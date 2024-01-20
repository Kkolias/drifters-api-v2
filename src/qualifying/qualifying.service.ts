import Qualifying, { IQualifyingResultItem, IQualifyingSchemaItem, IQualifyingSchemaRun } from "../Schema/drift/Qualifying";
import { isAdmin } from "../user/utils/isAdmin";
import { Request } from 'express'
import mongoose from 'mongoose'




class QualifyingService {
    async createDriver(req: Request): Promise<IQualifyingSchemaItem | null> {
        const {
            eventId
        } = req.body;

        if (!await isAdmin(req)) {
            return null
        }

        const qualifying = new Qualifying({
            eventId
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


    // async addResultToQualifying(req: Request): Promise<{ success?: IQualifyingSchemaItem, error?: string }> {
    //     const {
    //         driverId,
    //         leaderboardId,
    //         score,
    //         numOfWins,
    //         numOfSeconds,
    //         numOfThirds
    //     } = req.body
    //     const [isUserAdmin, leaderboard, driver] = await Promise.all([
    //         isAdmin(req),
    //         this.findById(leaderboardId),
    //         driverService.findById(driverId) as unknown as IDriver
    //     ])

    //     if (!isUserAdmin) {
    //         return { error: 'Cannot edit scoreboard' }
    //     }


    //     // if (!canAccess) return { error: 'Cannot edit fishin permit' }

    //     const scoreboardDriver = {
    //         driver,
    //         score,
    //         numOfWins,
    //         numOfSeconds,
    //         numOfThirds
    //     }

    //     leaderboard?.scoreboard.push(scoreboardDriver)
    //     const updated = await leaderboard?.save()
    //     return { success: updated }
    // }

    async addQualifyingRun(req: Request) {
        const { qualResultId, line, angle, style } = req.body

        const qualifyingOfResult = await Qualifying.find(
            { resultList: new mongoose.Types.ObjectId(qualResultId) }
        )
        const result = qualifyingOfResult?.[0]?.resultList?.find(r => r?._id === qualResultId)

        
    }

    private resultHasRun1(qualifyingResult: IQualifyingResultItem): boolean {
        return !!qualifyingResult?.run1
    }

    private createNewRun({ line, angle, style }: { line: number, angle: number, style: number }): IQualifyingSchemaRun {
        return {
            line, angle, style
        }
    }
}

export default new QualifyingService()