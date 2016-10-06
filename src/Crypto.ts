const crypto = require('crypto');
const createECDH = require('create-ecdh');
import {Random} from './Random';

export class EcdhKeyPair {
    constructor(private readonly keyPair: any) {
    }

    getPrivateKey(): string {
        return this.keyPair.getPrivateKey(Crypto.CRYPT_ENCODING);
    }

    getPublicKey(): string {
        return this.keyPair.getPublicKey(Crypto.CRYPT_ENCODING);
    }

    computeSecret(publicKey: string): string {
        return this.keyPair.computeSecret(publicKey, Crypto.CRYPT_ENCODING, Crypto.CRYPT_ENCODING);
    }
} 

export class Crypto {
    static readonly CIPHER = 'aes-256-ctr';
    static readonly CURVE = 'secp256k1';
    static readonly HASH = 'sha256';
    static readonly CRYPT_ENCODING = 'base64';
    static readonly CLEAR_ENCODING = 'utf8';

    static hash(message: string): string {
        const hash = crypto.createHash(this.HASH);
        hash.update(message);
        return hash.digest(this.CRYPT_ENCODING);
    }

    static hmac(secret: string, message: string): string {
        const hmac = crypto.createHmac(this.HASH, secret);
        hmac.update(message);
        return hmac.digest(this.CRYPT_ENCODING);
    }

    static encrypt(secret: string, message: string): string {
        const cipher = crypto.createCipher(this.CIPHER, secret);
        const crypted = cipher.update(message, Crypto.CLEAR_ENCODING, Crypto.CRYPT_ENCODING) + cipher.final(Crypto.CRYPT_ENCODING);
        return crypted;
    }

    static decrypt(secret: string, message: string): string {
        const decipher = crypto.createDecipher(this.CIPHER, secret);
        const decrypted = decipher.update(message, Crypto.CRYPT_ENCODING, Crypto.CLEAR_ENCODING) + decipher.final(Crypto.CLEAR_ENCODING);
        return decrypted;
    }

    static generateKeyPair(): EcdhKeyPair {
        const ecdh = createECDH(this.CURVE);
        ecdh.generateKeys(Crypto.CRYPT_ENCODING);
        return new EcdhKeyPair(ecdh);
    }

    static test() {
        const alice = crypto.createECDH(this.CURVE);
        const alicePublicKey = alice.generateKeys(Crypto.CRYPT_ENCODING);
        const bob = crypto.createECDH(this.CURVE);
        const bobPublicKey = bob.generateKeys(Crypto.CRYPT_ENCODING);

        const aliceSecret = alice.computeSecret(bobPublicKey, Crypto.CRYPT_ENCODING, Crypto.CRYPT_ENCODING);
        const bobSecret = bob.computeSecret(alicePublicKey, Crypto.CRYPT_ENCODING, Crypto.CRYPT_ENCODING);

        console.log(bobSecret);

        const secret = 'abc';
        const computedSecret = '6+fBzpDkAdi7Jqh9uLD2APytHlLlXSvBvs2ZnWCKO54=';
        // const initialKey = 'NDAzMkUzMEQzODRERjBBQkM3MTU3MkI0RTAwNTY4QjI=';
        const initialKey = Random.getRandomString();

        console.log('i ', initialKey);
        console.log('H(s) ', Crypto.hash(secret));
        console.log('E(s, i): ', Crypto.encrypt(secret, initialKey));
        console.log('E(H(s), i): ', Crypto.encrypt(Crypto.hash(secret), initialKey));
        console.log('E(s, c+i): ', Crypto.encrypt(secret, computedSecret + initialKey));
        console.log('E(c, i): ', Crypto.encrypt(computedSecret, initialKey));
        console.log('E(c+s, i): ', Crypto.encrypt(computedSecret + secret, initialKey));
    }


    static getCurves(): string[] {
        return crypto.getCurves();
    }

    static getCiphers(): string[] {
        return crypto.getCiphers();
    }

    static getHexFromBase64(base64: string): string {
        return Buffer.from(base64, 'base64').toString('hex');
    }

    static getBase64FromHex(hex: string): string {
        return Buffer.from(hex, 'hex').toString('base64');
    }
} 