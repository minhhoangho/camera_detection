import { Box, Button, Grid, Modal } from '@mui/material';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from 'react-query';
import * as React from 'react';
import { CreateViewPointPayloadRequest, ViewPointData } from './models';
import { OpenLayerMap } from './OpenLayerMap';
import { toast } from '../../components/Toast';
import { PathName } from '../../constants/routes';
import { createViewPoint } from '../../api/view-point';
import { FormInput } from '../../components/Form';

type ModalProps = {
  isOpen: boolean;
  // Function
  onClose: () => void;
};

export function CreateViewPointModal({ onClose, isOpen }: ModalProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = yup.object({
    name: yup.string().trim().required('Name is required'),
    description: yup.string().trim().default(''),
    lat: yup.number().required('Latitude is required'),
    long: yup.number().required('Longitude is required'),
  });

  const { control, handleSubmit, setValue } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const { mutate: createViewpointMutate } = useMutation({
    mutationFn: (data: CreateViewPointPayloadRequest): any =>
      createViewPoint(data),
    onSuccess: (data: ViewPointData) => {
      setIsLoading(false);
      toast('success', 'Create view point');
      const redirectUrl = `${PathName.GisLocationManagement}/${data.id}`;
      router.push(redirectUrl);
    },
    onError: () => {
      toast('error', 'Create view point error');
      setIsLoading(false);
    },
  });

  const handleCreateViewPoint = (data) => {
    createViewpointMutate(data as CreateViewPointPayloadRequest);
  };

  const updateFormLatLong = (lat: number, long: number) => {
    setValue("lat", lat)
    setValue("long", long)
  }
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700,
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 1,
          p: 3,
        }}
      >
        <div className="modal-header flex justify-between mb-2">
          <span className="modal-title">Create new view point</span>
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
          <Grid item xs={4}>
            <Box>
              <form
                onSubmit={handleSubmit(handleCreateViewPoint)}
              >
                <FormInput
                  control={control}
                  name="name"
                  inputElementClassName="form-control mr-sm-2"
                  placeholder="Location name"
                  label="Location name"
                  isRequired
                />
                <FormInput
                  control={control}
                  name="description"
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
          <Grid item xs={8}>
            <OpenLayerMap width={400} height={400} onUpdateLatLong={updateFormLatLong}/>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
}
