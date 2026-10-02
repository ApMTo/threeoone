import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';
import { AppConfigService } from '../config/config.service';

type OrderEmailItem = {
  productName: string;
  sizeLabel?: string | null;
  quantity: number;
  lineTotal: string;
};

type OrderConfirmationParams = {
  to: string;
  fullName: string;
  orderNumber: string;
  total: string;
  items: OrderEmailItem[];
  ordersUrl: string;
};

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

  async sendPasswordReset(email: string, fullName: string, resetUrl: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.config.smtpFrom,
      to: email,
      subject: 'Reset your Three-O-One password',
      text: [
        `Hi ${fullName},`,
        '',
        'We received a request to reset your password. Open this link:',
        resetUrl,
        '',
        'This link expires in 1 hour.',
        '',
        'If you did not request a reset, you can ignore this email.',
      ].join('\n'),
      html: `
        <p>Hi ${escapeHtml(fullName)},</p>
        <p>We received a request to reset your password.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background:#8D643D;color:#fff;text-decoration:none;border-radius:8px;">
            Reset password
          </a>
        </p>
        <p>Or open this link:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request a reset, you can ignore this email.</p>
      `,
    });

    this.logger.log(`Password reset email sent to ${email}`);
  }

  async sendOrderConfirmation(params: OrderConfirmationParams): Promise<void> {
    const itemLines = params.items
      .map((item) => {
        const size = item.sizeLabel ? ` (${item.sizeLabel})` : '';
        return `- ${item.productName}${size} ×${item.quantity} — ${item.lineTotal}`;
      })
      .join('\n');

    const itemHtml = params.items
      .map((item) => {
        const size = item.sizeLabel ? ` · ${escapeHtml(item.sizeLabel)}` : '';
        return `<li>${escapeHtml(item.productName)}${size} ×${item.quantity} — ${escapeHtml(item.lineTotal)}</li>`;
      })
      .join('');

    await this.transporter.sendMail({
      from: this.config.smtpFrom,
      to: params.to,
      subject: `Order ${params.orderNumber} confirmed`,
      text: [
        `Hi ${params.fullName},`,
        '',
        `Thanks for your order ${params.orderNumber}.`,
        '',
        'Items:',
        itemLines,
        '',
        `Total: ${params.total}`,
        '',
        `Track your order: ${params.ordersUrl}`,
      ].join('\n'),
      html: `
        <p>Hi ${escapeHtml(params.fullName)},</p>
        <p>Thanks for your order <strong>${escapeHtml(params.orderNumber)}</strong>.</p>
        <ul>${itemHtml}</ul>
        <p><strong>Total: ${escapeHtml(params.total)}</strong></p>
        <p>
          <a href="${params.ordersUrl}" style="display:inline-block;padding:12px 20px;background:#8D643D;color:#fff;text-decoration:none;border-radius:8px;">
            View orders
          </a>
        </p>
      `,
    });

    this.logger.log(`Order confirmation emailed to ${params.to} (${params.orderNumber})`);
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
