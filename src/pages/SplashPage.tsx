import {
    CheckCircleIcon,
    ExclamationCircleIcon,
    InformationCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/solid';
import { GoogleAuthProvider, signInAnonymously, signInWithPopup } from "firebase/auth";
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { css, keyframes } from 'styled-components';
import logo from "../assets/icons/logo.svg";
import howItWorksImage from "../assets/img/how-it-works.png";
import { auth } from "../firebase";
import { useAuthStore } from "../store/useAuthStore";

const provider = new GoogleAuthProvider();



interface MessageProps {
  type: 'error' | 'success';
}

/* ---------- Enhanced Animations ---------- */
// const fadeInUp = keyframes`
//   from {
//     opacity: 0;
//     transform: translateY(40px) scale(0.95);
//     filter: blur(4px);
//   }
//   to {
//     opacity: 1;
//     transform: translateY(0) scale(1);
//     filter: blur(0);
//   }
// `;

const modernSlideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;



const glassMorphPulse = keyframes`
  0%, 100% {
    opacity: 0.8;
    backdrop-filter: blur(20px);
    transform: scale(1);
  }
  50% {
    opacity: 1;
    backdrop-filter: blur(24px);
    transform: scale(1.02);
  }
`;



const slideIn = keyframes`
  from {
    transform: translateX(-100%) scale(0.8);
    opacity: 0;
  }
  to {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
`;







const iridescenceShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
`;

const spinLoader = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

/* ---------- Responsive Breakpoints ---------- */
const breakpoints = {
  xs: '320px',
  sm: '480px',
  md: '768px',
  lg: '1024px',
  xl: '1200px'
};

/* ---------- Grok-Inspired Glow Effect Background Container ---------- */
const Page = styled.div`
  min-height: 100vh;
  min-height: 100dvh; /* Dynamic viewport height for mobile */
  display: flex;
  align-items: center;
  justify-content: center;

  /* Grok-inspired clean, focused glow background */
  background:
    /* Central focused glow - similar to Grok's spotlight effect */
    radial-gradient(ellipse 1000px 600px at 50% 40%, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.06) 30%, transparent 70%),
    /* Subtle ambient glow */
    radial-gradient(ellipse 1400px 800px at 50% 50%, rgba(30, 58, 138, 0.08) 0%, transparent 60%),
    /* Clean dark base */
    linear-gradient(180deg, #0f172a 0%, #1e293b 100%);

  background-size: 100% 100%, 120% 120%, 100% 100%, 100% 100%;
  background-attachment: fixed;
  padding: 20px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  perspective: 1200px;

  /* Enhanced mobile support with performance optimizations */
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: none;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  /* Performance optimizations */
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
  contain: layout style paint;

  /* Enhanced mobile viewport handling */
  @media (max-width: 768px) {
    padding: clamp(16px, 4vw, 24px);
    height: 100vh;
    height: 100dvh;
    min-height: -webkit-fill-available;
    background-attachment: scroll; /* Better mobile performance */
    /* Simplified background for mobile performance */
    background:
      radial-gradient(ellipse 800px 600px at 50% 30%, rgba(30, 58, 138, 0.12) 0%, rgba(15, 23, 42, 0.9) 60%, rgba(2, 6, 23, 1) 100%),
      linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  }

  /* Tablet optimizations */
  @media (min-width: 769px) and (max-width: 1024px) {
    padding: clamp(24px, 5vw, 32px);
  }

  /* Clean, subtle glow overlay - Grok-inspired */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    /* Subtle central glow enhancement */
    background:
      radial-gradient(ellipse 600px 400px at 50% 45%, rgba(59, 130, 246, 0.08) 0%, transparent 60%);
    pointer-events: none;
    animation: ${glassMorphPulse} 20s ease-in-out infinite;
    opacity: 0.7;
  }

  /* Responsive padding adjustments */
  @media (max-width: ${breakpoints.xs}) {
    padding: 12px;
    min-height: -webkit-fill-available; /* iOS Safari fix */
  }

  @media (max-width: ${breakpoints.sm}) {
    padding: 16px;
  }

  @media (min-width: ${breakpoints.md}) {
    padding: 24px;
  }

  @media (min-width: ${breakpoints.lg}) {
    padding: 32px;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    &::before,
    &::after {
      animation: none;
    }
  }
`;







/* ---------- Enhanced Wide Glass Morphism Card - Innovative & Clean ---------- */
const Card = styled.form`
  width: 100%;
  max-width: 520px;
  padding: 56px 64px;
  background:
    linear-gradient(135deg,
      rgba(255, 255, 255, 0.98) 0%,
      rgba(248, 250, 252, 0.96) 25%,
      rgba(241, 245, 249, 0.94) 75%,
      rgba(226, 232, 240, 0.92) 100%
    );
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-radius: 32px;
  border: 1px solid rgba(59, 130, 246, 0.25);
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.12),
    0 12px 40px rgba(59, 130, 246, 0.06),
    0 4px 16px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    inset 0 -1px 0 rgba(59, 130, 246, 0.08);
  text-align: center;
  animation: ${modernSlideIn} 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 10;
  will-change: transform;
  transform: translateZ(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* Enhanced touch interactions */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg,
      rgba(59, 130, 246, 0.08) 0%,
      rgba(37, 99, 235, 0.06) 25%,
      rgba(79, 156, 249, 0.05) 50%,
      rgba(30, 58, 138, 0.04) 75%,
      rgba(59, 130, 246, 0.06) 100%
    );
    background-size: 200% 200%;
    animation: ${iridescenceShift} 18s ease-in-out infinite;
    border-radius: 28px;
    z-index: -1;
    opacity: 0.6;
  }

  &::after {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    background: linear-gradient(45deg,
      rgba(59, 130, 246, 0.25) 0%,
      rgba(37, 99, 235, 0.2) 25%,
      rgba(79, 156, 249, 0.18) 50%,
      rgba(30, 58, 138, 0.15) 75%,
      rgba(59, 130, 246, 0.25) 100%
    );
    background-size: 300% 300%;
    animation: ${iridescenceShift} 12s ease-in-out infinite;
    border-radius: 32px;
    z-index: -2;
    opacity: 0.4;
    filter: blur(1px);
  }

  /* Enhanced responsive design for wider card with improved mobile optimization */
  @media (max-width: ${breakpoints.xs}) {
    padding: 32px 24px;
    margin: 16px;
    max-width: calc(100vw - 32px);
    border-radius: 28px;
    backdrop-filter: blur(32px);
    -webkit-backdrop-filter: blur(32px);
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.1),
      0 8px 32px rgba(59, 130, 246, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.95);
  }

  @media (max-width: ${breakpoints.sm}) {
    padding: 40px 32px;
    margin: 20px;
    max-width: 420px;
    border-radius: 30px;
    backdrop-filter: blur(36px);
    -webkit-backdrop-filter: blur(36px);
  }

  @media (min-width: ${breakpoints.md}) {
    padding: 48px 52px;
    max-width: 480px;
  }

  @media (min-width: ${breakpoints.lg}) {
    padding: 56px 64px;
    max-width: 520px;
  }

  /* Enhanced reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    &::before,
    &::after {
      animation: none;
    }
  }

  /* Enhanced high contrast mode support for dark theme */
  @media (prefers-contrast: high) {
    border: 2px solid rgba(59, 130, 246, 0.8);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
  }
`;

/* ---------- Logo Container ---------- */
const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;

  /* Responsive margin adjustments */
  @media (max-width: ${breakpoints.xs}) {
    margin-bottom: 24px;
  }

  @media (max-width: ${breakpoints.sm}) {
    margin-bottom: 28px;
  }

  @media (min-width: ${breakpoints.lg}) {
    margin-bottom: 36px;
  }
`;

const LogoImage = styled.img`
  width: 220px;
  height: 220px;
  margin-bottom: 12px;
  filter:
    drop-shadow(0 0 24px rgba(59, 130, 246, 0.4))
    drop-shadow(0 0 48px rgba(37, 99, 235, 0.2))
    drop-shadow(0 8px 32px rgba(0, 0, 0, 0.3));

  /* Enhanced performance - static logo */
  backface-visibility: hidden;
  transform: translateZ(0);

  /* Responsive sizing */
  @media (max-width: ${breakpoints.xs}) {
    width: 160px;
    height: 160px;
    margin-bottom: 8px;
  }

  @media (max-width: ${breakpoints.sm}) {
    width: 180px;
    height: 180px;
    margin-bottom: 10px;
  }

  @media (min-width: ${breakpoints.md}) {
    width: 200px;
    height: 200px;
  }

  @media (min-width: ${breakpoints.lg}) {
    width: 240px;
    height: 240px;
    margin-bottom: 16px;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    filter:
      drop-shadow(0 0 16px rgba(79, 156, 249, 0.3))
      drop-shadow(0 4px 16px rgba(0, 0, 0, 0.2));
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    filter:
      drop-shadow(0 0 20px rgba(79, 156, 249, 0.8))
      drop-shadow(0 8px 24px rgba(0, 0, 0, 0.5));
  }

  /* Static logo - no hover effects for cleaner appearance */
`;

/* ---------- Enhanced Loading Spinner ---------- */
const LoadingSpinner = styled.div`
  width: 22px;
  height: 22px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top: 2px solid rgba(255, 255, 255, 0.9);
  border-right: 2px solid rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: ${spinLoader} 0.8s linear infinite, ${pulse} 2s ease-in-out infinite;
  margin-right: 10px;
  will-change: transform;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    right: 2px;
    bottom: 2px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }
`;

/* ---------- Modern Blue-Themed Google Button ---------- */
const GoogleButton = styled.button`
  width: 100%;
  height: 58px;
  padding: 0 28px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 16px;
  background:
    linear-gradient(135deg,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(248, 250, 252, 0.92) 50%,
      rgba(241, 245, 249, 0.88) 100%
    );
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  color: #1e293b;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-family-text);
  letter-spacing: -0.01em;
  margin-top: 16px;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(59, 130, 246, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  will-change: transform, box-shadow;

  /* Enhanced accessibility */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 48px; /* WCAG touch target size */

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg,
      transparent,
      rgba(59, 130, 246, 0.15),
      rgba(37, 99, 235, 0.1),
      transparent
    );
    transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg,
      rgba(59, 130, 246, 0.25) 0%,
      rgba(37, 99, 235, 0.2) 30%,
      rgba(79, 156, 249, 0.18) 70%,
      rgba(30, 58, 138, 0.15) 100%
    );
    border-radius: 18px;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover:not(:disabled) {
    border-color: rgba(59, 130, 246, 0.5);
    background:
      linear-gradient(135deg,
        rgba(255, 255, 255, 0.98) 0%,
        rgba(248, 250, 252, 0.95) 50%,
        rgba(241, 245, 249, 0.92) 100%
      );
    color: #0f172a;
    transform: translateY(-3px) scale(1.02);
    box-shadow:
      0 12px 40px rgba(0, 0, 0, 0.15),
      0 4px 16px rgba(59, 130, 246, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);

    &::before {
      left: 100%;
    }

    &::after {
      opacity: 1;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(-1px) scale(1.01);
    box-shadow:
      0 6px 24px rgba(0, 0, 0, 0.12),
      0 2px 8px rgba(59, 130, 246, 0.08);
  }

  &:focus {
    outline: none;
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.12),
      0 0 0 3px rgba(59, 130, 246, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  &:focus-visible {
    outline: 2px solid rgba(59, 130, 246, 0.8);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;

    &::before {
      display: none;
    }
  }

  svg {
    margin-right: 12px;
    flex-shrink: 0;
  }

  /* Responsive adjustments */
  @media (max-width: ${breakpoints.xs}) {
    height: 48px;
    padding: 0 20px;
    font-size: 0.9rem;
    border-radius: 14px;
  }

  @media (max-width: ${breakpoints.sm}) {
    height: 49px;
    padding: 0 22px;
    border-radius: 15px;
  }

  @media (min-width: ${breakpoints.lg}) {
    height: 52px;
    padding: 0 28px;
    font-size: 1rem;
    border-radius: 18px;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover:not(:disabled) {
      transform: none;
    }

    &::before {
      display: none;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    border: 3px solid rgba(59, 130, 246, 0.6);
    background: rgba(255, 255, 255, 1);
  }
`;

/* ---------- Guest Button - Matching Google Button Style ---------- */
const GuestButton = styled.button`
  width: 100%;
  height: 58px;
  padding: 0 28px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 16px;
  background:
    linear-gradient(135deg,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(248, 250, 252, 0.92) 50%,
      rgba(241, 245, 249, 0.88) 100%
    );
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  color: #1e293b;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(59, 130, 246, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  will-change: transform, box-shadow;

  /* Enhanced accessibility */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 48px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg,
      transparent,
      rgba(59, 130, 246, 0.2),
      rgba(37, 99, 235, 0.15),
      transparent
    );
    transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg,
      rgba(59, 130, 246, 0.3) 0%,
      rgba(37, 99, 235, 0.25) 30%,
      rgba(79, 156, 249, 0.2) 70%,
      rgba(30, 58, 138, 0.25) 100%
    );
    border-radius: 18px;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover:not(:disabled) {
    border-color: rgba(59, 130, 246, 0.5);
    background:
      linear-gradient(135deg,
        rgba(255, 255, 255, 0.98) 0%,
        rgba(248, 250, 252, 0.95) 50%,
        rgba(241, 245, 249, 0.92) 100%
      );
    color: #0f172a;
    transform: translateY(-3px) scale(1.02);
    box-shadow:
      0 12px 40px rgba(0, 0, 0, 0.15),
      0 4px 16px rgba(59, 130, 246, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);

    &::before {
      left: 100%;
    }

    &::after {
      opacity: 1;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(-1px) scale(1.01);
    box-shadow:
      0 8px 20px rgba(0, 0, 0, 0.15),
      0 4px 12px rgba(255, 255, 255, 0.08);
  }

  &:focus {
    outline: none;
    box-shadow:
      0 0 0 3px rgba(255, 255, 255, 0.3),
      0 8px 24px rgba(0, 0, 0, 0.15);
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.8);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;

    &::before,
    &::after {
      display: none;
    }
  }

  /* Responsive adjustments */
  @media (max-width: ${breakpoints.xs}) {
    height: 48px;
    padding: 0 20px;
    font-size: 0.9rem;
    border-radius: 16px;
  }

  @media (max-width: ${breakpoints.sm}) {
    height: 50px;
    padding: 0 24px;
    border-radius: 18px;
  }

  @media (min-width: ${breakpoints.lg}) {
    height: 56px;
    padding: 0 32px;
    font-size: 1.05rem;
    border-radius: 22px;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover:not(:disabled) {
      transform: none;
    }

    &::before,
    &::after {
      display: none;
    }
  }
`;

/* ---------- Info Button - Matching Google Button Style ---------- */
const InfoButton = styled.button`
  width: 100%;
  height: 58px;
  padding: 0 28px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 16px;
  background:
    linear-gradient(135deg,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(248, 250, 252, 0.92) 50%,
      rgba(241, 245, 249, 0.88) 100%
    );
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  color: #1e293b;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(59, 130, 246, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  will-change: transform, box-shadow;

  /* Enhanced accessibility */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 44px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg,
      transparent,
      rgba(59, 130, 246, 0.15),
      rgba(37, 99, 235, 0.1),
      transparent
    );
    transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg,
      rgba(59, 130, 246, 0.25) 0%,
      rgba(37, 99, 235, 0.2) 30%,
      rgba(79, 156, 249, 0.18) 70%,
      rgba(30, 58, 138, 0.15) 100%
    );
    border-radius: 18px;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover:not(:disabled) {
    border-color: rgba(59, 130, 246, 0.5);
    background:
      linear-gradient(135deg,
        rgba(255, 255, 255, 0.98) 0%,
        rgba(248, 250, 252, 0.95) 50%,
        rgba(241, 245, 249, 0.92) 100%
      );
    color: #0f172a;
    transform: translateY(-3px) scale(1.02);
    box-shadow:
      0 12px 40px rgba(0, 0, 0, 0.15),
      0 4px 16px rgba(59, 130, 246, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);

    &::before {
      left: 100%;
    }

    &::after {
      opacity: 1;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(-1px) scale(1.005);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.12),
      0 2px 6px rgba(79, 156, 249, 0.1);
  }

  &:focus {
    outline: none;
    box-shadow:
      0 0 0 3px rgba(79, 156, 249, 0.3),
      0 4px 16px rgba(0, 0, 0, 0.1);
  }

  &:focus-visible {
    outline: 2px solid rgba(79, 156, 249, 0.8);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;

    &::before {
      display: none;
    }
  }

  svg {
    margin-right: 10px;
    flex-shrink: 0;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover:not(:disabled) svg {
    transform: scale(1.1);
  }

  /* Responsive adjustments */
  @media (max-width: ${breakpoints.xs}) {
    height: 44px;
    padding: 0 20px;
    font-size: 0.9rem;
    border-radius: 16px;
  }

  @media (max-width: ${breakpoints.sm}) {
    height: 46px;
    padding: 0 22px;
    border-radius: 17px;
  }

  @media (min-width: ${breakpoints.lg}) {
    height: 50px;
    padding: 0 28px;
    font-size: 1rem;
    border-radius: 20px;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover:not(:disabled) {
      transform: none;
    }

    &::before {
      display: none;
    }

    svg {
      transition: none;
    }

    &:hover:not(:disabled) svg {
      transform: none;
    }
  }
`;

/* ---------- Enhanced Divider with Better Readability ---------- */
const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0 16px 0;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg,
      transparent,
      rgba(100, 116, 139, 0.4),
      rgba(100, 116, 139, 0.6),
      rgba(100, 116, 139, 0.4),
      transparent
    );
  }

  &::before {
    margin-right: 16px;
  }

  &::after {
    margin-left: 16px;
  }
`;

/* ---------- Enhanced Error/Success Message ---------- */
const Message = styled.div<MessageProps>`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-radius: 20px;
  font-size: 0.95rem;
  font-weight: 600;
  margin-top: 24px;
  min-height: 52px;
  animation: ${slideIn} 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  position: relative;
  overflow: hidden;
  will-change: transform, opacity;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: inherit;
    filter: blur(1px);
    opacity: 0.5;
    z-index: -1;
  }

  ${props => props.type === 'error' && css`
    background:
      linear-gradient(135deg,
        rgba(239, 68, 68, 0.2) 0%,
        rgba(220, 38, 38, 0.15) 100%
      );
    color: #fecaca;
    border: 1px solid rgba(239, 68, 68, 0.4);
    box-shadow:
      0 8px 24px rgba(239, 68, 68, 0.15),
      0 4px 12px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);

    &::after {
      content: '';
      position: absolute;
      top: -1px;
      left: -1px;
      right: -1px;
      bottom: -1px;
      background: linear-gradient(45deg,
        rgba(239, 68, 68, 0.3) 0%,
        rgba(220, 38, 38, 0.2) 100%
      );
      border-radius: 21px;
      z-index: -2;
      opacity: 0.6;
    }
  `}

  ${props => props.type === 'success' && css`
    background:
      linear-gradient(135deg,
        rgba(34, 197, 94, 0.2) 0%,
        rgba(16, 185, 129, 0.15) 100%
      );
    color: #bbf7d0;
    border: 1px solid rgba(34, 197, 94, 0.4);
    box-shadow:
      0 8px 24px rgba(34, 197, 94, 0.15),
      0 4px 12px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);

    &::after {
      content: '';
      position: absolute;
      top: -1px;
      left: -1px;
      right: -1px;
      bottom: -1px;
      background: linear-gradient(45deg,
        rgba(34, 197, 94, 0.3) 0%,
        rgba(16, 185, 129, 0.2) 100%
      );
      border-radius: 21px;
      z-index: -2;
      opacity: 0.6;
    }
  `}

  svg {
    margin-right: 12px;
    flex-shrink: 0;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }

  /* Responsive adjustments */
  @media (max-width: ${breakpoints.xs}) {
    padding: 14px 18px;
    font-size: 0.9rem;
    margin-top: 20px;
    min-height: 48px;
    border-radius: 18px;
  }

  @media (max-width: ${breakpoints.sm}) {
    padding: 15px 19px;
    font-size: 0.925rem;
    margin-top: 22px;
    min-height: 50px;
    border-radius: 19px;
  }

  @media (min-width: ${breakpoints.lg}) {
    padding: 18px 22px;
    font-size: 1rem;
    margin-top: 28px;
    min-height: 56px;
    border-radius: 22px;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    animation: none;

    &::before,
    &::after {
      display: none;
    }
  }
`;

/* ---------- Enhanced Modal Components ---------- */
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(ellipse at center, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.9) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
  animation: ${modernSlideIn} 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity, backdrop-filter;

  /* Enhanced mobile support */
  @media (max-width: ${breakpoints.sm}) {
    padding: 16px;
  }
`;

const ModalContent = styled.div`
  position: relative;
  max-width: 92vw;
  max-height: 88vh;
  background:
    linear-gradient(135deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.05) 100%
    );
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  box-shadow:
    0 32px 64px rgba(0, 0, 0, 0.4),
    0 16px 32px rgba(79, 156, 249, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  will-change: transform;
  transform: translateZ(0);

  /* Enhanced mobile support */
  @media (max-width: ${breakpoints.sm}) {
    max-width: 95vw;
    max-height: 90vh;
    border-radius: 24px;
  }
`;

const ModalImage = styled.img`
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 82vh;
  object-fit: contain;
  border-radius: 32px;
  filter:
    drop-shadow(0 8px 24px rgba(0, 0, 0, 0.3))
    drop-shadow(0 4px 12px rgba(79, 156, 249, 0.1));

  /* Enhanced mobile support */
  @media (max-width: ${breakpoints.sm}) {
    max-height: 85vh;
    border-radius: 24px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  background:
    linear-gradient(135deg,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0.9) 100%
    );
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1001;
  will-change: transform, background;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.3),
    0 4px 12px rgba(0, 0, 0, 0.2);

  /* Enhanced accessibility */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 44px;
  min-width: 44px;

  &:hover {
    background:
      linear-gradient(135deg,
        rgba(239, 68, 68, 0.9) 0%,
        rgba(220, 38, 38, 0.95) 100%
      );
    border-color: rgba(239, 68, 68, 0.4);
    color: rgba(255, 255, 255, 1);
    transform: scale(1.1);
    box-shadow:
      0 12px 32px rgba(0, 0, 0, 0.4),
      0 8px 16px rgba(239, 68, 68, 0.3);
  }

  &:active {
    transform: scale(1.05);
    box-shadow:
      0 6px 16px rgba(0, 0, 0, 0.3),
      0 4px 8px rgba(239, 68, 68, 0.2);
  }

  &:focus {
    outline: none;
    box-shadow:
      0 0 0 3px rgba(79, 156, 249, 0.4),
      0 8px 24px rgba(0, 0, 0, 0.3);
  }

  &:focus-visible {
    outline: 2px solid rgba(79, 156, 249, 0.8);
    outline-offset: 2px;
  }

  svg {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover svg {
    transform: rotate(90deg);
  }

  /* Mobile adjustments */
  @media (max-width: ${breakpoints.sm}) {
    top: 16px;
    right: 16px;
    width: 44px;
    height: 44px;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }

    svg {
      transition: none;
    }

    &:hover svg {
      transform: none;
    }
  }
`;

/* ---------- Google Icon Component ---------- */
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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

/* ---------- Component ---------- */
export function SplashPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);





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

    // Enhanced mobile viewport handling
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    // Prevent iOS bounce scrolling
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';

    // Enhanced touch handling for splash page
    const preventTouchMove = (e: TouchEvent) => {
      // Allow touch on interactive elements
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
    <Page role="main" aria-label="NeuraStack Authentication">
      {/* Skip link for keyboard navigation accessibility */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          zIndex: 999,
          padding: '8px 16px',
          background: 'rgba(59, 130, 246, 0.9)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: '500'
        }}
        onFocus={(e) => {
          e.target.style.left = '20px';
          e.target.style.top = '20px';
        }}
        onBlur={(e) => {
          e.target.style.left = '-9999px';
        }}
      >
        Skip to main content
      </a>

      {/* Clean background - no distracting animations for Grok-like aesthetic */}

      <Card
        id="main-content"
        role="form"
        aria-label="NeuraStack Authentication"
      >
        <LogoContainer>
          <LogoImage src={logo} alt="NeuraStack Logo" />
        </LogoContainer>

        {/* Moved error and success messages above buttons for better visibility */}
        {err && (
          <Message type="error" id="error-message" role="alert">
            <ExclamationCircleIcon width={20} />
            {err}
          </Message>
        )}
        {success && (
          <Message type="success" role="status">
            <CheckCircleIcon width={20} />
            {success}
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

        <InfoButton type="button" onClick={handleInfoClick} disabled={isLoading} aria-label="Learn more about NeuraStack" aria-expanded={showModal} aria-haspopup="dialog">
          <InformationCircleIcon width={18} />
          What is neurastack?
        </InfoButton>
      </Card>

      {/* Enhanced How it Works Modal */}
      {showModal && (
        <ModalOverlay onClick={handleModalClose} role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-description">
          <ModalContent onClick={e => e.stopPropagation()}>
            <CloseButton onClick={handleModalClose} aria-label="Close information modal" autoFocus>
              <XMarkIcon width={20} />
            </CloseButton>
            <ModalImage src={howItWorksImage} alt="Detailed diagram showing how NeuraStack works with AI models and user interactions" loading="lazy" id="modal-description" />
            <div id="modal-title" style={{ position: 'absolute', left: '-9999px' }}>
              How NeuraStack Works
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </Page>
  );
}