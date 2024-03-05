import { JSX, ReactElement } from 'react';

export interface MenuItemInterface {
  key: string;
  label: string;
  url?: string;
  icon: JSX.Element | ReactElement | HTMLElement;
  children?: MenuItemInterface[];
}

export interface MenuItemMapInterface {
  key: string;
  label: string;
  url?: string;
  icon: JSX.Element | ReactElement | HTMLElement;
  children?: MenuItemMapInterface[];
}
