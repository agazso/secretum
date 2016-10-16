import { expect } from 'chai';
import * as sinon from 'sinon';
import {Debug} from '../src/Debug';

describe('Debug', () => {
    const context = 'Context.<anonymous>';

    afterEach(() => {
        Debug.setDebug(false);
        Debug.prefix = '';
        Debug.withCaller = true;
    });


    it('should print the name of the caller', () => {
        expect(Debug.getCallerName()).equals(context);
    });

    it('should print the message to the console', () => {
        Debug.setDebug(true);

        const message = 'message';
        const consoleLogStub = sinon.stub(console, 'log');
        Debug.log(message, {}, []);

        expect(consoleLogStub.callCount).equals(1);
        expect(consoleLogStub.calledWithExactly(`${context}:`, message, {}, [])).to.be.true;
        consoleLogStub.restore();
    });

    it('should print the message to the console without caller', () => {
        Debug.setDebug(true);
        Debug.withCaller = false;

        const message = 'message';
        const consoleLogStub = sinon.stub(console, 'log');
        Debug.log(message, {}, []);

        expect(consoleLogStub.callCount).equals(1);
        expect(consoleLogStub.calledWithExactly(message, {}, [])).to.be.true;
        consoleLogStub.restore();
    });

    it('should print the prefix', () => {
        Debug.setDebug(true);
        Debug.prefix = 'prefix';
        const message = 'message';

        const consoleLogStub = sinon.stub(console, 'log');
        Debug.log(message);
 
        expect(consoleLogStub.callCount).equals(1);
        expect(consoleLogStub.calledWithMatch(Debug.prefix)).to.be.true;

        consoleLogStub.restore();
    });
});
