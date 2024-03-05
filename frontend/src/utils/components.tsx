import Link from 'next/link';
import React from 'react';
import { Tooltip } from 'react-tooltip';

export const linkComponent = (href: string, title: string): JSX.Element => (
  <Link href={href} passHref>
    <span className="text-primary" style={{ cursor: 'pointer' }}>
      {title}
    </span>
  </Link>
);

export const renderTooltip = (
  props: Record<string, any> ,
  content: string,
): JSX.Element => (
  <Tooltip id="button-tooltip" {...props}>
    {content}
    <div className="custom-tooltip"></div>
  </Tooltip>
);
