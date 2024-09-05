import { MakeResponse } from '../types/generic';
import * as response from '../garage/helper/response';
import userRepository from '../repository/user';
import { logger } from '../garage/log/logger';
import env from '../config/env';
import { IUser } from '../model/user';
import { IStepOneInput } from '../types/auth';

export async function signupStepOne(payload: IStepOneInput): Promise<MakeResponse> {
    try {
        let user = await userRepository.findByKeyVal('email', payload.email.toLowerCase());
        if (user) {
            return response.makeResponse(false, 'Email already in use!', {});
        }

        return response.makeResponse(true, 'Registration successful.', {});
    } catch (error: any) {
        logger.error(`[signupStepOne] [${error.message}] [${JSON.stringify(payload)}]`);
        return response.makeResponse(false, error.message, {});
    }
}
