const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");

router.post("/api/signup", async (req, res) => {
  const user = {
    ...req.body,
    password: await bcrypt.hash(req.body.password, 10),
  };

  try {
    let newUser = await User.create(user);
    let jwtToken = jwt.sign(
      {
        id: newUser._id,
        username: newUser.username,
        password: newUser.password,
      },
      process.env.JWT_SECRET
    );
    return res.status(201).json({ message: "User created", token: jwtToken });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Username already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/api/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  if (await bcrypt.compare(req.body.password, user.password)) {
    let jwtToken = jwt.sign(
      { id: user._id, username: user.username, password: user.password },
      process.env.JWT_SECRET
    );
    return res
      .status(201)
      .json({ message: "Login Successfully", token: jwtToken, user: user });
  }
  return res.status(400).json({ message: "Incorrect password" });
});

router.delete("/", async (req, res) => {
  await User.deleteMany({}).then((result) => {
    return res.status(200).json({ message: "All Users deleted" });
  });
});

router.post("/api/auth", (req, res) => {
  jwt.verify(req.body.token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(400).json({ authentication: false });
    } else {
      return res.status(200).json({ authentication: true });
    }
  });
});

router.post("/api/changePassword", async (req, res) => {
  let { current_password, new_password, token } = req.body;
  let user = jwt.verify(token, process.env.JWT_SECRET);
  try {
    if (await bcrypt.compare(current_password, user.password)) {
      let hashedPassword = await bcrypt.hash(new_password, 10);
      await User.updateOne(
        { _id: user.id },
        { $set: { password: hashedPassword } }
      );
      return res
        .status(200)
        .json({ success: true, message: "Password changed successfully" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect password" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Server error", success: false });
  }
});

module.exports = router;
