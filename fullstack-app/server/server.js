const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.static(__dirname));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connected"))
  .catch(err => console.log(err));
// User Model
const User = require("./models/User");

// Signup API
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  // ✅ Validation
  if (!email.includes("@")) {
    return res.send("Invalid email");
  }

  if (password.length < 6) {
    return res.send("Password must be at least 6 characters");
  }

  // ✅ Check existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.send("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    email,
    password: hashedPassword
  });

  await newUser.save();
  res.send("User Registered");
});

// Login API
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.send("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.send("Invalid password");

  res.send("Login successful");
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

