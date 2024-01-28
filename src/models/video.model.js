import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile: {
        typr: String,   //cloudinary url
        required: true
    },
    thumbnail: {
        typr: String,   //cloudinary url
        required: true
    },
    title: {
        typr: String,
        required: true
    },
    descripition: {
        typr: String,
        required: true
    },
    duration: {
        typr: Number,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
})

videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video", videoSchema)
