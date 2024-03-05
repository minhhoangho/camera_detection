import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import {
  DEFAULT_LANGUAGE,
  // ENV,
  // Environment2ErrorMessageType,
  // ErrorMessageType,
  // PREFIX,
} from 'src/constants';

export const translate = (namespaces: any, getServerSideProps: (arg0: any) => any) => async (ctx: { resolvedUrl?: any; locale: any; space?: any; query?: any; }) => {
  const { locale, query } = ctx;
  const spaceKey = query.spaceKey;
  if (!spaceKey) return { props: {} };

  if (spaceKey && spaceKey !== spaceKey.toLowerCase()) {
    return {
      redirect: {
        destination: ctx.resolvedUrl.toLowerCase(),
        permanent: false,
      },
    };
  }

  const lang = DEFAULT_LANGUAGE;

  ctx.locale = lang; // setup router locale because 404 page get locale from ctx

  const pageProps = (await getServerSideProps?.(ctx)) || {};

  return {
    ...pageProps,
    props: {
      ...pageProps?.props,
      ...(await serverSideTranslations(lang || locale, [
        'common',
        'messages',
        'validates',
        'roles',
        'toast-message',
        // `${PREFIX}${ERROR_MESSAGE_TYPE || Environment2ErrorMessageType[ENV] || ErrorMessageType.Wrapped}`,
        ...(namespaces || []),
      ])),
      space: ctx.space || {},
    },
  };
};