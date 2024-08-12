import { Xiao } from '../../../garage/xiao/interface';
import * as postgresql from '../database/postgresql';

export interface IUser {
    id: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}
