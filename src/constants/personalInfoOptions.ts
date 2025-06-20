import {
  PiUserBold,
  PiUserCircleBold,
  PiUserCirclePlusBold,
  PiUserCircleMinusBold,
  PiUserSquareBold,
  PiUserCheckBold,
  PiScalesBold,
  PiHeartBold,
  PiTargetBold,
  PiTrophyBold,
  PiBarbell,
  PiPersonBold
} from 'react-icons/pi';

export interface AgeCategory {
  code: string;
  label: string;
  range: string;
  icon: any;
  color: string;
  description?: string;
}

export interface WeightCategory {
  code: string;
  label: string;
  range: string;
  icon: any;
  color: string;
  description?: string;
}

// Age categories with 5-7 meaningful bands
export const ageCategories: AgeCategory[] = [
  {
    code: 'TEEN',
    label: 'Teen',
    range: '13-17',
    icon: PiUserCircleBold,
    color: 'purple',
    description: 'Teenage years with growing bodies'
  },
  {
    code: 'YOUNG_ADULT',
    label: 'Young Adult',
    range: '18-25',
    icon: PiUserBold,
    color: 'blue',
    description: 'Young adult with high energy'
  },
  {
    code: 'ADULT',
    label: 'Adult',
    range: '26-35',
    icon: PiUserCirclePlusBold,
    color: 'green',
    description: 'Prime adult years'
  },
  {
    code: 'MIDDLE_ADULT',
    label: 'Middle Adult',
    range: '36-45',
    icon: PiUserSquareBold,
    color: 'orange',
    description: 'Established adult with experience'
  },
  {
    code: 'MATURE_ADULT',
    label: 'Mature Adult',
    range: '46-55',
    icon: PiUserCheckBold,
    color: 'red',
    description: 'Mature adult focusing on health'
  },
  {
    code: 'SENIOR_ADULT',
    label: 'Senior Adult',
    range: '56-65',
    icon: PiUserCircleMinusBold,
    color: 'teal',
    description: 'Senior adult maintaining fitness'
  },
  {
    code: 'SENIOR',
    label: 'Senior',
    range: '66+',
    icon: PiHeartBold,
    color: 'pink',
    description: 'Senior focusing on mobility and health'
  }
];

// Weight categories with 6 meaningful bands (in lbs)
export const weightCategories: WeightCategory[] = [
  {
    code: 'LIGHT',
    label: 'Light',
    range: '90-125',
    icon: PiPersonBold,
    color: 'cyan',
    description: 'Lighter body weight'
  },
  {
    code: 'MODERATE_LIGHT',
    label: 'Moderate Light',
    range: '126-150',
    icon: PiTargetBold,
    color: 'blue',
    description: 'Moderate light body weight'
  },
  {
    code: 'MODERATE',
    label: 'Moderate',
    range: '151-175',
    icon: PiScalesBold,
    color: 'green',
    description: 'Moderate body weight'
  },
  {
    code: 'MODERATE_HEAVY',
    label: 'Moderate Heavy',
    range: '176-200',
    icon: PiBarbell,
    color: 'orange',
    description: 'Moderate heavy body weight'
  },
  {
    code: 'HEAVY',
    label: 'Heavy',
    range: '201-225',
    icon: PiTrophyBold,
    color: 'red',
    description: 'Heavy body weight'
  },
  {
    code: 'VERY_HEAVY',
    label: 'Very Heavy',
    range: '226+',
    icon: PiBarbell,
    color: 'purple',
    description: 'Very heavy body weight'
  }
];

export default {
  ageCategories,
  weightCategories
};
