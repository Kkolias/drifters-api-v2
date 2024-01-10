import User, { IUser, UserRoles } from "../Schema/User";
import { compareSync, hashSync } from "bcryptjs";
import jwt from "jsonwebtoken";
import { fetchUserByToken } from "./utils/fetchUserByToken";
import { Request } from "express";
import { parseToken } from "../utils/parseToken";
import { isAdmin } from "./utils/isAdmin";

const JWT_SECRET = "apina";

export class UserService {
  async signUp({
    email,
    password,
    firstName,
    lastName,
    role
  }: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRoles
  }): Promise<{ error: string; success: string }> {
    if (!email || !password || !firstName || !lastName) {
      return { error: "error creating user", success: "" };
    }

    const existingUser = await User.findOne({ email })
    if(existingUser) {
      return { error: "email in use", success: "" };
    }

    const userItem = new User({
      firstName,
      lastName,
      email,
      role,
      password: hashSync(password, 10),
    });

    const newUser = await userItem.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      JWT_SECRET
    );

    return { error: "", success: token };
  }

  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{ error: string; success: string }> {
    const user = await User.findOne({ email });
    console.log("TÄÄLÄ", user);

    if (!user) return { error: "no user found", success: "" };

    if (!compareSync(password, user.password as string)) {
      return { error: "wrong password", success: "" };
    }

    const id = user._id as string;
    const existingEmail = user.email as string;
    const token = jwt.sign({ id, email: existingEmail }, JWT_SECRET);

    return { error: "", success: token };
  }

  async updateRole(req: Request): Promise<{ user: IUser | null, error: string}> {
    const isUserAdmin = await isAdmin(req)
    if(!isUserAdmin) {
      return { user: null, error: 'no permission'}
    }

    const { role, id } = req.body

    const user = await User.findOne({ _id: id})
    console.log("USER", user)

    if(!user) return { user: null, error: 'no user found'}

    user.role = role

    const output = await user.save()
    return { user: output, error: ''}
  }

  async getUserByToken(req: Request): Promise<IUser | null> {
    if (req.headers && req.headers.authorization) {
      const rawToken = req.headers.authorization;
      const token = parseToken(rawToken) 

      const { user, error } = await fetchUserByToken(token);

      if(error) {
        return null
      }

      if (user) {
        return user;
      }
      return null;
    }
    return null
  }
}

export default new UserService();
