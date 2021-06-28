import { getConnectionManager } from 'typeorm';

import { db } from '../../common/config';
import { File, User } from './entities';

const connectionManager = getConnectionManager();
const connection = connectionManager.create({
  type: 'postgres',
  url: db.url,
  entities: [File, User],
  logging: db.isLogged,
  synchronize: db.isSynced,
  extra: {
    max: 5,
  },
});

export { connection as db };
