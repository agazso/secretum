import {ClientMessage} from './Client';
import {ServerTransport} from './Transport';
import {Debug} from './Debug';

export interface Server {
    receive(room: string, client: string, message: ClientMessage): void;
}

class ServerRoom {
    clients: string[] = [];
    
    constructor(readonly name: string, client: string) {
        this.addClient(client);
    }

    addClient(client: string) {
        this.clients.push(client);
    }

    hasClient(client: string): boolean {
        for (const c of this.clients) {
            if (c == client) {
                return true;
            }
        }
        return false;
    }
}

export class NullServer implements Server {
    private rooms: { [name: string]: ServerRoom; } = {};

    constructor(private transport: ServerTransport) {
    }

    private createServerRoom(roomName: string, client: string): ServerRoom {
        Debug.log('Room created ', roomName, client);
        const serverRoom = new ServerRoom(roomName, client);
        this.rooms[roomName] = serverRoom;
        
        return serverRoom;
    }

    receive(roomName: string, senderClient: string, message: ClientMessage): void {
        let serverRoom = this.rooms[roomName];
        
        if (serverRoom == null) {
            if (message.kind != 'PublishPublicKey') {
                console.log('Error, no room found by name: ', roomName);
                return;
            } else {
                serverRoom = this.createServerRoom(roomName, senderClient);
            }
        } else {
            if (message.kind == 'PublishPublicKey') {
                serverRoom.addClient(senderClient);
            }
        }

        for (const client of serverRoom.clients) {
            if (senderClient != client) {
                this.transport.sendClient(client, roomName, senderClient, message);
            }
        }
    }

    getRoomCount(): number {
        return Object.keys(this.rooms).length;
    }
}
