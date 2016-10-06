import { expect } from 'chai';
import * as sinon from 'sinon';
import {Debug} from '../src/Debug';

describe('Debug', () => {
    it('should print the name of the caller', () => {
        console.log(Debug.getCallerName());
    });

    it('should print the message to the console', () => {
        Debug.setDebug(true);
        Debug.log('message', 's', {}, []);
        Debug.setDebug(false);
    });
});
