import { IUser, UserRoles } from "../../Schema/User";
import { parseToken } from "../../utils/parseToken";
import { fetchUserByToken } from "./fetchUserByToken";
import { Request } from "express";

export async function isAdmin(req: Request): Promise<boolean> {
  if (req.headers && req.headers.authorization) {
    const rawToken = req.headers.authorization;
    const token = parseToken(rawToken);

    const { user } = await fetchUserByToken(token);
    const role = user?.role;
    return role === UserRoles.admin;
  }
  return false;
}

export function isUserAdmin(user: IUser): boolean {
  const role = user?.role;
  return role === UserRoles.admin;
}
