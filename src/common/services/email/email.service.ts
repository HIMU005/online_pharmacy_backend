import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendOtpEmail(
    to: string,
    otp: string,
    expiryMinutes: number,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject: 'Verify Your Email',
      html: `
        <div style="font-family:Arial,sans-serif">
          <h2>Email Verification</h2>

          <p>Your verification code is:</p>

          <h1
            style="
              letter-spacing:8px;
              color:#2563eb;
            "
          >
            ${otp}
          </h1>

          <p>
            This OTP is valid for
            <strong>${expiryMinutes} minutes</strong>.
          </p>

          <p>
            If you didn't request this,
            please ignore this email.
          </p>
        </div>
      `,
    });
  }
}
