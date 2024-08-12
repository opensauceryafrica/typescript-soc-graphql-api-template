import { MakeResponse } from '../types/misc/generic';
import * as response from '../helper/response';
import userRepository from '../repository/user';
import { logger } from '../../../garage/log/logger';
import { IUser } from '../model/user';

export async function user(payload: IUser): Promise<MakeResponse> {
    try {
        const user = await userRepository.findByKeyVal('id', payload.id);
        if (!user) {
            return response.makeResponse(false, 'Login required!', {}, 401);
        }
        return response.makeResponse(true, 'Profile retrieved.', user);
    } catch (error: any) {
        logger.error(
            `[${new Date().toUTCString()}] :: error while fetching user ${payload.id} with payload ${JSON.stringify(
                payload,
            )} :: ${error.message}`,
        );
        return response.makeResponse(false, error.message, {});
    }
}
