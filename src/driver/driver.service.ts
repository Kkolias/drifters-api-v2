import Driver, { IDriver } from "../Schema/drift/Driver";
import { Request } from "express";
import { isAdmin } from "../user/utils/isAdmin";

class DriverService {
  async createDriver(req: Request): Promise<IDriver | null> {
    const { firstName, lastName, birthday, raceNumber, nationality } = req.body;
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
      nationality,
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

  async findByName(name: string): Promise<IDriver | null> {
    // name should be in format "firstname-lastname" or "many-firstnames-or-lastnames"
    try {
      // Split the name into first name and last name based on the last hyphen
      const nameParts = name.split("-");

      // Generate all possible combinations of first and last names
      const combinations = [];
      for (let i = 1; i < nameParts.length; i++) {
        const firstName = nameParts.slice(0, i).join(" ").replace(/-/g, " ");
        const lastName = nameParts.slice(i).join(" ").replace(/-/g, " ");

        combinations.push({
          firstName: new RegExp("^" + firstName + "$", "i"),
          lastName: new RegExp("^" + lastName + "$", "i"),
        });
      }

      // Query the database with the combinations using $or
      const driver = await Driver.findOne({
        $or: combinations,
      });

      return driver;
    } catch (error) {
      console.error("Error finding driver:", error);
      throw error;
    }
  }

  async findByIdList(idList: string[]): Promise<IDriver[]> {
    return await Driver.find({ _id: { $in: idList } });
  }

  async addCarToDriver(
    req: Request
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
