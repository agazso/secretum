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
    onMessage: (data: string, message: ClientMessage) => void;
    
    constructor(private readonly url: string, private readonly roomName: string, onconnect: () => void) {
        this.sock = new SockJS(this.url);
        this.sock.onopen = (e: __SockJSClient.OpenEvent) => {
            onconnect();
        };
        
        this.sock.onmessage = (e) => {
            if (this.onMessage) {
                try {
                    Debug.log(e);
                    const sockMessage = <SockJSMessage> JSON.parse(e.data);
                    this.onMessage(sockMessage.clientId, sockMessage.message);
                } catch (e) {
                    console.log(e);
                }
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
