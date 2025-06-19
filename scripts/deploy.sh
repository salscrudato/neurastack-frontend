#!/bin/bash

# NeuraStack Frontend Deployment Script
# Comprehensive deployment automation with health checks and rollback capabilities

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/tmp/neurastack-deploy-${TIMESTAMP}.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="staging"
SKIP_TESTS=false
SKIP_BUILD=false
DRY_RUN=false
ROLLBACK=false
HEALTH_CHECK_TIMEOUT=300
DEPLOYMENT_TIMEOUT=600

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${GREEN}[INFO]${NC} ${timestamp} - $message" | tee -a "$LOG_FILE"
            ;;
        "WARN")
            echo -e "${YELLOW}[WARN]${NC} ${timestamp} - $message" | tee -a "$LOG_FILE"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} ${timestamp} - $message" | tee -a "$LOG_FILE"
            ;;
        "DEBUG")
            echo -e "${BLUE}[DEBUG]${NC} ${timestamp} - $message" | tee -a "$LOG_FILE"
            ;;
    esac
}

# Error handler
error_handler() {
    local line_number=$1
    log "ERROR" "Script failed at line $line_number"
    log "ERROR" "Deployment failed. Check logs at $LOG_FILE"
    exit 1
}

trap 'error_handler $LINENO' ERR

# Help function
show_help() {
    cat << EOF
NeuraStack Frontend Deployment Script

Usage: $0 [OPTIONS]

OPTIONS:
    -e, --environment ENV    Target environment (staging|production) [default: staging]
    -s, --skip-tests        Skip running tests
    -b, --skip-build        Skip building the application
    -d, --dry-run           Show what would be done without executing
    -r, --rollback          Rollback to previous deployment
    -t, --timeout SECONDS   Health check timeout [default: 300]
    -h, --help              Show this help message

EXAMPLES:
    $0 --environment production
    $0 --skip-tests --environment staging
    $0 --rollback --environment production
    $0 --dry-run --environment production

EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -s|--skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            -b|--skip-build)
                SKIP_BUILD=true
                shift
                ;;
            -d|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -r|--rollback)
                ROLLBACK=true
                shift
                ;;
            -t|--timeout)
                HEALTH_CHECK_TIMEOUT="$2"
                shift 2
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log "ERROR" "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Validate environment
validate_environment() {
    case $ENVIRONMENT in
        staging|production)
            log "INFO" "Deploying to $ENVIRONMENT environment"
            ;;
        *)
            log "ERROR" "Invalid environment: $ENVIRONMENT. Must be 'staging' or 'production'"
            exit 1
            ;;
    esac
}

# Check prerequisites
check_prerequisites() {
    log "INFO" "Checking prerequisites..."
    
    # Check required tools
    local required_tools=("node" "npm" "docker" "git")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log "ERROR" "Required tool '$tool' is not installed"
            exit 1
        fi
    done
    
    # Check Node.js version
    local node_version=$(node --version | cut -d'v' -f2)
    local required_version="18.0.0"
    if ! npx semver "$node_version" -r ">=$required_version" &> /dev/null; then
        log "ERROR" "Node.js version $node_version is not supported. Required: >=$required_version"
        exit 1
    fi
    
    # Check if we're in the right directory
    if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
        log "ERROR" "package.json not found. Are you in the right directory?"
        exit 1
    fi
    
    log "INFO" "Prerequisites check passed"
}

# Run tests
run_tests() {
    if [[ "$SKIP_TESTS" == true ]]; then
        log "WARN" "Skipping tests as requested"
        return 0
    fi
    
    log "INFO" "Running tests..."
    
    cd "$PROJECT_ROOT"
    
    # Install dependencies
    npm ci
    
    # Run linting
    log "INFO" "Running linter..."
    npm run lint
    
    # Run type checking
    log "INFO" "Running type check..."
    npm run type-check
    
    # Run unit tests
    log "INFO" "Running unit tests..."
    npm run test:run
    
    # Run E2E tests for production
    if [[ "$ENVIRONMENT" == "production" ]]; then
        log "INFO" "Running E2E tests..."
        npm run build
        npm run preview &
        local preview_pid=$!
        
        # Wait for preview server to start
        sleep 10
        
        # Run E2E tests
        npm run test:e2e || {
            kill $preview_pid
            log "ERROR" "E2E tests failed"
            exit 1
        }
        
        kill $preview_pid
    fi
    
    log "INFO" "All tests passed"
}

# Build application
build_application() {
    if [[ "$SKIP_BUILD" == true ]]; then
        log "WARN" "Skipping build as requested"
        return 0
    fi
    
    log "INFO" "Building application..."
    
    cd "$PROJECT_ROOT"
    
    # Set environment variables
    export VITE_APP_VERSION=$(git rev-parse --short HEAD)
    export VITE_BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    case $ENVIRONMENT in
        staging)
            export VITE_API_URL="https://staging-api.neurastack.app"
            ;;
        production)
            export VITE_API_URL="https://api.neurastack.app"
            ;;
    esac
    
    # Build the application
    npm run build
    
    # Verify build output
    if [[ ! -d "dist" ]]; then
        log "ERROR" "Build failed - dist directory not found"
        exit 1
    fi
    
    log "INFO" "Build completed successfully"
}

# Build Docker image
build_docker_image() {
    log "INFO" "Building Docker image..."
    
    cd "$PROJECT_ROOT"
    
    local image_tag="neurastack-frontend:${ENVIRONMENT}-${TIMESTAMP}"
    local latest_tag="neurastack-frontend:${ENVIRONMENT}-latest"
    
    docker build \
        --build-arg VITE_APP_VERSION="$(git rev-parse --short HEAD)" \
        --build-arg VITE_BUILD_TIME="$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
        --tag "$image_tag" \
        --tag "$latest_tag" \
        .
    
    log "INFO" "Docker image built: $image_tag"
}

# Deploy to environment
deploy() {
    log "INFO" "Deploying to $ENVIRONMENT..."
    
    if [[ "$DRY_RUN" == true ]]; then
        log "INFO" "DRY RUN - Would deploy to $ENVIRONMENT"
        return 0
    fi
    
    case $ENVIRONMENT in
        staging)
            deploy_staging
            ;;
        production)
            deploy_production
            ;;
    esac
}

# Deploy to staging
deploy_staging() {
    log "INFO" "Deploying to staging environment..."
    
    # Example deployment commands - replace with your actual deployment logic
    # docker-compose -f docker-compose.staging.yml up -d
    # kubectl apply -f k8s/staging/
    # terraform apply -var-file=staging.tfvars
    
    log "INFO" "Staging deployment completed"
}

# Deploy to production
deploy_production() {
    log "INFO" "Deploying to production environment..."
    
    # Example deployment commands - replace with your actual deployment logic
    # docker-compose -f docker-compose.production.yml up -d
    # kubectl apply -f k8s/production/
    # terraform apply -var-file=production.tfvars
    
    log "INFO" "Production deployment completed"
}

# Health check
health_check() {
    log "INFO" "Performing health check..."
    
    local url
    case $ENVIRONMENT in
        staging)
            url="https://staging.neurastack.app/health"
            ;;
        production)
            url="https://neurastack.app/health"
            ;;
    esac
    
    local start_time=$(date +%s)
    local timeout=$HEALTH_CHECK_TIMEOUT
    
    while true; do
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        
        if [[ $elapsed -gt $timeout ]]; then
            log "ERROR" "Health check timeout after ${timeout}s"
            return 1
        fi
        
        if curl -f -s "$url" > /dev/null 2>&1; then
            log "INFO" "Health check passed"
            return 0
        fi
        
        log "DEBUG" "Health check failed, retrying in 10s... (${elapsed}s elapsed)"
        sleep 10
    done
}

# Rollback function
rollback() {
    log "INFO" "Rolling back deployment..."
    
    if [[ "$DRY_RUN" == true ]]; then
        log "INFO" "DRY RUN - Would rollback $ENVIRONMENT"
        return 0
    fi
    
    # Example rollback commands - replace with your actual rollback logic
    # kubectl rollout undo deployment/neurastack-frontend
    # docker-compose down && docker-compose up -d
    
    log "INFO" "Rollback completed"
}

# Cleanup function
cleanup() {
    log "INFO" "Cleaning up..."
    
    # Remove old Docker images
    docker image prune -f
    
    # Clean up temporary files
    rm -f /tmp/neurastack-deploy-*.log.old
    
    log "INFO" "Cleanup completed"
}

# Main function
main() {
    log "INFO" "Starting NeuraStack Frontend deployment"
    log "INFO" "Timestamp: $TIMESTAMP"
    log "INFO" "Log file: $LOG_FILE"
    
    parse_args "$@"
    validate_environment
    check_prerequisites
    
    if [[ "$ROLLBACK" == true ]]; then
        rollback
        health_check
    else
        run_tests
        build_application
        build_docker_image
        deploy
        health_check
    fi
    
    cleanup
    
    log "INFO" "Deployment completed successfully!"
    log "INFO" "Environment: $ENVIRONMENT"
    log "INFO" "Version: $(git rev-parse --short HEAD)"
    log "INFO" "Log file: $LOG_FILE"
}

# Run main function with all arguments
main "$@"
