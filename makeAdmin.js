require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function makeAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected");

  const user = await User.findOneAndUpdate(
    { email: "sensational@gmail.com" },
    { isAdmin: true },
    { new: true }
  );

  if (user) {
    console.log(`Made admin: ${user.email}`);
  } else {
    console.log("User not found");
  }

  process.exit(0);
}

makeAdmin();
