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

type ConnectionState = "connected" | "connecting" | "disconnected";

export class SockJSClientTransport implements ClientTransport {
    private sock: SockJSClass;
    private connectionState: ConnectionState = "disconnected";
    private messageQueue: SockJSMessage[] = [];
    onReceive: (clientId: string, message: ClientMessage) => void;

    constructor(private readonly url: string,
                private readonly roomName: string, 
                onConnect: () => void,
                ) {
        this.connect(onConnect);
    }

    private connect(onConnect: () => void) {
        this.connectionState = "connecting";

        this.sock = new SockJS(this.url);
        this.sock.onopen = (e: __SockJSClient.OpenEvent) => {
            this.connectionState = "connected";
            
            while (this.messageQueue.length > 0) {
                this.sock.send(JSON.stringify(this.messageQueue.shift()));
            }
            
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

        this.sock.onclose = (e) => {
            this.connectionState = "disconnected";
            setTimeout(() => this.connect(onConnect), 1000);
        }
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
        
        if (this.connectionState == "connected") {
            this.sock.send(JSON.stringify(message));
        } else {
            this.messageQueue.push(message);
        }
    }
}
