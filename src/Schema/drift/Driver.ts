import mongoose, { Schema, Document } from "mongoose";

export interface ICar {
  model: string;
  engine: string;
  torque: number;
  hp: number;
  activeFrom: Date;
  activeTo: Date | null
}

export interface IDriver extends Document {
  firstName: string;
  lastName: string;
  age: number
  createdAt: Date;
  cars: ICar[]
}

const DriverShcema = new Schema<IDriver>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number, required: false },
  createdAt: { type: Date, default: () => Date.now() },
  cars: [
    {
      model: { type: String, required: true },
      engine: { type: String, required: true },
      torque: Number,
      hp: Number,
      activeFrom: { type: Date, default: null },
      activeTo: { type: Date, default: null }
    },
  ],
});

const Driver = mongoose.model<IDriver>(
  "Driver",
  DriverShcema
);

export default Driver;
