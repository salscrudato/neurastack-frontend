import { getRepresentativeAge, getRepresentativeWeight } from '../personalInfoUtils';

describe('personalInfoUtils', () => {
  describe('getRepresentativeAge', () => {
    it('should prioritize numeric age over category', () => {
      const profile = {
        age: 30,
        ageCategory: 'YOUNG_ADULT' // This would convert to ~21.5
      };
      
      expect(getRepresentativeAge(profile)).toBe(30);
    });

    it('should fall back to category when no numeric age', () => {
      const profile = {
        ageCategory: 'YOUNG_ADULT' // 18-25 range, midpoint = 21.5
      };
      
      expect(getRepresentativeAge(profile)).toBe(22); // Rounded midpoint
    });

    it('should return default when no age information', () => {
      const profile = {};
      
      expect(getRepresentativeAge(profile)).toBe(25);
    });

    it('should ignore zero or negative numeric age', () => {
      const profile = {
        age: 0,
        ageCategory: 'ADULT' // 26-35 range, midpoint = 30.5
      };
      
      expect(getRepresentativeAge(profile)).toBe(31); // Falls back to category
    });
  });

  describe('getRepresentativeWeight', () => {
    it('should prioritize numeric weight over category', () => {
      const profile = {
        weight: 180,
        weightCategory: 'MODERATE' // This would convert to ~163
      };
      
      expect(getRepresentativeWeight(profile)).toBe(180);
    });

    it('should fall back to category when no numeric weight', () => {
      const profile = {
        weightCategory: 'MODERATE' // 151-175 range, midpoint = 163
      };
      
      expect(getRepresentativeWeight(profile)).toBe(163);
    });

    it('should return undefined when no weight information', () => {
      const profile = {};
      
      expect(getRepresentativeWeight(profile)).toBeUndefined();
    });

    it('should ignore zero or negative numeric weight', () => {
      const profile = {
        weight: 0,
        weightCategory: 'MODERATE_HEAVY' // 176-200 range, midpoint = 188
      };
      
      expect(getRepresentativeWeight(profile)).toBe(188); // Falls back to category
    });
  });
});
