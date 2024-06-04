import mongoose, { Document, Schema } from "mongoose";
import { IQualifyingSchemaItem } from "./Qualifying";
import { ICompetitionDayItem } from "./CompetitionDay";
import { IQualifyingShowdownItem } from "./QualifyingShowdown";

// TODO: tästä computed outout versio missä laskettu voittajia yms statstiikkaa
export interface IDriftEventSchema extends Document {
  seasonId: string;
  country: string;
  city: string;
  track: string;
  name: string;
  slug: string;
  startsAt: Date;
  endsAt: Date;
  qualifying: IQualifyingSchemaItem;
  qualifyingShowdown: IQualifyingShowdownItem;
  competitionDay: ICompetitionDayItem;
  createdAt: Date;
}

const DriftEventSchema = new Schema<IDriftEventSchema>({
  createdAt: { type: Date, default: () => Date.now() },
  startsAt: { type: Date, default: null },
  endsAt: { type: Date, default: null },
  country: { type: String, required: true },
  city: { type: String, default: "" },
  track: { type: String, default: "" },
  name: { type: String, required: true },
  slug: { type: String, default: "" }, // TODO: make unique
  seasonId: { type: String, required: true },
  qualifying: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Qualifying",
    default: null,
  },
  qualifyingShowdown: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QualifyingShowdown",
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

