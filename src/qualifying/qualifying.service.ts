import { IDriver } from "../Schema/drift/Driver";
import Qualifying, {
  IQualifyingResultItem,
  IQualifyingSchemaItem,
  IQualifyingSchemaRun,
} from "../Schema/drift/Qualifying";
import driftEventService from "../drift-event/drift-event.service";
import driverService from "../driver/driver.service";
import { isAdmin } from "../user/utils/isAdmin";
import { Request } from "express";
import qualifyingCompute, {
  IQualifyingComputedItem,
} from "./computed/qualifying.compute";

class QualifyingService {
  async findAll(req: Request): Promise<IQualifyingSchemaItem[]> {
    const isUserAdmin = await isAdmin(req);
    if (!isUserAdmin) return [];
    return await Qualifying.find().lean().populate("resultList.driver");
  }

  async findAllComputed(req: Request): Promise<IQualifyingComputedItem[]> {
    const items = await this.findAll(req);
    return qualifyingCompute.getOutputQualifyingList(items);
  }

  async findById(id: string): Promise<IQualifyingComputedItem | null> {
    const qualifying = await Qualifying.findById(id).lean();
    let event = null
    if(qualifying) {
      event = await driftEventService.findById(qualifying?.eventId);
    }
    if (!qualifying) return null;
    return qualifyingCompute.getOutputQualifying({...qualifying, event});
  }

  async findByEventIdComputed(
    eventId: string
  ): Promise<IQualifyingComputedItem | null> {
    const qualifying = await Qualifying.findOne({ eventId }).lean().populate("resultList.driver");
    if (!qualifying) return null;
    return qualifyingCompute.getOutputQualifying(qualifying);
  }

  async createQualifying(eventId: string): Promise<IQualifyingSchemaItem> {
    const qualifying = await Qualifying.create({ eventId, resultList: [] });

    const driftEvent = await driftEventService.findById(eventId);

    if (!driftEvent || !qualifying) return qualifying;

    driftEvent.qualifying = qualifying;
    driftEvent.save();

    return qualifying;
  }

  async handleCreateQualifying(
    req: Request
  ): Promise<IQualifyingSchemaItem | null> {
    const { eventId } = req.body;

    if (!(await isAdmin(req))) {
      return null;
    }

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

  async createResultItemList(
    qualifyingId: string,
    driverList: { id: string; orderNumber: number }[]
  ): Promise<IQualifyingSchemaItem> {
    const driverIdList = driverList.map((driver) => driver.id);
    const drivers = (await driverService.findByIdList(
      driverIdList
    )) as unknown as IDriver[];

    const resultItemList = drivers.map((driver: IDriver) => {
      const orderNumber = this.findOrderNumberForDriver(driver, driverList);

      return {
        driver,
        orderNumber,
        run1: null,
        run2: null,
      };
    });

    // console.log(resultItemList);

    const qualifying = await Qualifying.findByIdAndUpdate(
      qualifyingId,
      { $push: { resultList: { $each: resultItemList } } },
      { new: true }
    );

    return qualifying as IQualifyingSchemaItem;
  }

  async deleteResultItemsFromListByDriverIds(
    qualifyingId: string,
    driverIdList: string[]
  ): Promise<IQualifyingSchemaItem | null> {
    const qualifying = await Qualifying.findByIdAndUpdate(
      qualifyingId,
      { $pull: { resultList: { driver: { $in: driverIdList } } } },
      { new: true }
    );

    return qualifying as IQualifyingSchemaItem;
  }

  async handleDeleteResultsByDriverIds(
    req: Request
  ): Promise<{ error: string; success: IQualifyingSchemaItem | null }> {
    const { qualifyingId, driverIdList } = req.body;

    if (!(await isAdmin(req))) {
      return { error: "not authorized", success: null };
    }

    const qualifying = await this.deleteResultItemsFromListByDriverIds(
      qualifyingId,
      driverIdList
    );
    if (!qualifying) return { error: "creating result failed", success: null };
    return { error: "", success: qualifying };
  }

  private findOrderNumberForDriver(
    driver: IDriver,
    driverIdOrderList: { id: string; orderNumber: number }[]
  ) {
    return driverIdOrderList?.find((driverOrderItem) => {
      return driverOrderItem.id === driver?._id?.toString();
    })?.orderNumber;
  }

  async handleCreateResultItem(
    req: Request
  ): Promise<{ error: string; success: IQualifyingSchemaItem | null }> {
    const { qualifyingId, driverId } = req.body;

    const qualifying = await this.createResultItem(qualifyingId, driverId);

    if (!qualifying) return { error: "creating result failed", success: null };
    return { error: "", success: qualifying };
  }

  async handleCreateResultItemList(
    req: Request
  ): Promise<{ error: string; success: IQualifyingSchemaItem | null }> {
    const { qualifyingId, driverList } = req.body;

    const qualifying = await this.createResultItemList(
      qualifyingId,
      driverList
    );

    if (!qualifying)
      return { error: "creating resultlist failed", success: null };
    return { error: "", success: qualifying };
  }

  // Method to add run1 and/or run2 to a specific QualifyingResultItem in the resultList of a Qualifying
  async addRunsToResultItem(
    qualifyingId: string,
    resultItemId: string,
    runs: Partial<IQualifyingResultItem>
  ): Promise<IQualifyingSchemaItem> {
    const qualifying = await Qualifying.findOneAndUpdate(
      { _id: qualifyingId, "resultList._id": resultItemId },
      {
        $set: {
          ...(runs.run1 !== undefined
            ? { "resultList.$.run1": runs.run1 }
            : {}),
          ...(runs.run2 !== undefined
            ? { "resultList.$.run2": runs.run2 }
            : {}),
        },
      },
      { new: true }
    );

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
