import { expect } from 'chai';
import * as sinon from 'sinon';
import {NullServer} from '../src/NullServer';
import {Server} from '../src/NullServer';
import {LocalClient, DefaultClientKeyGenerator} from '../src/LocalClient';
import {LocalClientTransport, LocalServerTransport} from '../src/Transport';
import {Debug} from '../src/Debug';

describe('NullServer', () => {
    const localClientName = 'localClient';
    const roomName = 'roomName';
    const initialKey = 'initialKey';
    const keyGenerator = new DefaultClientKeyGenerator(localClientName, localClientName + 'secret', initialKey);

    function createLocalClient(server: NullServer, name: string): LocalClient {
        return createLocalClientWithSecret(server, name, 'secret');
    }

    function createLocalClientWithSecret(server: NullServer, name: string, secret: string): LocalClient {
        const clientTransport = new LocalClientTransport(server, roomName);
        const keyGenerator = new DefaultClientKeyGenerator(name, secret, initialKey);
        return new LocalClient(name, clientTransport, keyGenerator, (message) => {})
    }

    it('should create a room when receives CreateRoom command', () => {
        const serverTransport = new LocalServerTransport();
        const server = serverTransport.server;
        const createServerRoomSpy = sinon.spy(server, 'createServerRoom');
        const clientTransport = new LocalClientTransport(server, roomName);
        const client = new LocalClient(localClientName, clientTransport, keyGenerator, (message) => {});

        expect(server.getRoomCount()).equals(0);

        client.sendPublishPublicKey();

        expect(server.getRoomCount()).equals(1);
        expect(createServerRoomSpy.callCount).equals(1);
        expect(createServerRoomSpy.calledWithExactly(roomName, client.publicKey)).to.be.true;
    });

    it('should not create a room with already existing name', () => {
        const serverTransport = new LocalServerTransport();
        const server = serverTransport.server;
        const clientTransport = new LocalClientTransport(server, roomName);
        const client = new LocalClient(localClientName, clientTransport, keyGenerator, (message) => {});

        expect(server.getRoomCount()).equals(0);
        client.sendPublishPublicKey();
        expect(server.getRoomCount()).equals(1);
        client.sendPublishPublicKey();
        expect(server.getRoomCount()).equals(1);
    });

    it('should broadcast public keys to newly connected clients', () => {
        const serverTransport = new LocalServerTransport();
        const server = serverTransport.server;
        const client1 = createLocalClient(server, localClientName + '1');
        serverTransport.registerClient(client1);
        const client2 = createLocalClient(server, localClientName + '2');
        serverTransport.registerClient(client2);
        const addRemoteClientSpy1 = sinon.spy(client1, 'addRemoteClient');
        const addRemoteClientSpy2 = sinon.spy(client2, 'addRemoteClient');

        client1.sendPublishPublicKey();
        client2.sendPublishPublicKey();

        expect(addRemoteClientSpy1.callCount).equals(1);
        expect(addRemoteClientSpy1.calledWithExactly(client2.name, client2.publicKey)).to.be.true;
    });

    it('should send message to clients in room', () => {
        const serverTransport = new LocalServerTransport();
        const server = serverTransport.server;
        const client1 = createLocalClient(server, localClientName + '1');
        serverTransport.registerClient(client1);
        const client2 = createLocalClient(server, localClientName + '2');
        serverTransport.registerClient(client2);
        const clientOnMessageSpy2 = sinon.spy(client2, 'onMessage'); 

        client1.sendPublishPublicKey();
        client2.sendPublishPublicKey();

        const message = 'hello';
        client1.sendEncryptedMessage(message);

        expect(clientOnMessageSpy2.callCount).equals(1);
        expect(clientOnMessageSpy2.calledWithExactly(message)).to.be.true;
    });

    it('should exchange keys and send encrypted message', () => {
        const serverTransport = new LocalServerTransport();
        const server = serverTransport.server;
        const client1 = createLocalClient(server, localClientName + '1');
        serverTransport.registerClient(client1);
        const clientSendInitialKey1 = sinon.spy(client1, 'sendInitialKey'); 
        const client2 = createLocalClient(server, localClientName + '2');
        serverTransport.registerClient(client2);
        const clientOnMessageSpy2 = sinon.spy(client2, 'onMessage'); 

        client1.sendPublishPublicKey();
        client2.sendPublishPublicKey();

        const message = 'hello';
        client1.sendEncryptedMessage(message);

        expect(clientSendInitialKey1.callCount).equals(1);
        expect(clientSendInitialKey1.calledWithExactly(client2.publicKey)).to.be.true;
        expect(clientOnMessageSpy2.callCount).equals(1);
        expect(clientOnMessageSpy2.calledWithExactly(message)).to.be.true;
    });

    it('should not work with different keys', () => {
        const serverTransport = new LocalServerTransport();
        const server = serverTransport.server;
        const client1 = createLocalClientWithSecret(server, localClientName + '1', 'secret1');
        serverTransport.registerClient(client1);
        const clientSendInitialKey1 = sinon.spy(client1, 'sendInitialKey'); 
        const client2 = createLocalClientWithSecret(server, localClientName + '2', 'secret2');
        serverTransport.registerClient(client2);
        const clientOnMessageSpy2 = sinon.spy(client2, 'onMessage'); 

        client1.sendPublishPublicKey();
        client2.sendPublishPublicKey();

        const message = 'hello';
        client1.sendEncryptedMessage(message);

        expect(clientSendInitialKey1.callCount).equals(1);
        expect(clientSendInitialKey1.calledWithExactly(client2.publicKey)).to.be.true;
        expect(clientOnMessageSpy2.callCount).equals(0);
    });

    it('should work with three participants', () => {
        const serverTransport = new LocalServerTransport();
        const server = serverTransport.server;
        const client1 = createLocalClient(server, localClientName + '1');
        serverTransport.registerClient(client1);
        const clientSendInitialKey1 = sinon.spy(client1, 'sendInitialKey'); 
        const client2 = createLocalClient(server, localClientName + '2');
        serverTransport.registerClient(client2);
        const clientOnMessageSpy2 = sinon.spy(client2, 'onMessage'); 
        const client3 = createLocalClient(server, localClientName + '3');
        serverTransport.registerClient(client3);
        const clientOnMessageSpy3 = sinon.spy(client3, 'onMessage'); 

        client1.sendPublishPublicKey();
        client2.sendPublishPublicKey();
        client3.sendPublishPublicKey();

        const message = 'hello';
        client1.sendEncryptedMessage(message);

        expect(clientSendInitialKey1.callCount).equals(2);
        expect(clientSendInitialKey1.calledWithExactly(client2.publicKey)).to.be.true;
        expect(clientOnMessageSpy2.callCount).equals(1);
        expect(clientOnMessageSpy2.calledWithExactly(message)).to.be.true;
        expect(clientOnMessageSpy3.callCount).equals(1);
        expect(clientOnMessageSpy3.calledWithExactly(message)).to.be.true;
    });
});