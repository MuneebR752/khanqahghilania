const express = require("express");
const connectDB = require("./config/mongoDB");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const path = require("path");
const UserRouter = require("./routes/user");

app.use(morgan("dev"));
app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});
app.use(express.json());
dotenv.config({ path: ".env" });
connectDB();
app.use(
  express.static(path.join(__dirname, "public"), { extensions: ["html"] })
);
app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "index"));
});

app.post("/user/signup", UserRouter);
app.post("/user/login", UserRouter);
app.post("/user/auth", UserRouter);
app.delete("/", UserRouter);

app.listen(5000, () => console.log("Server started on port 5000"));
