import {ClientTransport} from './Transport';
import {Client, ClientMessage} from './Client';
import {RemoteClient} from './RemoteClient';
import {NullServer} from './NullServer';
import {Debug} from './Debug';
import {SockJSMessage} from './SockJSMessage';

import * as SockJS from 'sockjs-client';
import SockJSClass = __SockJSClient.SockJSClass;

import http = require('http');
import stream = require("stream");


export class SockJSClientTransport implements ClientTransport {
    sock: SockJSClass;
    onReceive: (clientId: string, message: ClientMessage) => void;

    constructor(private readonly url: string,
                private readonly roomName: string, 
                onConnect: () => void,
                ) {
        
        this.sock = new SockJS(this.url);
        this.sock.onopen = (e: __SockJSClient.OpenEvent) => {
            onConnect();
        };
        
        this.sock.onmessage = (e) => {
            try {
                Debug.log(e);
                const sockMessage = <SockJSMessage> JSON.parse(e.data);
                this.onReceive(sockMessage.clientId, sockMessage.message);
            } catch (e) {
                console.log(e);
            }
        };
    }

    sendServer(clientId: string, message: ClientMessage): void {
        this.sendSockJSMessage({
            roomName: this.roomName,
            clientId: clientId,
            message: message
        })
    }

    private sendSockJSMessage(message: SockJSMessage) {
        Debug.log(message);
        this.sock.send(JSON.stringify(message));
    }
}
