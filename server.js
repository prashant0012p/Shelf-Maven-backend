const express = require("express");

const path = require("path");
const dotenv = require("dotenv");
const router = require(path.join(__dirname, "./router"));

const cors = require("cors");

const PORT = process.env.PORT;
dotenv.config({ path: "./config.env" });

const app = express();

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:4200"],
  })
);

app.use("/", router);

app.listen(PORT, () => {
  console.log(`server started at ${PORT}`);
});
