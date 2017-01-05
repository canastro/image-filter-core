const expect = require('chai').expect;
const sinon = require('sinon');
const proxyquire = require('proxyquireify')(require);

describe('utils', function () {
    var sandbox;
    before(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('#getCanvas()', function () {
        it('should return a canvas of 100 x 100', function () {
            const utils = require('../src/index');
            const element = utils.getCanvas(100, 100);

            expect(element.tagName).to.equal('CANVAS');
            expect(element.height).to.equal(100);
            expect(element.width).to.equal(100);
        });
    });

    describe('#convertImageDataToCanvasURL()', function () {
        it('should create canvas and call toDataURL', function () {
            const utils = require('../src/index');
            const expectedResult = 'TEST';

            const ctx = {
                putImageData: sandbox.stub()
            };

            const canvas = {
                getContext: sandbox.stub().returns(ctx),
                toDataURL: sandbox.stub().returns(expectedResult)
            };

            sandbox.stub(document, 'createElement').returns(canvas);

            const imageData = {
                width: 100,
                height: 150
            };

            const result = utils.convertImageDataToCanvasURL(imageData);

            expect(document.createElement.calledWith('canvas')).to.equal(true);
            expect(canvas.getContext.calledWith('2d')).to.equal(true);
            expect(canvas.width).to.equal(imageData.width);
            expect(canvas.height).to.equal(imageData.height);
            expect(ctx.putImageData.calledWith(imageData, 0, 0)).to.equal(true);
            expect(result).to.equal(expectedResult);
        });
    });

    describe('#apply()', function () {
        it('should', function (done) {
            var eventListenerCallback;
            const expectedResult = 'TEST';

            const ctx = {
                putImageData: sandbox.stub(),
                getImageData: sandbox.stub()
            };

            const canvas = {
                getContext: sandbox.stub().returns(ctx),
                toDataURL: sandbox.stub().returns(expectedResult)
            };

            const worker = {
                addEventListener: function addEventListener(evt, fn) {
                    eventListenerCallback = fn;
                },
                postMessage: sandbox.stub()
            };

            const utils = proxyquire('../src/index', {
                'webworkify': function () { return worker; }
            });

            const nWorkers = 4;
            const len = canvas.width * canvas.height * 4;
            const segmentLength = len / nWorkers; // This is the length of array sent to the worker
            const blockSize = canvas.height / nWorkers; // Height of the picture chunck for every worker

            const result = utils.apply(
                'DUMMY',
                nWorkers,
                canvas,
                ctx,
                {},
                blockSize,
                segmentLength
            );

            const evt = { data: { result: 'DUMMY', index: 1 } };
            eventListenerCallback(evt);
            eventListenerCallback(evt);
            eventListenerCallback(evt);
            eventListenerCallback(evt);

            result.then(function () {
                // One for each worker and one for the final result
                expect(ctx.getImageData.callCount).to.equal(5);

                // One for each worker
                expect(ctx.putImageData.callCount).to.equal(4);
                expect(worker.postMessage.callCount).to.equal(4);
                done();
            });
        });
    });
});
