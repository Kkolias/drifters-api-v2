import {
  IQualifyingResultItem,
  IQualifyingSchemaItem,
  IQualifyingSchemaRun,
} from "../../Schema/drift/Qualifying";

export interface IQualifyingComputedResultItem extends IQualifyingResultItem {
  run1Points: number;
  run2Points: number;
  highestPoints: number;
}

export interface IQualifyingComputedItem extends IQualifyingSchemaItem {
  resultList: IQualifyingComputedResultItem[];
}

export class QualifyingComputedUtil {
  getOutputQualifyingList(
    qualifyingList: IQualifyingSchemaItem[]
  ): IQualifyingComputedItem[] {
    return qualifyingList.map((qualifyingItem) => {
      return this.getOutputQualifying(qualifyingItem);
    }) as IQualifyingComputedItem[];
  }

  getOutputQualifying(
    qualifyingItem: IQualifyingSchemaItem
  ): IQualifyingComputedItem {
    const qualifyingWithComputedFields =
      this.qualifyingWithComputedFields(qualifyingItem);
    return this.getQualifyingWitOrderedResultList(qualifyingWithComputedFields);
  }

  qualifyingListWithComputedFields(
    qualifyingList: IQualifyingSchemaItem[]
  ): IQualifyingComputedItem[] {
    return qualifyingList.map((qualifyingItem) => {
      return this.qualifyingWithComputedFields(qualifyingItem);
    }) as IQualifyingComputedItem[];
  }

  qualifyingWithComputedFields(
    qualifyingItem: IQualifyingSchemaItem
  ): IQualifyingComputedItem {
    const resultList = this.computeResultList(qualifyingItem.resultList);
    return {
      ...qualifyingItem,
      resultList,
    } as IQualifyingComputedItem;
  }

  private computeResultList(
    resultList: IQualifyingResultItem[]
  ): IQualifyingComputedResultItem[] {
    return resultList.map((resultItem) => {
      const run1Points = this.computeRunPoints(resultItem.run1);
      const run2Points = this.computeRunPoints(resultItem.run2);
      const highestPoints = run1Points > run2Points ? run1Points : run2Points;
      return {
        ...resultItem,
        run1Points,
        run2Points,
        highestPoints,
      };
    }) as IQualifyingComputedResultItem[];
  }

  private computeRunPoints(run: IQualifyingSchemaRun | null): number {
    if (run === null) return 0;
    return (run.line ?? 0) + (run.angle ?? 0) + (run.style ?? 0);
  }

  getQualifyingListWithOrderedResultList(
    qualifyingList: IQualifyingComputedItem[]
  ): IQualifyingComputedItem[] {
    return qualifyingList.map((qualifying) => {
      return this.getQualifyingWitOrderedResultList(qualifying);
    }) as IQualifyingComputedItem[];
  }

  getQualifyingWitOrderedResultList(
    qualifying: IQualifyingComputedItem
  ): IQualifyingComputedItem {
    const resultList = qualifying.resultList.sort((a, b) => {
      if (b.highestPoints === a.highestPoints) {
        return this.handleSortTieBreaker(a, b);
      }
      return b.highestPoints - a.highestPoints;
    });
    return {
      ...qualifying,
      resultList,
    } as IQualifyingComputedItem;
  }

  private handleSortTieBreaker(
    resultA: IQualifyingComputedResultItem,
    resultB: IQualifyingComputedResultItem
  ): number {
    // tie breaker 1 higher score in lower scored run. Example resultA run1Points: 50, run2Points: 40
    // resultB run1Points: 30, run2Points: 55 -> we take lowest runs and compare them
    // so resultA wins because 40 > 30
    // check if runs are same if we skip this section
    const runALowestPoints =
      resultA.run1Points < resultA.run2Points
        ? resultA.run1Points
        : resultA.run2Points;
    const runBLowestPoints =
      resultB.run1Points < resultB.run2Points
        ? resultB.run1Points
        : resultB.run2Points;
    if (runALowestPoints !== runBLowestPoints) {
      // use tie breaker 1
      return runBLowestPoints - runALowestPoints;
    }

    // so first need to find higher scored run. This can be reasoned if run1Points is higher than run2Points
    // then we take run1, otherwise run2
    // we actually need runAHigherRun and runBHigherRun but also runALowerRun and runBLowerRun
    // so we can compare them all later
    const runAHigherRun =
      resultA?.run2Points > resultA?.run1Points ? resultA?.run2 : resultA?.run1;
    const runBHigherRun =
      resultB?.run2Points > resultB?.run1Points ? resultB?.run2 : resultB?.run1;
    const runALowerRun =
      resultA?.run2Points < resultA?.run1Points ? resultA?.run2 : resultA?.run1;
    const runBLowerRun =
      resultB?.run2Points < resultB?.run1Points ? resultB?.run2 : resultB?.run1;

    // all line points for runA
    const runALinePoints_HIGH = runAHigherRun?.line ?? 0;
    const runALinePoints_LOW = runALowerRun?.line ?? 0;
    const runAAnglePoints_HIGH = runAHigherRun?.angle ?? 0;
    const runAAnglePoints_LOW = runALowerRun?.angle ?? 0;
    const runAStylePoints_HIGH = runAHigherRun?.style ?? 0;
    const runAStylePoints_LOW = runALowerRun?.style ?? 0;

    // all line points for runB
    const runBLinePoints_HIGH = runBHigherRun?.line ?? 0;
    const runBLinePoints_LOW = runBLowerRun?.line ?? 0;
    const runBAnglePoints_HIGH = runBHigherRun?.angle ?? 0;
    const runBAnglePoints_LOW = runBLowerRun?.angle ?? 0;
    const runBStylePoints_HIGH = runBHigherRun?.style ?? 0;
    const runBStylePoints_LOW = runBLowerRun?.style ?? 0;

    // tie breaker 2 higher scored run's line score
    if (runALinePoints_HIGH !== runBLinePoints_HIGH) {
      return runBLinePoints_HIGH - runALinePoints_HIGH;
    }

    // tie breaker 3 higher scored run's angle score
    if (runAAnglePoints_HIGH !== runBAnglePoints_HIGH) {
      return runBAnglePoints_HIGH - runAAnglePoints_HIGH;
    }

    // tie breaker 4 higher scored run's style score
    if (runAStylePoints_HIGH !== runBStylePoints_HIGH) {
      return runBStylePoints_HIGH - runAStylePoints_HIGH;
    }

    // tie breaker 5 lower scored run's line score
    if (runALinePoints_LOW !== runBLinePoints_LOW) {
      return runALinePoints_LOW - runBLinePoints_LOW;
    }

    // tie breaker 6 lower scored run's angle score
    if (runAAnglePoints_LOW !== runBAnglePoints_LOW) {
      return runAAnglePoints_LOW - runBAnglePoints_LOW;
    }

    // tie breaker 7 lower scored run's style score
    if (runAStylePoints_LOW !== runBStylePoints_LOW) {
      return runAStylePoints_LOW - runBStylePoints_LOW;
    }

    // if all else fails, we just return 0
    return 0;
  }
}

export default new QualifyingComputedUtil();
