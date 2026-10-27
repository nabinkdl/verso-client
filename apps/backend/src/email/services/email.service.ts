import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('RESEND_API_KEY') ?? '';
    this.from =
      config.get<string>('RESEND_FROM_EMAIL') ??
      'Verso <onboarding@resend.dev>';
    this.resend = apiKey ? new Resend(apiKey) : null;

    if (!this.resend) {
      this.logger.warn(
        'RESEND_API_KEY is not set; password reset emails are disabled',
      );
    }
  }

  async sendPasswordReset(
    to: string,
    resetUrl: string,
    ttlMinutes: number,
  ): Promise<void> {
    if (!this.resend) {
      throw new ServiceUnavailableException(
        'Email delivery is not configured',
      );
    }

    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: 'Reset your Verso password',
      text: [
        'We received a request to reset your Verso password.',
        '',
        `Reset it here (valid for ${ttlMinutes} minutes):`,
        resetUrl,
        '',
        'If you did not request this, you can safely ignore this email.',
      ].join('\n'),
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #111;">
          <h2 style="margin: 0 0 16px;">Reset your Verso password</h2>
          <p style="line-height: 1.5;">We received a request to reset your password. This link is valid for ${ttlMinutes} minutes.</p>
          <p style="margin: 24px 0;">
            <a href="${resetUrl}" style="background: #111; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 8px; display: inline-block; font-weight: 600;">Reset password</a>
          </p>
          <p style="line-height: 1.5; color: #555; font-size: 13px;">If the button does not work, copy this link into your browser:<br /><a href="${resetUrl}">${resetUrl}</a></p>
          <p style="line-height: 1.5; color: #555; font-size: 13px;">If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      this.logger.error(
        `Resend rejected the password reset email: ${error.message}`,
      );
      throw new ServiceUnavailableException(
        'Could not send the password reset email',
      );
    }
  }
}
