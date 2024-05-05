import Driver, { IDriver } from "../Schema/drift/Driver";
import { Request } from "express";
import { isAdmin } from "../user/utils/isAdmin";

class DriverService {
  async createDriver(req: Request): Promise<IDriver | null> {
    const { firstName, lastName, birthday, raceNumber } = req.body;
    const cars = req.body?.cars || [];

    if (!(await isAdmin(req))) {
      return null;
    }

    const driver = new Driver({
      firstName,
      lastName,
      birthday,
      raceNumber,
      cars,
    });
    return await driver.save();
  }

  async findAll(_req: Request): Promise<IDriver[]> {
    // const isUserAdmin = await isAdmin(req);
    // if (!isUserAdmin) return [];
    return await Driver.find();
  }

  async findById(id: string): Promise<IDriver | null> {
    return await Driver.findById(id);
  }

  async findByIdList(idList: string[]): Promise<IDriver[]> {
    return await Driver.find({ _id: { $in: idList } });
  }

  async addCarToDriver(
    req: Request,
  ): Promise<{ success?: IDriver; error?: string }> {
    const { driverId, model, engine, torque, hp, activeFrom, activeTo } =
      req.body;
    const [isUserAdmin, driver] = await Promise.all([
      isAdmin(req),
      this.findById(driverId),
    ]);

    if (!isUserAdmin) {
      return { error: "Cannot edit driver" };
    }

    // if (!canAccess) return { error: 'Cannot edit fishin permit' }

    const car = {
      model,
      engine,
      torque,
      hp,
      activeFrom,
      activeTo,
    };

    driver?.cars.push(car);
    const updated = await driver?.save();
    return { success: updated };
  }
}

export default new DriverService();
