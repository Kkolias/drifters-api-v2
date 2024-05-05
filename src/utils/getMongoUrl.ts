import { isProduction } from "./isProduction";

export function getMongoUrl(): string {
    if(isProduction()) {
        return `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@driftdataancluster0.msh5f0i.mongodb.net/`
    }
    return `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@driftdataancluster0.msh5f0i.mongodb.net/`
    // return "mongodb://admin:password@localhost:27018/?authMechanism=DEFAULT"
}