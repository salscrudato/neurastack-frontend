import {
  PiBarbell,
  PiPersonBold,
  PiTargetBold,
  PiCircleBold,
  PiXBold,
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
    code: 'NO',
    label: 'No Equipment',
    icon: PiXBold,
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
    code: 'BW',
    label: 'Bodyweight',
    icon: PiPersonBold,
    color: 'cyan',
    description: 'Pull-up bar, push-up handles, etc.'
  }
];

export default equipmentOptions;
