import mongoose, { Schema, Document } from "mongoose";
import { DriftSerie, ILeaderboard } from "./Leaderboard";
import { IDriftEventSchema } from "./DriftEvent";
import { IDriver } from "./Driver";

// TODO: tästä computed outout versio missä laskettu voittajia yms statstiikkaa
export interface IDriftSeason extends Document {
  serie: DriftSerie;
  year: number;
  name: string
  slug: string
  driftEvents: IDriftEventSchema[];
  driversOfSeason: IDriver[];
  leaderboard: ILeaderboard;
  createdAt: Date;
}

const DriftSeasonSchema = new Schema<IDriftSeason>({
  serie: { type: String, required: true },
  year: { type: Number, required: true },
  name: { type: String, default: ''},
  slug: { type: String, default: ''}, // TODO: make unique
  createdAt: { type: Date, default: () => Date.now() },
  driftEvents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DriftEvent",
      default: null,
    },
  ],
  driversOfSeason: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },
  ],
  leaderboard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Leaderboard",
    default: null,
  },
});

const DriftSeason = mongoose.model<IDriftSeason>(
  "DriftSeason",
  DriftSeasonSchema,
);

export default DriftSeason;
