// eslint-disable-next-line @typescript-eslint/no-var-requires
const { join } = require('path');

module.exports = {
    type: 'postgres',
    port: 5432,
    url: process.env.DB_URI,
    synchronize: true,
    entities: ['dist/src/**/*.entity.{ts,js}'],
    migrations: [join(__dirname, 'dist', 'src', 'migrations', '*.{ts,js}')],
    migrationsTableName: 'migrations_history',
    migrationsRun: false,
    cli: {
        migrationsDir: './dist/src/migrations',
    },
    autoLoadEntities: true,
    keepConnectionAlive: true,
    extra: {
    ssl: {
        ca: process.env.SSL_CERT,
      },
    },
};
