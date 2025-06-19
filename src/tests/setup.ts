/**
 * Test Setup Configuration
 * 
 * Configures the testing environment with proper mocks, utilities, and global setup
 * for comprehensive testing of the NeuraStack frontend application.
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Declare global types for test utilities
declare global {
  var testUtils: {
    mockUser: any;
    mockWorkout: any;
    mockProfile: any;
  };
}

// Mock Firebase
vi.mock('../firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
    signInWithPopup: vi.fn(),
    signInAnonymously: vi.fn(),
    signOut: vi.fn(),
  },
  db: {
    collection: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    onSnapshot: vi.fn(),
  },
  analytics: {
    logEvent: vi.fn(),
  },
}));

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: null,
    onAuthStateChanged: vi.fn(),
  })),
  signInWithPopup: vi.fn(),
  signInAnonymously: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(() => Promise.resolve({
    exists: () => false,
    data: () => null,
  })),
  setDoc: vi.fn(() => Promise.resolve()),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({
    docs: [],
    empty: true,
  })),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
  enableNetwork: vi.fn(() => Promise.resolve()),
  disableNetwork: vi.fn(() => Promise.resolve()),
}));

// Mock Firebase Analytics
vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(),
  logEvent: vi.fn(),
}));

// Mock React Router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
  BrowserRouter: ({ children }: { children: any }) => children,
  Routes: ({ children }: { children: any }) => children,
  Route: ({ children }: { children: any }) => children,
  Link: ({ children, to }: { children: any; to: string }) =>
    ({ type: 'a', props: { href: to, children } }),
}));

// Mock Chakra UI Toast
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
  };
});

// Mock API calls
vi.mock('../lib/api', () => ({
  queryStack: vi.fn(() => Promise.resolve({
    answer: 'Mock AI response',
    models: ['mock-model'],
    tokenCount: 100,
  })),
}));

// Mock NeuraStack Client
vi.mock('../lib/neurastack-client', () => ({
  neuraStackClient: {
    configure: vi.fn(),
    queryAI: vi.fn(() => Promise.resolve({
      answer: 'Mock AI response',
      memoryContext: [],
      tokenCount: 100,
    })),
    generateWorkout: vi.fn(() => Promise.resolve({
      status: 'success',
      data: {
        workout: {
          name: 'Mock Workout',
          exercises: [],
          duration: 30,
        },
      },
    })),
    storeMemory: vi.fn(() => Promise.resolve()),
    healthCheck: vi.fn(() => Promise.resolve({ status: 'healthy' })),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('sessionStorage', sessionStorageMock);

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock performance API
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
  },
});

// Global test utilities
global.testUtils = {
  mockUser: {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    isAnonymous: false,
  },
  mockWorkout: {
    id: 'test-workout-123',
    name: 'Test Workout',
    exercises: [
      {
        name: 'Push-ups',
        sets: 3,
        reps: 10,
        duration: 30,
      },
    ],
    duration: 30,
    difficulty: 'beginner',
  },
  mockProfile: {
    fitnessLevel: 'beginner',
    goals: ['weight-loss'],
    equipment: ['bodyweight'],
    availableTime: 30,
    workoutDays: ['monday', 'wednesday', 'friday'],
    completedOnboarding: true,
  },
};

// Setup cleanup
import { afterEach } from 'vitest';

afterEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});
