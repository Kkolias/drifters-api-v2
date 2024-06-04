import { IHeat, IRunPairItem } from "../../Schema/drift/CompetitionDay";
import { IDriver } from "../../Schema/drift/Driver";
import { IShowdownHeat } from "../../Schema/drift/QualifyingShowdown";


export function getHeatWinner(heat: IHeat | IShowdownHeat): IDriver | null {
    const runList = heat.runList;
    const driver1 = heat?.driver1;
    const driver2 = heat?.driver2;

    for (const run of runList) {
      if (!driver1 || !driver2) {
        return null;
      }
      const winner = getWinnerIdOfRun(run, driver1, driver2);

      if (winner) {
        return winner;
      } else {
        continue;
      }
    }

    return null; // No winner yet
  }

  function getWinnerIdOfRun(
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