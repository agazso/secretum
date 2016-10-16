import {Client, ClientMessage, PublishPublicKey, InitialKey,
     EncryptedMessage, EncryptedMessagePayload, TextMessage, PublicKeyAuthentication} from './Client';
import {RemoteClient} from './RemoteClient';
import {ClientTransport} from './Transport';
import {Crypto, EcdhKeyPair} from './Crypto';
import {Debug} from './Debug';
import {Random} from './Random';

export interface ClientEventHandler {
    onMessage(clientId: string, message: string): void;
    onClientConnected(clientId: string): void;
    onClientDisconnected(clientId: string): void;
}

export class NullClientEventHandler implements ClientEventHandler {
    onMessage(clientId: string , message: string) {}
    onClientConnected(clientId: string) {}
    onClientDisconnected(clientId: string) {}
}

export interface ClientKeyGenerator {
    getIdentityKeyPair(): [string, string];
    getSecret(): string;
    getInitialKey(): string;
    computeIdentitySecret(otherPublicKey: string): string;
}

export class DefaultClientKeyGenerator {
    private ecdhKeyPair: EcdhKeyPair;
    constructor(readonly name: string, readonly secret: string, readonly initialKey: string) {
        this.ecdhKeyPair = Crypto.generateKeyPair();
    }

    getIdentityKeyPair(): [string, string] {
        return [this.ecdhKeyPair.getPrivateKey(), this.ecdhKeyPair.getPublicKey()];        
    }

    computeIdentitySecret(otherPublicKey: string): string {
        return this.ecdhKeyPair.computeSecret(otherPublicKey);
    }

    getSecret(): string {
        return this.secret;
    }

    getInitialKey(): string {
        return this.initialKey;
    }
}

function assertNever(x: never): never {
    throw new Error('Unexpected object: ' + x);
}

export class LocalClient implements Client {
    readonly publicKey: string;
    private readonly privateKey: string;
    private remoteClients: { [publickKey: string]: RemoteClient; } = {};
    private initialKey: string;
    private id: number = 0;
   
    constructor(readonly name: string, readonly transport: ClientTransport, private keyGenerator:ClientKeyGenerator, private eventHandler: ClientEventHandler) {
        [this.privateKey, this.publicKey] = keyGenerator.getIdentityKeyPair();
    }

    encrypt(message: string): string {
        const secret = this.getEncryptionKey();
        const encrypted = Crypto.encrypt(secret, message);
        return encrypted;
    }

    decrypt(message: string): string {
        const secret = this.getEncryptionKey();
        const decrypted = Crypto.decrypt(secret, message); 
        return decrypted;
    }

    receive(senderClientId: string, message: ClientMessage): void {
        Debug.log(message);
        try {
            if (senderClientId != this.publicKey) {
                this.tryReceive(senderClientId, message);
            }
        } catch (e) {
            console.log(e, message);
        }
    }

    private tryReceive(senderClientId: string, message: ClientMessage): void {
        switch (message.kind) {
            case 'PublishPublicKey':
                if (!this.remoteClients.hasOwnProperty(message['publicKey'])) {
                    this.sendInitialKey(message['publicKey']);
                    this.addRemoteClient(message['name'], message['publicKey']);
                    this.eventHandler.onClientConnected(message['name']);
                }
                break;
            case 'EncryptedMessage':
                this.onEncryptedMessage(senderClientId, message.payload);
                break;
            case 'InitialKey':
                const initialKey = Crypto.decrypt(
                    Crypto.hash(this.keyGenerator.computeIdentitySecret(senderClientId)), message['initialKey']);
                this.setInitialKey(initialKey);
                if (!this.remoteClients.hasOwnProperty(message['publicKey'])) {
                    this.addRemoteClient(message['name'], message['publicKey']);
                    this.eventHandler.onClientConnected(message['name']);
                }
                break;
            
            default: return assertNever(message);
        }
    }

    onEncryptedMessage(senderClientId: string, message: string) {
        const decryptedMessage = this.decrypt(message);
        const payload = <EncryptedMessagePayload> JSON.parse(decryptedMessage);
        switch (payload.kind) {
            case 'TextMessage':
                this.onTextMessage(senderClientId, payload.message);
                break;

            case 'PublicKeyAuthentication':
                break;
            
            default: return assertNever(payload);
        }
    }

    onTextMessage(senderClientId: string, message: string) {
        this.eventHandler.onMessage(senderClientId, message);
    }

    addRemoteClient(name: string, publicKey: string) {
        this.remoteClients[publicKey] = new RemoteClient(name, publicKey);
    }

    getRemoteClientNames(): string[] {
        return Object.keys(this.remoteClients).map((remoteClient, index) => {
            return this.remoteClients[remoteClient].name;
        })        
    }

    getRemoteClientNameById(clientId: string): string {
        return this.remoteClients[clientId].name;
    }

    sendServer(message: ClientMessage) {
        this.transport.sendServer(this.publicKey, message); 
    }

    sendEncryptedMessage(message: string) {
        this.id += 1;

        const payload = this.encrypt(JSON.stringify({
                kind: 'TextMessage',
                noise: Random.getRandomStringWithBitLength(Random.getRandomInt(200) + 100),
                message: message,
                id: this.id
            }));

        this.sendServer({
            kind: 'EncryptedMessage',
            payload: payload 
        });
    }

    sendPublishPublicKey() {
        const message: PublishPublicKey = {
            kind: 'PublishPublicKey',
            name: this.name,
            publicKey: this.publicKey,
        }
        this.sendServer(message);        
    }

    getEncryptionKey(): string {
        return Crypto.hmac(this.keyGenerator.getSecret(), this.initialKey);
    }

    setInitialKey(initialKey:string) {
        if (this.initialKey == null) {
            this.initialKey = initialKey;
        }
    }

    sendInitialKey(otherPublicKey: string) {
        // HACK
        this.setInitialKey(this.keyGenerator.getInitialKey());

        const encryptedInitialKey = Crypto.encrypt(
            Crypto.hash(this.keyGenerator.computeIdentitySecret(otherPublicKey)),
            this.initialKey);

        const message: InitialKey = {
            kind: 'InitialKey',
            name: this.name,
            publicKey: this.publicKey,
            initialKey: encryptedInitialKey
        }
        this.sendServer(message);
    }
}
