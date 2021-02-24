import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CopyModule } from './copy/copy.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const options = new DocumentBuilder()
    .addBearerAuth()
    .addBasicAuth()
    .setTitle('EA Tool Report')
    .setDescription('EA Tool Report')
    .setVersion('1.0')
    .addTag('API')
    .build();
  const document = SwaggerModule.createDocument(app, options, {
    include: [CopyModule],
  });
  SwaggerModule.setup('api/swagger', app, document);
  const configService = app.get(ConfigService);
  const port = configService.get('app.port');
  await app.listen(port);
}
bootstrap();
