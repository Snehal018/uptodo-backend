import { Request } from "express";

export interface ErrorType extends Error {
  statusCode?: number;
}
export interface AppRequestType extends Request {
  userId?: string;
  file?: Express.Multer.File;
}
