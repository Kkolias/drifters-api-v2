import mongoose, { Document, Schema } from "mongoose";
import { IQualifyingSchemaItem } from "./Qualifying";
import { ICompetitionDayItem } from "./CompetitionDay";

// TODO: tästä computed outout versio missä laskettu voittajia yms statstiikkaa
export interface IDriftEventSchema extends Document {
  seasonId: string;
  qualifying: IQualifyingSchemaItem;
  competitionDay: ICompetitionDayItem
  createdAt: Date;
}

const DriftEventSchema = new Schema<IDriftEventSchema>({
  createdAt: { type: Date, default: () => Date.now() },
  qualifying: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Qualifying",
    default: null
  },
  competitionDay: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CompetitionDay",
    default: null
  },
});

const DriftEvent = mongoose.model<IDriftEventSchema>(
  "DriftEvent",
  DriftEventSchema
);

export default DriftEvent;
