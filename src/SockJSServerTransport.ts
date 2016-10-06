import {ServerTransport} from './Transport';
import {Client, ClientMessage} from './Client';
import {RemoteClient} from './RemoteClient';
import {Server, NullServer} from './NullServer';
import {Debug} from './Debug';
import {SockJSMessage} from './SockJSMessage';

import sockjs = require('sockjs');
import http = require('http');
import stream = require("stream");

class ClientConnection {
    connection: sockjs.Connection;
    client: string;
}

export class SockJSServerTransport implements ServerTransport {
    private sockjsServer: sockjs.Server;
    private connections: { [id:string]: ClientConnection };
    private httpServer: http.Server;

    // TODO HACK for testing
    registerClient(client: Client) {

    }

    constructor(private serverPort: number, prefix: string) {
        this.connections = {};
        this.sockjsServer = sockjs.createServer();

        this.httpServer = http.createServer();
        this.sockjsServer.installHandlers(this.httpServer, {prefix: prefix});
    }

    start() {
        const server = new NullServer(this);
        this.sockjsServer.on('connection', (conn) => {
            
            conn.on('data', (data: string) => {
                try {
                    const m :SockJSMessage = JSON.parse(data);
                    
                    const roomName = m['roomName'];
                    const clientId = m['clientId'];
                    const message = m['message'];
                    
                    if (!this.connections.hasOwnProperty(clientId)) {
                        this.connections[clientId] = {
                            connection: conn,
                            client: clientId
                        };
                    }

                    server.receive(roomName, clientId, message);
                } catch (e) {
                    console.log('SockJSServerTransport: invalid message ', e);
                }
            });

            conn.on('close', () => {
                delete this.connections[conn.id];
            });
        });

        this.httpServer.listen(this.serverPort, '0.0.0.0');
    }

    close() {
        this.sockjsServer.removeAllListeners();
        this.httpServer.close();
    }

    sendClient(clientId: string, roomName: string, senderClientId: string, message: ClientMessage): void {
        const clientConnection = this.connections[clientId];
        if (clientConnection != undefined) {
            const sockMessage: SockJSMessage = {
                clientId: senderClientId,
                roomName: roomName,
                message: message
            }
            clientConnection.connection.write(JSON.stringify(sockMessage));
        }
    }
}

