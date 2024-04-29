import mongoose, { Document, Schema } from "mongoose";
import { IQualifyingSchemaItem } from "./Qualifying";
import { ICompetitionDayItem } from "./CompetitionDay";

// TODO: tästä computed outout versio missä laskettu voittajia yms statstiikkaa
export interface IDriftEventSchema extends Document {
  seasonId: string;
  country: string;
  city: string;
  track: string;
  name: string;
  startsAt: Date;
  endsAt: Date;
  qualifying: IQualifyingSchemaItem;
  competitionDay: ICompetitionDayItem;
  createdAt: Date;
}

const DriftEventSchema = new Schema<IDriftEventSchema>({
  createdAt: { type: Date, default: () => Date.now() },
  startsAt: { type: Date, default: null },
  endsAt: { type: Date, default: null },
  country: { type: String, required: true },
  city: { type: String, default: "" },
  track: { type: String, required: true },
  name: { type: String, required: true },
  seasonId: { type: String, required: true },
  qualifying: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Qualifying",
    default: null,
  },
  competitionDay: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CompetitionDay",
    default: null,
  },
});

const DriftEvent = mongoose.model<IDriftEventSchema>(
  "DriftEvent",
  DriftEventSchema,
);

export default DriftEvent;

