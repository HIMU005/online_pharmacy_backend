import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

@Module({
  imports: [
    ConfigModule,

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('EMAIL_HOST'),
          port: Number(configService.get<string>('EMAIL_PORT')),
          secure: configService.get<string>('EMAIL_SECURE') === 'true',

          auth: {
            user: configService.get<string>('EMAIL_USER'),
            pass: configService.get<string>('EMAIL_PASSWORD'),
          },
        },

        defaults: {
          from: configService.get<string>('EMAIL_FROM'),
        },
      }),
    }),
  ],

  providers: [EmailService],

  exports: [EmailService],
})
export class EmailModule {}
