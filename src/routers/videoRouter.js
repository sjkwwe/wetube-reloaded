import express from "express";
import {
  watch,
  deleteVideo,
  getUpload,
  getEdit,
  postEdit,
  postUpload,
} from "../controllers/videoController";

const videoRouter = express.Router();

// 코드가 위에서 부터 실행되며,
// /upload 를 :id 의 변수로 볼 수도 있기 때문에 파라미터 라우터 상단에 위치
videoRouter.route("/upload").get(getUpload).post(postUpload);
// videoRouter.get("/:id(\\d+)/edit", getEdit);
// videoRouter.post("/:id(\\d+)/edit", postEdit);
videoRouter.get("/:id([0-9a-f]{24})", watch);

videoRouter.route("/:id([0-9a-f]{24})/edit").get(getEdit).post(postEdit);
videoRouter.route("/:id([0-9a-f]{24})/delete").get(deleteVideo);


export default videoRouter;
