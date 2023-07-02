const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
const serviceAccount = require("./data/service-account.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(cors());
app.use(express.json());
app.use(
  express.static(path.join(__dirname, "public"), { extensions: ["html"] })
);

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const db = admin.firestore();
const usersCollection = db.collection("users");

app.post("/user/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      city,
      country,
      gender,
      username,
      password,
      role,
      services,
      expiry_date,
    } = req.body.user;

    const existingUserSnapshot = await usersCollection
      .where("username", "==", username)
      .get();
    if (!existingUserSnapshot.empty) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const newUser = {
      name,
      email,
      phone,
      city,
      country,
      gender,
      username,
      password,
      role,
      services,
      expiry_date,
    };

    await usersCollection.add(newUser);

    return res.status(201).json({ message: "User created", user: newUser });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/user/login", async (req, res) => {
  const { username, password } = req.body;
  const userSnapshot = await usersCollection
    .where("username", "==", username)
    .where("password", "==", password)
    .get();
  if (userSnapshot.empty) {
    return res.status(400).json({ message: "Invalid username or password" });
  }
  const user = userSnapshot.docs[0].data();
  const jwtToken = jwt.sign(
    {
      username: user.username,
      role: user.role,
      services: user.services,
    },
    "Jwt_Authentication_is_Awesome"
  );
  return res
    .status(201)
    .json({ message: "Login Successfully", token: jwtToken, user: user });
});

app.post("/user/auth", (req, res) => {
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

app.listen(5000, () => console.log("Server started on port 5000"));
