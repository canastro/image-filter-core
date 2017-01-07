const sinon = require('sinon');
const expect = require('chai').expect;
const worker = require('../src/worker');

describe('worker', function() {
    it('should make a postMessage and close itself', function(done) {
        const self = {
            postMessage: sinon.stub(),
            close: sinon.stub()
        };

        window.importScripts = sinon.stub();
        window.transform = sinon.stub();

        self.addEventListener = function (type, fn) {
            const e = {
                transformationURL: 'DUMMY-URL',
                data: {
                    options: {
                        test: 'DUMMY'
                    },
                    canvasData: {
                        data: ['DUMMY']
                    },
                    length: 8,
                    index: 0
                }
            };

            fn(e);

            expect(window.importScripts.calledWith(e.transformationURL));
            expect(self.postMessage.calledWith({
                result: ['DUMMY'],
                index: 0
            }));
            expect(self.postMessage.calledOnce).to.equal(true);
            expect(self.close.calledOnce).to.equal(true);

            done();
        };

        worker(self);
    });
});
