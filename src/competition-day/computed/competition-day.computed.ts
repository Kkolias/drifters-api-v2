import {
  HeatType,
  ICompetitionDayItem,
  IHeat,
  IRunItem,
  IRunPairItem,
} from "../../Schema/drift/CompetitionDay";
import { IDriver } from "../../Schema/drift/Driver";

export interface IComputedHeat extends IHeat {
  winner: IDriver | null;
}

export interface IScoreBoardItem {
  driver: IDriver | null;
  // points: number; // TODO
  placement: number;
}

export interface ICompetitionDayComputed extends ICompetitionDayItem {
  scoreBoard?: IScoreBoardItem[];
  heatList: IComputedHeat[];
}

export class CompetitionDayComputedUtil {
  getCompetitionDayWithWinners(
    competitionDay: ICompetitionDayItem,
  ): ICompetitionDayComputed {
    const heatList = this.getHeatListWithWinners(competitionDay.heatList);
    return {
      ...competitionDay,
      heatList,
    } as ICompetitionDayComputed;
  }

  private getHeatListWithWinners(heatList: IHeat[]): IComputedHeat[] {
    return heatList.map((heat) => {
      const winner = this.computeHeatWinnerId(heat);
      return {
        ...heat,
        winner,
      };
    }) as IComputedHeat[];
  }

  // used in handleNewHeatOnJudging.ts
  computeHeatWinnerId(heat: IHeat): IDriver | null {
    const runList = heat.runList;
    const driver1 = heat?.driver1;
    const driver2 = heat?.driver2;

    for (const run of runList) {
      if (!driver1 || !driver2) {
        return null;
      }
      const winner = this.getWinnerIdOfRun(run, driver1, driver2);

      if (winner) {
        return winner;
      } else {
        continue;
      }
    }

    return null; // No winner yet
  }

  private getWinnerIdOfRun(
    run: IRunPairItem,
    driver1: IDriver,
    driver2: IDriver,
  ): IDriver | null {
    const driver1Count = [
      run.judgePoint1,
      run.judgePoint2,
      run.judgePoint3,
    ].filter((point) => point === "driver1").length;
    const driver2Count = [
      run.judgePoint1,
      run.judgePoint2,
      run.judgePoint3,
    ].filter((point) => point === "driver2").length;
    const omtCount = [run.judgePoint1, run.judgePoint2, run.judgePoint3].filter(
      (point) => point === "omt",
    ).length;

    if (driver1Count >= 2) {
      return driver1;
    }
    if (driver2Count >= 2) {
      return driver2;
    }
    if (omtCount === 2 || omtCount === 3) {
      return null;
    }
    return null; // No winner yet
  }

  public computeCompetitionDay(
    competitionDay: ICompetitionDayItem,
  ): ICompetitionDayComputed {
    const competitionDayWithHeatWinners =
      this.getCompetitionDayWithWinners(competitionDay);
    const scoreBoard = this.computeScoreBoard(
      competitionDayWithHeatWinners.heatList,
    );
    return {
      ...competitionDayWithHeatWinners,
      scoreBoard,
    } as ICompetitionDayComputed;
  }

  private computeScoreBoard(heatList: IComputedHeat[]): IScoreBoardItem[] {
    // first of scoreboard is winner of heat with heatType "final" and driver that did not win that heat is second.
    // third is winner of heat with heatType "thirdPlace" and driver that did not win that heat is fourth.
    // fifth to eight is losers of heats with heatType "top8"
    // ninth to sixteenth is losers of heats with heatType "top16"
    // seventeenth to thirty-second is losers of heats with heatType "top32"
    // heatList might have heats with winner as null. This means that heat has not been driven yet.
    // if no winner in heat driver in scoreboard can be null

    const scoreBoard: IScoreBoardItem[] = [];
    const finalHeat = heatList.find((heat) => heat.heatType === HeatType.final);
    const thirdPlaceHeat = heatList.find(
      (heat) => heat.heatType === HeatType.bronze,
    );
    const top8HeatList = heatList.filter(
      (heat) => heat.heatType === HeatType.top8,
    );
    const top16HeatList = heatList.filter(
      (heat) => heat.heatType === HeatType.top16,
    );
    const top32HeatList = heatList.filter(
      (heat) => heat.heatType === HeatType.top32,
    );

    const finalHeatWinner = finalHeat?.winner;
    const finalHeatLoser =
      finalHeat?.driver1?._id.toString() === finalHeatWinner?._id.toString()
        ? finalHeat?.driver2
        : finalHeat?.driver1;

    const thirdPlaceHeatWinner = thirdPlaceHeat?.winner;
    const thirdPlaceHeatLoser =
      thirdPlaceHeat?.driver1?._id.toString() ===
      thirdPlaceHeatWinner?._id.toString()
        ? thirdPlaceHeat?.driver2
        : thirdPlaceHeat?.driver1;

    const top8HeatLosers = top8HeatList.map((heat) => {
      return heat.driver1?._id.toString() === heat.winner?._id.toString()
        ? heat.driver2
        : heat.driver1;
    });

    const top16HeatLosers = top16HeatList.map((heat) => {
      return heat.driver1?._id.toString() === heat.winner?._id.toString()
        ? heat.driver2
        : heat.driver1;
    });

    const top32HeatLosers = top32HeatList.map((heat) => {
      return heat.driver1?._id.toString() === heat.winner?._id.toString()
        ? heat.driver2
        : heat.driver1;
    });

    if (finalHeatWinner) {
      scoreBoard.push({ driver: finalHeatWinner, placement: 1 });
    }
    if (finalHeatLoser) {
      scoreBoard.push({ driver: finalHeatLoser, placement: 2 });
    }
    if (thirdPlaceHeatWinner) {
      scoreBoard.push({ driver: thirdPlaceHeatWinner, placement: 3 });
    }
    if (thirdPlaceHeatLoser) {
      scoreBoard.push({ driver: thirdPlaceHeatLoser, placement: 4 });
    }
    if (top8HeatLosers) {
      top8HeatLosers.forEach((driver, index) => {
        scoreBoard.push({ driver, placement: 5 + index });
      });
    }
    if (top16HeatLosers) {
      top16HeatLosers.forEach((driver, index) => {
        scoreBoard.push({ driver, placement: 9 + index });
      });
    }
    if (top32HeatLosers) {
      top32HeatLosers.forEach((driver, index) => {
        scoreBoard.push({ driver, placement: 17 + index });
      });
    }
    return scoreBoard;
  }
}

export default new CompetitionDayComputedUtil();
