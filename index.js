const express = require("express");
const { default: mongoose } = require("mongoose");
const app = express();
const User = require("./models/user");
const bcrypt = require("bcrypt");
const session = require("express-session");

mongoose
  .connect("mongodb://localhost:27017/authDemo")
  .then(() => console.log("MONGO CONNECTION OPEN!"))
  .catch((error) => console.log("MONGO ERROR", error));

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "notagoodsecret" }));

// Login middleware
const requireLogin = (req, res, next) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  next();
};

// Home page
app.get("/", (req, res) => {
  res.send("THIS IS THE HOMEPAGE");
});

// Register page
app.get("/register", (req, res) => {
  res.render("register");
});
// Resgister page POST
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const user = new User({ username, password });
  await user.save();
  req.session.user_id = user._id;
  res.redirect("/");
});

// Login page
app.get("/login", (req, res) => {
  res.render("login");
});
// Login POST
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await User.findAndValidate(username, password);
  if (foundUser) {
    req.session.user_id = foundUser._id;
    res.redirect("/secret");
  } else {
    res.redirect("/login");
  }
});

// Logout POST
app.post("/logout", async (req, res) => {
  // req.session.user_id = null; this is the minimum you need. destroy() will make EVERY session property to null
  req.session.destroy();
  res.redirect("/login");
});

// Secret page
app.get("/secret", requireLogin, (req, res) => {
  res.render("secret");
});

// Top secret page
app.get("/topsecret", requireLogin, (req, res) => {
  res.send("TOP SECRET");
});

app.listen(3000, () => {
  console.log("Serving your app!");
});
