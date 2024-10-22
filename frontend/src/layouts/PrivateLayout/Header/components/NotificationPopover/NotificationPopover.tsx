import { MouseEvent, useState } from 'react';
import { formatDistanceToNow, set, sub } from 'date-fns';
import { faker } from '@faker-js/faker';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Image from 'next/image';
import { Scrollbar } from 'src/components/Scrollbar';

// ----------------------------------------------------------------------

type NotificationItemObject = {
  id: string;
  createdAt: Date;
  isUnRead: boolean;
  title: string;
  description: string;
  type: string;
  avatar: string | null;
};

const NOTIFICATIONS: NotificationItemObject[] = [
  {
    id: faker.string.uuid(),
    title: 'Your order is placed',
    description: 'waiting for shipping',
    avatar: null,
    type: 'order_placed',
    createdAt: set(new Date(), { hours: 10, minutes: 30 }),
    isUnRead: true,
  },
  {
    id: faker.string.uuid(),
    title: faker.person.fullName(),
    description: 'answered to your comment on the Minimal',
    avatar: '/static/images/avatars/avatar_2.jpg',
    type: 'friend_interactive',
    createdAt: sub(new Date(), { hours: 3, minutes: 30 }),
    isUnRead: true,
  },
  {
    id: faker.string.uuid(),
    title: 'You have new message',
    description: '5 unread messages',
    avatar: null,
    type: 'chat_message',
    createdAt: sub(new Date(), { days: 1, hours: 3, minutes: 30 }),
    isUnRead: false,
  },
  {
    id: faker.string.uuid(),
    title: 'You have new mail',
    description: 'sent from Guido Padberg',
    avatar: null,
    type: 'mail',
    createdAt: sub(new Date(), { days: 2, hours: 3, minutes: 30 }),
    isUnRead: false,
  },
  {
    id: faker.string.uuid(),
    title: 'Delivery processing',
    description: 'Your order is being shipped',
    avatar: null,
    type: 'order_shipped',
    createdAt: sub(new Date(), { days: 3, hours: 3, minutes: 30 }),
    isUnRead: false,
  },
];

export function NotificationPopover() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const totalUnRead = notifications.filter(
    (item) => item.isUnRead === true,
  ).length;


  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    // eslint-disable-next-line no-console
    console.log("Temporary disabled ", event);
    // setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        isUnRead: false,
      })),
    );
  };

  return (
    <>
      <IconButton color={anchorEl ? 'primary' : 'default'} onClick={handleOpen}>
        <Badge badgeContent={totalUnRead} color='error'>
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            ml: 0.75,
            width: 360,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant='subtitle1'>Notifications</Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              You have {totalUnRead} unread messages
            </Typography>
          </Box>

          {totalUnRead > 0 && (
            <Tooltip title=' Mark all as read'>
              <IconButton color='primary' onClick={handleMarkAllAsRead}>
                <DoneAllIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar
          style={{
            width: '100%',
            height: '500px',
          }}
        >
          <List
            disablePadding
            subheader={
              <ListSubheader
                disableSticky
                sx={{ py: 1, px: 2.5, typography: 'overline' }}
              >
                New
              </ListSubheader>
            }
          >
            {notifications.slice(0, 2).map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </List>
          <List
            disablePadding
            subheader={
              <ListSubheader
                disableSticky
                sx={{ py: 1, px: 2.5, typography: 'overline' }}
              >
                Before that
              </ListSubheader>
            }
          >
            {notifications.slice(2, 5).map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </List>
        </Scrollbar>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button fullWidth disableRipple>
            View All
          </Button>
        </Box>
      </Popover>
    </>
  );
}

// ----------------------------------------------------------------------

type NotificationItemProps = {
  notification: NotificationItemObject;
};

function NotificationItem({ notification }: NotificationItemProps) {
  function renderContent(notification: NotificationItemObject) {
    const title = (
      <Typography variant='subtitle2'>
        {notification.title}
        <Typography
          component='span'
          variant='body2'
          sx={{ color: 'text.secondary' }}
        >
          &nbsp; {notification.description}
        </Typography>
      </Typography>
    );

    if (notification.type === 'order_placed') {
      return {
        avatar: (
          <Image
            width={24}
            height={24}
            alt={notification.title}
            src='/static/icons/ic_notification_package.svg'
          />
        ),
        title,
      };
    }
    if (notification.type === 'order_shipped') {
      return {
        avatar: (
          <Image
            width={24}
            height={24}
            alt={notification.title}
            src='/static/icons/ic_notification_shipping.svg'
          />
        ),
        title,
      };
    }
    if (notification.type === 'mail') {
      return {
        avatar: (
          <Image
            width={24}
            height={24}
            alt={notification.title}
            src='/static/icons/ic_notification_mail.svg'
          />
        ),
        title,
      };
    }
    if (notification.type === 'chat_message') {
      return {
        avatar: (
          <Image
            width={24}
            height={24}
            alt={notification.title}
            src='/static/icons/ic_notification_chat.svg'
          />
        ),
        title,
      };
    }
    return {
      avatar: notification.avatar ? (
        <Image
          width={24}
          height={24}
          alt={notification.title}
          src={notification.avatar}
        />
      ) : null,
      title,
    };
  }

  const { avatar, title } = renderContent(notification);

  return (
    <ListItemButton
      sx={{
        py: 1.5,
        px: 2.5,
        mt: '1px',
        ...(notification.isUnRead && {
          bgcolor: 'action.selected',
        }),
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'background.neutral' }}>{avatar}</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={
          <Typography
            variant='caption'
            sx={{
              mt: 0.5,
              display: 'flex',
              alignItems: 'center',
              color: 'text.disabled',
            }}
          >
            <AccessTimeIcon />
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </Typography>
        }
      />
    </ListItemButton>
  );
}

// ----------------------------------------------------------------------
