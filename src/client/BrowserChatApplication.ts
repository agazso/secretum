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

function addToHistory(message: string, byMe: boolean) {
    const history = document.getElementById('history');
    if (history) {
        const divClass = byMe ? 'message mine' : 'message';
        history.innerHTML += '<li class="' + divClass + '"><p>' + message + '</p></li>'; 
    }
}

setInputElementValueOrError('name', Random.getRandomString());


let app: ChatApplication | undefined;
const loginButton = document.getElementById('login');
if (loginButton) {
    loginButton.onclick = () => {
        Debug.prefix = getInputElementValueOrError('name');

        app = new ChatApplication({
            clientName: getInputElementValueOrError('name'),
            roomName: getInputElementValueOrError('room'),
            roomSecret: getInputElementValueOrError('secret'),
            serverHostname: 'localhost',
            serverPort: 8000,
            serverPrefix: '/chat',
            onMessage: (msg) => {
                addToHistory(msg, false);
            }
        });

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
                    addToHistory(message, true);
                    setInputElementValueOrError('chatinput', '');
                };
            }
        }
    }
}
