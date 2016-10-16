import {ChatApplication} from './ChatApplication';
import {Random} from '../Random';
import {Debug} from '../Debug';
import {Crypto} from '../Crypto';
import {dom} from '../Dom';

Debug.setDebug(true);
Debug.withCaller = false;

function isMobile() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||(<any>window).opera);
    return check;
};

function disableAppleMobileStatusBarIfNotStandalone() {
    if (!(<any>window.navigator).standalone) {
        dom('apple-mobile-status-bar', (statusBar) => {
            statusBar.style.display = 'none';
        });

        dom('head', (head) => {
            head.style.marginTop = '0';
        });
    } 
}

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

function setElementInnerHTMLOrError<T extends HTMLElement>(elementName: string, innerHTML: string) {
    const e = <T>document.getElementById(elementName);
    if (!e) throw new Error('cannot find ' + elementName);
    e.innerHTML = innerHTML;
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

function addToHistory(innerHTML: string) {
    const history = document.getElementById('history');
    if (history) {
        history.innerHTML += innerHTML;
        history.scrollTop = history.scrollHeight; 
    }
}

function addMessageToHistory(message: string, mine: boolean) {
    let liClass = 'entry';
    let pClass = 'message';
    if (mine) {
        liClass += ' mine';
        pClass += ' mine';
    } else {
        liClass += ' your';
        pClass += ' your';
    }
    const innerHTML = `<li class="${liClass}"><p class="${pClass}">` + message + '</p></li>';
    addToHistory(innerHTML);
}

function addStatusMessageToHistory(message: string) {
    const innerHTML = `<li class="entry"><p class="status">` + message + '</p></li>';
    addToHistory(innerHTML);
}

function sendMessage(app: ChatApplication) {
    const message = getInputElementValueOrError('chatinput');
    if (message == '') {
        return;
    }
    
    app.sendMessage(message);
    addMessageToHistory(message, true);
    setInputElementValueOrError('chatinput', '');
}

function tryGetRemoteClientNameById(app: ChatApplication, clientId: string): string {
    try {
        return app.getRemoteClientNameById(clientId);
    } catch (e) {
        return clientId;
    }
}

function getRoomApplication(rooms: { [name: string]: ChatApplication}): ChatApplication {
    const clientName = getInputElementValueOrError('name');
    const room = getInputElementValueOrError('room');
    const roomSecret = getInputElementValueOrError('secret');
    const roomName = Crypto.hmac(roomSecret, room);  

    const existingApp = rooms[roomName];
    if (existingApp) {
        return existingApp;
    }

    const newApp = new ChatApplication({
            clientName: clientName,
            roomName: roomName,
            roomSecret: roomSecret,
            serverHostname: serverHostname,
            serverPort: serverPort,
            serverPrefix: '/chat',
            eventHandler: {
                onMessage: (clientId, msg) => {
                    if (lastMessageClientId != clientId) {
                        addStatusMessageToHistory(tryGetRemoteClientNameById(newApp, clientId));
                        lastMessageClientId = clientId;
                    }
                    addMessageToHistory(msg, false);
                },
                onClientConnected: (clientId) => {
                    addStatusMessageToHistory(`${tryGetRemoteClientNameById(newApp, clientId)} joined`);
                },
                onClientDisconnected: (clientId) => {
                    addStatusMessageToHistory(`${tryGetRemoteClientNameById(newApp, clientId)} left the conversation`);
                }
            }
        });

    rooms[roomName] = newApp;
    return newApp;
}

// App starts here ////////////////////////////////////////////////////////////////////////////////////

const [serverHostname, serverPort] = getHostnameAndPort();

setInputElementValueOrError('name', Random.getRandomHexStringWithBitLength(64));
setInputElementValueOrError('server', serverHostname);
setInputElementValueOrError('port', serverPort.toString());

if (window.location.search.indexOf('debug') != -1) {
    const server = document.getElementById('server');
    if (server) {
        server.style.display = 'block';
    }
    const port = document.getElementById('port');
    if (port) {
        port.style.display = 'block';
    }
}

disableAppleMobileStatusBarIfNotStandalone();
// disable pinch zoom on mobile
document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});

dom('backbutton', (backButton) => {
    backButton.onclick = () => {
        dom('chat', (chat) => {
            chat.style.transition = '0.4s';
            chat.style.left = '100vw';            
        });
        dom('loginform', (loginform) => {
            loginform.style.transition = 'opacity 0.9s linear';
            loginform.style.opacity = '1';
        });
    };
});


let rooms: { [name: string]: ChatApplication} = {};
let lastMessageClientId = '';
const loginButton = document.getElementById('login');
if (loginButton) {
    loginButton.onclick = () => {
        Debug.prefix = getInputElementValueOrError('name');

        setElementInnerHTMLOrError('chatname', getInputElementValueOrError('room'));

        const app = getRoomApplication(rooms); 
        dom('loginform', (loginform) => {
            loginform.style.transition = 'none';
            loginform.style.opacity = '0';
        });

        dom('chat', (chat) => {
            chat.style.display = 'block';
            chat.style.transition = '0.4s';
            chat.style.left = '0';
   
            if (!isMobile()) {
                const chatinput = <HTMLInputElement> document.getElementById('chatinput');
                dom<HTMLInputElement>('chatinput', (chatinput) => {
                    chatinput.addEventListener("keyup", (event) => {
                        event.preventDefault();
                        if (event.keyCode == 13) {
                            sendMessage(app);
                        }
                    });
                });
            }

            dom('send', (sendButton) => {
                sendButton.onclick = () => {
                    sendMessage(app);
                };
            });
        });
    }
}
