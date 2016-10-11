import { expect } from 'chai';
import * as sinon from 'sinon';
import {ChatApplication} from '../src/client/ChatApplication';

describe('ChatApplication', () => {
    it('should be able to be created', () => {
        const options = {
            clientName: 'client',
            roomName: 'room',
            roomSecret: 'roomSecret',
            serverHostname: 'localhost',
            serverPort: 18000,
            serverPrefix: '/chat',
            onMessage: (msg: string) => {}          
        }
        const app = new ChatApplication(options);
    });
});
