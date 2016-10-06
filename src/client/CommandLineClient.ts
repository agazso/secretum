import {ChatApplication} from './ChatApplication';

class CommandLineClient {
    constructor() {
        if (process.argv.length < 6) {
            const usage = "Usage: ";
            console.log(usage);
            throw new Error('');
        }

        const options = {
            clientName: process.argv[1],
            roomName: process.argv[2],
            roomSecret: process.argv[3],
            serverHostname: process.argv[4],
            serverPort: parseInt(process.argv[5], 10),
            serverPrefix: process.argv[6]
        }

        const app = new ChatApplication(options);
    }
}

new CommandLineClient();
