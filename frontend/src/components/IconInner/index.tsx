import React from 'react';
import icons from 'public/icons.json';

function IconInner({ icon }: { icon: string }) {
  const iconMarkup: string = icons[icon] as string;
  const createMarkup = (markup: string) => {
    // we don't sanitize markup
    // since icons.json is maintained within the package before build
    // do the weird thing for dangerouslySetInnerHTML
    return { __html: markup };
  };

  if (iconMarkup) {
    return <g dangerouslySetInnerHTML={createMarkup(iconMarkup)} />;
  }
  return null;
}

export default IconInner;
