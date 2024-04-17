import { PathName } from 'src/constants/routes';

export const MENU_KEY = {
  OVERVIEW: 'overview',
  HOME: 'home',
  UPDATE_INFO: 'me',

  ADMIN: 'admin',
  USER_MANAGEMENT: 'user_management',

  BLOG: 'blog',
  POST: 'posts',

  CATEGORY: 'category',

  GIS_MANAGEMENT: 'gis_management',

  ANALYTIC: 'analytic',
};

export const MENU_LABEL = {
  [MENU_KEY.OVERVIEW]: 'Overview',
  [MENU_KEY.HOME]: 'Home',
  [MENU_KEY.UPDATE_INFO]: 'My info',
  [MENU_KEY.ADMIN]: 'Admin',
  [MENU_KEY.USER_MANAGEMENT]: 'Users',
  [MENU_KEY.ANALYTIC]: 'Analytics',

  [MENU_KEY.BLOG]: 'Blog',
  [MENU_KEY.POST]: 'Posts',

  [MENU_KEY.GIS_MANAGEMENT]: 'GIS Map',

  [MENU_KEY.CATEGORY]: 'Category',
};
export const DEFAULT_MENU_ITEMS = {
  SELECTED_KEY: [MENU_KEY.HOME],
  OPEN_KEY: [MENU_KEY.OVERVIEW],
};

export const MENU_URL = {
  [MENU_KEY.HOME]: PathName.Home,
  [MENU_KEY.UPDATE_INFO]: PathName.Profile,
};

export const MENU_ITEMS_STRUCTURE = {
  [PathName.Home]: {
    selectedKeys: [MENU_KEY.HOME],
    openKeys: [MENU_KEY.OVERVIEW],
  },

  [PathName.Profile]: {
    selectedKeys: [MENU_KEY.UPDATE_INFO],
    openKeys: [MENU_KEY.OVERVIEW],
  },
};
