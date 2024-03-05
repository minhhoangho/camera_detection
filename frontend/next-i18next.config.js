// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')
module.exports = {
  i18n: {
    localeDetection: false,
    defaultLocale: 'en',
    locales: ['en'],
    localePath: path.resolve('./public/locales')
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development'
};
