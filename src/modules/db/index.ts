import { getConnectionManager } from 'typeorm';

import { app } from '../../config';
import { File, User } from './entities';

const connectionManager = getConnectionManager();
const connection = connectionManager.create({
  type: 'postgres',
  url: app.dbUrl,
  entities: [File, User],
  logging: app.debug,
  synchronize: true,
});

export default connection;