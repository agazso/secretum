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

function getHostnameAndPort(): [string, number] {
    if (window.location.href.indexOf('file') == 0) {
        return ['localhost', 8000];
    }

    console.log('getHostnameAndPort --', window.location.port);
    let port = 80;
    if (window.location.port) {
        port = Number(window.location.port);
    }
    return [window.location.hostname, port];    
}

function addToHistory(message: string, mine: boolean) {
    const history = document.getElementById('history');
    if (history) {
        let liClass = 'entry';
        let pClass = 'message';
        if (mine) {
            liClass += ' mine';
            pClass += ' mine';
        } else {
            liClass += ' your';
            pClass += ' your';
        }
        history.innerHTML += `<li class="${liClass}"><p class="${pClass}">` + message + '</p></li>';
        history.scrollTop = history.scrollHeight; 
    }
}

function sendMessage(app: ChatApplication | undefined) {
    if (!app) {
        return;
    }
    
    const message = getInputElementValueOrError('chatinput');
    if (message == '') {
        return;
    }
    
    app.sendMessage(message);
    addToHistory(message, true);
    setInputElementValueOrError('chatinput', '');
    
    // HACK
    const chatname = document.getElementById('chatname');
    if (chatname) {
        chatname.innerHTML = app.getRemoteClientNames().join();
    }
}

const [serverHostname, serverPort] = getHostnameAndPort();

setInputElementValueOrError('name', Random.getRandomString());
setInputElementValueOrError('server', serverHostname);
setInputElementValueOrError('port', serverPort.toString());

let app: ChatApplication | undefined;
const loginButton = document.getElementById('login');
if (loginButton) {
    loginButton.onclick = () => {
        Debug.prefix = getInputElementValueOrError('name');


        app = new ChatApplication({
            clientName: getInputElementValueOrError('name'),
            roomName: getInputElementValueOrError('room'),
            roomSecret: getInputElementValueOrError('secret'),
            serverHostname: serverHostname,
            serverPort: serverPort,
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
   
            const chatinput = <HTMLInputElement> document.getElementById('chatinput');
            chatinput.addEventListener("keyup", (event) => {
                event.preventDefault();
                if (event.keyCode == 13) {
                    sendMessage(app);
                }
            });

            const sendButton = document.getElementById('send');
            if (sendButton) {
                sendButton.onclick = () => {
                    sendMessage(app);
                };
            }
        }
    }
}
