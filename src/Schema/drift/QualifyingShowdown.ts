import mongoose, { Document, Schema } from "mongoose";
import { IDriver } from "./Driver";
import { IDriftEventSchema } from "./DriftEvent";
import { JudgePoint, RunType } from "./CompetitionDay";

export enum ShowDownHeatType {
  Top2 = "Top2",
  Top4 = "Top4",
}

export interface IRunItem {
  leadDriverId: string;
  chaseDriverId: string;
}

export interface IRunPairItem {
  _id: string;
  type: RunType;
  runNumber: number;
  run1: IRunItem;
  run2: IRunItem;
  judgePoint1: JudgePoint | null;
  judgePoint2: JudgePoint | null;
  judgePoint3: JudgePoint | null;
}

export interface IShowdownHeat extends Document {
  driver1: IDriver | null;
  driver2: IDriver | null;
  heatType: ShowDownHeatType;
  bracketNumber: number; // 1 tai 2
  runList: IRunPairItem[];
}

export interface IQualifyingShowdownItem extends Document {
  eventId: string;
  event?: IDriftEventSchema | null;
  heatList: IShowdownHeat[];
  date: Date | null;
  createdAt: Date;
}

const QualifyingShowdownSchema = new Schema<IQualifyingShowdownItem>({
  eventId: { type: String, required: true },
  date: { type: Date, default: null },
  createdAt: { type: Date, default: () => Date.now() },
  heatList: [
    {
      driver1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Driver",
        default: null,
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

const QualifyingShowdown = mongoose.model<IQualifyingShowdownItem>(
  "QualifyingShowdown",
  QualifyingShowdownSchema,
);

export default QualifyingShowdown;
