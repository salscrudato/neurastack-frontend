/**
 * Admin Configuration
 * 
 * Centralized configuration for admin access control
 * and administrative features.
 */

// ============================================================================
// Admin Access Control
// ============================================================================

/** Authorized admin email address */
export const ADMIN_EMAIL = 'sal.scrudato@gmail.com';

/**
 * Check if a user has admin access
 * @param user - Firebase user object
 * @returns true if user has admin access
 */
export function hasAdminAccess(user: any): boolean {
  if (!user || user.isAnonymous || !user.email) {
    return false;
  }
  return user.email === ADMIN_EMAIL;
}

// ============================================================================
// Admin Feature Configuration
// ============================================================================

/** Admin dashboard configuration */
export const ADMIN_CONFIG = {
  /** Default refresh interval for monitoring dashboards (ms) */
  defaultRefreshInterval: 30000,
  
  /** Auto-refresh intervals for different components */
  refreshIntervals: {
    health: 30000,      // 30 seconds
    metrics: 60000,     // 1 minute
    tierInfo: 300000,   // 5 minutes
  },
  
  /** Admin dashboard features */
  features: {
    systemHealth: true,
    performanceMetrics: true,
    tierManagement: true,
    costEstimation: true,
    userAnalytics: false, // Future feature
    systemLogs: false,    // Future feature
  },
  
  /** Admin navigation */
  navigation: {
    label: 'Admin',
    path: '/admin',
    description: 'System monitoring and management'
  }
} as const;

// ============================================================================
// Admin Permissions
// ============================================================================

/** Admin permission levels */
export const AdminPermission = {
  READ_ONLY: 'read_only',
  FULL_ACCESS: 'full_access',
  SUPER_ADMIN: 'super_admin'
} as const;

export type AdminPermissionType = typeof AdminPermission[keyof typeof AdminPermission];

/**
 * Get admin permission level for a user
 * @param user - Firebase user object
 * @returns admin permission level
 */
export function getAdminPermission(user: any): AdminPermissionType | null {
  if (!hasAdminAccess(user)) {
    return null;
  }

  // For now, the single admin user has full access
  // In the future, this could be expanded to support multiple admin levels
  return AdminPermission.SUPER_ADMIN;
}

/**
 * Check if user has specific admin permission
 * @param user - Firebase user object
 * @param permission - Required permission level
 * @returns true if user has the required permission
 */
export function hasAdminPermission(
  user: any,
  permission: AdminPermissionType
): boolean {
  const userPermission = getAdminPermission(user);
  if (!userPermission) return false;

  // Permission hierarchy
  const permissionLevels = {
    [AdminPermission.READ_ONLY]: 1,
    [AdminPermission.FULL_ACCESS]: 2,
    [AdminPermission.SUPER_ADMIN]: 3
  };

  return permissionLevels[userPermission] >= permissionLevels[permission];
}
