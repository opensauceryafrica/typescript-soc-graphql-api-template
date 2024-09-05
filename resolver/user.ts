import * as response from '../garage/helper/response';
import { logger } from '../garage/log/logger';
import * as profilelogic from '../logic/user';
import * as authenticator from '../middleware/authenticate';
import { IContext } from '../types/generic';
import { GraphResponse } from '../types/graphql';

export const user = async (_: unknown, data: {}, context: IContext) => {
    // const access = authenticator.validateAccess(context.user!, [Role.User], [], []);
    // if (!access.status) {
    //     return response.sendErrorResponse(access.message, 403);
    // }

    logger.debug(
        `[${new Date().toUTCString()}] :: start call to query user ${context.user?.id} with payload ${JSON.stringify(
            data,
        )}`,
    );

    if (!context.user) {
        return response.sendErrorResponse('Login required!', 401);
    }
    const logic = await profilelogic.user(context.user);
    if (!logic.status) {
        return response.sendErrorResponse(logic.message, 400);
    }

    logger.debug(
        `[${new Date().toUTCString()}] :: end call to query user ${context.user?.id} with payload ${JSON.stringify(
            data,
        )} :: ${logic.message}`,
    );

    return response.sendSuccessResponse(GraphResponse.RespondWithUser, logic.message, logic.data);
};
