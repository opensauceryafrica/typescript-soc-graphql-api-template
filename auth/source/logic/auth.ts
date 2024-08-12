import { MakeResponse } from '../types/misc/generic';
import * as response from '../helper/response';
import userRepository from '../repository/user';
import * as bcrypt from '../helper/bcrypt';
import * as jwt from '../helper/jwt';
import * as func from '../helper/func';
import { logger } from '../../../garage/log/logger';
import env from '../config/env';
import { IUser } from '../model/user';

export async function signup(payload: IUser): Promise<MakeResponse> {
    try {
        let user = await userRepository.findByKeyVal('email', payload.email.toLowerCase());
        if (user) {
            return response.makeResponse(false, 'Email already in use!', {});
        }

        return response.makeResponse(true, 'Registration successful.', {});
    } catch (error: any) {
        logger.error(
            `[${new Date().toUTCString()}] :: error while registering user ${
                payload.email
            } with payload ${JSON.stringify(payload)} :: ${error.message}`,
        );
        return response.makeResponse(false, error.message, {});
    }
}

export async function signin(payload: { email: string }): Promise<MakeResponse> {
    try {
        return response.makeResponse(true, 'Login successful.', {});
    } catch (error: any) {
        logger.error(
            `[${new Date().toUTCString()}] :: error while logging in user ${
                payload.email
            } with payload ${JSON.stringify({ email: payload.email })} :: ${error.message}`,
        );
        return response.makeResponse(false, error.message, {});
    }
}
