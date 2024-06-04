import { IDriver } from "../../Schema/drift/Driver";
import { IQualifyingResultItem } from "../../Schema/drift/Qualifying";
import {
  IQualifyingShowdownItem,
  IShowdownHeat,
} from "../../Schema/drift/QualifyingShowdown";
import { IScoreBoardItem } from "../../competition-day/computed/competition-day.computed";
import { getHeatWinner } from "../../utils/drift/getHeatWinner";

export interface IComputedShowdownHeat extends IShowdownHeat {
  winner: IDriver | null;
}

export interface IQualifyingShowdownComputed extends IQualifyingShowdownItem {
  scoreBoard?: IScoreBoardItem[];
  heatList: IComputedShowdownHeat[];
}

export class QualifyingShowdownComputedUtil {
  getQualifyingShowdownWithWinners(
    qualifyingShowdown: IQualifyingShowdownItem
  ): IQualifyingShowdownComputed {
    const heatList = this.getHeatListWithWinners(qualifyingShowdown.heatList);
    return {
      ...qualifyingShowdown,
      heatList,
    } as IQualifyingShowdownComputed;
  }

  private getHeatListWithWinners(
    heatList: IShowdownHeat[]
  ): IComputedShowdownHeat[] {
    return heatList.map((heat) => {
      const winner = getHeatWinner(heat);
      return {
        ...heat,
        winner,
      };
    }) as IComputedShowdownHeat[];
  }

  public computeQualifyingShowdown(
    qualifyingShowdown: IQualifyingShowdownItem,
    qualifyingResultList: IQualifyingResultItem[]
  ): IQualifyingShowdownComputed {
    const qualifyingShowdownWithWinners =
      this.getQualifyingShowdownWithWinners(qualifyingShowdown);
    const scoreBoard = this.computeScoreBoard(
      qualifyingShowdownWithWinners.heatList,
      qualifyingResultList
    );
    return {
      ...qualifyingShowdownWithWinners,
      scoreBoard,
    } as IQualifyingShowdownComputed;
  }

  private computeScoreBoard(
    heatList: IComputedShowdownHeat[],
    qualifyingResultList: IQualifyingResultItem[]
  ): IScoreBoardItem[] {
    const top1Heat = this.getHeatByNumber(heatList, 1);
    const top2Heat = this.getHeatByNumber(heatList, 2);

    const { winner: top1Winner, loser: top1Loser } =
      this.getWinnerAndLoserOfHeat(top1Heat);
    const { winner: top2Winner, loser: top2Loser } =
      this.getWinnerAndLoserOfHeat(top2Heat);

    const [loserDriverTop3, loserDriverTop4] = this.getLosersInOrder(
      [top1Loser, top2Loser],
      qualifyingResultList
    );

    const scoreBoard = [
      {
        driver: top1Winner,
        placement: 1,
      },
      {
        driver: top2Winner,
        placement: 2,
      },
      {
        driver: loserDriverTop3,
        placement: 3,
      },
      {
        driver: loserDriverTop4,
        placement: 4,
      },
    ];

    return scoreBoard;
  }

  getLosersInOrder(
    losers: IDriver[],
    qualifyingResultList: IQualifyingResultItem[]
  ): IDriver[] {
    // higher in qualifying results is better
    return (
      losers?.sort((a, b) => {
        const aPlacement = qualifyingResultList?.findIndex(
          (result) => result?.driver?._id?.toString() === a?._id?.toString()
        );
        const bPlacement = qualifyingResultList?.findIndex(
          (result) => result?.driver?._id?.toString() === b?._id?.toString()
        );
        return aPlacement - bPlacement;
      }) || []
    );
  }

  private getWinnerAndLoserOfHeat(heat: IComputedShowdownHeat): {
    winner: IDriver;
    loser: IDriver;
  } {
    const driver1 = heat.driver1;
    const driver2 = heat.driver2;
    const winner = heat?.winner as IDriver;
    const loser = (driver1?._id === winner?._id ? driver2 : driver1) as IDriver;
    return { winner, loser };
  }

  private getHeatByNumber(
    heatList: IComputedShowdownHeat[],
    heatNumber: number
  ): IComputedShowdownHeat {
    return heatList?.find(
      (heat) => heat?.bracketNumber === heatNumber
    ) as IComputedShowdownHeat;
  }
}

export default new QualifyingShowdownComputedUtil();
