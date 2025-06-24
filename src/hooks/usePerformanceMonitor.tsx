// Minimal performance monitoring for essential debugging only
export function useOperationTimer() {
  const startTimer = (operationName: string) => {
    if (import.meta.env.DEV) {
      console.time(operationName);
    }
  };

  const endTimer = (operationName: string) => {
    if (import.meta.env.DEV) {
      console.timeEnd(operationName);
    }
  };

  return { startTimer, endTimer };
}

// No-op exports for backward compatibility
export const usePerformanceMonitor = () => ({});
export const usePerformanceAlerts = () => ({ alerts: [], clearAlerts: () => {}, metrics: {} });
export const usePerformanceLogger = () => ({});
