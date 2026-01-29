require("express-async-errors");   
require("dotenv").config({ path: "./.env" });

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'JWT_LIFETIME', 'PORT'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

const express = require("express");
const cors = require("cors");
const app = express();

const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

const connectDB = require("./db/connect");

const authRouter = require('./routes/auth');
const productsRouter = require('./routes/products');
const orderRouter = require('./routes/order')
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const cartRouter = require('./routes/cart');
const categoryRoutes = require('./routes/category')
const totalSales = require('./routes/totalSales')
const totalRevenue = require('./routes/totalRevenue')
const date = require('./routes/date')
const dailySales = require('./routes/dailySales')
const weeklyRevenue = require('./routes/weeklyRevenue')
app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/products", productsRouter)
app.use("/api/v1/cart", cartRouter)
app.use("/api/v1/order", orderRouter)
app.use("/api/v1", categoryRoutes )
app.use("/api/v1", totalSales )
app.use("/api/v1", totalRevenue)
app.use("/api/v1", date)
app.use("/api/v1", dailySales)
app.use('/api/v1', weeklyRevenue)
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

app.use(helmet());
app.use(xss());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    msg: "API working",
  });
});

const auth = require('./middleware/authentication');

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