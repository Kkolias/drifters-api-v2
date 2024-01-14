import mongoose, { Schema } from "mongoose";
import { IDriver } from "./Driver";

export interface IQualifyingSchemaRun {
    line: number | null
    angle: number | null
    style: number | null
}

export interface IQualifyingResultItem {
    driver: IDriver
    run1: IQualifyingSchemaRun
    run2: IQualifyingSchemaRun
}

export interface IQualifyingSchemaItem {
    eventId: string
    resultList: IQualifyingResultItem[]
    createdAt: Date
  }


const QualifyingSchema = new Schema<IQualifyingSchemaItem>({
    eventId: { type: String, required: true },
    createdAt: { type: Date, default: () => Date.now() },
    resultList: [
      {
        driver: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Driver",
          required: true
        },
        run1: { type: Object, default: null },
        run2: { type: Object, default: null },
      },
    ],
  });

  const Qualifying = mongoose.model<IQualifyingSchemaItem>(
    "Qualifying",
    QualifyingSchema
  );
  
  export default Qualifying;