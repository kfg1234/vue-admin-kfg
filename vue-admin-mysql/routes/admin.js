const express = require("express");
const router = express.Router();
const User = require("./modules/user");
const System = require("./modules/system");
const upload = require("./modules/upload");

router.use("/upload", upload); //处理用户信息接口模块
router.use("/user", User); //处理用户信息接口模块
router.use("/system", System); //处理系统设置接口模块

module.exports = router;
