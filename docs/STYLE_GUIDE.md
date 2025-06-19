# NeuraStack Frontend Style Guide

## 🎯 Overview

This style guide establishes human-readable, maintainable coding standards for the NeuraStack React/TypeScript application. Our goal is to create code that is intuitive, self-documenting, and easy to understand for any developer.

## 📝 Naming Conventions

### Variables and Functions

**✅ DO: Use descriptive, human-readable names**
```typescript
// Good - Clear intent and purpose
const userAuthenticationToken = generateAuthToken();
const calculateTotalWorkoutDuration = (exercises: Exercise[]) => { ... };
const isUserProfileComplete = checkProfileCompleteness(profile);

// Bad - Cryptic abbreviations
const usrTkn = genTkn();
const calcDur = (ex: any[]) => { ... };
const isUsrOk = chkProf(prof);
```

**✅ DO: Use verb-noun patterns for functions**
```typescript
// Good - Action + Object
const validateUserInput = (input: string) => { ... };
const fetchWorkoutHistory = async (userId: string) => { ... };
const renderExerciseCard = (exercise: Exercise) => { ... };

// Bad - Unclear action
const userInput = (input: string) => { ... };
const workoutHistory = async (userId: string) => { ... };
const exerciseCard = (exercise: Exercise) => { ... };
```

### Components

**✅ DO: Use PascalCase with descriptive names**
```typescript
// Good - Clear component purpose
const WorkoutGenerationModal = () => { ... };
const UserProfileEditForm = () => { ... };
const ExerciseInstructionCard = () => { ... };

// Bad - Generic or unclear names
const Modal = () => { ... };
const Form = () => { ... };
const Card = () => { ... };
```

### Types and Interfaces

**✅ DO: Prefix interfaces with 'I' and use descriptive names**
```typescript
// Good - Clear type definitions
interface IUserProfile {
  personalInformation: IPersonalInformation;
  fitnessGoals: IFitnessGoal[];
  workoutPreferences: IWorkoutPreferences;
}

interface IWorkoutExercise {
  exerciseName: string;
  targetMuscleGroups: string[];
  repetitionCount: number;
  setCount: number;
}

// Bad - Generic or unclear types
interface User {
  info: any;
  goals: any[];
  prefs: any;
}
```

### Constants and Enums

**✅ DO: Use UPPER_SNAKE_CASE for constants**
```typescript
// Good - Clear constant purposes
const MAXIMUM_WORKOUT_DURATION_MINUTES = 120;
const DEFAULT_REST_PERIOD_SECONDS = 60;
const API_REQUEST_TIMEOUT_MILLISECONDS = 30000;

enum WorkoutDifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}
```

## 🏗️ Code Structure

### File Organization

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Generic components (Button, Modal, etc.)
│   ├── forms/           # Form-specific components
│   └── specialized/     # Feature-specific components
├── pages/               # Route-level components
├── hooks/               # Custom React hooks
├── services/            # API and business logic
├── utils/               # Pure utility functions
├── types/               # TypeScript type definitions
├── constants/           # Application constants
└── tests/               # Test files
```

### Component Structure

```typescript
/**
 * WorkoutGenerationModal Component
 * 
 * Provides an interface for users to generate personalized workout plans
 * using AI-powered recommendations based on their fitness profile.
 */

import React, { useState, useCallback } from 'react';
import type { IWorkoutGenerationRequest, IWorkoutPlan } from '../types/fitness';

interface IWorkoutGenerationModalProps {
  isModalOpen: boolean;
  onCloseModal: () => void;
  userFitnessProfile: IUserFitnessProfile;
  onWorkoutGenerated: (workout: IWorkoutPlan) => void;
}

export const WorkoutGenerationModal: React.FC<IWorkoutGenerationModalProps> = ({
  isModalOpen,
  onCloseModal,
  userFitnessProfile,
  onWorkoutGenerated
}) => {
  // State management with descriptive names
  const [isGeneratingWorkout, setIsGeneratingWorkout] = useState(false);
  const [workoutGenerationError, setWorkoutGenerationError] = useState<string | null>(null);

  // Event handlers with clear purposes
  const handleWorkoutGeneration = useCallback(async () => {
    setIsGeneratingWorkout(true);
    setWorkoutGenerationError(null);
    
    try {
      const generatedWorkout = await generatePersonalizedWorkout(userFitnessProfile);
      onWorkoutGenerated(generatedWorkout);
      onCloseModal();
    } catch (error) {
      setWorkoutGenerationError('Failed to generate workout. Please try again.');
    } finally {
      setIsGeneratingWorkout(false);
    }
  }, [userFitnessProfile, onWorkoutGenerated, onCloseModal]);

  return (
    // Component JSX with clear structure
  );
};
```

## 🔧 TypeScript Best Practices

### Type Safety

**✅ DO: Define explicit types instead of using 'any'**
```typescript
// Good - Explicit type definitions
interface IApiResponse<TData> {
  success: boolean;
  data?: TData;
  error?: string;
  timestamp: number;
}

const fetchUserData = async (userId: string): Promise<IApiResponse<IUserProfile>> => {
  // Implementation
};

// Bad - Using 'any' types
const fetchUserData = async (userId: any): Promise<any> => {
  // Implementation
};
```

### Error Handling

**✅ DO: Use comprehensive error handling with typed errors**
```typescript
// Good - Typed error handling
import { analyzeApplicationError, handleAsynchronousOperationWithRetry } from '../utils/errorHandler';

const saveUserProfile = async (profile: IUserProfile): Promise<void> => {
  const result = await handleAsynchronousOperationWithRetry(
    () => userProfileService.save(profile),
    { component: 'UserProfileForm', action: 'save' }
  );

  if (!result.success) {
    throw new Error(result.error?.userMessage || 'Failed to save profile');
  }
};
```

## 🎨 Component Design Principles

### Single Responsibility
Each component should have one clear purpose and responsibility.

### Composition over Inheritance
Build complex components by composing simpler ones.

### Props Interface
Always define clear TypeScript interfaces for component props.

### Error Boundaries
Implement graceful error handling at appropriate component levels.

## 📚 Documentation Standards

### Function Documentation
```typescript
/**
 * Calculates the estimated calorie burn for a workout session
 * 
 * @param exercises - Array of exercises in the workout
 * @param userWeight - User's weight in pounds
 * @param workoutDuration - Duration of workout in minutes
 * @returns Estimated calories burned during the workout
 */
const calculateWorkoutCalorieBurn = (
  exercises: IWorkoutExercise[],
  userWeight: number,
  workoutDuration: number
): number => {
  // Implementation
};
```

### Component Documentation
```typescript
/**
 * ExerciseInstructionCard Component
 * 
 * Displays detailed instructions for performing a specific exercise,
 * including form tips, muscle groups targeted, and safety considerations.
 * 
 * @param exercise - The exercise to display instructions for
 * @param showVideo - Whether to display instructional video
 * @param onMarkComplete - Callback when user marks exercise as complete
 */
```

## 🧪 Testing Standards

### Test Naming
```typescript
describe('WorkoutGenerationService', () => {
  describe('generatePersonalizedWorkout', () => {
    it('should create beginner workout for new user', async () => {
      // Test implementation
    });

    it('should include user preferred equipment only', async () => {
      // Test implementation
    });

    it('should handle API errors gracefully', async () => {
      // Test implementation
    });
  });
});
```

### Test Structure
- **Arrange**: Set up test data and mocks
- **Act**: Execute the function being tested
- **Assert**: Verify the expected outcome

## 🚀 Performance Guidelines

### Memoization
Use React.memo, useMemo, and useCallback appropriately for performance optimization.

### Bundle Optimization
Implement code splitting and lazy loading for large components.

### Type-Safe Performance Monitoring
Use typed performance metrics and monitoring.

## 📋 Code Review Checklist

- [ ] All variables and functions have descriptive, human-readable names
- [ ] No 'any' types used - all types are explicitly defined
- [ ] Components follow single responsibility principle
- [ ] Error handling is comprehensive and user-friendly
- [ ] Tests cover critical functionality with clear naming
- [ ] Documentation explains intent and usage
- [ ] Performance considerations are addressed
- [ ] Accessibility requirements are met

This style guide ensures our codebase remains maintainable, scalable, and enjoyable to work with as the team and application grow.
