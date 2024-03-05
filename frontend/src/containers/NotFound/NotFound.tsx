import * as React from 'react';
import { useRouter } from 'next/router';
import { Button, Grid, Typography } from '@mui/material';
import styles from './NotFound.module.scss';
import { BaseLayout } from '../../layouts';


export function NotFound() {
  const router = useRouter();
  return (
    <BaseLayout>
      <section className={styles['not-found-wrapper']}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <div className={styles['custom-backdrop']}>
              <Typography variant='h1' className='text-center text-9xl mt-10'>404</Typography>
            </div>
            <div className={styles['content-box']}>
              <Button onClick={() => router.replace('/')} variant='outlined'>Comeback home</Button>
              <h3 className='h2'>Look like you are lost</h3>
              <p>the page you are looking for not available!</p>
            </div>
          </Grid>
        </Grid>
      </section>
    </BaseLayout>

  );
}