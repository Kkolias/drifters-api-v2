import { Request, Response } from "express";
import userService from "./user.service";

export class UserController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const { error, success } = await userService.login({ email, password });

      if (error?.length) {
        res.status(500).json({ success, error });
      } else {
        res.status(201).json({ success, error });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to login" });
    }
  }

  async signUp(req: Request, res: Response) {
    try {
      const { firstName, lastName, email, password } = req.body;
      const role = req.body?.role;

      const createdUser = await userService.signUp({
        email,
        password,
        firstName,
        lastName,
        role,
      });

      res.status(201).json(createdUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create user" });
    }
  }

  async getUserByToken(req: Request, res: Response) {
    try {
      const user = await userService.getUserByToken(req);

      if (!user) {
        res.status(500).json(user);
      } else {
        res.status(201).json(user);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to login" });
    }
  }

  async updateRole(req: Request, res: Response) {
    try {
      const output = await userService.updateRole(req);

      if (output?.error?.length) {
        res.status(500).json(output);
      } else {
        res.status(201).json(output);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update" });
    }
  }
}

export default new UserController();
