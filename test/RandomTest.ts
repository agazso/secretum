import { expect } from 'chai';
import * as sinon from 'sinon';
import {Random} from '../src/Random';

describe('Random', () => {
    it('should have a certain length', () => {
        const passwordLength = 44;
        const random = Random.getRandomString();
        expect(random.length).equals(passwordLength);
    });

    it('should have a certain bit length', () => {
        const bitLength = 256;
        const passwordLength = 44;
        const random = Random.getRandomStringWithBitLength(bitLength);
        expect(random.length).equals(passwordLength);
    });

    it('should work with bit length not divisible by 8', () => {
        const bitLength = 257;
        const passwordLength = 44;
        const random = Random.getRandomStringWithBitLength(bitLength);
        expect(random.length).equals(passwordLength);
    });

    it('should not be the same after two invokations', () => {
        const random1 = Random.getRandomString();
        const random2 = Random.getRandomString();
        expect(random1).not.equals(random2);
    });
});