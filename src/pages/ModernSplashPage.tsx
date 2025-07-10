import {
    CheckCircleIcon,
    ExclamationCircleIcon,
    InformationCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/solid';
import { GoogleAuthProvider, signInAnonymously, signInWithPopup } from "firebase/auth";
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/icons/logo.svg";
import { auth } from "../firebase";
import { useReducedMotion } from "../hooks/useAccessibility";
import { useAuthStore } from "../store/useAuthStore";

const provider = new GoogleAuthProvider();

/* ---------- Helper Function for Firebase Errors ---------- */
const prettyError = (code: string): string => {
  switch (code) {
    case 'auth/user-not-found': return 'No account matches that username.';
    case 'auth/wrong-password': return 'Incorrect password.';
    case 'auth/weak-password': return 'Choose a stronger password.';
    case 'auth/email-already-in-use': return 'Username is already registered.';
    case 'auth/invalid-credentials': return 'Invalid username or password.';
    default: return 'Something went wrong. Please try again.';
  }
};

/* ---------- Google Icon Component ---------- */
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

/* ---------- Loading Spinner Component ---------- */
const LoadingSpinner = () => (
  <div className="w-5 h-5 border-2 border-white/20 border-t-white/90 border-r-white/60 rounded-full animate-spin mr-3" />
);

/* ---------- Component ---------- */
export function ModernSplashPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Performance and accessibility hooks
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (user) {
      navigate("/chat", { replace: true });
    }
  }, [user, navigate]);

  // Enhanced mobile scroll locking and viewport management
  useEffect(() => {
    // Lock scroll on splash page with enhanced mobile support
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';

    // Enhanced touch handling for splash page
    const preventTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('input') || target.closest('[role="button"]')) {
        return;
      }
      e.preventDefault();
    };

    document.addEventListener('touchmove', preventTouchMove, { passive: false });

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.overscrollBehavior = '';
      document.removeEventListener('touchmove', preventTouchMove);
    };
  }, []);

  const handleGoogleLogin = useCallback(async () => {
    setErr('');
    setSuccess('');
    setIsLoading(true);
    try {
      const res = await signInWithPopup(auth, provider);
      setUser(res.user);
      navigate("/chat", { replace: true });
    } catch (error: any) {
      setErr(prettyError(error?.code || 'unknown'));
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setUser]);

  const handleGuestLogin = useCallback(async () => {
    setErr('');
    setSuccess('');
    setIsLoading(true);
    try {
      const cred = await signInAnonymously(auth);
      setUser(cred.user);
      navigate("/chat", { replace: true });
    } catch (error: any) {
      setErr(prettyError(error?.code || 'guest-login-failed'));
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setUser]);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleInfoClick = useCallback(() => {
    setShowModal(true);
  }, []);

  // Enhanced keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && showModal) {
      setShowModal(false);
    }
  }, [showModal]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus management for accessibility
  useEffect(() => {
    if (showModal) {
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };
      document.addEventListener('keydown', handleTabKey);
      firstElement?.focus();
      return () => document.removeEventListener('keydown', handleTabKey);
    }
  }, [showModal]);

  return (
    <div
      className="min-h-screen min-h-[100dvh] flex items-center justify-center fixed inset-0 w-full h-full overflow-hidden perspective-[1200px] splash-container-mobile"
      role="main"
      aria-label="NeuraStack Authentication"
      style={{
        background: `
          radial-gradient(ellipse 1000px 600px at 50% 40%, rgba(30, 144, 255, 0.12) 0%, rgba(30, 144, 255, 0.06) 30%, transparent 70%),
          radial-gradient(ellipse 1400px 800px at 50% 50%, rgba(10, 25, 47, 0.08) 0%, transparent 60%),
          linear-gradient(180deg, #0A192F 0%, #1e293b 100%)
        `,
        backgroundAttachment: 'fixed',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'none',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
        contain: 'layout style paint'
      }}
    >
      {/* Skip link for keyboard navigation accessibility */}
      <a
        href="#main-content"
        className="absolute -left-[9999px] z-[999] px-4 py-2 bg-primary-500/90 text-white no-underline rounded font-medium text-sm focus:left-5 focus:top-5"
      >
        Skip to main content
      </a>

      {/* Subtle teal glow overlay - Grok-inspired */}
      <div
        className={`absolute inset-0 pointer-events-none opacity-70 ${!prefersReducedMotion ? 'animate-glow-pulse' : ''}`}
        style={{
          background: 'radial-gradient(ellipse 600px 400px at 50% 45%, rgba(0, 196, 180, 0.08) 0%, transparent 60%)'
        }}
      />

      {/* Background Welcome Text */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-5"
        style={{
          top: '20%',
          opacity: 0.15
        }}
      >
        <h1
          className="text-6xl md:text-7xl lg:text-8xl font-bold text-center"
          style={{
            color: '#1A1A1A',  // Dark charcoal for Grok aesthetic
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}
        >
          How can I help you?
        </h1>
      </div>

      {/* Main Card */}
      <div
        id="main-content"
        className={`w-full max-w-[520px] p-10 mx-5 text-center relative z-10 splash-card-mobile ${!prefersReducedMotion ? 'animate-slide-up' : ''}`}
        style={{
          background: `
            linear-gradient(135deg,
              #F5F5F5 0%,
              rgba(255, 255, 255, 0.95) 50%,
              #FAFAFA 100%
            )
          `,
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderRadius: '36px',
          border: '1px solid rgba(0, 196, 180, 0.25)',  // Teal border
          boxShadow: '0 4px 20px rgba(0, 196, 180, 0.08), 0 2px 12px rgba(0, 0, 0, 0.06)',
          willChange: 'transform',
          transform: 'translateZ(0)',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
        role="form"
        aria-label="NeuraStack Authentication"
      >
        {/* Logo Container */}
        <div className="flex flex-col items-center mb-8">
          <img 
            src={logo} 
            alt="NeuraStack Logo" 
            className="w-56 h-56 mb-3 md:w-60 md:h-60 lg:w-64 lg:h-64"
            style={{
              filter: `
                drop-shadow(0 0 24px rgba(0, 196, 180, 0.4))
                drop-shadow(0 0 48px rgba(0, 168, 154, 0.2))
                drop-shadow(0 8px 32px rgba(0, 0, 0, 0.3))
              `,
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)'
            }}
          />
        </div>

        {/* Error and Success Messages */}
        {err && (
          <div 
            className={`flex items-center p-4 mb-6 rounded-2xl text-red-100 bg-gradient-to-r from-red-500/20 to-red-600/15 border border-red-500/40 backdrop-blur-md ${!prefersReducedMotion ? 'animate-slide-up' : ''}`}
            style={{
              boxShadow: '0 8px 24px rgba(239, 68, 68, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
            role="alert"
          >
            <ExclamationCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
            {err}
          </div>
        )}
        
        {success && (
          <div 
            className={`flex items-center p-4 mb-6 rounded-2xl text-green-100 bg-gradient-to-r from-green-500/20 to-green-600/15 border border-green-500/40 backdrop-blur-md ${!prefersReducedMotion ? 'animate-slide-up' : ''}`}
            style={{
              boxShadow: '0 8px 24px rgba(34, 197, 94, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
            role="status"
          >
            <CheckCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
            {success}
          </div>
        )}

        {/* Button Container for Mobile Responsiveness */}
        <div className="splash-button-container">
          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-12 px-5 border-2 rounded-2xl font-medium cursor-pointer transition-all duration-300 ease-out flex items-center justify-center relative overflow-hidden hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            aria-label="Sign in with Google account"
            style={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              minHeight: '48px',
              willChange: 'transform',
              fontSize: '16px',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              background: 'linear-gradient(135deg, #00C4B4 0%, #00A89A 100%)',  // Teal gradient background
              borderColor: '#00C4B4 !important',
              color: '#ffffff !important',  // White text on teal background
              borderWidth: '2px',
              borderStyle: 'solid'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #1AFFE8 0%, #00C4B4 100%)';  // Lighter teal on hover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #00C4B4 0%, #00A89A 100%)';
            }}
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                Signing in with Google...
              </>
            ) : (
              <>
                <GoogleIcon />
                <span className="ml-2">Sign in with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="my-6">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          </div>

          {/* Guest Button */}
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="w-full h-12 px-5 border-2 rounded-2xl font-medium cursor-pointer transition-all duration-300 ease-out flex items-center justify-center relative overflow-hidden hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            aria-label="Continue as guest user without account"
            style={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              minHeight: '48px',
              willChange: 'transform',
              fontSize: '16px',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              backgroundColor: '#ffffff !important',
              borderColor: '#00C4B4 !important',  // Teal border
              color: '#00C4B4 !important',        // Teal text
              borderWidth: '2px',
              borderStyle: 'solid'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0fdfc';  // Light teal background on hover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                Continuing as Guest...
              </>
            ) : (
              'Continue as Guest'
            )}
          </button>

          {/* Info Button */}
          <button
            type="button"
            onClick={handleInfoClick}
            disabled={isLoading}
            className="w-full h-12 px-5 border-2 rounded-2xl font-medium cursor-pointer transition-all duration-300 ease-out flex items-center justify-center relative overflow-hidden hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-2"
            aria-label="Learn more about NeuraStack"
            aria-expanded={showModal}
            aria-haspopup="dialog"
            style={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              minHeight: '44px',
              willChange: 'transform',
              fontSize: '16px',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              backgroundColor: '#ffffff !important',
              borderColor: '#00C4B4 !important',  // Teal border
              color: '#00C4B4 !important',        // Teal text
              borderWidth: '2px',
              borderStyle: 'solid'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0fdfc';  // Light teal background on hover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
          >
            <InformationCircleIcon className="w-4 h-4 mr-2 flex-shrink-0" />
            What is neurastack?
          </button>
        </div>
      </div>

      {/* Enhanced How it Works Modal */}
      {showModal && (
        <div 
          className={`fixed inset-0 bg-black/85 backdrop-blur-2xl flex items-center justify-center z-[1000] p-6 ${!prefersReducedMotion ? 'animate-fade-in' : ''}`}
          onClick={handleModalClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.9) 100%)',
            willChange: 'opacity, backdrop-filter'
          }}
        >
          <div 
            className="relative max-w-[92vw] max-h-[88vh] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-3xl rounded-4xl border border-white/20 overflow-hidden shadow-glass-lg"
            onClick={e => e.stopPropagation()}
            style={{
              boxShadow: '0 32px 64px rgba(0, 0, 0, 0.4), 0 16px 32px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              willChange: 'transform',
              transform: 'translateZ(0)'
            }}
          >
            <button
              onClick={handleModalClose}
              className="absolute top-5 right-5 w-12 h-12 border border-white/20 rounded-full bg-gradient-to-br from-black/80 to-black/90 backdrop-blur-md text-white/90 cursor-pointer flex items-center justify-center transition-all duration-400 ease-out z-[1001] shadow-glass hover:bg-gradient-to-br hover:from-red-500/90 hover:to-red-600/95 hover:border-red-500/40 hover:text-white hover:scale-110 active:scale-105 focus:outline-none focus:ring-3 focus:ring-primary-500/40"
              aria-label="Close information modal"
              autoFocus
              style={{
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                minHeight: '44px',
                minWidth: '44px',
                willChange: 'transform, background'
              }}
            >
              <XMarkIcon className="w-5 h-5 transition-transform duration-300 hover:rotate-90" />
            </button>
            <div
              className="max-w-2xl mx-auto p-8 bg-white/95 backdrop-blur-md rounded-2xl"
              style={{
                boxShadow: '0 8px 32px rgba(0, 196, 180, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08)'
              }}
              id="modal-description"
            >
              <h2
                id="modal-title"
                className="text-3xl font-bold mb-6 text-center"
                style={{ color: '#1A1A1A' }}
              >
                How NeuraStack Works
              </h2>
              <div className="space-y-4 text-left">
                <p className="text-lg" style={{ color: '#333333' }}>
                  NeuraStack is an AI-powered platform that provides intelligent responses through advanced language models.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div
                      className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold mt-0.5"
                      style={{ background: '#00C4B4' }}
                    >
                      1
                    </div>
                    <p style={{ color: '#666666' }}>
                      <strong style={{ color: '#333333' }}>Ask Questions:</strong> Type your questions or requests in natural language
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div
                      className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold mt-0.5"
                      style={{ background: '#00C4B4' }}
                    >
                      2
                    </div>
                    <p style={{ color: '#666666' }}>
                      <strong style={{ color: '#333333' }}>AI Processing:</strong> Our advanced AI models analyze and understand your request
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div
                      className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold mt-0.5"
                      style={{ background: '#00C4B4' }}
                    >
                      3
                    </div>
                    <p style={{ color: '#666666' }}>
                      <strong style={{ color: '#333333' }}>Get Responses:</strong> Receive intelligent, contextual answers and assistance
                    </p>
                  </div>
                </div>
                <p className="text-center mt-6 text-sm" style={{ color: '#A0A0A0' }}>
                  Start chatting to experience the power of AI assistance
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
