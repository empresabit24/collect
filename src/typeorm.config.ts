import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

import { AuthGuard } from './infraestructure/auth/auth.guard';

import { CreateTables1713237726733 } from './migrations/1713237726733-CreateTables';

export const createTypeOrmOptions = async (
  request: ExecutionContext,
): Promise<TypeOrmModuleOptions> => {
  // Instanciar dependencias
  const jwtService = new JwtService();
  const authGuard = new AuthGuard(jwtService);

  // Lógica de autenticación
  const access = await authGuard.authorize(request);

  if (!access) {
    throw new UnauthorizedException();
  }

  return {
    type: 'postgres',
    host: access.primary_db.db_hostname,
    port: 5432,
    username: access.primary_db.db_username,
    password: access.primary_db.db_password,
    database: access.primary_db.db_name,
    autoLoadEntities: true,
    schema: 'sch_main',
    migrations: [CreateTables1713237726733],
    migrationsRun: true,
  };
};
