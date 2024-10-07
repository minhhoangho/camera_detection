import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'next-i18next';
import {
  Box,
  Modal,
  Typography,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';

import useConfirm from 'src/shared/hooks/use-confirm';
import { ConfirmType } from 'src/constants';
import Icon from '../Icon';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #3f51b5', // Updated border color
  borderRadius: '8px', // Added border radius
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)', // Updated box shadow
  pt: 2,
  px: 4,
  pb: 3,
};

const ConfirmBox = ({
  classNameContent = '',
  classNameTitle = '',
}: {
  classNameContent?: string;
  classNameTitle?: string;
}) => {
  const { t } = useTranslation();
  const { confirmBox, onConfirm, onCancel } = useConfirm();
  const {
    type,
    reverse,
    title,
    message,
    confirmButtonLabel,
    confirmButtonVariant,
    contentClassName,
  } = confirmBox;

  return (
    <Modal
      open={confirmBox.show}
      onClose={onCancel}
      aria-labelledby="parent-modal-title"
      aria-describedby="parent-modal-description"
    >
      <Card sx={{ ...style, width: 400 }}>
        <CardHeader title={title || 'Xác nhận'} />
        <CardContent>
          <Typography id="parent-modal-description" className="px-2">
              {message || 'Bạn có muốn tiếp tục không ?'}
          </Typography>
        </CardContent>
        <CardActions>
          <div className="flex px-2">

            <Button onClick={onConfirm} color="primary">
              Xác nhận
            </Button>
            <Button onClick={onCancel} color="primary" className="mx-2">
              Huỷ bỏ
            </Button>
          </div>
        </CardActions>
      </Card>
    </Modal>
  );
};

export default ConfirmBox;
