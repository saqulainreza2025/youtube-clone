import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema(
  {
    videoFile: {
      type: String, // URL of the uploaded video
      required: [true, "Video file URL is required"],
    },
    thumbnail: {
      type: String, // URL of the thumbnail
      required: [true, "Thumbnail URL is required"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    duration: {
      type: Number, // Could also be Number (seconds)
      required: [true, "Video duration is required"],
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

//Injecting Plugin
videoSchema.plugin(aggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
