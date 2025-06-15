import {
  PiScalesBold,
  PiBarbell,
  PiHeartBold,
  PiPersonArmsSpreadBold,
  PiTargetBold,
  PiTrophyBold
} from 'react-icons/pi';

export interface FitnessGoal {
  code: 'LW' | 'BM' | 'IC' | 'IF' | 'GF' | 'AP';
  value: 'lose_weight' | 'build_muscle' | 'improve_cardio' | 'increase_flexibility' | 'general_fitness' | 'athletic_performance';
  label: string;
  icon: any;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  hoverBg: string;
  iconColor: string;
}

// Modern, sleek, minimalistic fitness goals - Leading tech company aesthetic
export const FITNESS_GOALS: FitnessGoal[] = [
  {
    code: 'LW',
    value: 'lose_weight', // Keep for backward compatibility
    label: 'Lose Weight',
    icon: PiScalesBold,
    description: 'Reduce body fat & scale weight',
    color: '#FF6B6B', // Soft coral red
    bgColor: '#FAFAFA', // Ultra-light neutral
    borderColor: '#FF6B6B', // Soft coral red
    hoverBg: '#F5F5F5', // Light neutral hover
    iconColor: '#E55555', // Deeper coral
  },
  {
    code: 'BM',
    value: 'build_muscle',
    label: 'Build Muscle',
    icon: PiBarbell,
    description: 'Increase lean mass & strength',
    color: '#4ECDC4', // Modern teal
    bgColor: '#FAFAFA', // Ultra-light neutral
    borderColor: '#4ECDC4', // Modern teal
    hoverBg: '#F5F5F5', // Light neutral hover
    iconColor: '#45B7B8', // Deeper teal
  },
  {
    code: 'IC',
    value: 'improve_cardio',
    label: 'Improve Cardio',
    icon: PiHeartBold,
    description: 'Boost endurance & VO₂ max',
    color: '#A8E6CF', // Soft mint green
    bgColor: '#FAFAFA', // Ultra-light neutral
    borderColor: '#A8E6CF', // Soft mint green
    hoverBg: '#F5F5F5', // Light neutral hover
    iconColor: '#88D8A3', // Deeper mint
  },
  {
    code: 'IF',
    value: 'increase_flexibility',
    label: 'Increase Flexibility',
    icon: PiPersonArmsSpreadBold,
    description: 'Enhance mobility & range of motion',
    color: '#C7CEEA', // Soft lavender
    bgColor: '#FAFAFA', // Ultra-light neutral
    borderColor: '#C7CEEA', // Soft lavender
    hoverBg: '#F5F5F5', // Light neutral hover
    iconColor: '#A8B3D9', // Deeper lavender
  },
  {
    code: 'GF',
    value: 'general_fitness',
    label: 'General Fitness',
    icon: PiTargetBold,
    description: 'Maintain overall health & wellness',
    color: '#74B9FF', // Modern sky blue
    bgColor: '#FAFAFA', // Ultra-light neutral
    borderColor: '#74B9FF', // Modern sky blue
    hoverBg: '#F5F5F5', // Light neutral hover
    iconColor: '#0984E3', // Deeper blue
  },
  {
    code: 'AP',
    value: 'athletic_performance',
    label: 'Athletic Performance',
    icon: PiTrophyBold,
    description: 'Sport-specific power & speed',
    color: '#FDCB6E', // Warm gold
    bgColor: '#FAFAFA', // Ultra-light neutral
    borderColor: '#FDCB6E', // Warm gold
    hoverBg: '#F5F5F5', // Light neutral hover
    iconColor: '#E17055', // Deeper gold-orange
  },
];
