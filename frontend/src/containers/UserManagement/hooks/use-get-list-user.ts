import { useQuery } from 'react-query';
import { toast } from 'src/components/Toast';
import { listUserPaginate } from '../../../api/user';
import { ListUserPaginateRequest, ListUserPaginateResponse } from '../models';

export function useGetListUser(params: ListUserPaginateRequest) {
  const { data, status, error, isLoading, isFetching, refetch } = useQuery<ListUserPaginateResponse>({
    queryKey: ['useGetListUser'],
    queryFn: () => listUserPaginate(params),
    onError: () => toast('error', "Error"),
    staleTime: 0,
    cacheTime: 0,
    enabled: false,
  });
  return { data, status, error, isLoading, isFetching, refetch };
}
