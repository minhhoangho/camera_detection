import * as React from 'react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Avatar, Box, Drawer, Typography } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import { account } from 'src/mocks/account';
import { Scrollbar } from 'src/components/Scrollbar';
import { CustomSidebarMenu } from './CustomSidebarMenu';
import { useResponsive } from '../../../shared/hooks/use-responsive';
import styles from './Sidebar.module.scss';

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

  const renderMenu = <CustomSidebarMenu></CustomSidebarMenu>;

  const renderContent = (
    <>
      <Scrollbar>
        <div className="mt-2">
          <Link href="/" className="flex items-center justify-center">
            <Image
              src="/static/images/webcam-icon.png"
              alt="logo"
              width={75}
              height={75}
            />
          </Link>
        </div>
        {renderAccount}
        {renderMenu}
      </Scrollbar>
    </>
  );

  return (
    <Box
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: 280 },
      }}
    >
      {upLg ? (
        <Box
          sx={{
            height: 1,
            position: 'fixed',
            width: 280,
            borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          }}
        >
          {renderContent}
        </Box>
      ) : (
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
      )}
    </Box>
  );
}
