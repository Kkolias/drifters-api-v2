import CompetitionDay, {
  HeatType,
  ICompetitionDayItem,
  IHeat,
  IRunItem,
  IRunPairItem,
  RunType,
} from "../../Schema/drift/CompetitionDay";
import { IDriver } from "../../Schema/drift/Driver";
import driftEventService from "../../drift-event/drift-event.service";
// import driverService from "../../driver/driver.service";
import { IQualifyingComputedResultItem } from "../../qualifying/computed/qualifying.compute";
import qualifyingService from "../../qualifying/qualifying.service";

// resultList will be type of IQualifyingComputedResultItem[] so it has highestPoints for each resultItem
// resultList will be sorted from highestPoints to lowestPoints

// they way heatList is created is that it will have first driver against last driver, second driver against second to last driver and so on
// there will not be odd number of drivers in resultList

export class CreateCompetitionDayFromQualifyingResults {
  async execute(eventId: string): Promise<ICompetitionDayItem> {
    const qualifying = await qualifyingService.findByEventIdCompted(eventId);

    const resultList = qualifying?.resultList || []; // this is sorted already
    // sort resultList by highestPoints

    // create competition day
    return await this.createCompetitionDay(eventId, resultList);
  }

  //   // find all drivers by id list
  //   private async getDriverList(idList: string[]): Promise<IDriver[]> {
  //     return await driverService.findByIdList(idList);
  //   }

  // basic methods
  private async createCompetitionDay(
    eventId: string,
    resultList: IQualifyingComputedResultItem[]
  ): Promise<ICompetitionDayItem> {
    const heatList = this.generateHeatList(resultList);
    const competitionDay = await CompetitionDay.create({
      eventId,
      heatList: heatList,
    });

    const driftEvent = await driftEventService.findById(eventId);

    if (!driftEvent || !competitionDay) return competitionDay;

    driftEvent.competitionDay = competitionDay;
    driftEvent.save();
    return competitionDay;
  }

  // bracketNumber for heat will be generated later as it makes no fucking sense how its calculated :)
  private generateHeatList(
    resultList: IQualifyingComputedResultItem[]
  ): IHeat[] {
    const heatList: IHeat[] = [];
    for (let i = 0; i < resultList.length / 2; i++) {
      const driver1 = resultList[i]?.driver;
      const driver2 = resultList[resultList.length - i - 1]?.driver;
      const heat = {
        driver1, // this is lead driver
        driver2, // this is chase driver
        heatType: HeatType.top32,
        bracketNumber: i + 1,
        runList: [this.generateFirstRun(driver1, driver2)],
      } as IHeat;
      heatList.push(heat);
    }
    return heatList;
  }

  // will be used in handleNewHeatOnJudging.ts
  generateFirstRun(driver1: IDriver | null, driver2: IDriver | null, type?: RunType, runNumber?: number): Partial<IRunPairItem> {
    return {
      runNumber: runNumber ?? 1,
      type: type || RunType.normal,
      run1: {
        leadDriverId: driver1?._id,
        chaseDriverId: driver2?._id,
      },
      run2: {
        leadDriverId: driver2?._id,
        chaseDriverId: driver1?._id,
      },
      judgePoint1: null,
      judgePoint2: null,
      judgePoint3: null,
    };
  }
}

export default new CreateCompetitionDayFromQualifyingResults();
