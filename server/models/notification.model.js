const { Schema, model } = require("mongoose");

const notificationSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "unread",
    },
    user:{
        type:Object,
        required:true
    }
  },
  {
    timestamps: true,
  }
);

module.exports = model("Notification", notificationSchema);
