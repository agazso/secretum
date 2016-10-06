import {ClientMessage} from './Client';

export interface SockJSMessage {
    roomName: string;
    clientId: string;
    message: ClientMessage;
}
