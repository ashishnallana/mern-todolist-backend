const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const app = express();
dotenv.config();
const port = process.env.PORT || 3001;

// connecting to db
require("./db/connection");

app.use(express.json());
app.use(cookieParser());
// linking express router
app.use(require("./router/route"));

// heroku
// if (process.env.NODE_ENV == "production") {
//   app.use(express.static("client/build"));
// }

app.listen(port, () => {
  console.log(`server is up and running at the port ${port}.`);
});
