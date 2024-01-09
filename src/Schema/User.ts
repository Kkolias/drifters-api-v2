import mongoose, { Schema, Document } from "mongoose";

export enum UserRoles {
  admin = 'admin',
  noRole = 'noRole'
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRoles;
  password?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  role: { type: String, required: false, default: UserRoles.noRole },
  password: { type: String, required: true },
  createdAt: { type: Date, default: () => Date.now() },
});

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
