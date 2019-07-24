import { expect } from 'chai';
import FrameRate from '../../src/framerate.js';

describe('FrameRate', function () {
    it('returns the right value for its constants', function () {
        expect(FrameRate.FR_23_976).to.equal(24000 / 1001);
        expect(FrameRate.FR_24).to.equal(24);
        expect(FrameRate.FR_25).to.equal(25);
        expect(FrameRate.FR_29_97).to.equal(30000 / 1001);
        expect(FrameRate.FR_30).to.equal(30);
        expect(FrameRate.FR_50).to.equal(50);
        expect(FrameRate.FR_59_94).to.equal(60000 / 1001);
        expect(FrameRate.FR_60).to.equal(60);
    });
});
