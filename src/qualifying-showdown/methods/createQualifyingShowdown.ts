import { IQualifyingResultItem } from "../../Schema/drift/Qualifying";
import QualifyingShowdown, {
  IQualifyingShowdownItem,
  IShowdownHeat,
  ShowDownHeatType,
} from "../../Schema/drift/QualifyingShowdown";
import qualifyingService from "../../qualifying/qualifying.service";
import competitionDayUtil from "../../competition-day/utils/createCompetitionDayFromQualifyingResults";
import driftEventService from "../../drift-event/drift-event.service";
import { sortQualifyingResults } from "../../utils/drift/sortQualifyingResults";

/*
Tää on vitun epäselvää paskaa dmeciltä taas mutta:
top 4 lajittelusta pääsee qualifyingShowdowniin
top 1 ja top 4 ajaa vastakkain
top 2 ja top 3 ajaa vastakkain
näistä ensimmäisen voittaja eli joko top 1 tai 4 saa 4 pistettä
toisen voittaja eli joko top 2 tai 3 saa 3 pistettä
tämän jälkeen häviäjistä paremmalla sijalla qualifyingissa ollut saa 2 pistettä
ja huonommalla sijalla ollut saa 1 pisteen

aivan naurettavan paska idea ja logiikka :D:DD::D 
*/

export class CreateQualifyingShowdownUtil {
  async execute(eventId: string): Promise<IQualifyingShowdownItem> {
    const qualifyingResults = await this.getQualifyingResults(eventId);
    const driftEvent = await driftEventService.findById(eventId);

    const top4Heat = this.generateTop4Heat(qualifyingResults);
    const top2Heat = this.generateTop2Heat(qualifyingResults);

    const heatList = [top2Heat, top4Heat];

    const qualifyingShowdown = {
      eventId,
      event: driftEvent,
      heatList,
    };

    const created = await QualifyingShowdown.create(qualifyingShowdown);

    if (!driftEvent || !created) return created;

    driftEvent.qualifyingShowdown = created;
    driftEvent.save();
    return created;
  }

  private generateTop2Heat(resultList: IQualifyingResultItem[]): IShowdownHeat {
    const driver1 = this.getNthDriverFromResultList(resultList, 0); // 1
    const driver2 = this.getNthDriverFromResultList(resultList, 3); // 3
    const heat = {
      driver1, // this is lead driver
      driver2, // this is chase driver
      heatType: ShowDownHeatType.Top2,
      bracketNumber: 1,
      runList: [competitionDayUtil.generateFirstRun(driver1, driver2)],
    } as IShowdownHeat;
    return heat;
  }

  private generateTop4Heat(resultList: IQualifyingResultItem[]): IShowdownHeat {
    const driver1 = this.getNthDriverFromResultList(resultList, 1); // 2
    const driver2 = this.getNthDriverFromResultList(resultList, 2); // 3
    const heat = {
      driver1, // this is lead driver
      driver2, // this is chase driver
      heatType: ShowDownHeatType.Top4,
      bracketNumber: 2,
      runList: [competitionDayUtil.generateFirstRun(driver1, driver2)],
    } as IShowdownHeat;
    return heat;
  }

  private getNthDriverFromResultList(
    resultList: IQualifyingResultItem[],
    n: number
  ) {
    return resultList[n]?.driver;
  }

  private async getQualifyingResults(
    eventId: string
  ): Promise<IQualifyingResultItem[]> {
    const qualifying = await qualifyingService.findByEventIdComputed(eventId);

    return qualifying?.resultList || []; // this is sorted already
  }
}

export default new CreateQualifyingShowdownUtil();
