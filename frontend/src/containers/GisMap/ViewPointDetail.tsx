import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { Container } from '@mui/material';
import { ViewPointData } from './models';
import { getDetailViewPoint } from '../../api/view-point';
import { toast } from '../../components/Toast';
import { useDebouncedCallback } from '../../shared/hooks/use-debounce-callback';
import { BaseLayout, PrivateLayout } from '../../layouts';

export function ViewPointDetail() {
  const router = useRouter();
  const viewPointId = (router.query['id'] ?? 0) as number;

  const {
    data: dataDetail,
    isFetching,
    refetch,
    isLoading,
  } = useQuery<ViewPointData>({
    queryKey: ['getViewPointDetail', viewPointId],
    queryFn: () => {
      if (viewPointId) {
        return getDetailViewPoint(viewPointId);
      }
    },
    onError: () => toast('error', 'Error'),
    // cacheTime: 0,
  });

  const debouncedRefetch = useDebouncedCallback(() => refetch?.(), 300, [
    router.query,
  ]);

  useEffect(() => {
    debouncedRefetch();
    return () => {
      debouncedRefetch.cancel();
    };
  }, [debouncedRefetch, router.query]);

  return (
    <BaseLayout>
      <PrivateLayout>
        <Container>
          <h1>ViewPointDetail</h1>
        </Container>
      </PrivateLayout>
    </BaseLayout>
  );
}
