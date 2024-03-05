import React from 'react';
import { useRouter } from 'next/router';
import { useRecoilValue } from 'recoil';
import { Avatar, Dropdown, Menu } from 'antd';
import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, SettingOutlined } from '@ant-design/icons';

import { TokensManager } from 'src/modules/Authentication';
import { userState } from 'src/app-recoil/atoms/user';

import classes from './Header.module.scss';

type Props = {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
};

export function Header({ collapsed, setCollapsed }: Props) {
  const user = useRecoilValue(userState);
  const router = useRouter();

  const handleLogout = () => {
    TokensManager.removeAllCredentials();
    window.location.href = '/login';
  };

  const userMenu = () => {
    return (
      <Menu style={{ minWidth: '120px' }}>
        <Menu.Item key="user-setting" onClick={() => router.push('/me')}>
          <div className="flex items-center gap-x-2">
            <SettingOutlined style={{ fontSize: '18px' }} />
            <span>Cập nhật profile</span>
          </div>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item onClick={handleLogout} key="logout">
          <div className="flex items-center gap-x-2">
            <LogoutOutlined style={{ fontSize: '18px' }} />
            <span>Đăng xuất</span>
          </div>
        </Menu.Item>
      </Menu>
    );
  };

  return (
    <div className={classes['header']}>
      {collapsed ? (
        <MenuUnfoldOutlined className={classes['collapse-menu-icon']} onClick={() => setCollapsed(!collapsed)} />
      ) : (
        <MenuFoldOutlined className={classes['collapse-menu-icon']} onClick={() => setCollapsed(!collapsed)} />
      )}
      <div className="clickable user-item tab-user flex flex-end items-center cursor-pointer">
        <Dropdown dropdownRender={userMenu} trigger={['click']} placement="bottomRight" overlayStyle={{ top: '65px' }}>
          <div className="flex items-center">
            <div className="mr-2">
              <span className="mr-1">{user?.username}</span>
            </div>
            <Avatar size="large" src={user?.avatar} />
          </div>
        </Dropdown>
      </div>
    </div>
  );
}
