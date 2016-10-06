import { expect } from 'chai';
import * as sinon from 'sinon';
import {LocalClient, DefaultClientKeyGenerator} from '../src/LocalClient';
import {Client, TextMessage} from '../src/Client';
import {NullClientTransport} from '../src/Transport';
import {RemoteClient} from '../src/RemoteClient';
import {Debug} from '../src/Debug';

describe('LocalClient', () => {
    const localClientName = 'localClient';
    const roomName = 'roomName';
    const initialKey = 'initialKey';
    const keyGenerator = new DefaultClientKeyGenerator(localClientName, localClientName + '.secret', initialKey);
    const clientTransport = new NullClientTransport();

    it('should receive messages', () => {
        const remoteClient = new RemoteClient('remote', 'remote.public');
        const client = new LocalClient(localClientName, clientTransport, keyGenerator, (message) => {});
        const message = "hello";
        const onMessageSpy = sinon.spy(client, 'onMessage');

        client.setInitialKey(initialKey);
        const payload = JSON.stringify({kind: 'TextMessage', message:message});
        const encryptedPayload = client.encrypt(payload);
        client.receive(remoteClient.publicKey, {kind: 'EncryptedMessage', payload: encryptedPayload});

        expect(onMessageSpy.callCount).equals(1);
        expect(onMessageSpy.calledWithExactly(message)).to.be.true;
    });

    it('should be encoded to JSON', () => {
        const client = new LocalClient(localClientName, clientTransport, keyGenerator, (message) => {});
        const jsonClient = JSON.stringify(<Client>client);
        const parsedClient = JSON.parse(jsonClient);
        
        // TODO
        // expect(parsedClient.hasOwnProperty('privateKey')).to.be.false;
    });

    it('should decrypt and encrypt', () => {
        const client = new LocalClient(localClientName, clientTransport, keyGenerator, (message) => {});
        client.setInitialKey(initialKey);
        const message = 'hello';
        const encrypted = client.encrypt(message);
        const decrypted = client.decrypt(encrypted);

        expect(message).to.be.equal(decrypted);
    });

});
