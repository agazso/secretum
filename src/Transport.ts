import {Client, ClientMessage} from './Client';
import {Server, NullServer} from './NullServer';
import {Debug} from './Debug';

export interface ServerTransport {
    sendClient(clientId: string, roomName: string, senderClientId: string, message: ClientMessage): void;
}

export class LocalServerTransport implements ServerTransport {
    private clients: { [id: string]: Client} = {};
    readonly server: NullServer = new NullServer(this);

    registerClient(client: Client) {
        this.clients[client.publicKey] = client;
    }

    sendClient(clientId: string, roomName: string, senderClientId: string, message: ClientMessage): void {
        Debug.log('sendClient ', clientId, senderClientId, message, '\n');
        this.clients[clientId].receive(senderClientId, message);
    }
}

export interface ClientTransport {
    sendServer(clientId: string, message: ClientMessage): void;
}

export class NullClientTransport implements ClientTransport {
    sendServer(clientId: string, message: ClientMessage): void {
    }
}

export class LocalClientTransport implements ClientTransport {
    constructor(readonly server: Server, readonly room: string) {

    }
    sendServer(clientId: string, message: ClientMessage): void {
        Debug.log('sendServer ', this.room, clientId, message, '\n');
        this.server.receive(this.room, clientId, message);
    }   
}