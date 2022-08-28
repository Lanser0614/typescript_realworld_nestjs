import { ConnectionOptions } from "typeorm";
import { join } from 'path';

const config: ConnectionOptions = {
  type: 'postgres',
  host: '127.0.0.1',
  port: 5432,
  database: 'test',
  username: 'doniyor',
  password: 'revm0614',
  entities: [join(__dirname, '**', '*.entity.{ts,js}')],
  synchronize: true,
};

export default config;