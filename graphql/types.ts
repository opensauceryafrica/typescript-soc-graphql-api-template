import { gql } from 'apollo-server-core';
import { read } from '../garage/helper/filesystem';
import path = require('path');

export default gql(read(path.join(__dirname, '../schema')));
