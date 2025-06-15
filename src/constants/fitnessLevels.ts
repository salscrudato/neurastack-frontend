import {
  PiUserCircleBold,
  PiHeartBold,
  PiTrophyBold
} from 'react-icons/pi';

export interface FitnessLevel {
  value: 'beginner' | 'intermediate' | 'advanced';
  code: 'B' | 'I' | 'A';
  label: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  hoverBg: string;
  iconColor: string;
}

export const fitnessLevels: FitnessLevel[] = [
  {
    value: 'beginner',
    code: 'B',
    label: 'Beginner',
    description: 'New to fitness or returning after a break',
    icon: PiUserCircleBold,
    color: '#10B981', // Modern green
    bgColor: '#F0FDF4', // green.50
    borderColor: '#10B981', // green.500
    hoverBg: '#ECFDF5', // green.100
    iconColor: '#059669', // green.600
  },
  {
    value: 'intermediate',
    code: 'I',
    label: 'Intermediate',
    description: 'Regular exercise routine, comfortable with basics',
    icon: PiHeartBold,
    color: '#3B82F6', // Modern blue
    bgColor: '#EFF6FF', // blue.50
    borderColor: '#3B82F6', // blue.500
    hoverBg: '#DBEAFE', // blue.100
    iconColor: '#2563EB', // blue.600
  },
  {
    value: 'advanced',
    code: 'A',
    label: 'Advanced',
    description: 'Experienced athlete, ready for challenges',
    icon: PiTrophyBold,
    color: '#F97316', // Modern orange
    bgColor: '#FFF7ED', // orange.50
    borderColor: '#F97316', // orange.500
    hoverBg: '#FED7AA', // orange.200
    iconColor: '#EA580C', // orange.600
  },
];
