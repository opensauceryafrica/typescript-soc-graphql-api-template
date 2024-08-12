import * as xiao from '../../../garage/xiao';
import { Pool } from '../database/postgresql';
import { IUser } from '../model/user';

class User extends xiao.Xiao<IUser> {
    protected tableName = 'users';

    constructor(pool: xiao.XiaoPool) {
        super(pool);
    }
}

export default new User(Pool);
