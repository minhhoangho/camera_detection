import * as React from 'react';
import MapIcon from '@mui/icons-material/Map';
import PieChartIcon from '@mui/icons-material/PieChart';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import BlockIcon from '@mui/icons-material/Block';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import _get from 'lodash/get';
import _map from 'lodash/map';
import _isEmpty from 'lodash/isEmpty';
import { MenuItemInterface, MenuItemMapInterface } from './types';
import { MENU_KEY, MENU_LABEL } from './constants';
import { PathName } from '../../../../constants/routes';
export const MenuDirectory = [
  {
    key: MENU_KEY.OVERVIEW,
    label: MENU_LABEL[MENU_KEY.OVERVIEW] as string,
    icon: <PieChartIcon />,
    children: [
      {
        key: MENU_KEY.HOME,
        label: MENU_LABEL[MENU_KEY.HOME] as string,
        icon: <HomeIcon />,
        url: PathName.Home
      },
      {
        key: MENU_KEY.UPDATE_INFO,
        label: MENU_LABEL[MENU_KEY.UPDATE_INFO] as string,
        icon: <PersonIcon />,
        url: PathName.Home
      },
    ],
  },

  // {
  //   key: MENU_KEY.BLOG,
  //   label: MENU_LABEL[MENU_KEY.BLOG] as string,
  //   icon: <NewspaperIcon />,
  //   children: [
  //     {
  //       key: MENU_KEY.POST,
  //       label: MENU_LABEL[MENU_KEY.POST] as string,
  //       icon: <FeedIcon />,
  //       url: PathName.Home
  //     },
  //     {
  //       key: MENU_KEY.CATEGORY,
  //       label: MENU_LABEL[MENU_KEY.CATEGORY] as string,
  //       icon: <CategoryIcon />,
  //       url: PathName.Home
  //     },
  //   ],
  // },

  {
    key: MENU_KEY.ADMIN,
    label: MENU_LABEL[MENU_KEY.ADMIN] as string,
    icon: <AdminPanelSettingsIcon />,
    children: [
      // {
      //   key: MENU_KEY.USER_MANAGEMENT,
      //   label: MENU_LABEL[MENU_KEY.USER_MANAGEMENT] as string,
      //   icon: <PeopleIcon />,
      //   url: PathName.UserManagement
      // },
      {
        key: MENU_KEY.GIS_MANAGEMENT,
        label: MENU_LABEL[MENU_KEY.GIS_MANAGEMENT] as string,
        icon: <MapIcon />,
        url: PathName.GisLocationManagement
      },
    ]
  },
  {
    key: MENU_KEY.ANALYTIC,
    label: MENU_LABEL[MENU_KEY.ANALYTIC] as string,
    icon: <AnalyticsIcon />,
    url: PathName.Analytic
  },
];

const formatOneCategory = (
  menuItem: MenuItemMapInterface,
): MenuItemInterface => {
  // const iconString: string = _get(menuItem, 'icon', 'file-icons:default');
  const icon = _get(menuItem, 'icon', <BlockIcon />);
  const children = _get(menuItem, 'children', []);
  if (!_isEmpty(children)) {
    return {
      key: _get(menuItem, 'key', ''),
      label: _get(menuItem, 'label', ''),
      icon,
      children: formatCategories(children),
    };
  }
  return {
    key: _get(menuItem, 'key', ''),
    label: _get(menuItem, 'label', ''),
    icon,
  };
};

const formatCategories = (
  categories: MenuItemMapInterface[],
): MenuItemInterface[] => {
  return _map(categories, (item: MenuItemMapInterface) => {
    return formatOneCategory(item);
  });
};
