require("express-async-errors");   // MUST be first
require("dotenv").config({ path: "./.env" });

const express = require("express");
const cors = require("cors");
const app = express();

const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

const connectDB = require("./db/connect");

const authRouter = require("./routes/auth");

const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");


app.use(cors());
app.use(express.json());


app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

app.use(helmet());
app.use(xss());

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    msg: "API working",
  });
});

// Routes
app.use("/api/v1/auth", authRouter);

// Error Middlewares
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(` Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
