import {
  PiBarbell,
  PiPersonBold,
  PiTargetBold,
  PiCircleBold,
  PiBicycleBold
} from 'react-icons/pi';

export interface EquipmentOption {
  code: string;
  label: string;
  icon: any;
  color: string;
  description?: string;
}

const equipmentOptions: EquipmentOption[] = [
  {
    code: 'BW',
    label: 'Body Weight',
    icon: PiPersonBold,
    color: 'gray',
    description: 'Bodyweight exercises only'
  },
  {
    code: 'DB',
    label: 'Dumbbells',
    icon: PiBarbell,
    color: 'blue',
    description: 'Adjustable or fixed weight dumbbells'
  },
  {
    code: 'BB',
    label: 'Barbell',
    icon: PiBarbell,
    color: 'orange',
    description: 'Olympic or standard barbell with plates'
  },
  {
    code: 'KB',
    label: 'Kettlebells',
    icon: PiCircleBold,
    color: 'red',
    description: 'Various weight kettlebells'
  },
  {
    code: 'RB',
    label: 'Resistance Bands',
    icon: PiTargetBold,
    color: 'green',
    description: 'Loop bands, tube bands, or resistance bands'
  },
  {
    code: 'TM',
    label: 'Treadmill',
    icon: PiPersonBold,
    color: 'purple',
    description: 'Motorized or manual treadmill'
  },
  {
    code: 'BK',
    label: 'Exercise Bike',
    icon: PiBicycleBold,
    color: 'pink',
    description: 'Stationary or spin bike'
  },
  {
    code: 'YM',
    label: 'Yoga Mat',
    icon: PiTargetBold,
    color: 'cyan',
    description: 'Yoga mat for floor exercises'
  }
];

export default equipmentOptions;
