const express = require("express");
const cookieParser = require("cookie-parser");
// const https = require("https");
// const fs = require("fs");

const apiServer = require("./controllers/api.controller");
require("dotenv").config();
const loginRouter = require("./routes/auth.routh");

const app = express();

// Enable Cookie for Api (We can use a secret too)
app.use(cookieParser());

// Authentication Routes
app.use("/auth", loginRouter);

// When it is true other site can use api
// const enableCORS = (process.env.CORS || "false") === "true";
// console.log(process.env.CORS);

// cors:true allow other site to use API which is default behaviour in case of UnAuthenticated APIs
apiServer.applyMiddleware({
  app,
  path: "/_api",
  cors: {
    origin: process.env.UI_SERVER_ORIGIN, credentials: true, methods: "POST",
  },
});

app.set("port", process.env.PORT || 3000);
app.listen(app.get("port"), () => {
  console.log(`API server started at http://localhost:${app.get("port")}/`);
});

// const key = fs.readFileSync("./key.pem");
// const cert = fs.readFileSync("./cert.pem");
// https.createServer({ key, cert }, app).listen(3001);
