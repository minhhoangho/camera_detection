import { toast as toastify } from 'react-toastify';
import Toast from './Toast';

export const toast = (type: string, message: string, toastId: any = null, delay = 0) => {
  toastify.clearWaitingQueue();
  toastify.dismiss();
  setTimeout(() => toastify(<Toast type={type} message={message} />, { toastId, delay }));
};
