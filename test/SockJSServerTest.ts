import { expect } from 'chai';
import * as sinon from 'sinon';
import {NullServer} from '../src/NullServer';
import {Server} from '../src/NullServer';
import {LocalClient, DefaultClientKeyGenerator, NullClientEventHandler} from '../src/LocalClient';
import {SockJSClientTransport} from '../src/SockJSClientTransport';
import {SockJSServerTransport} from '../src/SockJSServerTransport';
import {Debug} from '../src/Debug';

describe('SockJSServer', () => {
    const localClientName = 'localClient';
    const roomName = 'roomName';
    const serverPort = 18000;
    const serverPrefix = '/chat';
    const serverUrl = 'http://localhost:'+ serverPort + serverPrefix; 
    const initialKey = 'initialKey';
    const keyGenerator = new DefaultClientKeyGenerator(localClientName, localClientName + 'secret', initialKey);
    const timeout = 100*1000;
    const serverTransport:SockJSServerTransport = new SockJSServerTransport(serverPort, serverPrefix);
    const eventHandler = new NullClientEventHandler();

    beforeEach(() => {
    });

    afterEach(() => {
        serverTransport.close();
    });

    it('client should connect', (done) => {
        serverTransport.start();

        const clientTransport = new SockJSClientTransport(serverUrl, roomName, () => {
            const client = new LocalClient(localClientName, clientTransport, keyGenerator, eventHandler);
            client.sendPublishPublicKey();
            done();
        });
    });

    it('two clients should connect and send encrypted message', (done) => {
        const message = 'hello';
        serverTransport.start();
        const client1Transport = new SockJSClientTransport(serverUrl, roomName, () => {
            const keyGenerator1 = new DefaultClientKeyGenerator(localClientName + '1', 'secret', initialKey);
            const client1EventHandler = {
                onMessage: (clientId: string, msg:string) => {
                    expect(msg).to.be.equal(message);
                    done();
                },
                onClientConnected: (client:string) => {},
                onClientDisconnected: (client: string) => {}
            };
            const client1 = new LocalClient(localClientName + '1', client1Transport, keyGenerator1, client1EventHandler);
            client1Transport.onReceive = (senderClientId, clientMessage) => {
                client1.receive(senderClientId, clientMessage);
            };

            const client2Transport = new SockJSClientTransport(serverUrl, roomName, () => {
                const keyGenerator2 = new DefaultClientKeyGenerator(localClientName + '2', 'secret', initialKey);
                const client2 = new LocalClient(localClientName + '2', client2Transport, keyGenerator2, eventHandler);
                client2Transport.onReceive = (senderClientId, clientMessage) => {
                    client2.receive(senderClientId, clientMessage);

                    if (clientMessage.kind == 'InitialKey') {
                        client2.sendEncryptedMessage(message);
                    }
                };

                client1.sendPublishPublicKey();
                client2.sendPublishPublicKey();
           });
        });
    });
});
