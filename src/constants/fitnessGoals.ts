import {
    PiBarbell,
    PiBrainBold,
    PiFirstAidBold,
    PiHeartBold,
    PiPersonBold,
    PiScalesBold,
    PiTargetBold,
    PiTrophyBold,
    PiUserCircleBold
} from 'react-icons/pi';

export interface FitnessGoal {
  code: 'LW' | 'BM' | 'IC' | 'GF' | 'AP' | 'FM' | 'HA' | 'IR' | 'MW';
  value: 'lose_weight' | 'build_muscle' | 'improve_cardio' | 'general_fitness' | 'athletic_performance' | 'flexibility_mobility' | 'healthy_aging' | 'injury_rehab' | 'mental_wellbeing';
  label: string;
  icon: any;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  hoverBg: string;
  iconColor: string;
  isPrimary?: boolean; // For displaying first 5 by default
  benefit?: string; // Contextual micro-copy for when highlighted
}

// Modern, sleek, minimalistic fitness goals - Leading tech company aesthetic
export const FITNESS_GOALS: FitnessGoal[] = [
  {
    code: 'LW',
    value: 'lose_weight', // Keep for backward compatibility
    label: 'Lose Weight',
    icon: PiScalesBold,
    description: 'Reduce body-fat and scale weight',
    color: '#FF6B6B', // Soft coral red
    bgColor: '#FAFAFA', // Ultra-light neutral
    borderColor: '#FF6B6B', // Soft coral red
    hoverBg: '#F5F5F5', // Light neutral hover
    iconColor: '#E55555', // Deeper coral
    isPrimary: true,
    benefit: 'Dropping 5% body-fat can improve insulin sensitivity'
  },
  {
    code: 'BM',
    value: 'build_muscle',
    label: 'Build Muscle',
    icon: PiBarbell,
    description: 'Increase lean mass and strength',
    color: '#4ECDC4', // Modern teal
    bgColor: '#FAFAFA', // Ultra-light neutral
    borderColor: '#4ECDC4', // Modern teal
    hoverBg: '#F5F5F5', // Light neutral hover
    iconColor: '#45B7B8', // Deeper teal
    isPrimary: true,
    benefit: 'Building muscle increases metabolism by 7% per pound gained'
  },
  {
    code: 'IC',
    value: 'improve_cardio',
    label: 'Improve Cardio',
    icon: PiHeartBold,
    description: 'Boost endurance and VO₂ max',
    color: '#A8E6CF', // Soft mint green
    bgColor: '#FAFAFA', // Ultra-light neutral
    borderColor: '#A8E6CF', // Soft mint green
    hoverBg: '#F5F5F5', // Light neutral hover
    iconColor: '#88D8A3', // Deeper mint
    isPrimary: true,
    benefit: 'Improved VO₂ max reduces heart disease risk by 15%'
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
    isPrimary: true,
    benefit: 'Regular exercise adds 3-7 years to life expectancy'
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
    isPrimary: true,
    benefit: 'Enhanced power & speed can improve athletic performance by 15-25%'
  },
  {
    code: 'FM',
    value: 'flexibility_mobility',
    label: 'Flexibility & Mobility',
    icon: PiPersonBold,
    description: 'Improve range of motion and posture',
    color: '#9B59B6', // Purple
    bgColor: '#FAFAFA',
    borderColor: '#9B59B6',
    hoverBg: '#F5F5F5',
    iconColor: '#8E44AD',
    benefit: 'Better flexibility reduces injury risk by up to 40%'
  },
  {
    code: 'HA',
    value: 'healthy_aging',
    label: 'Healthy Aging',
    icon: PiUserCircleBold,
    description: 'Preserve functional strength & bone density',
    color: '#16A085', // Teal
    bgColor: '#FAFAFA',
    borderColor: '#16A085',
    hoverBg: '#F5F5F5',
    iconColor: '#138D75',
    benefit: 'Strength training can slow bone density loss by 1-3% annually'
  },
  {
    code: 'IR',
    value: 'injury_rehab',
    label: 'Injury Rehab',
    icon: PiFirstAidBold,
    description: 'Regain stability and pain-free movement',
    color: '#E74C3C', // Red
    bgColor: '#FAFAFA',
    borderColor: '#E74C3C',
    hoverBg: '#F5F5F5',
    iconColor: '#C0392B',
    benefit: 'Proper rehab reduces re-injury risk by 60-80%'
  },
  {
    code: 'MW',
    value: 'mental_wellbeing',
    label: 'Mental Well-being',
    icon: PiBrainBold,
    description: 'Lower stress and elevate mood',
    color: '#8E44AD', // Purple
    bgColor: '#FAFAFA',
    borderColor: '#8E44AD',
    hoverBg: '#F5F5F5',
    iconColor: '#7D3C98',
    benefit: 'Exercise can reduce anxiety & depression symptoms by 20-30%'
  },
];
