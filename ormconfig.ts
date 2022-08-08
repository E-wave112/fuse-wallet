// eslint-disable-next-line @typescript-eslint/no-var-requires
const { join } = require('path');

module.exports = {
    type: 'mysql',
    port: 3306,
    url: process.env.DB_URI,
    synchronize: false,
    entities: ['dist/src/**/*.entity.{ts,js}'],
    migrations: [join(__dirname, 'dist', 'src', 'migrations', '*.{ts,js}')],
    migrationsTableName: 'migrations_history',
    migrationsRun: true,
    cli: {
        migrationsDir: './dist/src/migrations',
    },
    autoLoadEntities: true,
    keepConnectionAlive: true,
};
