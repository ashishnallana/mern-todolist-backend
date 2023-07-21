const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const app = express();
dotenv.config();
const port = process.env.PORT || 3001;

// connecting to db
require("./db/connection");

// const allowedOrigins = [
//   "https://mern-todo-844aa.web.app",
//   "http://localhost:3000/",
// ];

// const corsOptions = {
//   origin: (origin, callback) => {
//     if (allowedOrigins.includes(origin) || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
// };

app.use(express.json());
// app.use(cors(corsOptions));
app.use(cookieParser());
// linking express router
app.use(require("./router/route"));

app.listen(port, () => {
  console.log(`server is up and running at the port ${port}.`);
});
