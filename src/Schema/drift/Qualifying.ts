import mongoose, { Document, Schema } from "mongoose";
import { IDriver } from "./Driver";
import { IDriftEventSchema } from "./DriftEvent";

export interface IQualifyingSchemaRun {
  line: number | null
  angle: number | null
  style: number | null
}

export interface IQualifyingResultItem extends Document {
  driver: IDriver
  orderNumber: number
  run1: IQualifyingSchemaRun | null
  run2: IQualifyingSchemaRun | null
}

export interface IQualifyingSchemaItem extends Document {
  eventId: string
  event?: IDriftEventSchema | null
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
      orderNumber: { type: Number, required: true },
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