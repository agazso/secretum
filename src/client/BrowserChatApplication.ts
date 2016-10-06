import {ChatApplication} from './ChatApplication';
import {Random} from '../Random';
import {Debug} from '../Debug';

Debug.setDebug(true);

function getInputElementValueOrError(elementName: string): string {
    const e = <HTMLInputElement>document.getElementById(elementName);
    if (!e) throw new Error('cannot find ' + elementName);
    return e.value;
}

function setInputElementValueOrError(elementName: string, value: string) {
    const e = <HTMLInputElement>document.getElementById(elementName);
    if (!e) throw new Error('cannot find ' + elementName);
    e.value = value;
}

setInputElementValueOrError('name', Random.getRandomString());

let app: ChatApplication | undefined;
const loginButton = document.getElementById('login');
if (loginButton) {
    loginButton.onclick = () => {
        app = new ChatApplication({
            clientName: getInputElementValueOrError('name'),
            roomName: getInputElementValueOrError('room'),
            roomSecret: getInputElementValueOrError('secret'),
            serverHostname: 'localhost',
            serverPort: 8000,
            serverPrefix: '/chat'
        });

        // app.onMessage = () => {

        // };

        const loginform = document.getElementById('loginform');
        if (loginform) {
            loginform.style.display = 'none';
        }

        const chat = document.getElementById('chat');
        if (chat) {
            chat.style.display = 'block';
            const sendButton = document.getElementById('send');
            if (sendButton) {
                sendButton.onclick = () => {
                    const message = getInputElementValueOrError('chatinput');
                    if (app) {
                        app.sendMessage(message);
                    }
                    const chatinput = document.getElementById('chatinput');
                    if (chatinput) {
                        chatinput.innerHTML = '';
                    }
                };
            }
        }
    }
}
