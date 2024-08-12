import { MakeResponse } from '../types/misc/generic';
import * as response from '../helper/response';
import * as userRepository from '../repository/user';
import * as bcrypt from '../helper/bcrypt';
import mongoose from 'mongoose';
import * as jwt from '../helper/jwt';
import * as func from '../helper/func';
import * as mailjet from '../service/mailjet';
import * as termii from '../service/termii';
import { logger } from '../../../garage/log/logger';
import env from '../config/env';

export async function emailVerification(payload: { email: string }): Promise<MakeResponse> {
    try {
        return response.makeResponse(true, 'Verification link sent.', {});
    } catch (error: any) {
        logger.error(
            `[${new Date().toUTCString()}] :: error while requesting email verification user ${
                payload.email
            } with payload ${JSON.stringify({
                email: payload.email,
            })} :: ${error.message}`,
        );
        return response.makeResponse(false, error.message, {});
    }
}

export async function emailConfirmation(payload: { email: string }): Promise<MakeResponse> {
    try {
        return response.makeResponse(true, 'Email verification successful.', {});
    } catch (error: any) {
        logger.error(
            `[${new Date().toUTCString()}] :: error while verifying email for user ${
                payload.email
            } with payload ${JSON.stringify({
                email: payload.email,
            })} :: ${error.message}`,
        );
        return response.makeResponse(false, error.message, {});
    }
}

export async function phoneVerification(userId: mongoose.ObjectId, payload: { phone: string }): Promise<MakeResponse> {
    try {
        return response.makeResponse(true, 'OTP sent.', {});
    } catch (error: any) {
        logger.error(
            `[${new Date().toUTCString()}] :: error while requesting OTP for user ${userId} with phone ${
                payload.phone
            } :: ${error.message}`,
        );
        return response.makeResponse(false, error.message, {});
    }
}

export async function phoneConfirmation(userId: mongoose.ObjectId, payload: { phone: string }): Promise<MakeResponse> {
    try {
        return response.makeResponse(true, 'OTP sent.', {});
    } catch (error: any) {
        logger.error(
            `[${new Date().toUTCString()}] :: error while requesting OTP for user ${userId} with phone ${
                payload.phone
            } :: ${error.message}`,
        );
        return response.makeResponse(false, error.message, {});
    }
}
