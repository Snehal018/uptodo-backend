import express from "express";
import * as dotenv from "dotenv";
import { env } from "process";
import { MongoClient } from "mongodb";

dotenv.config();

const app = express();

MongoClient.connect(env.MONGO_URI!)
  .then((d) => {
    app.listen(+env.PORT!);
  })
  .catch((err) => console.log(err));
