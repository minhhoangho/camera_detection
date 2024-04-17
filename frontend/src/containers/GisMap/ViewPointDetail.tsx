import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { Box, Button, Container, Grid } from '@mui/material';
import { ViewPointData } from './models';
import { getDetailViewPoint } from '../../api/view-point';
import { toast } from '../../components/Toast';
import { useDebouncedCallback } from '../../shared/hooks/use-debounce-callback';
import { BaseLayout, PrivateLayout } from '../../layouts';
import styles from './GisMap.module.scss';
import { FormInput } from '../../components/Form';
import { OpenLayerMap } from './OpenLayerMap';
import * as React from 'react';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

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

  const {
    data: dataDetail,
    isFetching,
    refetch,
    isLoading,
  }: {
    data: ViewPointData;
    isFetching: boolean;
    isLoading: boolean;
  } = useQuery<ViewPointData>({
    queryKey: ['getViewPointDetail', viewPointId],
    queryFn: () => {
      if (viewPointId) {
        return getDetailViewPoint(viewPointId);
      }
    },
    onSuccess: (data: ViewPointData) => {
      setValue('name', data.name);
      setValue('description', data.description);
      setValue('lat', data.lat);
      setValue('long', data.long);
    },
    onError: () => toast('error', 'Error'),
    // cacheTime: 0,
  });

  const debouncedRefetch = useDebouncedCallback(() => refetch?.(), 300, [
    router.query,
  ]);

  useEffect(() => {
    debouncedRefetch();
    return () => {
      debouncedRefetch.cancel();
    };
  }, [debouncedRefetch, router.query]);

  const handleSubmitForm = () => {};
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
              <Box>
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
