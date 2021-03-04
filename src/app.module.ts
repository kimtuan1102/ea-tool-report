import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import appConfig from './config/app.config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from './config/mongo.config';
import { CopyModule } from './copy/copy.module';
import { ReportExcelsModule } from './report-excels/report-excels.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TelegramModule } from './telegram/telegram.module';

const ENV = process.env.NODE_ENV;
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: path.resolve(
        process.cwd(),
        !ENV ? 'env/....env.staging.production.development' : `env/.env.${ENV}`,
      ),
      isGlobal: true,
      load: [appConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useClass: MongooseConfigService,
    }),
    CopyModule,
    AuthModule,
    UserModule,
    ReportExcelsModule,
    TelegramModule,
  ],
})
export class AppModule {}
