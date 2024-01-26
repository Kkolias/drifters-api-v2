import mongoose, { Document, Schema } from "mongoose";
import { IDriver } from "./Driver";

export enum RunType {
  omt = "omt", // one more time
  byeRun = "byeRun",
  normal = "normal",
}

export enum JudgePoint {
  lead = "lead",
  chase = "chase",
  omt = "omt",
}

export interface IRunItem {
  type: RunType;
  runNumber: number;
  leadDriverId: string;
  chaseDriverId: string;
  judgePoint1: JudgePoint | null;
  judgePoint2: JudgePoint | null;
  judgePoint3: JudgePoint | null;
}

export interface IHeat extends Document {
  driver1: IDriver;
  driver2: IDriver;
  heatType: string; // esim top32 top16 karsinnat
  runList: IRunItem[];
}

export interface ICompetitionDayItem extends Document {
  eventId: string;
  heatList: IHeat[];
  createdAt: Date;
}

export interface ICompetitionDayComputed extends ICompetitionDayItem {
  winner: IDriver;
  second: IDriver;
}

const CompetitionDaySchema = new Schema<ICompetitionDayItem>({
  eventId: { type: String, required: true },
  createdAt: { type: Date, default: () => Date.now() },
  heatList: [
    {
      driver1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Driver",
        required: true,
      },
      driver2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Driver",
        required: true,
      },
      heatType: { type: String, default: "" },
      runList: [
        {
          type: { type: String, default: RunType.normal },
          runNumber: { type: Number, default: 0 },
          leadDriverId: { type: String, required: true },
          chaseDriverId: { type: String, required: true },
          judgePoint1: { type: String, default: null },
          judgePoint2: { type: String, default: null },
          judgePoint3: { type: String, default: null },
        },
      ],
    },
  ],
});

const CompetitionDay = mongoose.model<ICompetitionDayItem>(
  "CompetitionDay",
  CompetitionDaySchema
);

export default CompetitionDay;
