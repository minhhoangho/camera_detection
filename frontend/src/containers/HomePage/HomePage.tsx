import React from 'react';
import { BaseLayout, PublicLayout } from 'src/layouts';
import {HomeMap} from "./HomeMap/HomeMap";
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function HomePage() {
  const [collapsed, setCollapsed] = React.useState<boolean>(false);

  return (
    <BaseLayout>
      <PublicLayout>
        <Header onOpenNav={() => setCollapsed(true)} />
        <Sidebar open={collapsed} onClose={() => setCollapsed(false)} />
        <HomeMap
          width="100%"
          height="100vh"
        />
      </PublicLayout>
    </BaseLayout>
  );
}
