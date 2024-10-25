import React from 'react';
import { Container, Grid, Typography } from '@mui/material';
import Image from 'next/image';
import { useQuery } from 'react-query';
import { BaseLayout, PrivateLayout } from 'src/layouts';
import { WidgetSummary } from './WidgetSummary';
import styles from './Analytic.module.scss';
import { ViewPointDataAnalyticItem } from './models/analytic-response';
import { toast } from '../../components/Toast';
import { getAnalyticData } from '../../api/analytic';

export function Analytic() {
  const { data: dataDetail, isLoading } = useQuery({
    queryKey: ['analytic'],
    queryFn: () => {
      return getAnalyticData();
    },
    onError: () => toast('error', 'Error'),
    // cacheTime: 0,
  });

  const renderBlock = (analyticItem: ViewPointDataAnalyticItem) => {
    const data = analyticItem.data;
    const viewPoint = analyticItem.viewPoint;
    const numCar = data['car'] ?? 0;
    const numBicycle = data['bicycle'] ?? 0;
    const numTruck = data['truck'] ?? 0;
    const numMotorcycle = data['motorcycle'] ?? 0;
    return (
      <div className="mt-3" key={viewPoint.id}>
        <div className="mb-2"><span>Địa điểm: </span> <span>{viewPoint.name}</span></div>
        <Grid container spacing={3} >
          <Grid item xs={12} sm={6} md={3}>
            <WidgetSummary
              title="Ô tô"
              total={numCar}
              color="success"
              icon={
                <Image
                  width={64}
                  height={64}
                  alt="icon"
                  src="/static/icons/glass/car.png"
                />
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <WidgetSummary
              title="Xe đạp"
              total={numBicycle}
              color="info"
              icon={
                <Image
                  width={64}
                  height={64}
                  alt="icon"
                  src="/static/icons/glass/bicycle.png"
                />
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <WidgetSummary
              title="Xe tải"
              total={numTruck}
              color="warning"
              icon={
                <Image
                  width={64}
                  height={64}
                  alt="icon"
                  src="/static/icons/glass/delivery.png"
                />
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <WidgetSummary
              title="Xe máy"
              total={numMotorcycle}
              color="error"
              icon={
                <Image
                  width={64}
                  height={64}
                  alt="icon"
                  src="/static/icons/glass/scooter.png"
                />
              }
            />
          </Grid>
        </Grid>
      </div>
    );
  };
  return (
    <BaseLayout>
      <PrivateLayout>
        <Container className={styles['container']} maxWidth="xl">
          <Typography variant="h4" sx={{ mb: 5 }}>
            Hi, Welcome back 👋
          </Typography>
          {!isLoading &&
            dataDetail?.analyticData.map((data: ViewPointDataAnalyticItem) =>
              renderBlock(data),
            )}
        </Container>
      </PrivateLayout>
    </BaseLayout>
  );
}
