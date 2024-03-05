import { request } from 'src/utils/request';
import { LoginPayloadRequest } from '../containers/Login/models';

export const login = async (loginPayload: LoginPayloadRequest) => {
    return await request.post('/auth/login', loginPayload);
}

