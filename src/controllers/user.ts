import {
  ChangePasswordRequest,
  UpdateProfileRequest,
} from "../utils/types/request/user";
import { NextFunction, Response } from "express";
import { parseStatusError, validatorErrorsHandler } from "../utils/error";
import { AppStrings } from "../utils/strings";
import {
  changePasswordService,
  deleteUserService,
  findUserByIdService,
  updateUserService,
} from "../services/user";
import { parseUserProfileResponse } from "../utils/response/user";
import { AppRequestType } from "../utils/types";

export const getUser = async (
  req: AppRequestType,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;
  try {
    const user = await findUserByIdService(userId ?? "");
    if (!user) {
      throw parseStatusError(AppStrings.userDoesNotExists, 404);
    }
    res.status(200).json(parseUserProfileResponse(user));
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: AppRequestType,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;
  try {
    await deleteUserService(userId ?? "");
    res.status(200).json({
      message: AppStrings.userDeleteSuccess,
    });
  } catch (error) {
    next(error);
  }
};

export const postChangePassword = async (
  req: AppRequestType,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;
  const { oldPassword, newPassword } = req.body as ChangePasswordRequest;

  try {
    validatorErrorsHandler(req);

    await changePasswordService({
      userId: userId ?? "",
      newPassword,
      oldPassword,
    });

    res.status(200).json({
      message: AppStrings.passwordUpdateSuccess,
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateUser = async (
  req: AppRequestType,
  res: Response,
  next: NextFunction
) => {
  const { userId, file } = req;
  const { username } = req.body as UpdateProfileRequest;

  try {
    validatorErrorsHandler(req);

    const user = await updateUserService(userId ?? "", {
      imageFile: file,
      username,
    });

    res.status(200).json({
      message: AppStrings.profileUpdateSuccess,
      data: parseUserProfileResponse(user),
    });
  } catch (error: any) {
    next(error);
  }
};
