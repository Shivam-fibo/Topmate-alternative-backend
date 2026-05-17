import { TransactionalEmailsApi, SendSmtpEmail } from "@getbrevo/brevo";

import { config } from "../../../config";

import type { EmailProvider, SendEmailOptions } from "./email.types";

const brevoClient = new TransactionalEmailsApi();

brevoClient.setApiKey(
  TransactionalEmailsApiApiKeys.apiKey,
  config.mail.brevoApiKey,
);

class BrevoProvider implements EmailProvider {
  async sendEmail(options: SendEmailOptions): Promise<void> {
    const email = new SendSmtpEmail();

    email.subject = options.subject;

    email.htmlContent = options.html;

    email.sender = {
      email: config.mail.fromEmail,

      name: config.mail.fromName,
    };

    email.to = [
      {
        email: options.to,
      },
    ];

    await brevoClient.sendTransacEmail(email);
  }
}

export const brevoProvider = new BrevoProvider();
