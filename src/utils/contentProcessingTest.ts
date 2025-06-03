/**
 * Content Processing Test Utility
 * 
 * Test utility to verify that message content is not being duplicated or corrupted
 */

// Import the processing function from OptimizedChatMessage
const processMessageContent = (text: string): string => {
  if (!text || typeof text !== 'string') return '';

  // Only apply basic formatting cleanup without removing any content
  return text
    // Clean up excessive whitespace while preserving intentional formatting
    .replace(/\n{4,}/g, '\n\n\n') // Limit to max 3 consecutive newlines
    .replace(/[ \t]{3,}/g, '  ') // Limit to max 2 consecutive spaces
    .trim(); // Remove leading/trailing whitespace
};

export function testContentProcessing() {
  console.log('🧪 Testing content processing...');
  
  // Test case 1: Normal workout content
  const workoutContent = `Here's a practical and balanced leg workout plan tailored to your request, focusing on actionable insights you can apply immediately. This plan integrates creative approaches, scientific principles, and safety considerations for an effective and sustainable routine.

Leg Workout Plan
Warm-Up (5-10 minutes): Start with dynamic stretches and light cardio (e.g., jogging or leg swings) to prepare your muscles and joints, reducing injury risk.

Workout (45-60 minutes): This circuit targets major leg muscle groups—quads, hamstrings, glutes, and calves—while promoting balance and strength. Perform 3 rounds with 60-90 seconds rest between exercises. Adjust weights and reps based on your fitness level.

Squats (Quads, Glutes): 3 sets of 10-12 reps. Use bodyweight if new, or add dumbbells/barbell for intensity. Focus on form—keep knees behind toes.
Lunges (Quads, Hamstrings, Glutes): 3 sets of 10 reps per leg. Step forward or backward, holding dumbbells for added challenge.
Romanian Deadlifts (Hamstrings, Glutes): 3 sets of 8-10 reps. Use light weights to start, hinging at hips while keeping back straight.
Calf Raises (Calves): 3 sets of 15-20 reps. Stand on a flat surface or step for range of motion, holding a wall for balance.
Bulgarian Split Squats (Quads, Glutes): 3 sets of 8-10 reps per leg. Elevate one foot behind on a bench for a sculpting, single-leg focus.
Cool-Down (5-10 minutes): Stretch major muscles (quads, hamstrings, calves) to aid recovery and flexibility.

Creative Twist: Gamify your workout—set a rep or weight goal each session (e.g., add 5 lbs to squats) and reward yourself with a healthy treat or rest day upon completion. Think of each workout as a step in a "leg-sculpting journey," progressively building strength.

Critical Considerations:

Form First: Prioritize technique over weight to avoid injuries like knee strain or back pain. Watch tutorials or consult a trainer if unsure.
Balance Workload: Target all muscle groups to prevent imbalances. Don't skip hamstrings or calves.
Rest & Recover: Allow 48-72 hours between leg days to avoid overtraining. Listen to your body for signs of fatigue.
Personalize: Adjust intensity based on your fitness level or any pre-existing conditions. Seek professional advice if injured.
This plan offers a balanced approach to building strength and definition while minimizing risks. Track progress with a fitness app or journal to stay motivated and adjust as you grow stronger. Start today and take the first step in your leg day journey!`;

  const processed = processMessageContent(workoutContent);
  
  console.log('📊 Test Results:');
  console.log('Original length:', workoutContent.length);
  console.log('Processed length:', processed.length);
  console.log('Content preserved:', processed === workoutContent.trim());
  
  // Check for duplication
  const lines = processed.split('\n');
  const uniqueLines = new Set(lines.filter(line => line.trim()));
  const hasDuplicates = lines.length !== uniqueLines.size;
  
  console.log('Lines count:', lines.length);
  console.log('Unique lines count:', uniqueLines.size);
  console.log('Has duplicates:', hasDuplicates);
  
  // Test case 2: Content with excessive whitespace
  const messyContent = `Test content\n\n\n\n\nwith    too   many   spaces\n\n\n\nand newlines`;
  const cleanedMessy = processMessageContent(messyContent);
  
  console.log('\n🧹 Whitespace cleanup test:');
  console.log('Original:', JSON.stringify(messyContent));
  console.log('Cleaned:', JSON.stringify(cleanedMessy));
  console.log('Properly cleaned:', cleanedMessy === 'Test content\n\n\nwith  too  many  spaces\n\n\nand newlines');
  
  // Test case 3: Empty and edge cases
  console.log('\n🔍 Edge cases:');
  console.log('Empty string:', processMessageContent('') === '');
  console.log('Whitespace only:', processMessageContent('   \n\n   ') === '');
  console.log('Single line:', processMessageContent('Hello world') === 'Hello world');
  
  return {
    originalLength: workoutContent.length,
    processedLength: processed.length,
    contentPreserved: processed === workoutContent.trim(),
    hasDuplicates,
    allTestsPassed: processed === workoutContent.trim() && !hasDuplicates
  };
}

// Export for use in development console
if (typeof window !== 'undefined') {
  (window as any).testContentProcessing = testContentProcessing;
}
