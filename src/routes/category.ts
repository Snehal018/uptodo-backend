import { Router } from "express";
import { getCategories, postCategory } from "../controllers/category";
import { isAuth } from "../middleware/auth";
import { addCategoryValidation } from "../validators/category";

const categoryRoutes = Router();

categoryRoutes.get("/category", isAuth, getCategories);

categoryRoutes.post("/category", isAuth, addCategoryValidation, postCategory);

export { categoryRoutes };
