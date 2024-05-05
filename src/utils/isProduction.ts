export function isProduction(): boolean {
    return process.env.PLATFORM === "production"
}