import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';
import { AppConfigService } from '../config/config.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;

  constructor(private readonly config: AppConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });
  }

  async sendAccountConfirmation(email: string, fullName: string, confirmUrl: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.config.smtpFrom,
      to: email,
      subject: 'Confirm your Three-O-One account',
      text: [
        `Hi ${fullName},`,
        '',
        'Please confirm your account by opening this link:',
        confirmUrl,
        '',
        'This link expires in 24 hours.',
        '',
        'If you did not create an account, you can ignore this email.',
      ].join('\n'),
      html: `
        <p>Hi ${escapeHtml(fullName)},</p>
        <p>Please confirm your account by clicking the button below:</p>
        <p>
          <a href="${confirmUrl}" style="display:inline-block;padding:12px 20px;background:#8D643D;color:#fff;text-decoration:none;border-radius:8px;">
            Confirm account
          </a>
        </p>
        <p>Or open this link:</p>
        <p><a href="${confirmUrl}">${confirmUrl}</a></p>
        <p>This link expires in 24 hours.</p>
        <p>If you did not create an account, you can ignore this email.</p>
      `,
    });

    this.logger.log(`Confirmation email sent to ${email}`);
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
