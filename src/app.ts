import express from "express";
import * as dotenv from "dotenv";
import { env } from "process";
import userRoutes from "./routes/user";
import bodyParser from "body-parser";
import { ErrorType } from "./utils/types";
import mongoose from "mongoose";
import path from "path";
import categoryRoutes from "./routes/category";
import taskRoutes from "./routes/task";
import cors from "cors";
import { serve, setup } from "swagger-ui-express";
import authRoutes from "./routes/auth";
const swaggerDocument = require("./swagger.json");

dotenv.config();

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use("/api-docs", serve, setup(swaggerDocument));

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/tasks", taskRoutes);

app.use(
  (
    error: ErrorType,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    res
      .status(error.statusCode ?? 500)
      .send({ error: error.message, status: error.statusCode });
  }
);

mongoose.set("strictQuery", false);

mongoose
  .connect(env.MONGO_URI!, { dbName: "uptodo" })
  .then((err) => {
    app.listen(+env.PORT!);
  })
  .catch((err) => console.log(err));
