import mongoose, { Schema, Document } from "mongoose";

export enum DriftSerie {
  dmec = "dmec",
}

export interface ScoreboardItem {
  driverId: string;
  score: number;
  numOfWins: number;
  numOfSeconds: number;
  numOfThirds: number;
}

export interface ILeaderboard extends Document {
  serie: DriftSerie;
  year: number;
  scoreboard: ScoreboardItem[];
  createdAt: Date;
}

const LeaderboardSchema = new Schema<ILeaderboard>({
  serie: { type: String, required: true },
  year: { type: Number, required: true },
  createdAt: { type: Date, default: () => Date.now() },
  scoreboard: [
    {
      driverId: { type: String, required: true },
      score: { type: Number, default: 0 },
      numOfWins: { type: Number, default: 0 },
      numOfSeconds: { type: Number, default: 0 },
      numOfThirds: { type: Number, default: 0 },
    },
  ],
});

const Leaderboard = mongoose.model<ILeaderboard>(
  "Leaderboard",
  LeaderboardSchema
);

export default Leaderboard;
