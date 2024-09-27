import React from 'react';
import {Container} from '@mui/material';
import { BaseLayout, PrivateLayout, PublicLayout } from 'src/layouts';
import styles from './HomePage.module.scss';
import {HomeMap} from "./HomeMap/HomeMap";

export function HomePage() {
  return (
    <BaseLayout>
      <PublicLayout>
        <Container className={styles['container']} maxWidth="xl">
          <HomeMap
            width="100%"
            height="calc(100vh - 80px)"
          />
        </Container>
      </PublicLayout>
    </BaseLayout>
  );
}
