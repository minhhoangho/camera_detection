import { Box, Button, Grid, Modal } from '@mui/material';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useRouter } from 'next/router';
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
  cameraViewPointId?: number;
  isOpen: boolean;
  // Function
  onClose: () => void;
};

export function UpsertCameraSourceModal({
  cameraViewPointId,
  viewPointId,
  onClose,
  isOpen,
}: ModalProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = yup.object({
    cameraUri: yup.string().trim().required('Url is require'),
    cameraSource: yup.string(),
  });

  const { control, handleSubmit } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const { mutate } = useMutation({
    mutationFn: (data: UpsertCameraSourcePayloadRequest): any =>
      upsertNewViewPointCamera(viewPointId, data),
    onSuccess: (data: ViewPointCameraData) => {
      setIsLoading(false);
      toast('success', 'Updated camera source');
    },
    onError: () => {
      toast('error', 'Update camera source error');
      setIsLoading(false);
    },
  });

  const handleUpsertCameraSource = (data: any) => {
    if (cameraViewPointId) {
      data.id = cameraViewPointId;
    }
    mutate(data as UpsertCameraSourcePayloadRequest);
  };

  // const updateFormLatLong = (lat: number, long: number) => {
  //   setValue("lat", lat)
  //   setValue("long", long)
  // }
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
          <span className="modal-title">Camera source</span>
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
                {/*<FormInput*/}
                {/*  control={control}*/}
                {/*  name="cameraSource"*/}
                {/*  inputElementClassName="form-control mr-sm-2"*/}
                {/*  placeholder="Location name"*/}
                {/*  label="Location name"*/}
                {/*  isRequired*/}
                {/*/>*/}
                <FormSelect
                  control={control}
                  name="cameraSource"
                  label="Camera source"
                  options={[
                    { value: '1', label: 'Camera 1' },
                    { value: '2', label: 'Camera 2' },
                    { value: '3', label: 'Camera 3' },
                  ]}
                />
                <FormInput
                  control={control}
                  name="cameraUri"
                  isTextarea
                  inputElementClassName="form-control mr-sm-2 resize-none"
                  placeholder="Description"
                  label="Description"
                />

                <FormInput
                  control={control}
                  name="lat"
                  type="number"
                  inputElementClassName="form-control mr-sm-2"
                  placeholder="Latitude"
                  label="Latitude"
                  labelClassName=""
                  isRequired
                />

                <FormInput
                  control={control}
                  name="long"
                  type="number"
                  inputElementClassName="form-control mr-sm-2"
                  placeholder="Longitude"
                  label="Longitude"
                  labelClassName=""
                  isRequired
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
