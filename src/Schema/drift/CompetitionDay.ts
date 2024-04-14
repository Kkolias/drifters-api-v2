import mongoose, { Document, Schema } from "mongoose";
import { IDriver } from "./Driver";

export enum RunType {
  omt = "omt", // one more time
  byeRun = "byeRun",
  normal = "normal",
}

export enum HeatType {
  top32 = "top32",
  top16 = "top16",
  top8 = "top8",
  top4 = "top4",
  final = "final",
  bronze = "bronze",
}

export enum JudgePoint {
  driver1 = "driver1",
  driver2 = "driver2",
  omt = "omt",
}

export interface IRunItem {
  leadDriverId: string;
  chaseDriverId: string;
}

export interface IRunPairItem {
  _id: string
  type: RunType;
  runNumber: number;
  run1: IRunItem;
  run2: IRunItem;
  judgePoint1: JudgePoint | null;
  judgePoint2: JudgePoint | null;
  judgePoint3: JudgePoint | null;
}

export interface IHeat extends Document {
  driver1: IDriver | null;
  driver2: IDriver | null;
  heatType: HeatType; // esim top32 top16 karsinnat
  bracketNumber: number; // vasen on 1-16 oikea 17-32 vasen 2 on 33-40 oikea 41-48 jne
  runList: IRunPairItem[];
}

export interface ICompetitionDayItem extends Document {
  eventId: string;
  heatList: IHeat[];
  createdAt: Date;
}

const CompetitionDaySchema = new Schema<ICompetitionDayItem>({
  eventId: { type: String, required: true },
  createdAt: { type: Date, default: () => Date.now() },
  heatList: [
    {
      driver1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Driver",
        default: null
      },
      driver2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Driver",
        default: null,
      },
      heatType: { type: String, default: "" },
      bracketNumber: { type: Number, default: 0 },
      runList: [
        {
          type: { type: String, default: RunType.normal },
          runNumber: { type: Number, default: 0 },
          // leadDriverId: { type: String, required: true },
          // chaseDriverId: { type: String, required: true },
          run1: {
            leadDriverId: { type: String, required: true },
            chaseDriverId: { type: String, required: true },
          },
          run2: {
            leadDriverId: { type: String, required: true },
            chaseDriverId: { type: String, required: true },
          },

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
