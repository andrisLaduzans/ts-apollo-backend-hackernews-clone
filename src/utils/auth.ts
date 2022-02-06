import * as jwt from "jsonwebtoken";

export const getAppSecret = () => {
  const APP_SECRET = process.env.SIGN_UP_SECRET;
  if (!APP_SECRET) {
    throw new Error("could not load env variables");
  }
  return APP_SECRET;
};

export interface AuthTokenPayload {
  userId: string;
}

export function decodeAuthHeader(authHeader: string): AuthTokenPayload {
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    throw new Error(`No token found`);
  }
  return jwt.verify(token, getAppSecret()) as AuthTokenPayload;
}
