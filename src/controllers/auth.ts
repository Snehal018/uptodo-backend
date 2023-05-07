import { NextFunction, Request, Response } from "express";
import { LoginRequest, SignupRequest } from "../utils/types/request/user";
import { parseStatusError, validatorErrorsHandler } from "../utils/error";
import { AppStrings } from "../utils/strings";
import {
  compareHashService,
  hashStringService,
  signJWTService,
} from "../services/auth";
import { createUserService, findOneUserService } from "../services/user";
import { parseUserProfileResponse } from "../utils/response/user";

export const postSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password } = req.body as SignupRequest;
  try {
    validatorErrorsHandler(req);

    const existingUser = await findOneUserService({ username });
    if (existingUser) {
      throw parseStatusError(AppStrings.usernameAlreadyInuse, 400);
    }

    const hashedPassword = await hashStringService(password);
    await createUserService({ username, password: hashedPassword });

    res.status(201).json({ message: AppStrings.userCreationSuccess });
  } catch (error) {
    next(error);
  }
};

export const postLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password } = req.body as LoginRequest;
  try {
    validatorErrorsHandler(req);

    const existingUser = await findOneUserService({ username });
    if (!existingUser) {
      throw parseStatusError(AppStrings.usernameDoesNotExists, 404);
    }

    const isPasswordValid = await compareHashService(
      existingUser.password,
      password
    );
    if (!isPasswordValid) {
      throw parseStatusError(AppStrings.incorrectPassword, 400);
    }

    const token = signJWTService(
      { userId: existingUser._id?.toString() },
      "24h"
    );

    res.status(200).json({
      authToken: token,
      userProfile: parseUserProfileResponse(existingUser),
    });
  } catch (error) {
    next(error);
  }
};
