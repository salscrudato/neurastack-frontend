/**
 * Offline Resilience Service
 * 
 * Provides comprehensive offline support, request queuing, and graceful degradation
 * for the NeuraStack chat application.
 */


// Configuration
const OFFLINE_CONFIG = {
  MAX_QUEUED_REQUESTS: 50,
  RETRY_INTERVALS: [1000, 2000, 5000, 10000], // Progressive backoff
  STORAGE_KEY: 'neurastack_offline_queue',
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  CONNECTION_TIMEOUT: 10000, // 10 seconds
} as const;

// Types
interface QueuedRequest {
  id: string;
  timestamp: number;
  type: 'chat_message' | 'save_message' | 'load_history';
  payload: any;
  retryCount: number;
  maxRetries: number;
}

interface ConnectionStatus {
  isOnline: boolean;
  lastOnline: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
  latency: number;
}

class OfflineResilienceService {
  private requestQueue: QueuedRequest[] = [];
  private connectionStatus: ConnectionStatus = {
    isOnline: navigator.onLine,
    lastOnline: Date.now(),
    connectionQuality: 'excellent',
    latency: 0,
  };
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private retryTimeout: NodeJS.Timeout | null = null;
  private listeners: Set<(status: ConnectionStatus) => void> = new Set();

  constructor() {
    this.initializeService();
  }

  private initializeService(): void {
    // Load queued requests from storage
    this.loadQueueFromStorage();

    // Set up online/offline event listeners
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Start connection monitoring
    this.startHeartbeat();

    // Process any queued requests if online
    if (navigator.onLine) {
      this.processQueue();
    }
  }

  private handleOnline(): void {
    this.connectionStatus.isOnline = true;
    this.connectionStatus.lastOnline = Date.now();
    this.notifyListeners();
    this.processQueue();
  }

  private handleOffline(): void {
    this.connectionStatus.isOnline = false;
    this.connectionStatus.connectionQuality = 'offline';
    this.notifyListeners();
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      this.checkConnectionQuality();
    }, OFFLINE_CONFIG.HEARTBEAT_INTERVAL);
  }

  private async checkConnectionQuality(): Promise<void> {
    if (!navigator.onLine) {
      this.connectionStatus.connectionQuality = 'offline';
      this.notifyListeners();
      return;
    }

    try {
      const startTime = Date.now();
      
      // Use a lightweight endpoint or create a ping endpoint
      const response = await fetch('/api/ping', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(OFFLINE_CONFIG.CONNECTION_TIMEOUT),
      });

      const latency = Date.now() - startTime;
      this.connectionStatus.latency = latency;

      if (response.ok) {
        if (latency < 200) {
          this.connectionStatus.connectionQuality = 'excellent';
        } else if (latency < 500) {
          this.connectionStatus.connectionQuality = 'good';
        } else {
          this.connectionStatus.connectionQuality = 'poor';
        }
      } else {
        this.connectionStatus.connectionQuality = 'poor';
      }
    } catch (error) {
      this.connectionStatus.connectionQuality = 'offline';
      this.connectionStatus.isOnline = false;
    }

    this.notifyListeners();
  }

  /**
   * Queue a request for later processing when online
   */
  public queueRequest(
    type: QueuedRequest['type'],
    payload: any,
    maxRetries: number = 3
  ): string {
    const request: QueuedRequest = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type,
      payload,
      retryCount: 0,
      maxRetries,
    };

    this.requestQueue.push(request);

    // Limit queue size
    if (this.requestQueue.length > OFFLINE_CONFIG.MAX_QUEUED_REQUESTS) {
      this.requestQueue.shift(); // Remove oldest request
    }

    this.saveQueueToStorage();

    // Try to process immediately if online
    if (this.connectionStatus.isOnline) {
      this.processQueue();
    }

    return request.id;
  }

  /**
   * Process queued requests
   */
  private async processQueue(): Promise<void> {
    if (!this.connectionStatus.isOnline || this.requestQueue.length === 0) {
      return;
    }

    const request = this.requestQueue[0];
    
    try {
      await this.executeRequest(request);
      
      // Remove successful request from queue
      this.requestQueue.shift();
      this.saveQueueToStorage();
      
      // Process next request
      if (this.requestQueue.length > 0) {
        setTimeout(() => this.processQueue(), 100);
      }
    } catch (error) {
      request.retryCount++;
      
      if (request.retryCount >= request.maxRetries) {
        // Remove failed request after max retries
        this.requestQueue.shift();
        this.saveQueueToStorage();
        
        if (import.meta.env.DEV) {
          console.warn('Request failed after max retries:', request);
        }
      } else {
        // Schedule retry with exponential backoff
        const delay = OFFLINE_CONFIG.RETRY_INTERVALS[
          Math.min(request.retryCount - 1, OFFLINE_CONFIG.RETRY_INTERVALS.length - 1)
        ];
        
        this.retryTimeout = setTimeout(() => this.processQueue(), delay);
      }
    }
  }

  /**
   * Execute a queued request
   */
  private async executeRequest(request: QueuedRequest): Promise<void> {
    switch (request.type) {
      case 'chat_message':
        // Import dynamically to avoid circular dependencies
        const { useChatStore } = await import('../store/useChatStore');
        await useChatStore.getState().sendMessage(request.payload.text);
        break;
        
      case 'save_message':
        const { saveMessageToFirebase } = await import('./chatHistoryService');
        await saveMessageToFirebase(request.payload.message);
        break;
        
      case 'load_history':
        const { loadChatHistoryFromFirebase } = await import('./chatHistoryService');
        await loadChatHistoryFromFirebase(request.payload.limit);
        break;
        
      default:
        throw new Error(`Unknown request type: ${request.type}`);
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveQueueToStorage(): void {
    try {
      localStorage.setItem(
        OFFLINE_CONFIG.STORAGE_KEY,
        JSON.stringify(this.requestQueue)
      );
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Failed to save offline queue to storage:', error);
      }
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadQueueFromStorage(): void {
    try {
      const stored = localStorage.getItem(OFFLINE_CONFIG.STORAGE_KEY);
      if (stored) {
        this.requestQueue = JSON.parse(stored);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Failed to load offline queue from storage:', error);
      }
      this.requestQueue = [];
    }
  }

  /**
   * Get current connection status
   */
  public getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Subscribe to connection status changes
   */
  public onConnectionChange(callback: (status: ConnectionStatus) => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of connection status changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback(this.connectionStatus);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Error in connection status listener:', error);
        }
      }
    });
  }

  /**
   * Get offline capabilities info
   */
  public getOfflineCapabilities(): {
    canQueueRequests: boolean;
    queuedRequestsCount: number;
    maxQueueSize: number;
    estimatedSyncTime: number;
  } {
    return {
      canQueueRequests: true,
      queuedRequestsCount: this.requestQueue.length,
      maxQueueSize: OFFLINE_CONFIG.MAX_QUEUED_REQUESTS,
      estimatedSyncTime: this.requestQueue.length * 2000, // Rough estimate
    };
  }

  /**
   * Clear all queued requests
   */
  public clearQueue(): void {
    this.requestQueue = [];
    this.saveQueueToStorage();
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
    
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    
    this.listeners.clear();
  }
}

// Export singleton instance
export const offlineResilienceService = new OfflineResilienceService();

// Export types for use in other modules
export type { ConnectionStatus, QueuedRequest };
