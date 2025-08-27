declare const __dirname: string;

declare global {
  namespace Express {
    interface Request {
      user?: UserSessionData;
    }
  }
}