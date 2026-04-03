  export interface IRecaptchaResponse {
    success: boolean;
    challenge_ts: string;
    hostname: string;
    score: number;
  }
  

  export interface IRecaptchaPayload {
    secret: string;
    response: string;
  }
  