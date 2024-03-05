import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'next-i18next';
import { Box, Modal, Typography } from '@mui/material';
import useConfirm from 'src/shared/hooks/use-confirm';
import { ConfirmType } from 'src/constants';
import Icon from '../Icon';

const ConfirmBox = ({ classNameContent = '', classNameTitle = '' }: { classNameContent?: string, classNameTitle?: string }) => {
  const { t } = useTranslation();
  const { confirmBox, onConfirm, onCancel } = useConfirm();
  const { type, reverse, title, message, confirmButtonLabel, confirmButtonVariant, contentClassName } = confirmBox;

  return (
    <Modal
      open={confirmBox.show}
      onClose={onCancel}
      closeAfterTransition
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box>
        <button className='btn-close-modal close pos-absolute tx-15 t-25-f r-20' onClick={onCancel}>
          <Icon icon='x' />
        </button>
        <Typography variant='h6' component='h2'>
          <div className='d-flex'>
            <div className='header-content'>
              <h5 className={classNames('tx-18 tx-sftext-semibold mg-b-0 lh-2', classNameTitle)}>{title}</h5>
            </div>
          </div>
        </Typography>
        <Typography className='pd-20'>
          <div className={classNames('dailog-message-content', classNameContent)}>
            <p className={classNames('description mg-b-0 text-break', contentClassName)}
               dangerouslySetInnerHTML={{ __html: message }} />
          </div>
        </Typography>
        <Typography className='justify-content-center'>
          {type !== ConfirmType.Notify && (
            <button type='button' className='btn wd-140 btn-sm btn-outline-light'
                    onClick={reverse ? onConfirm : onCancel}>
              {t('common:buttons.cancel')}
            </button>
          )}
          <button
            type='button'
            className={classNames('btn wd-140 btn-sm', `btn-${confirmButtonVariant}`)}
            onClick={reverse ? onCancel : onConfirm}
          >
            {confirmButtonLabel || t('common:buttons.delete')}
          </button>
        </Typography>
      </Box>
    </Modal>
  );
};

export default ConfirmBox;
