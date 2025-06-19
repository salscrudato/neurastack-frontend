import { useState, useEffect, useCallback, useRef } from 'react';
import { Exercise } from '../types/neurafit';

interface VoiceCoachingOptions {
  enabled: boolean;
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface VoiceCoachingHook {
  isEnabled: boolean;
  isSupported: boolean;
  isSpeaking: boolean;
  voices: SpeechSynthesisVoice[];
  options: VoiceCoachingOptions;
  speak: (text: string, priority?: 'low' | 'medium' | 'high') => void;
  speakExerciseInstructions: (exercise: Exercise) => void;
  speakMotivation: () => void;
  speakSetComplete: (setNumber: number, totalSets: number) => void;
  speakRestPeriod: (restTime: number) => void;
  speakWorkoutComplete: () => void;
  updateOptions: (newOptions: Partial<VoiceCoachingOptions>) => void;
  stop: () => void;
}

const motivationalPhrases = [
  "Great job! Keep pushing!",
  "You're doing amazing!",
  "Stay strong, you've got this!",
  "Perfect form! Keep it up!",
  "You're crushing it!",
  "Almost there, don't give up!",
  "Excellent work!",
  "You're stronger than you think!",
  "Keep that energy up!",
  "Outstanding effort!"
];

const restPeriodPhrases = [
  "Take a deep breath and recover",
  "Use this time to hydrate",
  "Shake it out and prepare for the next set",
  "Focus on your breathing",
  "You're doing great, rest up",
  "Prepare mentally for the next set"
];

export const useVoiceCoaching = (initialOptions: Partial<VoiceCoachingOptions> = {}): VoiceCoachingHook => {
  const [isEnabled, setIsEnabled] = useState(initialOptions.enabled ?? false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [options, setOptions] = useState<VoiceCoachingOptions>({
    enabled: false,
    rate: 1.0,
    pitch: 1.0,
    volume: 0.8,
    ...initialOptions
  });

  const speechQueue = useRef<Array<{ text: string; priority: 'low' | 'medium' | 'high' }>>([]);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  // Check if speech synthesis is supported
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Set default voice to first English voice if none selected
      if (!options.voice && availableVoices.length > 0) {
        const englishVoice = availableVoices.find(voice => 
          voice.lang.startsWith('en')
        ) || availableVoices[0];
        
        setOptions(prev => ({ ...prev, voice: englishVoice }));
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [isSupported, options.voice]);

  // Process speech queue
  const processQueue = useCallback(() => {
    if (!isSupported || !isEnabled || speechQueue.current.length === 0 || isSpeaking) {
      return;
    }

    // Sort by priority (high > medium > low)
    speechQueue.current.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    const nextItem = speechQueue.current.shift();
    if (!nextItem) return;

    const utterance = new SpeechSynthesisUtterance(nextItem.text);
    
    // Apply voice options
    if (options.voice) utterance.voice = options.voice;
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 0.8;

    utterance.onstart = () => {
      setIsSpeaking(true);
      currentUtterance.current = utterance;
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      currentUtterance.current = null;
      // Process next item in queue
      setTimeout(processQueue, 100);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      currentUtterance.current = null;
      // Process next item in queue
      setTimeout(processQueue, 100);
    };

    speechSynthesis.speak(utterance);
  }, [isSupported, isEnabled, isSpeaking, options]);

  // Main speak function
  const speak = useCallback((text: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
    if (!isSupported || !isEnabled || !text.trim()) return;

    // Add to queue
    speechQueue.current.push({ text: text.trim(), priority });
    
    // Process queue
    processQueue();
  }, [isSupported, isEnabled, processQueue]);

  // Specialized speaking functions
  const speakExerciseInstructions = useCallback((exercise: Exercise) => {
    if (!exercise) return;
    
    const instruction = `Next exercise: ${exercise.name}. ${exercise.instructions || ''}`;
    speak(instruction, 'high');
  }, [speak]);

  const speakMotivation = useCallback(() => {
    const phrase = motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)];
    speak(phrase, 'low');
  }, [speak]);

  const speakSetComplete = useCallback((setNumber: number, totalSets: number) => {
    const message = setNumber === totalSets 
      ? `Exercise complete! Great work!`
      : `Set ${setNumber} complete. ${totalSets - setNumber} sets remaining.`;
    speak(message, 'medium');
  }, [speak]);

  const speakRestPeriod = useCallback((restTime: number) => {
    const phrase = restPeriodPhrases[Math.floor(Math.random() * restPeriodPhrases.length)];
    const message = `Rest for ${restTime} seconds. ${phrase}`;
    speak(message, 'medium');
  }, [speak]);

  const speakWorkoutComplete = useCallback(() => {
    const message = "Workout complete! Excellent job! You should be proud of your effort today.";
    speak(message, 'high');
  }, [speak]);

  // Update options
  const updateOptions = useCallback((newOptions: Partial<VoiceCoachingOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }));
    setIsEnabled(newOptions.enabled ?? prev.enabled);
  }, []);

  // Stop current speech
  const stop = useCallback(() => {
    if (!isSupported) return;
    
    speechSynthesis.cancel();
    speechQueue.current = [];
    setIsSpeaking(false);
    currentUtterance.current = null;
  }, [isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isEnabled,
    isSupported,
    isSpeaking,
    voices,
    options,
    speak,
    speakExerciseInstructions,
    speakMotivation,
    speakSetComplete,
    speakRestPeriod,
    speakWorkoutComplete,
    updateOptions,
    stop
  };
};

export default useVoiceCoaching;
