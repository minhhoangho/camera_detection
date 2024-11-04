import React from 'react';
import { Container, Typography } from '@mui/material';
import { BaseLayout, PrivateLayout } from 'src/layouts';
import styles from './Benchmark.module.scss';

export function Benchmark() {
  return (
    <BaseLayout>
      <PrivateLayout>
        <Container className={styles['container']} maxWidth="xl">
          <Typography variant="h4" sx={{ mb: 5 }}>
            Hi, Welcome back 👋
          </Typography>
        </Container>
      </PrivateLayout>
    </BaseLayout>
  );
}
