import express from "express";
import { validatorErrorsHandler } from "../utils/error";
import { AddCategoryRequest } from "../utils/types/request/category";
import Category from "../models/category";
import { ITEMS_PER_PAGE, parsePaginationResponse } from "../utils/pagination";

export const getCategories = async (
  req: any,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { userId } = req;
    const page = +req.query.page || 1;

    const categories = await Category.find({ user: userId })
      .populate("user", "_id username profileImage")
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    const categoriesCount = await Category.countDocuments();

    res
      .status(200)
      .json(parsePaginationResponse(categories, page, categoriesCount));
  } catch (error) {
    next(error);
  }
};

export const postCategory = async (
  req: any,
  res: express.Response,
  next: express.NextFunction
) => {
  validatorErrorsHandler(req);

  try {
    const { name, color } = req.body as AddCategoryRequest;
    const newCategory = new Category({ name, color, user: req.userId });
    await newCategory.save();

    res.status(201).json(newCategory);
  } catch (error) {
    next(error);
  }
};
