import { parseStatusError } from "../utils/error";
import Category from "../models/category";
import { ITEMS_PER_PAGE } from "../utils/pagination";

const getPaginatedCategoriesService = async (filter: object = {}, page = 1) => {
  try {
    const categories = await Category.find(filter)
      .populate("user", "_id username profileImage")
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    return categories;
  } catch (error) {
    throw parseStatusError();
  }
};

const getCategoriesCountService = async () => {
  try {
    return await Category.countDocuments();
  } catch (error) {
    throw parseStatusError();
  }
};

const createCategoryService = async (createCategoryData: {
  name: string;
  color: string;
  userId: string;
}) => {
  try {
    const newCategory = new Category({
      name: createCategoryData.name,
      color: createCategoryData.color,
      user: createCategoryData.userId,
    });
    return await newCategory.save();
  } catch (error) {
    throw parseStatusError();
  }
};

export {
  getPaginatedCategoriesService,
  getCategoriesCountService,
  createCategoryService,
};
