import { expect } from 'chai';
import * as sinon from 'sinon';
import {Crypto} from '../src/Crypto';

describe('Crypto', () => {
    it('should have elliptic curve installed', () => {
        expect(Crypto.getCurves().indexOf(Crypto.CURVE)).not.equals(-1);       
    });

    it('should have cipher installed', () => {
        expect(Crypto.getCiphers().indexOf(Crypto.CIPHER)).not.equals(-1);       
    });

    it('should decrypt encrpyted message', () => {
        const message = 'hello';
        const secret = 'secret';
        const encrpyted = Crypto.encrypt(secret, message);
        const decrypted = Crypto.decrypt(secret, encrpyted);
        
        expect(decrypted).to.be.equal(message);
    });

    it('should not decrypt encrpyted message with different secrets', () => {
        const message = 'hello';
        const encryptSecret = 'secret';
        const decryptSecret = 'terces';
        const encrpyted = Crypto.encrypt(encryptSecret, message);
        const decrypted = Crypto.decrypt(decryptSecret, encrpyted);
        
        expect(decrypted).to.be.not.equal(message);
    });


    it('should exchange keys with elliptic curve Diffie-Hellmann', () => {
        const aliceKeys = Crypto.generateKeyPair();
        const bobKeys = Crypto.generateKeyPair();
        const aliceSecret = aliceKeys.computeSecret(bobKeys.getPublicKey());
        const bobSecret = bobKeys.computeSecret(aliceKeys.getPublicKey());

        expect(aliceSecret).to.be.equal(bobSecret);
    });

    it('should HMAC message', () => {
        const message = 'hello';
        const secret = 'secret';
        const hmac = Crypto.hmac(secret, message);

        const notTheSecret = 'notTheSecret';
        const otherHmac = Crypto.hmac(notTheSecret, message);

        expect(otherHmac).to.be.not.equal(hmac);

        const notTheMessage = 'notTheMessage';
        const notTheMessageHmac = Crypto.hmac(secret, notTheMessage);

        expect(notTheMessage).to.be.not.equal(hmac);
    });

    it('should compute well-known HMAC messages', () => {
        const emptyBase64 = Crypto.hmac('', '');
        const emptyHex = Crypto.getHexFromBase64(emptyBase64);

        expect(emptyHex).to.be.equal('b613679a0814d9ec772f95d778c35fc5ff1697c493715653c6c712144292c5ad');

        const qbfBase64 = Crypto.hmac('key', 'The quick brown fox jumps over the lazy dog');
        const qbfHex = Crypto.getHexFromBase64(qbfBase64);

        expect(qbfHex).to.be.equal('f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8');
    });

    it('should hash message', () => {
        const message = 'hello';
        const hash = Crypto.hash(message);
    });

    it('should convert hex to base64', () => {
        const hex = '7468697320697320612074c3a97374';
        const base64 = Crypto.getBase64FromHex(hex);

        expect(base64).to.be.equal('dGhpcyBpcyBhIHTDqXN0');
    });

    it('should convert base64 to hex', () => {
        const base64 = 'dGhpcyBpcyBhIHTDqXN0';
        const hex = Crypto.getHexFromBase64(base64);
        
        expect(hex).to.be.equal('7468697320697320612074c3a97374');
    });

    it('test other AES-256 modes', () => {
        const crypto = require('crypto');
        const message = 'hello world, welcome to the paradise';
        const secret = 'secret'
        const cipher = crypto.createCipher('aes-256-cbc', secret);
        const crypted = cipher.update(message, 'base64', 'base64') + cipher.final('base64');
        console.log(crypted);
    });
});

 
  