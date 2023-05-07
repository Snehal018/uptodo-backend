import { join } from "path";
import User from "../models/user";
import { parseStatusError } from "../utils/error";
import { AppStrings } from "../utils/strings";
import { unlink } from "fs";
import { compareHashService, hashStringService } from "./auth";
import { Types } from "mongoose";

const findOneUserService = async (filter: object = {}) => {
  try {
    return await User.findOne(filter);
  } catch (error: any) {
    throw parseStatusError();
  }
};

const createUserService = async (userData: {
  username: string;
  password: string;
}) => {
  try {
    const user = new User({
      username: userData.username,
      password: userData.password,
      profileImage: null,
      completedTasksCount: 0,
      pendingTasksCount: 0,
    });
    return await user.save();
  } catch (error) {
    throw parseStatusError();
  }
};

const findUserByIdService = async (userId: string) => {
  try {
    return await User.findById(userId);
  } catch (error) {
    throw parseStatusError();
  }
};

const deleteProfileImageService = (imageName: string = "") => {
  const profileImagePath = join(__dirname, "..", "..", imageName);
  if (profileImagePath) {
    unlink(profileImagePath, (err) => {
      if (err) {
        console.log("Failed to delete Profile Image", err);
      }
    });
  }
};

const deleteUserService = async (userId: string) => {
  try {
    const user = await findUserByIdService(userId);
    if (!user) {
      throw parseStatusError(AppStrings.noUserFound, 404);
    }
    deleteProfileImageService(user.profileImage?.toString());
    await user.deleteOne();
  } catch (error: any) {
    throw parseStatusError(error.message);
  }
};

const changePasswordService = async ({
  userId,
  newPassword,
  oldPassword,
}: {
  userId: string;
  oldPassword: string;
  newPassword: string;
}) => {
  try {
    const user = await findUserByIdService(userId);
    if (!user) {
      throw parseStatusError(AppStrings.userDoesNotExists, 404);
    }

    const isOldPasswordSame = await compareHashService(
      user.password,
      oldPassword
    );
    if (!isOldPasswordSame) {
      throw parseStatusError(AppStrings.oldPasswordDoesNotMatch, 422);
    }

    const newHashedPassword = await hashStringService(newPassword);
    user.password = newHashedPassword;
    await user.save();
  } catch (error: any) {
    throw parseStatusError(error.message);
  }
};

const updateUserService = async (
  userId: string,
  updateData: {
    imageFile?: Express.Multer.File;
    username?: string;
  }
) => {
  try {
    const user = await findUserByIdService(userId);
    if (!user) {
      throw parseStatusError(AppStrings.userDoesNotExists, 404);
    }

    const { imageFile, username } = updateData;
    if (imageFile) {
      user.profileImage = imageFile.path;
    }
    if (username) {
      user.username = username;
    }

    return await user.save();
  } catch (error) {
    throw parseStatusError();
  }
};

export {
  findOneUserService,
  createUserService,
  findUserByIdService,
  deleteUserService,
  changePasswordService,
  updateUserService,
};
