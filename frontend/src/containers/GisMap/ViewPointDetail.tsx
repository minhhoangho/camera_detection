import { useRouter } from 'next/router';
import { useMutation, useQuery } from 'react-query';
import { Box, Button, Container, Grid } from '@mui/material';
import * as React from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  EditViewPointPayloadRequest,
  ViewPointCameraData,
  ViewPointData,
} from './models';
import { OpenLayerMap } from './OpenLayerMap';
import { ViewPointCameraList } from './components/ViewPointCameraList';
import { getDetailViewPoint, updateViewPoint } from '../../api/view-point';
import { toast } from '../../components/Toast';
import { BaseLayout, PrivateLayout } from '../../layouts';
import { FormInput } from '../../components/Form';
import { RealtimeCamera } from './components/RealtimeCamera';
import { Iconify } from '../../components/Iconify';
export function ViewPointDetail() {
  const [showRealtimeCamera, setShowRealtimeCamera] = React.useState(false);
  const [selectedViewPointCamera, setSelectedViewPointCamera] = React.useState(
    {} as ViewPointCameraData,
  );
  const router = useRouter();
  const viewPointId = (router.query['id'] ?? 0) as number;
  const validationSchema = yup.object({
    name: yup.string().trim().required('Name is required'),
    description: yup.string().trim().default(''),
    lat: yup.number().required('Latitude is required'),
    long: yup.number().required('Longitude is required'),
  });
  const { control, handleSubmit, setValue } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const {
    data: dataDetail,
    isLoading,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: ['getViewPointDetail', viewPointId],
    queryFn: () => {
      return getDetailViewPoint(viewPointId);
    },
    onSuccess: (data: ViewPointData) => {
      setValue('name', data?.name);
      setValue('description', data?.description);
      setValue('lat', data?.lat);
      setValue('long', data?.long);
    },
    onError: () => toast('error', 'Error'),
    enabled: !!viewPointId,
    // cacheTime: 0,
  });

  const { mutate: updateViewpointMutate } = useMutation({
    mutationFn: (data: EditViewPointPayloadRequest): any =>
      updateViewPoint(viewPointId, data),
    onSuccess: async () => {
      toast('success', 'Updated view point');
      await refetchDetail();
    },
    onError: () => {
      toast('error', 'Update view point error');
    },
  });

  const handleSubmitForm = (data: any) => {
    updateViewpointMutate(data as EditViewPointPayloadRequest);
  };
  const updateFormLatLong = (lat: number, long: number) => {
    setValue('lat', lat);
    setValue('long', long);
  };

  const handleSetShowRealtimeCamera = (
    val: boolean,
    viewPointCamera: ViewPointCameraData,
  ) => {
    setShowRealtimeCamera(val);
    setSelectedViewPointCamera(viewPointCamera);
  };


  return (
    <BaseLayout>
      <PrivateLayout>
        <Container>
          <div>
              <Iconify
                icon="ic:baseline-arrow-back"
                color="text.disabled"
                width={20}
                height={20}
                className="cursor-pointer"
                onClick={() => router.back()}
              />
          </div>
          <h1>{dataDetail?.name ?? ''}</h1>
          <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={6}>
              {showRealtimeCamera ? (
                <RealtimeCamera
                  viewPoint={dataDetail as ViewPointData}
                  viewPointCamera={selectedViewPointCamera}
                  setShowRealtimeCamera={setShowRealtimeCamera}
                />
              ) : (
                <>
                  <Box className="mb-2">
                    <form onSubmit={handleSubmit(handleSubmitForm)}>
                      <div className="flex justify-end">
                        <Button
                          variant="contained"
                          className="btn wd-140 btn-sm btn-primary"
                          type="submit"
                          disabled={isLoading}
                        >
                          Lưu
                        </Button>
                      </div>
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
                        labelClassName="mt-2"
                      />
                      <div className="flex justify-between gap-3">
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
                      </div>
                    </form>
                  </Box>
                  <ViewPointCameraList
                    viewPointId={viewPointId}
                    setShowRealtimeCamera={handleSetShowRealtimeCamera}
                  />
                </>
              )}
            </Grid>
            <Grid item xs={6}>
              {!isLoading && (
                <OpenLayerMap
                  width={"--webkit-fill-available"}
                  height={600}
                  onUpdateLatLong={updateFormLatLong}
                  center={[dataDetail?.long ?? 0, dataDetail?.lat ?? 0]}
                />
              )}
            </Grid>
          </Grid>
        </Container>
      </PrivateLayout>
    </BaseLayout>
  );
}
