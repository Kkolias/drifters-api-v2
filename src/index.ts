import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

import userRouter from "./routes/user.routes";
import driverRouter from "./routes/driver.routes";
import leaderboardRouter from "./routes/leaderboard.routes";
import qualifyingRouter from "./routes/qualifying.routes";
import driftEventRouter from "./routes/drift-event.routes";
import driftSeasonRouter from "./routes/drift-season.routes";
import competitionDayRouter from "./routes/competition-day.routes";

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
app.use("/user", userRouter);
app.use("/driver", driverRouter);
app.use("/leaderboard", leaderboardRouter);
app.use("/qualifying", qualifyingRouter);
app.use("/drift-event", driftEventRouter);
app.use("/drift-season", driftSeasonRouter);
app.use("/competition-day", competitionDayRouter);

// MONGODB SETUP
const mongoUrl =
  "mongodb://admin:password@localhost:27018/?authMechanism=DEFAULT";
// const mongoUrl = `mongodb://localhost:27017`; // dev
mongoose.connect(mongoUrl, { dbName: "drifters-db" });

app.get("/", cors(corsOptions), (req: Request, res: Response) => {
  res.send("Home page!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
