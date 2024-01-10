

export function parseToken(rawToken: string): string {
    return rawToken.split(" ")?.[1] || '';
}