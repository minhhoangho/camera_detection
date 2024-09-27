import * as React from 'react';
import { useRouter } from 'next/router';
import { useResponsive } from '../../../shared/hooks/use-responsive';
import { useEffect } from 'react';
import { Avatar, Box, Drawer, IconButton, Typography } from '@mui/material';
import styles from '../../../layouts/PrivateLayout/Sidebar/Sidebar.module.scss';
import { account } from '../../../mocks/account';
import { CustomSidebarMenu } from '../../../layouts/PrivateLayout/Sidebar/CustomSidebarMenu';
import { Scrollbar } from '../../../components/Scrollbar';
import Link from 'next/link';
import Image from 'next/image';
import MenuIcon from '@mui/icons-material/Menu';


type Props = {
  onClose: () => void;
  open: boolean;
};

export function Sidebar({ open, onClose }: Props): React.ReactElement {
  const router = useRouter();
  const pathname = router.pathname;

  const upLg = useResponsive('up', 'lg');
  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderAccount = (
    <Box
      className={styles['account-info']}
      sx={{
        my: 3,
        mx: 2.5,
        py: 2,
        px: 2.5,
        display: 'flex',
        borderRadius: 1.5,
        alignItems: 'center',
      }}
    >
      <Avatar src={account.photoURL} alt="photoURL" />
      <Box sx={{ ml: 2 }}>
        <Typography variant="subtitle2">{account.displayName}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {account.role}
        </Typography>
      </Box>
    </Box>
  );

  // const renderMenu = <CustomSidebarMenu></CustomSidebarMenu>;

  const renderContent = (
    <>
      <Scrollbar>
        <div className="mt-2">
          <Link href="/public" className="flex items-center justify-center">
            <Image
              src="/static/images/nextjs.png"
              alt="logo"
              width={100}
              height={50}
            />
          </Link>
        </div>
        {/*{renderAccount}*/}
        {/*{renderMenu}*/}
      </Scrollbar>
    </>
  );
  return (
    <Box
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: 280 },
        position: 'absolute'
      }}
    >
      <Drawer
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: 280,
          },
        }}
      >
        {renderContent}
      </Drawer>
    </Box>
  );
}
