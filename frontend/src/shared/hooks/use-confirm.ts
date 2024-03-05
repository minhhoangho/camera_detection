import { useRecoilState } from 'recoil';
import confirmBoxState, { defaultConfirmBox } from 'src/app-recoil/atoms/common/confirm-box';

let resolve: (param: any) => void;
const useConfirm = () => {
  const [confirmBox, setConfirmBox] = useRecoilState(confirmBoxState);

  const confirm = (args: Record<string, any>) => {
    const { title, message, confirmButtonLabel, confirmButtonVariant = 'primary', contentClassName = '' } = args || {};
    return new Promise(res => {
      setConfirmBox({
        ...defaultConfirmBox,
        show: true,
        title,
        message,
        confirmButtonLabel,
        confirmButtonVariant,
        contentClassName,
      });
      resolve = res;
    });
  };

  const onConfirm = () => {
    setConfirmBox(defaultConfirmBox);
    resolve(true);
  };

  const onCancel = () => {
    setConfirmBox(defaultConfirmBox);
    resolve(false);
  };

  return { confirm, confirmBox, onCancel, onConfirm };
};

export default useConfirm;
