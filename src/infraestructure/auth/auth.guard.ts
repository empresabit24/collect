import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import base64 from 'base64url';
import { DynamoDbConfig } from '../configurations/dynamo-db-config';
import { IAccessDataBase } from '../configurations/interfaces/IAccessDataBase';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request['rawHeaders']).toString();

    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: '3GBJHHD5hghtg',
      });

      request['customerId'] = JSON.parse(base64.decode(payload['ct']));
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException();
    }
    return true;
  }

  async authorize(request: ExecutionContext): Promise<IAccessDataBase> {
    const token = this.extractTokenFromHeader(request['rawHeaders']);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: '3GBJHHD5hghtg',
      });
      const user: any = JSON.parse(base64.decode(payload['ct']));
      request['customerId'] = user['customer_id'];
      const dynamodb = new DynamoDbConfig();
      return await dynamodb.getSettings(user['customer_id']).then((value) => {
        return value;
      });
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const tokenRequest = request?.find((req: any) => req.includes('Bearer'));
    return tokenRequest ? tokenRequest.split(' ')[1] : undefined;
  }
}
