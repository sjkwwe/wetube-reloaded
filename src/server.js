
import "./init";
import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from 'connect-mongo';
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import {localsMiddleware} from "./middlewares";

const app = express();
const logger = morgan("dev");

app.set("views", process.cwd() + "/src/views");
app.set("view engine", "pug");
app.set("x-powered-by", false);
app.use(logger);
app.use(express.urlencoded({extended: true}));

app.use(session({
        secret: process.env.COOKIE_SECRET,
        resave: true,
        saveUninitialized: true,
        store: MongoStore.create({mongoUrl: process.env.DB_URL}),
    // cookie: {
    //         maxAge: 20000,
    // },
    })
);

// session에 값을 추가하는 것을 이해하기 위한 코드
// app.get("/add-one", (req, res, next) => {
//     req.session.potato += 1
//     return res.send(`${req.session.id}\n${req.session.potato}`)
// });

// app.use(session) 뒤에 나와야 undefined 오류가 발생하지 않는다 *** 순서 중요***
app.use(localsMiddleware);
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

export default app;
