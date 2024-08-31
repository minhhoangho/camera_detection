import React from 'react';
import { Box } from '@mui/material';
import Head from 'next/head';
import Spinner from '../../components/Spinner';


const getPageTitle = (title: string): string => {
  return title ? `City camera - ${title}` : 'City camera';
};

export function BaseLayout({ children, pageTitle = '', isLoading = false }: {
  children: React.ReactNode | Element,
  pageTitle?: string,
  isLoading?: boolean
}) {
  // const router = useRouter();

  // const isAuthenticated: boolean = CookiesStorage.isAuthenticated();
  // useEffect(() => {
  //     isAuthenticated && router.pathname === "/login" && router.replace("/")
  // },[isAuthenticated, router])
  
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
