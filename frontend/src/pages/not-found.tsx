import React from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { NotFound } from 'src/containers/NotFound';

export const getServerSideProps = async ({ locale }: { locale?: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

const NotFoundPage = () => {
  return <NotFound />;
};

export default NotFoundPage;
