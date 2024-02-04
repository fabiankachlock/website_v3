export type CaptchaRequestDto = {
  token: string;
};

export type CaptchaResponseDto = {
  success: boolean;
  challenge_ts: number;
  hostname: string;
  credit?: boolean;
  'error-codes'?: string[];
};

export const verifyCaptcha = async (req: CaptchaRequestDto): Promise<CaptchaResponseDto> => {
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
