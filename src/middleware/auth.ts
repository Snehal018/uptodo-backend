import express from "express";
import { parseStatusError } from "../utils/error";
import { AppStrings } from "../utils/strings";
import jwt from "jsonwebtoken";
import { env } from "process";

export const isAuth = (
  req: any,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    if (!req.get("Authorization")) {
      throw parseStatusError(AppStrings.invalidAuthenticationCredentials, 401);
    }

    const token = req.get("Authorization")?.split(" ")[1];

    if (!token) {
      throw parseStatusError(AppStrings.invalidAuthenticationCredentials, 401);
    }

    const tokenData = jwt.verify(token, env.JWT_SECRET_KEY!);

    if (!tokenData) {
      throw parseStatusError(AppStrings.invalidAuthenticationCredentials, 401);
    }

    if (typeof tokenData !== "string") {
      req.userId = tokenData.userId;
    }

    if (!req.userId) {
      throw parseStatusError(AppStrings.invalidAuthenticationCredentials, 401);
    }

    next();
  } catch (error) {
    throw parseStatusError(
      "Something went wrong when validating the access token",
      401
    );
  }
};
