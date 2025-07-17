/**
 * Subscription Service
 * 
 * Provides a service layer for subscription management operations
 * with comprehensive error handling and user feedback.
 */

import { neuraStackClient } from '../lib/neurastack-client';
import type { 
    UserTierInfoResponse, 
    TierConfigResponse, 
    TierUpgradeRequest, 
    TierUpgradeResponse,
    TierDowngradeRequest,
    TierDowngradeResponse
} from '../lib/types';

export interface SubscriptionError {
    code: string;
    message: string;
    details?: any;
}

export interface SubscriptionServiceResult<T> {
    success: boolean;
    data?: T;
    error?: SubscriptionError;
}

/**
 * Subscription Service Class
 */
export class SubscriptionService {
    private static instance: SubscriptionService;

    private constructor() {}

    public static getInstance(): SubscriptionService {
        if (!SubscriptionService.instance) {
            SubscriptionService.instance = new SubscriptionService();
        }
        return SubscriptionService.instance;
    }

    /**
     * Get user tier information with error handling
     */
    async getUserTierInfo(userId: string): Promise<SubscriptionServiceResult<UserTierInfoResponse>> {
        try {
            if (!userId) {
                return {
                    success: false,
                    error: {
                        code: 'INVALID_USER_ID',
                        message: 'User ID is required'
                    }
                };
            }

            const data = await neuraStackClient.getUserTierInfo(userId);
            return {
                success: true,
                data
            };
        } catch (error: any) {
            console.error('Failed to get user tier info:', error);
            return {
                success: false,
                error: {
                    code: 'FETCH_TIER_INFO_FAILED',
                    message: 'Failed to load subscription information. Please try again.',
                    details: error
                }
            };
        }
    }

    /**
     * Get tier configurations with error handling
     */
    async getTierConfigurations(): Promise<SubscriptionServiceResult<TierConfigResponse>> {
        try {
            const data = await neuraStackClient.getTierConfigurations();
            return {
                success: true,
                data
            };
        } catch (error: any) {
            console.error('Failed to get tier configurations:', error);
            return {
                success: false,
                error: {
                    code: 'FETCH_TIER_CONFIG_FAILED',
                    message: 'Failed to load tier configurations. Please try again.',
                    details: error
                }
            };
        }
    }

    /**
     * Upgrade user tier with validation and error handling
     */
    async upgradeTier(request: TierUpgradeRequest): Promise<SubscriptionServiceResult<TierUpgradeResponse>> {
        try {
            // Validate request
            if (!request.userId) {
                return {
                    success: false,
                    error: {
                        code: 'INVALID_USER_ID',
                        message: 'User ID is required for upgrade'
                    }
                };
            }

            // Set default duration if not provided
            const upgradeRequest: TierUpgradeRequest = {
                ...request,
                durationDays: request.durationDays || 30,
                reason: request.reason || 'User manual upgrade'
            };

            const data = await neuraStackClient.upgradeTier(upgradeRequest);
            
            return {
                success: true,
                data
            };
        } catch (error: any) {
            console.error('Failed to upgrade tier:', error);
            
            // Handle specific error cases
            if (error.statusCode === 429) {
                return {
                    success: false,
                    error: {
                        code: 'RATE_LIMITED',
                        message: 'Too many upgrade requests. Please try again later.',
                        details: error
                    }
                };
            }

            if (error.statusCode === 402) {
                return {
                    success: false,
                    error: {
                        code: 'PAYMENT_REQUIRED',
                        message: 'Payment is required to upgrade to premium tier.',
                        details: error
                    }
                };
            }

            return {
                success: false,
                error: {
                    code: 'UPGRADE_FAILED',
                    message: 'Failed to upgrade subscription. Please try again or contact support.',
                    details: error
                }
            };
        }
    }

    /**
     * Downgrade user tier with validation and error handling
     */
    async downgradeTier(request: TierDowngradeRequest): Promise<SubscriptionServiceResult<TierDowngradeResponse>> {
        try {
            // Validate request
            if (!request.userId) {
                return {
                    success: false,
                    error: {
                        code: 'INVALID_USER_ID',
                        message: 'User ID is required for downgrade'
                    }
                };
            }

            const downgradeRequest: TierDowngradeRequest = {
                ...request,
                reason: request.reason || 'User manual downgrade'
            };

            const data = await neuraStackClient.downgradeTier(downgradeRequest);
            
            return {
                success: true,
                data
            };
        } catch (error: any) {
            console.error('Failed to downgrade tier:', error);
            
            // Handle specific error cases
            if (error.statusCode === 429) {
                return {
                    success: false,
                    error: {
                        code: 'RATE_LIMITED',
                        message: 'Too many downgrade requests. Please try again later.',
                        details: error
                    }
                };
            }

            return {
                success: false,
                error: {
                    code: 'DOWNGRADE_FAILED',
                    message: 'Failed to downgrade subscription. Please try again or contact support.',
                    details: error
                }
            };
        }
    }

    /**
     * Load complete subscription data (tier info + configurations)
     */
    async loadSubscriptionData(userId: string): Promise<SubscriptionServiceResult<{
        userTierInfo: UserTierInfoResponse;
        tierConfig: TierConfigResponse;
    }>> {
        try {
            const [tierInfoResult, configResult] = await Promise.all([
                this.getUserTierInfo(userId),
                this.getTierConfigurations()
            ]);

            if (!tierInfoResult.success) {
                return {
                    success: false,
                    error: tierInfoResult.error
                };
            }

            if (!configResult.success) {
                return {
                    success: false,
                    error: configResult.error
                };
            }

            return {
                success: true,
                data: {
                    userTierInfo: tierInfoResult.data!,
                    tierConfig: configResult.data!
                }
            };
        } catch (error: any) {
            console.error('Failed to load subscription data:', error);
            return {
                success: false,
                error: {
                    code: 'LOAD_SUBSCRIPTION_DATA_FAILED',
                    message: 'Failed to load subscription information. Please refresh the page.',
                    details: error
                }
            };
        }
    }

    /**
     * Utility method to format dates consistently
     */
    formatDate(dateString: string): string {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return 'Unknown';
        }
    }

    /**
     * Utility method to calculate usage percentage
     */
    getUsagePercentage(current: number, max: number): number {
        return Math.min((current / max) * 100, 100);
    }

    /**
     * Utility method to get usage color based on percentage
     */
    getUsageColor(percentage: number): 'red' | 'orange' | 'blue' {
        if (percentage >= 90) return 'red';
        if (percentage >= 70) return 'orange';
        return 'blue';
    }

    /**
     * Check if user can upgrade (is currently on free tier)
     */
    canUpgrade(userTierInfo: UserTierInfoResponse): boolean {
        return userTierInfo.data.tier === 'free';
    }

    /**
     * Check if user can downgrade (is currently on premium tier)
     */
    canDowngrade(userTierInfo: UserTierInfoResponse): boolean {
        return userTierInfo.data.tier === 'premium';
    }
}

// Export singleton instance
export const subscriptionService = SubscriptionService.getInstance();
