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

dotenv.config();

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(userRoutes);
app.use(categoryRoutes);
app.use(taskRoutes);

app.use(
  (
    error: ErrorType,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    res.status(error.statusCode ?? 500).send({ error: error.message });
  }
);

mongoose.set("strictQuery", false);

mongoose
  .connect(env.MONGO_URI!, { dbName: "uptodo" })
  .then((err) => {
    app.listen(+env.PORT!);
  })
  .catch((err) => console.log(err));
