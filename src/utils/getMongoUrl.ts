import { isProduction } from "./isProduction";

export function getMongoUrl(): string {
    if(isProduction()) {
        return `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/`
    }
    return `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/`
    // return "mongodb://admin:password@localhost:27018/?authMechanism=DEFAULT"
}