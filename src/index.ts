import express, { Request, Response } from "express";
import bodyParser from "body-parser";

import userRouter from './routes/user.routes'
import mongoose from "mongoose";

const app = express();
const port = 8000;

const cors = require("cors");

const allowedOrigins = ["http://localhost:8000", "100.112.240.70"];
const corsOptions = {
  origin: function (origin: string, callback: any) {
    if (!origin) {
      callback(null, true);
    } else if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

// USES
app.use(cors());
app.use(bodyParser.json());

//ROUTES
app.use('/user', userRouter)


// MONGODB SETUP
const mongoUrl = "mongodb://admin:password@localhost:27018/?authMechanism=DEFAULT"
// const mongoUrl = `mongodb://localhost:27017`; // dev
mongoose.connect(mongoUrl, { dbName: "drifters-db" });



app.get("/", cors(corsOptions), (req: Request, res: Response) => {
    res.send("Home page!");
  });
  
  
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });