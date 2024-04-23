import { Box, Button, Grid, Modal } from '@mui/material';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import * as React from 'react';
import { toast } from '../../../components/Toast';
import { FormInput } from '../../../components/Form';
import {
  UpsertCameraSourcePayloadRequest,
  ViewPointCameraData,
} from '../models';
import { upsertNewViewPointCamera } from '../../../api/view-point';
import { FormSelect } from '../../../components/Form/FormSelect';

type ModalProps = {
  viewPointId: number;
  cameraViewPoint?: ViewPointCameraData | null;
  isOpen: boolean;
  // Function
  onClose: () => void;
};

export function UpsertCameraSourceModal({
  cameraViewPoint,
  viewPointId,
  onClose,
  isOpen,
}: ModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = yup.object({
    cameraUri: yup.string().trim().required('Url is require'),
    cameraSource: yup.number().required('Camera source is require'),
  });

  const { control, handleSubmit, setValue } = useForm({
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    if (cameraViewPoint) {
      setValue('cameraUri', cameraViewPoint.cameraUri);
      setValue('cameraSource', cameraViewPoint.cameraSource);
    }
  }, [cameraViewPoint, setValue])

  const { mutate } = useMutation({
    mutationFn: (data: UpsertCameraSourcePayloadRequest): any =>
      upsertNewViewPointCamera(viewPointId, data),
    onSuccess: () => {
      setIsLoading(false);
      toast('success', 'Updated camera source');
      onClose?.();
    },
    onError: () => {
      toast('error', 'Update camera source error');
      setIsLoading(false);
      onClose?.();
    },
  });

  const handleUpsertCameraSource = (data: any) => {
    if (cameraViewPoint) {
      data.id = cameraViewPoint.id;
    }
    mutate(data as UpsertCameraSourcePayloadRequest);
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 1,
          p: 3,
        }}
      >
        <div className="modal-header flex justify-between mb-2">
          <span className="modal-title">Video source configuration</span>
          <button
            type="button"
            className="close bg-transparent border-none cursor-pointer"
            data-dismiss="modal"
            aria-label="Close"
            onClick={onClose}
          >
            <span aria-hidden="true" className="text-xl">
              &times;
            </span>
          </button>
        </div>
        <Grid container spacing={3} alignItems="stretch">
          <Grid item xs={12}>
            <Box>
              <form onSubmit={handleSubmit(handleUpsertCameraSource)}>
                <FormSelect
                  control={control}
                  isRequired
                  className="mb-2"
                  name="cameraSource"
                  label="Camera source"
                  options={[
                    { value: 0, label: 'RTSP' },
                    { value: 1, label: 'Youtube' },
                  ]}
                />
                <FormInput
                  control={control}
                  isRequired
                  name="cameraUri"
                  inputElementClassName="form-control mr-sm-2 resize-none"
                  placeholder="Camera URI (rtsp://...)"
                  label="Camera URI "
                />

                <div className="mt-5 flex justify-end">
                  <Button
                    className="btn wd-140 btn-sm btn-outline-light"
                    type="submit"
                    disabled={isLoading}
                  >
                    Save
                  </Button>
                </div>
              </form>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
}
