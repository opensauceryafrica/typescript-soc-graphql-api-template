import * as auth from './auth';
import * as user from './user';

export default {
    Query: {
        ...auth,
        ...user,
    },
    Mutation: {
        ...auth,
        ...user,
    },
};
