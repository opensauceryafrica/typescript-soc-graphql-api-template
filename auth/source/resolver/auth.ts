import * as response from '../helper/response';
import * as authvalidator from '../validator/auth';
import * as authenticator from '../middleware/authenticate';
import validate from '../validator/validate';
import * as authlogic from '../logic/auth';
import { IContext } from '../types/misc/generic';
import { GraphResponse } from '../types/misc/graphql';
import { logger } from '../../../garage/log/logger';
import { IUser } from '../model/user';

export const signup = async (_: unknown, data: { input: IUser }, context: IContext) => {
    const validation = validate(authvalidator.register, data.input);
    if (!validation.status) {
        return response.sendErrorResponse(validation.message, 400);
    }

    logger.debug(
        `[${new Date().toUTCString()}] :: start call to register user ${data.input.email} with payload ${JSON.stringify(
            { ...data.input, password: '********' },
        )}`,
    );

    const logic = await authlogic.signup(data.input);
    if (!logic.status) {
        return response.sendErrorResponse(logic.message, 400);
    }

    logger.debug(
        `[${new Date().toUTCString()}] :: end call to register user ${data.input.email} with payload ${JSON.stringify({
            ...data.input,
            password: '********',
        })} :: ${logic.message}`,
    );

    return response.sendSuccessResponse(GraphResponse.RespondWithUser, logic.message, logic.data);
};
