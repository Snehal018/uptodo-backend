import {
  ChangePasswordRequest,
  LoginRequest,
  SignupRequest,
  UpdateProfileRequest,
} from "../utils/types/request/user";
import express from "express";
import { parseStatusError, validatorErrorsHandler } from "../utils/error";
import jwt from "jsonwebtoken";
import User from "../models/user";
import bcrypt from "bcryptjs";
import { AppStrings } from "../utils/strings";
import { env } from "process";
import { unlink } from "fs";
import { join } from "path";

export const postSignup = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { username, password } = req.body as SignupRequest;

  try {
    validatorErrorsHandler(req);

    const existingUser = await User.findOne({ username: username });

    if (existingUser) {
      throw parseStatusError(AppStrings.usernameAlreadyInuse, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      username,
      password: hashedPassword,
      profileImage: null,
      completedTasksCount: 0,
      pendingTasksCount: 0,
    });
    await user.save();
    res.status(201).json({ message: AppStrings.userCreationSuccess });
  } catch (error) {
    next(error);
  }
};

export const postLogin = async (
  req: any,
  res: express.Response,
  next: express.NextFunction
) => {
  const { username, password } = req.body as LoginRequest;

  try {
    validatorErrorsHandler(req);

    const existingUser = await User.findOne({ username: username });
    if (!existingUser) {
      throw parseStatusError(AppStrings.usernameDoesNotExists, 404);
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      throw parseStatusError(AppStrings.incorrectPassword, 400);
    }

    const token = jwt.sign(
      { userId: existingUser._id?.toString() },
      env.JWT_SECRET_KEY!,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      authToken: token,
      userProfile: {
        _id: existingUser._id,
        username: existingUser.username,
        profileImage: existingUser.profileImage,
        leftTasks: existingUser.pendingTasksCount,
        doneTasks: existingUser.completedTasksCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (
  req: any,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { userId } = req;

    const user = await User.findById(userId);

    if (!user) {
      throw parseStatusError(AppStrings.userDoesNotExists, 404);
    }

    res.status(200).json({
      username: user.username,
      _id: user._id,
      profileImage: user.profileImage,
      leftTasks: user.pendingTasksCount,
      doneTasks: user.completedTasksCount,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: any,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { userId } = req;

    const user = await User.findById(userId);
    if (!user) {
      throw parseStatusError(AppStrings.noUserFound, 404);
    }
    await user.remove();

    const profileImagePath = join(
      __dirname,
      "..",
      "..",
      user.profileImage?.toString() ?? ""
    );

    if (profileImagePath) {
      unlink(profileImagePath, (err) => {
        if (err) {
          console.log("Failed to delete Profile Image", err);
        }
      });
    }

    res.status(200).json({
      message: "User Deleted Successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const postChangePassword = async (
  req: any,
  res: express.Response,
  next: express.NextFunction
) => {
  validatorErrorsHandler(req);

  try {
    const { userId } = req;
    const { oldPassword, newPassword } = req.body as ChangePasswordRequest;

    const user = await User.findById(userId);
    if (!user) {
      throw parseStatusError(AppStrings.userDoesNotExists, 404);
    }

    const isOldPasswordSame = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordSame) {
      throw parseStatusError(AppStrings.oldPasswordDoesNotMatch, 422);
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = newHashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password Updated Successfully",
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateUser = async (
  req: any,
  res: express.Response,
  next: express.NextFunction
) => {
  validatorErrorsHandler(req);

  try {
    const { userId, file } = req;
    const { username } = req.body as UpdateProfileRequest;

    const user = await User.findById(userId);
    if (!user) {
      throw parseStatusError(AppStrings.userDoesNotExists, 404);
    }

    if (file) {
      user.profileImage = file.path;
    }

    if (username) {
      user.username = username;
    }

    await user.save();

    res.status(200).json({
      message: "Profile Updated Successfully",
      data: {
        _id: user._id,
        username: user.username,
        profileImage: user.profileImage,
        leftTasks: user.pendingTasksCount,
        doneTasks: user.completedTasksCount,
      },
    });
  } catch (error: any) {
    next(error);
  }
};
