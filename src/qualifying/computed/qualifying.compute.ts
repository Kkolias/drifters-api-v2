import { IQualifyingResultItem, IQualifyingSchemaItem, IQualifyingSchemaRun } from "../../Schema/drift/Qualifying";

export interface IQualifyingComputedResultItem extends IQualifyingResultItem {
    run1Points: number
    run2Points: number
    highestPoints: number
}

export interface IQualifyingComputedItem extends IQualifyingSchemaItem {
    resultList: IQualifyingComputedResultItem[]
}

export class QualifyingComputedUtil {

    getOutputQualifyingList(qualifyingList: IQualifyingSchemaItem[]): IQualifyingComputedItem[] {
        return qualifyingList.map((qualifyingItem) => {
            return this.getOutputQualifying(qualifyingItem);
        }) as IQualifyingComputedItem[]
    }

    getOutputQualifying(qualifyingItem: IQualifyingSchemaItem): IQualifyingComputedItem {
        const qualifyingWithComputedFields = this.qualifyingWithComputedFields(qualifyingItem);
        return this.getQualifyingWitOrderedResultList(qualifyingWithComputedFields);
    }

    qualifyingListWithComputedFields(qualifyingList: IQualifyingSchemaItem[]): IQualifyingComputedItem[] {
        return qualifyingList.map((qualifyingItem) => {
            return this.qualifyingWithComputedFields(qualifyingItem);
        }) as IQualifyingComputedItem[]
    }

    qualifyingWithComputedFields(qualifyingItem: IQualifyingSchemaItem): IQualifyingComputedItem {
        const resultList = this.computeResultList(qualifyingItem.resultList);
        return {
            ...qualifyingItem,
            resultList
        } as IQualifyingComputedItem
    }

    private computeResultList(resultList: IQualifyingResultItem[]): IQualifyingComputedResultItem[] {
        return resultList.map((resultItem) => {
            const run1Points = this.computeRunPoints(resultItem.run1);
            const run2Points = this.computeRunPoints(resultItem.run2);
            const highestPoints = run1Points > run2Points ? run1Points : run2Points;
            return {
                ...resultItem,
                run1Points,
                run2Points,
                highestPoints
            }
        }) as IQualifyingComputedResultItem[]
    }

    private computeRunPoints(run: IQualifyingSchemaRun | null): number {
        if (run === null) return 0;
        return (run.line ?? 0) + (run.angle ?? 0) + (run.style ?? 0);
    }

    getQualifyingListWithOrderedResultList(qualifyingList: IQualifyingComputedItem[]): IQualifyingComputedItem[] {
        return qualifyingList.map((qualifying) => {
            return this.getQualifyingWitOrderedResultList(qualifying);
        }) as IQualifyingComputedItem[]
    }

    getQualifyingWitOrderedResultList(qualifying: IQualifyingComputedItem): IQualifyingComputedItem {
        const resultList = qualifying.resultList.sort((a, b) => {
            return b.highestPoints - a.highestPoints
        })
        return {
            ...qualifying,
            resultList
        } as IQualifyingComputedItem
    }
}

export default new QualifyingComputedUtil();