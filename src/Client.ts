export interface PublishPublicKey {
    kind: "PublishPublicKey";
    name: string;
    publicKey: string;
}

export interface InitialKey {
    kind: "InitialKey";
    name: string;
    publicKey: string;
    initialKey: string;
}

export interface EncryptedMessage {
    kind: "EncryptedMessage";
    payload: string;
}

export interface TextMessage {
    kind: "TextMessage";
    noise: string;
    message: string;    
}

export interface PublicKeyAuthentication {
    kind: "PublicKeyAuthentication";
    realPublicKey: string;
}

export type ClientMessage = PublishPublicKey | InitialKey | EncryptedMessage;

export type EncryptedMessagePayload = TextMessage | PublicKeyAuthentication;

export interface ClientData {
    readonly publicKey: string;
    readonly name: string;    
}

export interface Client extends ClientData {
    receive(senderClientId: string, message: ClientMessage): void;
}
