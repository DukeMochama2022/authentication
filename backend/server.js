const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/mongodb");
const { router } = require("./routes/authRoutes");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true }));

PORT = process.env.PORT || 4000;
connectDB();

//API endpoints
app.get("/", (req, res) => {
  res.send("Api working.");
});

app.use('/api/auth',router)

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
