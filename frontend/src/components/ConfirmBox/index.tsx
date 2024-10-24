import React from 'react';
import {
  Modal,
  Typography,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';

import classNames from 'classnames';
import useConfirm from 'src/shared/hooks/use-confirm';

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
  // const { t } = useTranslation();
  const { confirmBox, onConfirm, onCancel } = useConfirm();
  const {
    // type,
    // reverse,
    title,
    message,
    confirmButtonLabel,
    // confirmButtonVariant,
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
        <CardHeader title={title || classNameTitle || 'Xác nhận'} />
        <CardContent>
          <Typography id="parent-modal-description" className={classNames('px-2', contentClassName)}>
              {message || classNameContent || 'Bạn có muốn tiếp tục không ?'}
          </Typography>
        </CardContent>
        <CardActions>
          <div className="flex px-2">
            <Button onClick={onConfirm} color="primary">
              {confirmButtonLabel || 'Xác nhận'}
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
