import jwt from "jsonwebtoken";
import User, { IUser } from "../../Schema/User";

const JWT_SECRET = "apina";

export async function fetchUserByToken(
  token: string
): Promise<{ user: IUser | null; error: string }> {
  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return {
      error: "token error",
      user: null,
    };
  }
  const userId = decoded?.id;

  const user = (await User.findOne({ _id: userId })) as IUser;
  if (user) {
    return {
      user,
      error: "",
    };
  }

  return { user, error: "unexpected error" };
}
