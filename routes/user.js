const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");

router.post("/user/signup", async (req, res) => {
  try {
    const { username, password, role, services } = req.body;
    console.log(req.body);
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      password: hashedPassword,
      role,
      services,
    });
    return res.status(201).json({ message: "User created", user: newUser });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ message: "Validation error", errors });
    } else if (error.code === 11000) {
      return res.status(400).json({ message: "Username already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/user/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  if (await bcrypt.compare(req.body.password, user.password)) {
    let jwtToken = jwt.sign(
      {
        id: user._id,
        username: user.username,
        password: user.password,
        role: user.role,
        services: user.services,
      },
      "Jwt_Authentication_is_Awesome"
    );
    return res
      .status(201)
      .json({ message: "Login Successfully", token: jwtToken, user: user });
  }
  return res.status(400).json({ message: "Incorrect password" });
});

// router.delete("/", async (req, res) => {
//   await User.deleteMany({}).then((result) => {
//     return res.status(200).json({ message: "All Users deleted" });
//   });
// });

router.post("/user/auth", (req, res) => {
  jwt.verify(
    req.body.token,
    "Jwt_Authentication_is_Awesome",
    (err, decoded) => {
      if (err) {
        return res.status(400).json({ authentication: false });
      } else {
        return res.status(200).json({ authentication: true });
      }
    }
  );
});

module.exports = router;
