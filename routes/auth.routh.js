const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const controller = require("../controllers/auth.controller");

const router = express.Router();
router.use(bodyParser.json());
// router.use(express.urlencoded({ extended: true }));
// router.use(express.json());

router.use(cors({
  credentials: true,
  origin: process.env.UI_SERVER_ORIGIN,
}));

router.post("/signin", controller.verifyLogin);
router.post("/signout", controller.signOut);
router.post("/user", controller.getSigninStatus);

module.exports = router;
