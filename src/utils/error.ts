import { validationResult } from "express-validator";
import { ErrorType } from "./types";
import express from "express";

export const parseStatusError = (errorString: string, statusCode?: number) => {
  const error: ErrorType = new Error(errorString);
  error.statusCode = statusCode ?? 500;
  return error;
};

export const validatorErrorsHandler = (
  req: express.Request,
  customError?: { message: string; statusCode: number }
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const validatorErrorString = errors.array()[0].msg;

    throw parseStatusError(
      customError?.message ?? validatorErrorString,
      customError?.statusCode ?? 500
    );
  }
};
