import { Router } from "express";
import { getCategories, postCategory } from "../controllers/category";
import { isAuth } from "../middleware/auth";
import { addCategoryValidation } from "../validators/category";

const categoryRoutes = Router();

categoryRoutes.get("", isAuth, getCategories);

categoryRoutes.post("", isAuth, addCategoryValidation, postCategory);

export default categoryRoutes;
