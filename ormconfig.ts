// eslint-disable-next-line @typescript-eslint/no-var-requires
const { join } = require('path');
// import { ConfigService } from '@nestjs/config';
// import configuration from './src/config/configuration';
// const configService: ConfigService = new ConfigService(configuration);

module.exports = {
  type: 'postgres',
  port: 5432,
  url: process.env.DB_URI,
  synchronize: false,
  entities: ['dist/**/*.entity.{ts,js}'],
  migrations: [join(__dirname, 'dist', 'migrations', '*.{ts,js}')],
  migrationsTableName: 'migrations_history',
  migrationsRun: true,
  cli: {
    migrationsDir: './dist/migrations',
  },
  autoLoadEntities: true,
  keepConnectionAlive: true,
};
