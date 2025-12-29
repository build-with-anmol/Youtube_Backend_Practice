import mongoose, { Schema } from "mongoose"; 
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
 

const videoSchema = new Schema(
  {
    videoFile: {
      type: String, // We are using cloudinary to store the images
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      required: true,
      default: 0,
    },
    isPlubished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
); 

videoSchema.plugin(mongooseAggregatePaginate); // Using this we can paginate the data of the video

export const Video = mongoose.model("Video", videoSchema);
