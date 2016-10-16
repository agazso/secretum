export class Debug {
    static isDebug: boolean = false;
    static withCaller: boolean = true;
    static prefix: string = '';
    
    static setDebug(isDebug: boolean) {
        this.isDebug = isDebug;
    }

    static log(...args: any[]) {
        if (this.isDebug) {
            if (this.withCaller) {
                args.unshift(Debug.getCallerNameOf(3) + ':');
            }
            if (Debug.prefix != '') {
                args.unshift(Debug.prefix);
            }
            console.log.apply(console, args);
        }
        
    }

    static getCallerName(): string {
        return Debug.getCallerNameOf(3);
    }

    static getCallerNameOf(depth: number) {
        const error = new Error();
        if (error && error.stack) {
            const caller = error.stack.split('\n')[depth].replace(/.*at ([\w\d.<>]+).*/, '$1');
            return caller;
        }

        return '';
    }
} 