import { IDriver } from "../Schema/drift/Driver";
import Qualifying, {
  IQualifyingResultItem,
  IQualifyingSchemaItem,
  IQualifyingSchemaRun,
} from "../Schema/drift/Qualifying";
import driverService from "../driver/driver.service";
import { isAdmin } from "../user/utils/isAdmin";
import { Request } from "express";
import mongoose from "mongoose";

class QualifyingService {
  async createDriver(req: Request): Promise<IQualifyingSchemaItem | null> {
    const { eventId } = req.body;

    if (!(await isAdmin(req))) {
      return null;
    }

    const qualifying = new Qualifying({
      eventId,
    });
    return await qualifying.save();
  }

  async findAll(req: Request): Promise<IQualifyingSchemaItem[]> {
    const isUserAdmin = await isAdmin(req);
    if (!isUserAdmin) return [];
    return await Qualifying.find();
  }

  async findById(id: string): Promise<IQualifyingSchemaItem | null> {
    return await Qualifying.findById(id);
  }

  async createQualifying(eventId: string): Promise<IQualifyingSchemaItem> {
    const qualifying = await Qualifying.create({ eventId, resultList: [] });
    return qualifying;
  }

  async handleCreateQualifying(req: Request): Promise<IQualifyingSchemaItem> {
    const { eventId } = req.body;

    return await this.createQualifying(eventId);
  }

  // Method to create a new QualifyingResultItem and add it to the resultList of a Qualifying
  async createResultItem(
    qualifyingId: string,
    driverId: string
  ): Promise<IQualifyingSchemaItem> {
    console.log("ADADADASDA");
    const driver = (await driverService.findById(
      driverId
    )) as unknown as IDriver;
    const resultItem = {
      driver,
      run1: null,
      run2: null,
    };
    console.log({ resultItem });

    const qualifying = await Qualifying.findByIdAndUpdate(
      qualifyingId,
      { $push: { resultList: resultItem } },
      { new: true }
    );

    return qualifying as IQualifyingSchemaItem;
  }

  async handleCreateResultItem(
    req: Request
  ): Promise<{ error: string; success: IQualifyingSchemaItem | null }> {
    const { qualifyingId, driverId } = req.body;

    const qualifying = await this.createResultItem(qualifyingId, driverId);

    if (!qualifying) return { error: "creating result failed", success: null };
    return { error: "", success: qualifying };
  }

  // Method to add run1 and/or run2 to a specific QualifyingResultItem in the resultList of a Qualifying
  async addRunsToResultItem(
    qualifyingId: string,
    resultItemId: string,
    runs: Partial<IQualifyingResultItem>
  ): Promise<IQualifyingSchemaItem> {
    console.log("HALOOO");

    const testi = await Qualifying.findOne({
      _id: qualifyingId,
      "resultList._id": resultItemId,
    });
    console.log({testi})
    const qualifying = await Qualifying.findOneAndUpdate(
      { _id: qualifyingId, "resultList._id": resultItemId },
      {
        $set: {
            ...(runs.run1 !== undefined ? { "resultList.$.run1": runs.run1 } : {}),
            ...(runs.run2 !== undefined ? { "resultList.$.run2": runs.run2 } : {}),
          },
      },
      { new: true }
    );
    console.log({ qualifying });

    return qualifying as IQualifyingSchemaItem;
  }

  async handleAddRunsToResultItem(
    req: Request
  ): Promise<{ error: string; success: IQualifyingSchemaItem | null }> {
    const { qualifyingId, resultItemId, runs } = req.body;

    const qualifying = await this.addRunsToResultItem(
      qualifyingId,
      resultItemId,
      runs
    );

    if (!qualifying) return { error: "creating result failed", success: null };
    return { error: "", success: qualifying };
  }
}

export default new QualifyingService();
