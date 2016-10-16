export class WithElement<T extends HTMLElement> {
    constructor(private element: HTMLElement | null) {

    }

    then(withElement?: (element: T) => void): WithElement<T> {
        if (this.element instanceof HTMLElement && withElement) {
            withElement(<T>this.element);
        }
        return this;
    }
}

export function dom<T extends HTMLElement>(idElem: string | WithElement<T>, withElement?: (element: T) => void): WithElement<T> {
    if (typeof idElem === 'string') {
        const elem = <T>document.getElementById(idElem);
        if (elem && withElement) {
            withElement(elem);
        }
        return new WithElement(elem);
    } else {
        return idElem.then(withElement);
    }
}

