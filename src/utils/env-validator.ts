/**
 * Environment Variable Validation Utility
 * 
 * This utility validates that environment variables are loaded correctly
 * and provides debugging information for API endpoint configuration.
 */

export interface EnvValidationResult {
  isValid: boolean;
  backendUrl: string;
  issues: string[];
  recommendations: string[];
  environment: 'development' | 'production' | 'unknown';
}

/**
 * Validates the current environment configuration
 */
export function validateEnvironment(): EnvValidationResult {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Determine environment
  const isDev = import.meta.env.DEV;
  const isProd = import.meta.env.PROD;

  let environment: 'development' | 'production' | 'unknown' = 'unknown';
  if (isDev) environment = 'development';
  else if (isProd) environment = 'production';

  // Get backend URL
  const envBackendUrl = import.meta.env.VITE_BACKEND_URL;
  const productionUrl = "https://neurastack-backend-638289111765.us-central1.run.app";
  
  let backendUrl = productionUrl; // Default to production
  
  if (envBackendUrl && envBackendUrl.trim() !== '') {
    backendUrl = envBackendUrl.trim();
  }
  
  // Validation checks
  if (!envBackendUrl) {
    issues.push("VITE_BACKEND_URL environment variable is not set");
    recommendations.push("Set VITE_BACKEND_URL in your .env file");
  }
  
  if (isProd && backendUrl.includes('localhost')) {
    issues.push("Production build is configured to use localhost");
    recommendations.push("Remove localhost URL from production environment variables");
    // Force production URL
    backendUrl = productionUrl;
  }
  
  if (isDev && backendUrl === productionUrl) {
    recommendations.push("Consider creating .env.local with VITE_BACKEND_URL=http://localhost:8080 for local development");
  }
  
  // URL format validation
  try {
    new URL(backendUrl);
  } catch (error) {
    issues.push(`Invalid backend URL format: ${backendUrl}`);
    recommendations.push("Ensure backend URL is a valid HTTP/HTTPS URL");
  }
  
  // Protocol validation
  if (!backendUrl.startsWith('http://') && !backendUrl.startsWith('https://')) {
    issues.push("Backend URL must start with http:// or https://");
  }
  
  if (isProd && backendUrl.startsWith('http://') && !backendUrl.includes('localhost')) {
    issues.push("Production should use HTTPS, not HTTP");
    recommendations.push("Use HTTPS URL for production backend");
  }
  
  return {
    isValid: issues.length === 0,
    backendUrl,
    issues,
    recommendations,
    environment
  };
}

/**
 * Logs environment validation results to console
 */
export function logEnvironmentValidation(): EnvValidationResult {
  const result = validateEnvironment();
  
  console.group('🔍 Environment Validation');
  console.log('');
  console.log('🌍 Environment:', result.environment);
  console.log('🔗 Backend URL:', `%c${result.backendUrl}`, 'color: #00ff00; font-weight: bold;');
  console.log('✅ Valid Configuration:', result.isValid ? '✅ Yes' : '❌ No');
  
  if (result.issues.length > 0) {
    console.log('');
    console.log('🚨 Issues Found:');
    result.issues.forEach(issue => console.log(`  • ${issue}`));
  }
  
  if (result.recommendations.length > 0) {
    console.log('');
    console.log('💡 Recommendations:');
    result.recommendations.forEach(rec => console.log(`  • ${rec}`));
  }
  
  console.log('');
  console.log('🔧 Environment Variables:');
  console.log('  VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL || 'Not set');
  console.log('  MODE:', import.meta.env.MODE || 'unknown');
  console.log('  DEV:', import.meta.env.DEV || false);
  console.log('  PROD:', import.meta.env.PROD || false);
  
  console.groupEnd();
  
  return result;
}

/**
 * Gets the correct backend URL with validation
 */
export function getValidatedBackendUrl(): string {
  const result = validateEnvironment();
  
  if (!result.isValid) {
    console.warn('Environment validation failed, using production URL as fallback');
    return "https://neurastack-backend-638289111765.us-central1.run.app";
  }
  
  return result.backendUrl;
}
