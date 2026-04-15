const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connect
mongoose.connect("mongodb+srv://Bharathraj:raju123@cluster0.o9w6fi2.mongodb.net/test")
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
app.listen(5000, () => {
  console.log("Server running on port 5000");
});