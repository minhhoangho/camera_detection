/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as React from 'react';
import { useRouter } from 'next/router';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { Box } from '@mui/material';
import { UserInfo, userState } from 'src/app-recoil/atoms/user';
// import {useGetCurrentUser} from "src/modules/UserProfile/hooks";
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { UserRole } from '../../constants/user';
import { useResponsive } from '../../shared/hooks/use-responsive';
import CookiesStorage from '../../utils/cookie-storage';

type Props = {
  children: React.ReactNode;
};

export function PrivateLayout({ children }: Props): React.ReactElement {
  const [collapsed, setCollapsed] = React.useState<boolean>(false);
  const [isClient, setIsClient] = React.useState(false);
  const lgUp = useResponsive('up', 'lg');

  const router = useRouter();
  const user = useRecoilValue(userState);
  const setCurrentUser = useSetRecoilState(userState);
  const isAuthenticated = CookiesStorage.isAuthenticated();
  const isNavigatingToAdmin = router.pathname.includes('/admin');

  const userData: UserInfo | null = null;
  const isLoading = false;
  const isFetching = false;
  // const {data: userData, isLoading, isFetching, refetch} = useGetCurrentUser()

  const isAdmin = React.useMemo(
    () => user?.role?.key === UserRole.Admin,
    [user?.role],
  );

  React.useEffect(() => {
    setIsClient(true);
    // refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const redirectUrl = router.asPath;

  React.useEffect(() => {
    setCurrentUser(userData ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  React.useEffect(() => {
    console.log("isAuthenticated", isAuthenticated)
    if (!isAuthenticated) {
      router.push({
        pathname: '/login',
        query: {
          redirectUrl,
        },
      });
    } else {
      if (userData) {
        // if (
        //   userData?.role?.key !== UserRole.Admin &&
        //   router.pathname.includes('/admin')
        // ) {
        //   router.push('/404');
        // }
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
    }
  }, [
    isAuthenticated,
    router,
    router.pathname,
    setCurrentUser,
    redirectUrl,
    user,
    isLoading,
    isFetching,
    userData,
  ]);

  if (isClient && isAuthenticated) {
    if (isNavigatingToAdmin && !isAdmin) return <div></div>;

    return (
      <>
        {/*<CircularProgress color="inherit" />*/}
        <Header onOpenNav={() => setCollapsed(true)} />

        <Box
          sx={{
            minHeight: 1,
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
          }}
        >
          <Sidebar open={collapsed} onClose={() => setCollapsed(false)} />

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              minHeight: 1,
              display: 'flex',
              flexDirection: 'column',
              py: `${72}px`,
              ...(lgUp && {
                px: 2,
                py: `${88}px`,
                width: `calc(100vw - ${280}px)`,
              }),
            }}
          >
            {children}
          </Box>
        </Box>
      </>
    );
  }

  return <div></div>;
}
