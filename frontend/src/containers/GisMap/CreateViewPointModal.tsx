import { Box, Button, Grid, Modal } from '@mui/material';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from 'react-query';
import * as React from 'react';
import { FormInput } from 'src/components/Form';
import { toast } from 'src/components/Toast';
import { CreateViewPointPayloadRequest, ViewPointData } from './models';
import { OpenLayerMapManagement } from './OpenLayerMap';
import { PathName } from '../../constants/routes';
import { createViewPoint } from '../../api/view-point';

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
      toast('success', 'Đã tạo thông tin đia điê');
      const redirectUrl = `${PathName.GisLocationManagement}/${data.id}`;
      router.push(redirectUrl);
    },
    onError: () => {
      toast('error', 'Có lỗi xảy ra, vui lòng thử lại sau');
      setIsLoading(false);
    },
  });

  const handleCreateViewPoint = (data: any) => {
    const submitData: CreateViewPointPayloadRequest = {
      ...data,
      mapView: {
        zoom: 15,
        lat: data.lat,
        long: data.long,
      }
    }
    createViewpointMutate(submitData);
  };

  const updateFormLatLong = (lat: number, long: number) => {
    setValue('lat', lat);
    setValue('long', long);
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '50%',
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 1,
          p: 3,
        }}
      >
        <div className="modal-header flex justify-between mb-2">
          <span className="modal-title">Tạo thông tin</span>
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
              <form onSubmit={handleSubmit(handleCreateViewPoint)}>
                <FormInput
                  control={control}
                  name="name"
                  inputElementClassName="form-control mr-sm-2"
                  placeholder="Tên địa điểm"
                  label="Tên địa điểm"
                  isRequired
                />
                <FormInput
                  control={control}
                  name="description"
                  isTextarea
                  inputElementClassName="form-control mr-sm-2 resize-none"
                  placeholder="Mô tả"
                  label="Mô tả"
                />

                <FormInput
                  control={control}
                  name="lat"
                  type="number"
                  inputElementClassName="form-control mr-sm-2"
                  placeholder="Vĩ độ"
                  label="Vĩ độ"
                  labelClassName=""
                  isRequired
                />

                <FormInput
                  control={control}
                  name="long"
                  type="number"
                  inputElementClassName="form-control mr-sm-2"
                  placeholder="Kinh độ"
                  label="Kinh độ"
                  labelClassName=""
                  isRequired
                />

                <div className="mt-5 flex justify-end">
                  <Button
                    className="btn wd-140 btn-sm btn-outline-light"
                    type="submit"
                    disabled={isLoading}
                  >
                    Lưu
                  </Button>
                </div>
              </form>
            </Box>
          </Grid>
          <Grid item xs={8}>
            <OpenLayerMapManagement
              width={'-webkit-fill-available'}
              height={400}
              onUpdateLatLong={updateFormLatLong}
              center={[16.071135, 108.22]}
            />
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
}
