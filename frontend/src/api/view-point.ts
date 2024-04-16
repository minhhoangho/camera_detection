import {request} from '../utils/request';
import {
    ListViewPointPaginateResponse,
    ViewPointPaginateRequest,
} from '../containers/GisMap/models';

export const listViewPointsPaginate = async ({
    pagination,
    keyword,
}: ViewPointPaginateRequest): Promise<ListViewPointPaginateResponse> => {
    const offsetParam = `offset=${pagination?.offset ?? ''}`;
    const limitParam = `limit=${pagination?.limit ?? ''}`;
    const keywordParam = `keyword=${keyword ?? ''}`;
    return request.get(`/gis-maps/view-points?${offsetParam}&${limitParam}&${keywordParam}`);
};

export const createViewPoint = async (data: any) => {
    return request.post('/gis-maps/view-points', data);
}

export const updateViewPoint = async (id: number, data: any) => {
    return request.put(`/gis-maps/view-points/${id}`, data);
}

export const getDetailViewPoint = async (id: number) => {
    return request.get(`/gis-maps/view-points/${id}`);
}
