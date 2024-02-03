import type { Context } from '@netlify/functions';
import nodemailer from 'nodemailer';

export default async (req: Request, context: Context) => {
  return new Response('Hello, world!');
  // const env = Netlify.env;

  // if (event.httpMethod !== 'POST') {
  //   return { statusCode: 405, body: 'Method Not Allowed' };
  // }

  // const { to, subject, text } = JSON.parse(event.body);

  // let transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: process.env.EMAIL,
  //     pass: process.env.PASSWORD,
  //   },
  // });

  // let mailOptions = {
  //   from: process.env.EMAIL,
  //   to: to,
  //   subject: subject,
  //   text: text,
  // };

  // try {
  //   await transporter.sendMail(mailOptions);
  //   return { statusCode: 200, body: 'Email sent' };
  // } catch (error) {
  //   return { statusCode: 500, body: 'Error sending email' };
  // }
};
