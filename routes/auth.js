const express = require("express");
const router = express.Router();
const registrationController = require("../controller/authAccounts")

router.post("/register", registrationController.register);
router.post("/login", registrationController.login);
router.get("/updateform/:email", registrationController.updateform);
router.post("/updateuser", registrationController.updateuser);
router.get("/delete/:account_id", registrationController.delete);
router.get("/logout", registrationController.logout);
router.get("/skillset/:account_id", registrationController.skillset);
router.get("/back", registrationController.back);


module.exports = router;