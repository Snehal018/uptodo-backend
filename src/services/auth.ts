import { parseStatusError } from "../utils/error";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "process";

const hashStringService = async (value: string) => {
  try {
    return await bcrypt.hash(value, 12);
  } catch (error: any) {
    throw parseStatusError();
  }
};

const compareHashService = async (hashValue: string, stringValue: string) => {
  try {
    return await bcrypt.compare(stringValue, hashValue);
  } catch (error: any) {
    throw parseStatusError();
  }
};

const signJWTService = (payload: object, expiresIn: string) => {
  try {
    return jwt.sign(payload, env.JWT_SECRET_KEY!, { expiresIn });
  } catch (error) {
    throw parseStatusError();
  }
};

export { hashStringService, compareHashService, signJWTService };
