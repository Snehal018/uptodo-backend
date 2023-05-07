import { NextFunction, Response } from "express";
import { validatorErrorsHandler } from "../utils/error";
import { AddCategoryRequest } from "../utils/types/request/category";
import { parsePaginationResponse } from "../utils/pagination";
import {
  createCategoryService,
  getCategoriesCountService,
  getPaginatedCategoriesService,
} from "../services/category";
import { AppRequestType } from "../utils/types";

export const getCategories = async (
  req: AppRequestType,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;
  const page = req?.query?.page ? +req.query.page : 1;
  try {
    const categories = await getPaginatedCategoriesService(
      { user: userId },
      page
    );
    const categoriesCount = await getCategoriesCountService();
    res
      .status(200)
      .json(parsePaginationResponse(categories, page, categoriesCount));
  } catch (error) {
    next(error);
  }
};

export const postCategory = async (
  req: AppRequestType,
  res: Response,
  next: NextFunction
) => {
  const { name, color } = req.body as AddCategoryRequest;
  try {
    validatorErrorsHandler(req);
    const newCategory = await createCategoryService({
      name,
      color,
      userId: req.userId ?? "",
    });
    res.status(201).json(newCategory);
  } catch (error) {
    next(error);
  }
};
