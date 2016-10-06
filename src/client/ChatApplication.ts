import {LocalClient, DefaultClientKeyGenerator} from '../LocalClient';
import {ClientTransport, LocalClientTransport} from '../Transport';
import {SockJSClientTransport} from '../SockJSClientTransport';
import {Random} from '../Random';

interface ChatApplicationOptions {
    clientName: string;
    roomName: string;
    roomSecret: string;
    serverHostname: string;
    serverPort: number;
    serverPrefix: string;
}

export class ChatApplication {
    private readonly localClient: LocalClient;
    private readonly clientTransport: ClientTransport;

    constructor(options: ChatApplicationOptions) {
        const keyGenerator = new DefaultClientKeyGenerator(options.clientName, options.roomSecret, this.getInitialKey());
        const serverUrl = this.getServerUrl(options.serverHostname, options.serverPort, options.serverPrefix);
        this.clientTransport = new SockJSClientTransport(serverUrl, options.roomName, () => {
            this.localClient.sendPublishPublicKey();
        });
        this.localClient = new LocalClient(options.clientName, this.clientTransport, keyGenerator, this.onMessage);
    }

    onMessage(message: string) {
        console.log('onMessage: ', message);
    }

    sendMessage(message: string) {
        this.localClient.sendEncryptedMessage(message);
    }

    getInitialKey(): string {
        return Random.getRandomString();
    }

    getServerUrl(hostname: string, port: number, prefix: string): string {
        return 'http://' + hostname + ':' + port + prefix;
    }
}
