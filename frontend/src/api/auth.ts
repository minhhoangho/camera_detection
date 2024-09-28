import { request } from 'src/utils/request';
import { LoginPayloadRequest, LoginResponse } from '../containers/Login/models';

export const login = async (loginPayload: LoginPayloadRequest): Promise<LoginResponse> => {
    return await request.post('/auth/login', loginPayload);
}

