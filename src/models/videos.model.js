import mongoose , {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema({
    videoFile: {
        type: String, //cloudnary url service will be used to store as image for free   
        required: true,
    },
    thumnail: {
        type: String, //cloudnary url service will be used to store as image for free   
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
        type: Number, //cloudnary 
        required: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    published: {
        type: Boolean,
        default: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
},{timestamps: true});

videoSchema.plugin(mongooseAggregatePaginate); //for mongoose aggregation pipelines


export const Video = mongoose.model("Video" , videoSchema);