import { IUser,  } from "../../Schema/User";
import { IFishingPermit } from "../../Schema/FishingPermit";
import { isUserAdmin } from "./isAdmin";

export function isAdminOrOwnsPermit(
  user: IUser | null,
  fishingPermit: IFishingPermit | null
): boolean {
  if (!user || !fishingPermit) return false;

  const userId = user?._id || null;
  if (!userId) return false;
  const userIdAsString = userId.toString()

  const isUsersPermit = userIdAsString === fishingPermit?.userId;
  const isAdmin = isUserAdmin(user as IUser);

  return isUsersPermit || isAdmin;
}
