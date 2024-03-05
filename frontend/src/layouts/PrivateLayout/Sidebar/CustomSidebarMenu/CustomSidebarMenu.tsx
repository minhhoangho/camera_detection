import * as React from 'react';
import { Sidebar, SubMenu, MenuItem, Menu } from 'react-pro-sidebar';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { MenuItemMapInterface } from './types';
import { MenuDirectory } from './MenuDirectory';
import styles from './CustomSidebarMenu.module.scss';
import { PathName } from '../../../../constants/routes';

export function CustomSidebarMenu(): React.ReactElement {
  const [selectedMenuItem, setSelectedMenuItem] = useState('');
  const router = useRouter();


  const handleSelectMenuItem = (menuItem: MenuItemMapInterface) => {
    setSelectedMenuItem(menuItem.key)
    router.replace(menuItem.url ?? PathName.Home)
  }

  const renderMenu = (menuList: MenuItemMapInterface[]): JSX.Element[] => {
    return menuList.map((item) => renderMenuItem(item));
  };

  const renderMenuItem = (menuItem: MenuItemMapInterface): JSX.Element => {
    if (menuItem.children) {
      return (
        <SubMenu
          label={menuItem.label}
          key={menuItem.key}
          icon={menuItem.icon}
          className={styles['custom-sub-menu']}
          rootStyles={{
            backgroundColor: '#F9FAFB',
          }}
        >
          {renderMenu(menuItem.children)}
        </SubMenu>
      );
    }
    return (
      <MenuItem
        icon={menuItem.icon}
        key={menuItem.key}
        active={selectedMenuItem === menuItem.key}
        onClick={() => handleSelectMenuItem(menuItem)}
        className={styles['custom-menu-item']}
      >
        {menuItem.label}
      </MenuItem>
    );
  };

  return (
    <div>
      <Sidebar width="280px" className="px-5">
        <Menu
          transitionDuration={500}
          menuItemStyles={{
            button: ({ active }) => {
              return {
                color: active ? '#1877F2' : undefined,
                backgroundColor: active
                  ? '#e2eef9'
                  : undefined,

                '&:hover': {
                  backgroundColor: active
                    ? 'rgba(24, 119, 242, 0.16)'
                    : undefined,
                },
              };
            },
          }}
        >
          {renderMenu(MenuDirectory)}
        </Menu>
      </Sidebar>
    </div>
  );
}
