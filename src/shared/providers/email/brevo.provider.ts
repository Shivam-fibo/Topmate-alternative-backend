import { BrevoClient } from "@getbrevo/brevo";

import { config } from "../../../config";

import type { EmailProvider, SendEmailOptions } from "./email.types";

const brevoClient = new BrevoClient({
  apiKey: config.mail.brevoApiKey,
});

class BrevoProvider implements EmailProvider {
  async sendEmail(options: SendEmailOptions): Promise<void> {
    await brevoClient.transactionalEmails.sendTransacEmail({
      subject: options.subject,

      htmlContent: options.html,

      sender: {
        email: config.mail.fromEmail,

        name: config.mail.fromName,
      },

      to: [
        {
          email: options.to,
        },
      ],
    });
  }
}

export const brevoProvider = new BrevoProvider();
