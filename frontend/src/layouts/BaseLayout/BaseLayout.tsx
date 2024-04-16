import React, {useEffect} from 'react';
import { Box } from '@mui/material';
import Head from 'next/head';
import {useRouter} from "next/router";
import Spinner from '../../components/Spinner';
import CookiesStorage from "../../utils/cookie-storage";


const getPageTitle = (title: string): string => {
  return title ? `Camera detection - ${title}` : 'Camera detection';
};

export function BaseLayout({ children, pageTitle = '', isLoading = false }: {
  children: React.ReactNode | Element,
  pageTitle?: string,
  isLoading?: boolean
}) {
  const router = useRouter();

  const isAuthenticated: boolean = CookiesStorage.isAuthenticated();
  useEffect(() => {
      isAuthenticated && router.pathname === "/login" && router.replace("/")
  },[isAuthenticated, router])
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
