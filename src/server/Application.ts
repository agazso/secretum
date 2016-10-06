import {SockJSServerTransport} from '../SockJSServerTransport';
import {Debug} from '../Debug';

Debug.setDebug(true);

const prefix = '/chat';
const port = 8000;
const app = new SockJSServerTransport(port, prefix);
app.start();