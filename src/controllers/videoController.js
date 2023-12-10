import Video from "../models/Video";

export const home = async(req, res) => {
    const videos = await Video.find({}).sort({createdAt:"desc"});
    return res.render("home", { pageTitle: "Home", videos});
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.render("404", {pageTitle: "Video not found."});
  }
    return res.render("watch", { pageTitle: `${video.title}`, video });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", {pageTitle: "Video not found."});
  }
  return res.render("edit", { pageTitle: `Edit ${video.title}` , video})
};

export const postEdit = async(req, res) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  const video = await Video.exists({_id:id});
  if (!video) {
    return res.status(404).render("404", {pageTitle: "Video not found."});
  }
  await Video.findByIdAndUpdate(id, {
    title, description, hashtags: Video.formatHashtags(hashtags),
  });
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", {pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const { title, description, hashtags } = req.body;
  try{
    await Video.create(({
      title,
      description,
      // middleware 가 해시태그 처리를 해주고 있으므로  
      // .split(",").map((word) => word.startsWith("#") ? `#${word.replace(/#/g, "")}` : `#${word}`) 생략
      hashtags: Video.formatHashtags(hashtags),
      // Video.js 의 model 에서 default 처리를 해주었으므로 생략 
      /*createdAt: Date.now(),
      meta: {
        views: 0,
        rating: 0,
      },*/
    }));
    return res.redirect("/");
  } catch(error) {
    return res.status(400).render("upload", 
    {pageTitle: "Upload video", errorMessage: error._message});
  }

  /* Create 메서드를 사용하면 아래와 new 를 통해 객체를 생성할 필요가 없다.
  const video = new Video({
    title,
    description,
    hashtags: hashtags.split(",").map((word) => word.trim().startsWith("#") ? word.trim() : `#${word.trim()}`),
    createdAt: Date.now(),
    meta: {
      views: 0,
      rating: 0,
    },
  });
  await video.save();
  */
  
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
}

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {$regex: new RegExp(keyword, "i") },
      });
  }
  return res.render("search", { pageTitle : "Search", videos });
}