import { expect } from 'chai';
import * as sinon from 'sinon';
import {ChatApplication} from '../src/client/ChatApplication';
import {NullClientEventHandler} from '../src/LocalClient';

describe('ChatApplication', () => {
    it('should be able to be created', () => {
        const options = {
            clientName: 'client',
            roomName: 'room',
            roomSecret: 'roomSecret',
            serverHostname: 'localhost',
            serverPort: 18000,
            serverPrefix: '/chat',
            eventHandler: new NullClientEventHandler()
        }
        const app = new ChatApplication(options);
    });
});
