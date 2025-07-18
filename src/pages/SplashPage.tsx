import { GoogleAuthProvider, signInAnonymously, signInWithPopup } from "firebase/auth";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PiWarningCircleBold } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import styled, { css, keyframes } from 'styled-components';
import logo from "../assets/icons/logo.svg";
import { auth } from "../firebase";
import { useReducedMotion } from "../hooks/useAccessibility";
import { useAuthStore } from "../store/useAuthStore";

const provider = new GoogleAuthProvider();

/* ---------- Type Definitions ---------- */
interface AnimatedElementProps {
  $color?: string;
  $duration?: string;
  $delay?: string;
}

interface MessageProps {
  type: 'error' | 'success';
}

/* ---------- Animations ---------- */
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const flyingStars = keyframes`
  0% { transform: translateX(-100vw) translateY(0) scale(0.1); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateX(100vw) translateY(-20px) scale(1.5); opacity: 0; }
`;

const warpSpeed = keyframes`
  0% { transform: translateX(-50px) scaleX(1); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(calc(100vw + 50px)) scaleX(3); opacity: 0; }
`;

const cosmicPulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.2); opacity: 0.8; }
`;

/* ---------- Responsive Breakpoints ---------- */
const breakpoints = {
  xs: '320px',
  sm: '480px',
  md: '768px',
  lg: '1024px',
  xl: '1200px'
};

/* ---------- Main Page Container ---------- */
const Page = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at center, #1e3a8a 0%, #0f172a 70%, #000000 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
  perspective: 1000px;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: none;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 20% 80%, rgba(30, 58, 138, 0.2) 0%, transparent 60%),
      radial-gradient(circle at 80% 20%, rgba(15, 23, 42, 0.3) 0%, transparent 60%),
      radial-gradient(circle at 40% 40%, rgba(0, 0, 0, 0.4) 0%, transparent 60%);
    pointer-events: none;
    animation: ${pulse} 8s ease-in-out infinite;
  }

  @media (max-width: ${breakpoints.xs}) { padding: 12px; min-height: -webkit-fill-available; }
  @media (max-width: ${breakpoints.sm}) { padding: 16px; }
  @media (min-width: ${breakpoints.md}) { padding: 24px; }
  @media (min-width: ${breakpoints.lg}) { padding: 32px; }
  @media (prefers-reduced-motion: reduce) { &::before { animation: none; } }
`;

/* ---------- Flying Stars Effect ---------- */
const FlyingStar = styled.div<AnimatedElementProps>`
  position: absolute;
  width: 2px;
  height: 2px;
  background: ${props => props.$color || 'rgba(255, 255, 255, 0.8)'};
  border-radius: 50%;
  animation: ${flyingStars} ${props => props.$duration || '3s'} linear infinite;
  animation-delay: ${props => props.$delay || '0s'};
  box-shadow: 0 0 6px ${props => props.$color || 'rgba(255, 255, 255, 0.8)'};
`;

/* ---------- Warp Speed Lines ---------- */
const WarpLine = styled.div<AnimatedElementProps>`
  position: absolute;
  height: 1px;
  width: 100px;
  background: linear-gradient(90deg, transparent, ${props => props.$color || 'rgba(30, 58, 138, 0.8)'} 50%, transparent);
  animation: ${warpSpeed} ${props => props.$duration || '2s'} linear infinite;
  animation-delay: ${props => props.$delay || '0s'};
  filter: blur(0.5px);
`;

/* ---------- Cosmic Orbs ---------- */
const CosmicOrb = styled.div<AnimatedElementProps>`
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, ${props => props.$color || 'rgba(30, 58, 138, 0.6)'} 0%, transparent 70%);
  animation: ${cosmicPulse} ${props => props.$duration || '4s'} ease-in-out infinite;
  animation-delay: ${props => props.$delay || '0s'};
  filter: blur(2px);
`;

/* ---------- Card Container ---------- */
const Card = styled.form`
  width: 100%;
  max-width: 420px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 30px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  text-align: center;
  animation: ${fadeInUp} 0.8s ease-out;
  position: relative;
  z-index: 10;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 50%, rgba(29, 78, 216, 0.1) 100%);
    border-radius: 24px;
    z-index: -1;
  }

  @media (max-width: ${breakpoints.xs}) { padding: 24px 16px; margin: 12px; max-width: calc(100vw - 24px); border-radius: 20px; }
  @media (max-width: ${breakpoints.sm}) { padding: 32px 24px; margin: 16px; max-width: 360px; border-radius: 22px; }
  @media (min-width: ${breakpoints.md}) { padding: 44px; max-width: 440px; }
  @media (min-width: ${breakpoints.lg}) { padding: 48px; max-width: 460px; }
  @media (prefers-reduced-motion: reduce) { animation: none; }
  @media (prefers-contrast: high) { border: 2px solid rgba(255, 255, 255, 0.3); background: rgba(255, 255, 255, 0.12); }
`;

/* ---------- Logo Container ---------- */
const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;

  @media (max-width: ${breakpoints.xs}) { margin-bottom: 24px; }
  @media (max-width: ${breakpoints.sm}) { margin-bottom: 28px; }
  @media (min-width: ${breakpoints.lg}) { margin-bottom: 36px; }
`;

const LogoImage = styled.img`
  width: 200px;
  height: 200px;
  margin-bottom: 6px;
  filter: drop-shadow(0 0 20px rgba(30, 58, 138, 0.6));
  will-change: filter;
  backface-visibility: hidden;

  @media (max-width: ${breakpoints.xs}) { width: 140px; height: 140px; }
  @media (max-width: ${breakpoints.sm}) { width: 160px; height: 160px; }
  @media (min-width: ${breakpoints.md}) { width: 180px; height: 180px; }
  @media (min-width: ${breakpoints.lg}) { width: 220px; height: 220px; }
  @media (prefers-reduced-motion: reduce) { filter: drop-shadow(0 0 10px rgba(30, 58, 138, 0.4)); }
  @media (prefers-contrast: high) { filter: drop-shadow(0 0 15px rgba(30, 58, 138, 0.8)); }
`;

/* ---------- Loading Spinner ---------- */
const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: ${pulse} 1s linear infinite;
  margin-right: 8px;
`;

/* ---------- Google Button ---------- */
const GoogleButton = styled.button`
  width: 100%;
  height: 56px;
  padding: 0 24px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  color: #1f2937;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 56px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(79, 156, 249, 0.1), transparent);
    transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover:not(:disabled) {
    border-color: rgba(79, 156, 249, 0.25);
    background: rgba(255, 255, 255, 1);
    color: #0f172a;
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(79, 156, 249, 0.2), 0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9);
    &::before { left: 100%; }
  }

  &:active:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(79, 156, 249, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(79, 156, 249, 0.3), 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  &:focus-visible {
    outline: 2px solid rgba(79, 156, 249, 0.8);
    outline-offset: 3px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    background: rgba(255, 255, 255, 0.7);
    &::before { display: none; }
  }

  svg { margin-right: 12px; flex-shrink: 0; }

  @media (max-width: ${breakpoints.xs}) { height: 52px; padding: 0 20px; font-size: 0.95rem; border-radius: 18px; margin-top: 12px; }
  @media (max-width: ${breakpoints.sm}) { height: 54px; padding: 0 22px; border-radius: 19px; margin-top: 14px; }
  @media (min-width: ${breakpoints.lg}) { height: 60px; padding: 0 32px; font-size: 1.05rem; border-radius: 22px; margin-top: 20px; }
  @media (prefers-reduced-motion: reduce) { transition: none; &:hover:not(:disabled) { transform: none; } &::before { display: none; } }
  @media (prefers-contrast: high) { border: 3px solid rgba(59, 130, 246, 0.6); background: rgba(255, 255, 255, 1); }
`;

/* ---------- Guest Button ---------- */
const GuestButton = styled.button`
  width: 100%;
  height: 56px;
  padding: 0 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  color: rgba(255, 255, 255, 0.95);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 56px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
    transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover:not(:disabled) {
    border-color: rgba(255, 255, 255, 0.35);
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 1);
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(255, 255, 255, 0.15), 0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15);
    &::before { left: 100%; }
  }

  &:active:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(255, 255, 255, 0.1), 0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3), 0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.8);
    outline-offset: 3px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    background: rgba(255, 255, 255, 0.04);
    &::before { display: none; }
  }
`;

/* ---------- Retry Button ---------- */
const RetryButton = styled.button`
  margin-left: 12px;
  padding: 4px 8px;
  font-size: 0.8rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 6px;
  color: #fca5a5;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.3);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

/* ---------- Divider ---------- */
const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0 16px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
  font-weight: 500;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  }

  &::before { margin-right: 16px; }
  &::after { margin-left: 16px; }
`;

/* ---------- Error/Success Message ---------- */
const Message = styled.div<MessageProps>`
  display: flex;
  align-items: center;
  padding: 14px 18px;
  border-radius: 16px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 20px;
  min-height: 48px;
  animation: ${slideIn} 0.4s ease-out;
  backdrop-filter: blur(10px);

  ${props => props.type === 'error' && css`
    background: rgba(239, 68, 68, 0.15);
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.3);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
  `}

  ${props => props.type === 'success' && css`
    background: rgba(34, 197, 94, 0.15);
    color: #86efac;
    border: 1px solid rgba(34, 197, 94, 0.3);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.1);
  `}

  svg { margin-right: 10px; flex-shrink: 0; }

  @media (max-width: ${breakpoints.xs}) { padding: 12px 16px; font-size: 0.85rem; margin-top: 16px; min-height: 44px; }
  @media (max-width: ${breakpoints.sm}) { padding: 13px 17px; font-size: 0.875rem; margin-top: 18px; min-height: 46px; }
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

/* ---------- Google Icon Component ---------- */
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

/* ---------- Helper Function for Firebase Errors ---------- */
const prettyError = (code: string): string => {
  switch (code) {
    case 'auth/user-not-found': return 'No account matches that username.';
    case 'auth/wrong-password': return 'Incorrect password.';
    case 'auth/weak-password': return 'Choose a stronger password.';
    case 'auth/email-already-in-use': return 'Username is already registered.';
    case 'auth/invalid-credentials': return 'Invalid username or password.';
    case 'auth/the-service-is-currently-unavailable': return 'Authentication service is temporarily unavailable. Please try again in a few minutes.';
    case 'auth/network-request-failed': return 'Network error. Please check your connection and try again.';
    case 'auth/too-many-requests': return 'Too many attempts. Please wait a moment and try again.';
    default: return 'Something went wrong. Please try again.';
  }
};

/* ---------- Component ---------- */
export function SplashPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const [err, setErr] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastFailedAction, setLastFailedAction] = useState<'google' | 'guest' | null>(null);

  const prefersReducedMotion = useReducedMotion();

  const animationConfig = useMemo(() => ({
    starsCount: prefersReducedMotion ? 5 : 10,
    warpLinesCount: prefersReducedMotion ? 3 : 4,
    animationDuration: prefersReducedMotion ? '10s' : '3s'
  }), [prefersReducedMotion]);

  // Memoised decorative elements to avoid re‑creation on every render
  const stars = useMemo(
    () =>
      Array.from({ length: animationConfig.starsCount }, (_, i) => (
        <FlyingStar
          key={`star-${i}`}
          style={{ top: `${Math.random() * 100}%`, left: '-10px' }}
          $color={
            i % 3 === 0
              ? 'rgba(255,255,255,0.9)'
              : i % 3 === 1
              ? 'rgba(30,58,138,0.8)'
              : 'rgba(59,130,246,0.6)'
          }
          $duration={`${2 + Math.random() * 3}s`}
          $delay={`${Math.random() * 5}s`}
        />
      )),
    [animationConfig.starsCount]
  );

  const warpLines = useMemo(
    () =>
      Array.from({ length: animationConfig.warpLinesCount }, (_, i) => (
        <WarpLine
          key={`warp-${i}`}
          style={{ top: `${10 + i * 12}%`, left: '-100px' }}
          $color={i % 2 === 0 ? 'rgba(30,58,138,0.6)' : 'rgba(59,130,246,0.4)'}
          $duration={`${1.5 + Math.random() * 2}s`}
          $delay={`${Math.random() * 3}s`}
        />
      )),
    [animationConfig.warpLinesCount]
  );

  useEffect(() => {
    if (user) navigate("/chat", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const handleGoogleLogin = useCallback(async () => {
    setErr('');
    setIsLoading(true);
    setLastFailedAction(null);
    try {
      const res = await signInWithPopup(auth, provider);
      setUser(res.user);
      navigate("/chat", { replace: true });
    } catch (error: any) {
      setErr(prettyError(error?.code || 'unknown'));
      setLastFailedAction('google');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setUser]);

  const handleGuestLogin = useCallback(async () => {
    setErr('');
    setIsLoading(true);
    setLastFailedAction(null);
    try {
      const credential = await signInAnonymously(auth);
      setUser(credential.user);
      navigate("/chat", { replace: true });
    } catch (error: any) {
      // Use the same error handling as Google login for consistency
      setErr(prettyError(error?.code || 'unknown'));
      setLastFailedAction('guest');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setUser]);

  const handleRetry = useCallback(() => {
    if (lastFailedAction === 'google') {
      handleGoogleLogin();
    } else if (lastFailedAction === 'guest') {
      handleGuestLogin();
    }
  }, [lastFailedAction, handleGoogleLogin, handleGuestLogin]);

  // Check if the error is a service unavailable error that can be retried
  const isRetryableError = err.includes('temporarily unavailable') || err.includes('try again');

  return (
    <Page>
      {stars}

      {warpLines}

      <CosmicOrb style={{ width: '200px', height: '200px', top: '5%', left: '5%' }} $color="rgba(30,58,138,0.3)" $duration="8s" $delay="0s" />
      <CosmicOrb style={{ width: '150px', height: '150px', top: '60%', right: '10%' }} $color="rgba(59,130,246,0.2)" $duration="6s" $delay="2s" />
      <CosmicOrb style={{ width: '100px', height: '100px', top: '30%', right: '5%' }} $color="rgba(15,23,42,0.4)" $duration="10s" $delay="4s" />

      <Card>
        <LogoContainer>
          <LogoImage src={logo} alt="NeuraStack Logo" />
        </LogoContainer>

        {err && (
          <Message type="error" id="error-message" role="alert">
            <PiWarningCircleBold size={20} />
            {err}
            {isRetryableError && lastFailedAction && (
              <RetryButton onClick={handleRetry} disabled={isLoading}>
                Retry
              </RetryButton>
            )}
          </Message>
        )}

        <GoogleButton type="button" onClick={handleGoogleLogin} disabled={isLoading} aria-label="Sign in with Google account">
          {isLoading ? (
            <>
              <LoadingSpinner />
              Signing in with Google...
            </>
          ) : (
            <>
              <GoogleIcon />
              Sign in with Google
            </>
          )}
        </GoogleButton>

        <Divider>or</Divider>

        <GuestButton type="button" onClick={handleGuestLogin} disabled={isLoading} aria-label="Continue as guest user without account">
          {isLoading ? (
            <>
              <LoadingSpinner />
              Continuing as Guest...
            </>
          ) : (
            'Continue as Guest'
          )}
        </GuestButton>
      </Card>
    </Page>
  );
}