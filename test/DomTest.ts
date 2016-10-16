import { expect } from 'chai';
import * as sinon from 'sinon';
import {dom} from '../src/Dom';

declare var document:any;

describe('Dom', () => {
    beforeEach(() => {
        (<any>global).HTMLElement = typeof HTMLElement === 'undefined' ? function(){} : HTMLElement;
        const mockDocument = { getElementById(id:string): HTMLElement|null { return null; }};
        (<any>global).document = <any>mockDocument;
    });


    it('should be called if non-null', (done) => {
        const getElementByIdStub = sinon.stub(document, 'getElementById');
        const chatElement = {};
        
        getElementByIdStub.withArgs('chat').returns(chatElement);

        dom('chat', (chat) => {
            expect(chat).to.be.equal(chatElement);
            done();
        });
    });

    it('should not be called if null', () => {
        const getElementByIdStub = sinon.stub(document, 'getElementById');
        const chatElement = null;
        
        getElementByIdStub.withArgs('chat').returns(chatElement);

        const argumentStub = sinon.spy();
        dom('chat', argumentStub);

        expect(argumentStub.callCount).to.be.equal(0);
    });
});
