import {
  Box,
  Card,
  CardHeader,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import React from 'react';
import {OpenLayerMap} from "./OpenLayerMap";
import { BaseLayout, PrivateLayout } from '../../layouts';

export function GisMapPage() {
  return (
    <BaseLayout>
      <PrivateLayout>
        <Container>
          <Typography variant="h4" sx={{ mb: 5 }}>
            Hi, Gis Map 👋
          </Typography>
          <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={12}>
              <Card>
                <CardHeader title={'DEmo'} subheader={'Demo'} />
                <Box sx={{ p: 3, pb: 1 }}>
                  <OpenLayerMap />
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </PrivateLayout>
    </BaseLayout>
  );
}
