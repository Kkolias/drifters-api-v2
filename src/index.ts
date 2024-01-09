import express, { Request, Response } from "express";
import bodyParser from "body-parser";

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




app.get("/", cors(corsOptions), (req: Request, res: Response) => {
    res.send("Home page!");
  });
  
  
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });