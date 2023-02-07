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
import Task from "../models/task";

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
    });
    await user.save();
    res.status(200).json({ message: AppStrings.userCreationSuccess });
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

    const existingUser: any = await User.findOne({ username: username });

    if (!existingUser) {
      throw parseStatusError(AppStrings.usernameDoesNotExists, 404);
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      throw parseStatusError(AppStrings.incorrectPassword);
    }

    const token = jwt.sign(
      { userId: existingUser._id?.toString() },
      env.JWT_SECRET_KEY!,
      { expiresIn: "24h" }
    );

    const pendingTasks = await Task.find({
      user: req.userId,
      isDone: false,
    }).countDocuments();

    const completedTasks = await Task.find({
      user: req.userId,
      isDone: true,
    }).countDocuments();

    res.status(200).json({
      authToken: token,
      userProfile: {
        _id: existingUser._id,
        username: existingUser.username,
        profileImage: existingUser.profileImage,
        leftTasks: pendingTasks,
        doneTasks: completedTasks,
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

    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw parseStatusError(AppStrings.userDoesNotExists, 404);
    }

    const pendingTasks = await Task.find({
      user: req.userId,
      isDone: false,
    }).countDocuments();

    const completedTasks = await Task.find({
      user: req.userId,
      isDone: true,
    }).countDocuments();

    res.status(200).json({
      username: user.username,
      _id: user._id,
      profileImage: user.profileImage,
      leftTasks: pendingTasks,
      doneTasks: completedTasks,
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
    await User.findOneAndDelete({ _id: userId });

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

    const user = await User.findOne({ _id: userId });
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

    const user = await User.findOne({ _id: userId });
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

    const pendingTasks = await Task.find({
      user: req.userId,
      isDone: false,
    }).countDocuments();

    const completedTasks = await Task.find({
      user: req.userId,
      isDone: true,
    }).countDocuments();

    res.status(200).json({
      message: "Profile Updated Successfully",
      data: {
        _id: user._id,
        username: user.username,
        profileImage: user.profileImage,
        leftTasks: pendingTasks,
        doneTasks: completedTasks,
      },
    });
  } catch (error: any) {
    next(error);
  }
};
