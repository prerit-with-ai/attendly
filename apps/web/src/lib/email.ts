import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const emailFrom = process.env.EMAIL_FROM || "Attndly <noreply@attndly.com>";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.log(`\n📧 Email (dev mode):\n  To: ${to}\n  Subject: ${subject}\n  Body: ${html}\n`);
    return;
  }

  await resend.emails.send({ from: emailFrom, to, subject, html });
}
