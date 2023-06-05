import { model, Schema } from "mongoose";

const taskSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  time: {
    type: Date,
    required: true,
  },
  priority: { type: Number, required: true },
  category: { ref: "Category", type: Schema.Types.ObjectId },
  isDone: Boolean,
  subTasks: {
    type: [
      {
        title: { type: String, required: true },
        description: { type: String },
        time: {
          type: Date,
          required: true,
        },
        priority: { type: Number, required: true },
        isDone: Boolean,
      },
    ],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

export default model("Task", taskSchema);
