import React from 'react';
import { Container, Grid, Typography} from '@mui/material';
import Image from 'next/image';
import { BaseLayout, PrivateLayout } from 'src/layouts';
import { WidgetSummary } from './WidgetSummary';
import styles from './HomePage.module.scss';
import { WidgetWebsiteVisit } from './WidgetWebsiteVisit';
import { WidgetCurrentVisit } from './WidgetCurrentVisit';
import {WidgetCarTracking} from "./WidgetCarTracking";
export function HomePage() {
  return (
    <BaseLayout>
      <PrivateLayout>
        <Container className={styles['container']} maxWidth="xl">
          <Typography variant="h4" sx={{ mb: 5 }}>
            Hi, Welcome back 👋
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <WidgetSummary
                title="Weekly Sales"
                total={714000}
                color="success"
                icon={
                  <Image
                    width={64}
                    height={64}
                    alt="icon"
                    src="/static/icons/glass/ic_glass_bag.png"
                  />
                }
              />
            </Grid>


            <Grid item xs={12} sm={6} md={3}>
              <WidgetSummary
                title="New Users"
                total={1352831}
                color="info"
                icon={
                  <Image
                    width={64}
                    height={64}
                    alt="icon"
                    src="/static/icons/glass/ic_glass_users.png"
                  />
                }
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <WidgetSummary
                title="Item Orders"
                total={1723315}
                color="warning"
                icon={
                  <Image
                    width={64}
                    height={64}
                    alt="icon"
                    src="/static/icons/glass/ic_glass_buy.png"
                  />
                }
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <WidgetSummary
                title="Bug Reports"
                total={234}
                color="error"
                icon={
                  <Image
                    width={64}
                    height={64}
                    alt="icon"
                    src="/static/icons/glass/ic_glass_message.png"
                  />
                }
              />
            </Grid>
             <Grid item xs={12}>
              <WidgetCarTracking title={"Tracking"} subheader="Result"/>
            </Grid>

            <Grid item xs={12} md={6} lg={8}>
              <WidgetWebsiteVisit
                title="Website Visits"
                subheader="(+43%) than last year"
                chart={{
                  labels: [
                    '01/01/2003',
                    '02/01/2003',
                    '03/01/2003',
                    '04/01/2003',
                    '05/01/2003',
                    '06/01/2003',
                    '07/01/2003',
                    '08/01/2003',
                    '09/01/2003',
                    '10/01/2003',
                    '11/01/2003',
                  ],
                  series: [
                    {
                      name: 'Team A',
                      type: 'column',
                      fill: 'solid',
                      data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30],
                    },
                    {
                      name: 'Team B',
                      type: 'area',
                      fill: 'gradient',
                      data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43],
                    },
                    {
                      name: 'Team C',
                      type: 'line',
                      fill: 'solid',
                      data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39],
                    },
                  ],
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <WidgetCurrentVisit
                title="Current Visits"
                chart={{
                  series: [
                    { label: 'America', value: 4344 },
                    { label: 'Asia', value: 5435 },
                    { label: 'Europe', value: 1443 },
                    { label: 'Africa', value: 4443 },
                  ],
                }}
              />
            </Grid>

          </Grid>
        </Container>
      </PrivateLayout>
    </BaseLayout>
  );
}
