import { verifyCaptcha } from 'netlify/util/hcaptcha';

export class ContactFormDto {
  public constructor(
    public name: string,
    public email: string,
    public message: string,
    public site: string,
    public captchaToken: string,
  ) {}
}

export default async (req: Request) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  console.log(`[http] in  | ${req.method} ${req.url}`);
  if (req.method === 'OPTIONS') {
    // returns CORS headers
    return new Response('', { headers });
  }
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { headers, status: 405 });
  }
  const data: ContactFormDto = await req.json();

  try {
    const captchaResponse = await verifyCaptcha({ token: data.captchaToken });
    console.log(`[http] out | 401 - captcha failure: ${captchaResponse['error-codes']}`);
    if (!captchaResponse || !captchaResponse.success) {
      return new Response('insufficient captcha', {
        status: 401,
      });
    }

    let body = `From: '${data.name}' (${data.email})\n`;
    body += `Submitted: ${data.site} at ${new Date(Date.now()).toLocaleString('de-DE')}\n`;
    body += `Captcha Score: ${captchaResponse.success ? 1 : 0} / 1\n`;
    body += `Message:\n${data.message}\n\n`;

    const mailResponse = await fetch('https://eu-api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Smtp2go-Api-Key': Netlify.env.get('SMTP2GO_API_KEY')!,
      },
      body: JSON.stringify({
        sender: 'no-reply@fabiankachlock.dev',
        to: ['contact@fabiankachlock.dev'],
        subject: 'Contact Form Submission',
        text_body: body,
      }),
    });
    if (!mailResponse.ok) {
      throw new Error(`smtp2go responded with ${mailResponse.status}: ${await mailResponse.text()}`);
    }
    console.log(`[http] out | 200 - success`);
    return new Response('OK', { headers, status: 200 });
  } catch (e: unknown) {
    console.log(`[http] out | 500 - error: ${e}`);
    return new Response('Internal Server Error', { headers, status: 500 });
  }
};
