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
  MODEL_BENCHMARK: 'model_benchmark',

  ANALYTIC: 'analytic',
};

export const MENU_LABEL = {
  [MENU_KEY.OVERVIEW]: 'Tổng quan',
  [MENU_KEY.HOME]: 'Trang chủ',
  [MENU_KEY.UPDATE_INFO]: 'Thông tin',
  [MENU_KEY.ADMIN]: 'Admin',
  [MENU_KEY.USER_MANAGEMENT]: 'Users',
  [MENU_KEY.ANALYTIC]: 'Phân tích',
  [MENU_KEY.MODEL_BENCHMARK]: 'Benchmark',

  [MENU_KEY.BLOG]: 'Blog',
  [MENU_KEY.POST]: 'Posts',

  [MENU_KEY.GIS_MANAGEMENT]: 'Bản đồ GIS',

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
