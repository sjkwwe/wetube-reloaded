import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title: { type: String, trim: true, required: true, maxLength: 80},
    description: { type: String, trim: true, minLength: 20},
   createdAt: { type: Date, required: true, default: Date.now },
    hashtags: [{ type: String, trim: true }],
    meta: {
        views: {type: Number, default: 0, required: true},
        rating: {type: Number, default: 0, required: true},
    },
});

videoSchema.static("formatHashtags", function (hashtags) {
    return hashtags.split(",")
    .map((word) => word.startsWith("#") ? `#${word.replace(/#/g, "")}` : `#${word}`);
});

// "video" 부분은 MongoDB의 모델의 컬렉션의 이름이 된다.
// Mongoose는 자동으로 모델을 찾고, 해당 모델의 이름을 따서 소문자+뒤에 s(복수형)을 붙여 컬렉션을 생성한다.

// videoSchema.pre("save", async function() {
//     console.log(this);
//     this.hashtags = this.hashtags[0]
//     .split(",")
//     .map((word) => word.startsWith("#") ? `#${word.replace(/#/g, "")}` : `#${word}`)
// });

const Video = mongoose.model("video", videoSchema);
export default Video;