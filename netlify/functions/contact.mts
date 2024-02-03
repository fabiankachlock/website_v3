import type { Context } from '@netlify/functions';
import sgMail from '@sendgrid/mail';

export default async (req: Request, context: Context) => {
  sgMail.setApiKey(process.env['SENDGRID_API_KEY']!);

  try {
    await sgMail.send({
      from: 'no-reply@fabiankachlock.dev',
      to: 'contact@fabiankachlock.dev',
      subject: 'Contact Form Submission',
      text: 'Hello World',
    });
    return new Response('OK', { status: 200 });
  } catch {
    return new Response('Internal Server Error', { status: 500 });
  }
  // if (req.method !== 'POST') {
  //   return new Response('Method Not Allowed', { status: 405 });
  // }
  // const { to, subject, text } = await req.json();
};
