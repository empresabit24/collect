const config = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    dialectOptions: {
      charset: 'utf8',
      useUTC: false,
      timezone: '-05:00',
    },
    migrationStorageTableSchema: 'sch_util', // For migrations table
    migrationStorageTableName: 'migrations_collect', // For migrations table
  },
};

module.exports = config;
