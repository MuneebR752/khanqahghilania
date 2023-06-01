const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");

router.post("/admin/signup", async (req, res) => {
  const admin = {
    ...req.body,
    password: await bcrypt.hash(req.body.password, 10),
  };

  try {
    let newAdmin = await Admin.create(admin);
    return res.status(201).json({ message: "Admin created" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Username already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/admin/login", async (req, res) => {
  const admin = await Admin.findOne({ username: req.body.username });
  if (!admin) {
    return res.status(400).json({ message: "User not found" });
  }
  if (await bcrypt.compare(req.body.password, admin.password)) {
    let jwtToken = jwt.sign(
      { id: admin._id, username: admin.username, password: admin.password },
      process.env.JWT_SECRET
    );
    return res
      .status(201)
      .json({ message: "Login Successfully", token: jwtToken });
  }
  return res.status(400).json({ message: "Incorrect password" });
});

// router.delete("/", async (req, res) => {
//   await User.deleteMany({}).then((result) => {
//     return res.status(200).json({ message: "All Users deleted" });
//   });
// });

router.post("/admin/auth", (req, res) => {
  jwt.verify(req.body.token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(400).json({ authentication: false });
    } else {
      return res.status(200).json({ authentication: true });
    }
  });
});

module.exports = router;
