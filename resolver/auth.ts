import * as response from '../garage/helper/response';
// import * as authvalidator from '../validator/auth';
import * as authenticator from '../middleware/authenticate';
import validate from '../validator/validate';
import * as authlogic from '../logic/auth';
import { IContext } from '../types/generic';
import { GraphResponse } from '../types/graphql';
import { logger } from '../garage/log/logger';
import { IUser } from '../model/user';
import { IStepOneInput } from '../types/auth';

export const signupStepOne = async (_: unknown, data: { input: IStepOneInput }, context: IContext) => {
    // const validation = validate(authvalidator.register, data.input);
    // if (!validation.status) {
    //     return response.sendErrorResponse(validation.message, 400);
    // }

    logger.debug(`[signupStepOne] [${JSON.stringify(data.input)}]`);

    const logic = await authlogic.signupStepOne(data.input);
    if (!logic.status) {
        return response.sendErrorResponse(logic.message, 400);
    }

    return response.sendSuccessResponse(GraphResponse.RespondWithUser, logic.message, logic.data);
};
