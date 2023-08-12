const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
require("dotenv").config();
const indexRouter = require("./routes/index");
const apiRouter = require("./routes/api");
const apiResponse = require("./helpers/apiResponse");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");


// DB connection
const MONGODB_URL = process.env.MONGODB_URL;
const mongoose = require("mongoose");
mongoose
    .connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        //don't show the log when it is test
        if (process.env.NODE_ENV !== "test") {
            console.log("Connected to mongodb");
        }
    })
    .catch((err) => {
        console.error("App starting error:", err.message);
        process.exit(1);
    });

const db = mongoose.connection;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});

app.use((req, res, next) => {
    req.io = io;
    next();
})

//don't show the log when it is test
if (process.env.NODE_ENV !== "test") {
    app.use(logger("dev"));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//To allow cross-origin requests
app.use(cors());

//Route Prefixes
app.use("/", indexRouter);
app.use("/api/v1/", apiRouter);

// throw 404 if URL not found
app.all("*", function (req, res) {
    return apiResponse.notFoundResponse(res, "Page not found");
});

app.use((err, req, res) => {
    return res.status(500).send({ error: err });
});


module.exports = app;
