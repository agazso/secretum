import {ClientMessage, Client} from './Client';

export class RemoteClient implements Client {
    constructor(readonly name: string, readonly publicKey: string) {

    }

    receive(senderClientId: string, clientMessage: ClientMessage): void {

    }
}

