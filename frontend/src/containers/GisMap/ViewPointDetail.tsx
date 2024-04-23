import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { Box, Button, Container, Grid } from '@mui/material';
import * as React from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ViewPointData } from './models';
import styles from './GisMap.module.scss';
import { OpenLayerMap } from './OpenLayerMap';
import { ViewPointCameraList } from './components/ViewPointCameraList';
import { getDetailViewPoint } from '../../api/view-point';
import { toast } from '../../components/Toast';
import { BaseLayout, PrivateLayout } from '../../layouts';
import { FormInput } from '../../components/Form';

export function ViewPointDetail() {
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

  const { data: dataDetail, isLoading } = useQuery({
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

  // const debouncedRefetch = useDebouncedCallback(() => refetch?.(), 300, [
  //   router.query,
  // ]);

  // useEffect(() => {
  //   debouncedRefetch();
  //   return () => {
  //     debouncedRefetch.cancel();
  //   };
  // }, [debouncedRefetch, router.query]);

  const handleSubmitForm = (data) => {
    handleSubmit(data);
  };
  const updateFormLatLong = (lat: number, long: number) => {
    setValue('lat', lat);
    setValue('long', long);
  };
  return (
    <BaseLayout>
      <PrivateLayout>
        <Container>
          <h1>{dataDetail?.name ?? ''}</h1>
          <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={6}>
              <Box className="mb-2">
                <div className="flex justify-end">
                  <Button
                    variant="contained"
                    className="btn wd-140 btn-sm btn-primary"
                    type="submit"
                    disabled={isLoading}
                  >
                    Save
                  </Button>
                </div>
                <form
                  onSubmit={handleSubmitForm}
                  className={styles['create-modal-form']}
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
                  <div className="flex justify-between gap-3">
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
                  </div>
                </form>
              </Box>
              <ViewPointCameraList viewPointId={viewPointId} />
            </Grid>
            <Grid item xs={6}>
              {!isLoading && (
                <OpenLayerMap
                  width="100%"
                  height={600}
                  onUpdateLatLong={updateFormLatLong}
                />
              )}
            </Grid>
          </Grid>
        </Container>
      </PrivateLayout>
    </BaseLayout>
  );
}
