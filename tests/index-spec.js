import { expect } from 'chai';
import * as utils from '../src/index';

describe('utils', function () {

    context('#getCanvas', () => {
        it('should return a canvas of 100 x 100', function () {
            const element = utils.getCanvas(100, 100);

            expect(element.tagName).to.equal('CANVAS');
            expect(element.height).to.equal(100);
            expect(element.width).to.equal(100);
        });
    });
});
