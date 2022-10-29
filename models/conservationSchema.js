import mongoose from "mongoose";

const conservationSchema = new mongoose.Schema(
  {
    Chatname: {
      type: String,
      trim: true,
      maxLength: [20, "Chat name is upto 20 char long"],
    },
    participant: {
      type: Array,
      required: true,
      trim: true,
    },
    messages: [
      {
        id: String,
        from: String,
        message: String,
        time: String,
        date: String,
        status: String,
      },
    ],
    unReadMsgs: {},
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("conservations", conservationSchema);
