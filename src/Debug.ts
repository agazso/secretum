export class Debug {
    static isDebug: boolean = false;
    
    static setDebug(isDebug: boolean) {
        this.isDebug = isDebug;
    }

    static log(...args: any[]) {
        if (this.isDebug) {
            args.unshift(Debug.getCallerNameOf(3) + ':');
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