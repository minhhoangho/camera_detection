import { atom } from 'recoil';
import { ConfirmType } from 'src/constants';

export const defaultConfirmBox = {
  type: ConfirmType.YesNo,
  reverse: false,
  show: false,
  title: '',
  message: '',
  confirmButtonLabel: '',
  confirmButtonVariant: 'primary',
  contentClassName: ''
};

const confirmBoxState = atom({
  key: 'confirmBox',
  default: defaultConfirmBox,
});

export default confirmBoxState;
