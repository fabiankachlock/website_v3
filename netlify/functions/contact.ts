// import { verifyCaptcha } from 'netlify/util/hcaptcha';
const sgMail = require('@sendgrid/mail');

class ContactFormDto {
  public constructor(
    public name: string,
    public email: string,
    public message: string,
    public site: string,
    public captchaToken: string,
  ) {}
}

type CaptchaRequestDto = {
  token: string;
};

type CaptchaResponseDto = {
  success: boolean;
  challenge_ts: number;
  hostname: string;
  credit?: boolean;
  'error-codes'?: string[];
};

const verifyCaptcha = async (req: CaptchaRequestDto): Promise<CaptchaResponseDto> => {
  const isProd = process.env['API_ENV'] !== 'dev';
  const captchaSecret = isProd ? process.env['CAPTCHA_SECRET'] : '0x0000000000000000000000000000000000000000';
  const captchaSiteKey = process.env['CAPTCHA_SITEKEY'];

  const data = {
    secret: captchaSecret,
    response: req.token,
    sitekey: captchaSiteKey,
  };

  let formBody = [];
  for (const entry of Object.entries(data)) {
    var encodedKey = encodeURIComponent(entry[0] ?? '');
    var encodedValue = encodeURIComponent(entry[1] ?? '');
    formBody.push(encodedKey + '=' + encodedValue);
  }

  const res = await fetch('https://hcaptcha.com/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: formBody.join('&'),
  });
  return (await res.json()) as CaptchaResponseDto;
};

module.exports = async (req: Request) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
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
    if (!captchaResponse || !captchaResponse.success) {
      return new Response('insufficient captcha', {
        status: 401,
      });
    }

    sgMail.setApiKey(Netlify.env.get('SENDGRID_API_KEY')!);

    let body = `From: '${data.name}' (${data.email})\n`;
    body += `Submitted: ${data.site} at ${new Date(Date.now()).toLocaleString('de-DE')}\n`;
    body += `Captcha Score: ${captchaResponse.success ? 1 : 0} / 1\n`;
    body += `Message:\n${data.message}\n\n`;

    await sgMail.send({
      from: 'no-reply@fabiankachlock.dev',
      to: 'contact@fabiankachlock.dev',
      subject: 'Contact Form Submission',
      text: body,
    });
    return new Response('OK', { headers, status: 200 });
  } catch {
    return new Response('Internal Server Error', { headers, status: 500 });
  }
};
