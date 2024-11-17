import React from 'react';
import { useRouter } from 'next/router';
import _toNumber from 'lodash/toNumber';
import { ViewPointChartContainer } from 'src/containers/Analytic/ViewPointChart';

export default function AnalyticViewPointPage() {
  const router = useRouter();
  const { view_point_id: viewPointId } = router.query;

  return <ViewPointChartContainer viewPointId={_toNumber(viewPointId)} />;
}
