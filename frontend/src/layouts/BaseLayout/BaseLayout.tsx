import React from 'react';
import { Box } from '@mui/material';
import Head from 'next/head';
// import CookiesStorage from 'src/utils/cookie-storage';
import Spinner from '../../components/Spinner';


const getPageTitle = (title: string): string => {
  return title ? `Code base - ${title}` : 'Code base';
};

export function BaseLayout({ children, pageTitle = '', isLoading = false }: {
  children: React.ReactNode | Element,
  pageTitle?: string,
  isLoading?: boolean
}) {

  // const isAuthenticated: boolean = CookiesStorage.isAuthenticated();
  return (
    <>
      <Head>
        <title>{getPageTitle(pageTitle)}</title>
      </Head>
      {isLoading ? (
        <div className='layout-container-loading'>
          <Spinner />
        </div>
      ) : <Box
        className='base-layout-wrapper'
        sx={{
          display: 'flex',
          flex: 1,
          height: '100%',
        }}
      >
        {children}
      </Box>}
    </>

  );
}
