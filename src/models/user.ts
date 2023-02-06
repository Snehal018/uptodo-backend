import { model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImage: String,
  },
  { timestamps: true }
);

export default model("User", userSchema);
