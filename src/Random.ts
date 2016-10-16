const crypto = require('crypto');

export class Random {
    private static getRandomHexChar(): string {
        const random = Math.floor(Math.random() * 16);
        if (random < 10) {
            return '' + random;
        }
        return ['A', 'B', 'C', 'D', 'E', 'F'][random - 10];
    }

    static getRandomString(): string {
        return crypto.randomBytes(32).toString('base64');
    }

    static getRandomStringWithBitLength(bitLength: number): string {
        return crypto.randomBytes(Math.floor(bitLength / 8)).toString('base64');
    }

    static getRandomHexStringWithBitLength(bitLength: number): string {
        return crypto.randomBytes(Math.floor(bitLength / 8)).toString('hex');
    }
    
    static getRandomInt(max: number): number {
        return Math.floor(Math.random() * max);
    }
}
