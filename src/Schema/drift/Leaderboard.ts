import mongoose, { Schema, Document } from "mongoose";
import { IDriver } from "./Driver";

export enum DriftSerie {
  dmec = "dmec",
  fd = "fd",
}

export interface ScoreboardItem {
  driver: IDriver;
  score: number;
  numOfWins: number;
  numOfSeconds: number;
  numOfThirds: number;
}

export interface ILeaderboard extends Document {
  seasonId: string;
  scoreboard: ScoreboardItem[];
  createdAt: Date;
}

const LeaderboardSchema = new Schema<ILeaderboard>({
  seasonId: { type: String, required: true },
  createdAt: { type: Date, default: () => Date.now() },
  scoreboard: [
    {
      driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Driver",
        required: true,
      },
      score: { type: Number, default: 0 },
      numOfWins: { type: Number, default: 0 },
      numOfSeconds: { type: Number, default: 0 },
      numOfThirds: { type: Number, default: 0 },
    },
  ],
});

const Leaderboard = mongoose.model<ILeaderboard>(
  "Leaderboard",
  LeaderboardSchema,
);

export default Leaderboard;
