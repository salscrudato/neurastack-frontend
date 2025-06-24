import {
  PiBarbell,
  PiBicycleBold,
  PiCircleBold,
  PiPersonBold,
  PiTargetBold
} from 'react-icons/pi';

export interface EquipmentOption {
  label: string;
  icon: any;
  color: string;
}

const equipmentOptions: EquipmentOption[] = [
  {
    label: 'Body Weight',
    icon: PiPersonBold,
    color: 'gray'
  },
  {
    label: 'Dumbbells',
    icon: PiBarbell,
    color: 'blue'
  },
  {
    label: 'Barbell',
    icon: PiBarbell,
    color: 'orange'
  },
  {
    label: 'Kettlebells',
    icon: PiCircleBold,
    color: 'red'
  },
  {
    label: 'Resistance Bands',
    icon: PiTargetBold,
    color: 'green'
  },
  {
    label: 'Treadmill',
    icon: PiPersonBold,
    color: 'purple'
  },
  {
    label: 'Exercise Bike',
    icon: PiBicycleBold,
    color: 'pink'
  },
  {
    label: 'Yoga Mat',
    icon: PiTargetBold,
    color: 'cyan'
  }
];

export default equipmentOptions;
