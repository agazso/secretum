import {SockJSServerTransport} from '../SockJSServerTransport';

const prefix = '/chat';
const port = 8000;
const app = new SockJSServerTransport(port, prefix);
app.start();