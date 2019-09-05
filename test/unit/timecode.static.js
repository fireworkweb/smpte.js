import { expect } from 'chai';
import SMPTE from '../../src/index.js';
import FrameRate from "../../src/framerate.js";

describe('SMPTE', function () {
    describe('.constructor(time, frameRate=24, df=false)', function () {
        it('requires smpte timecode string or frame count as argument', function () {
            expect(() => new SMPTE()).to.not.throw(Error);
            expect(() => new SMPTE(0)).to.not.throw(Error);
            expect(() => new SMPTE({})).to.not.throw(Error);
            expect(() => new SMPTE('00:00:00:00')).to.not.throw(Error);

            expect(() => new SMPTE(-128)).to.throw(Error);
            expect(() => new SMPTE('abcde')).to.throw(Error);
            expect(() => new SMPTE(true)).to.throw(Error);
        });

        it('requires a timecode less or equal to 23:59:59:23', function () {
            expect(() => new SMPTE('23:59:59:23')).to.not.throw(Error);
            expect(() => new SMPTE('24:60:60:24')).to.throw(Error);
        });

        it('requires a boolean indicating when timecode has drop frame representation', function () {
            expect(() => new SMPTE('00:00:00;00', FrameRate.FR_29_97, false)).to.throw(Error);
            expect(() => new SMPTE('00;00;00;00', FrameRate.FR_29_97, false)).to.throw(Error);
            expect(() => new SMPTE('00:00:00;00', FrameRate.FR_29_97, true)).to.not.throw(Error);
            expect(() => new SMPTE('00;00;00;00', FrameRate.FR_29_97, true)).to.not.throw(Error);
        });

        it('supports only 23.97, 24, 25, 29.97, 30, 50, 59.94 or 60 frame rate', function () {
            expect(() => new SMPTE(128, FrameRate.FR_23_976)).to.not.throw(Error);
            expect(() => new SMPTE(128, FrameRate.FR_24)).to.not.throw(Error);
            expect(() => new SMPTE(128, FrameRate.FR_25)).to.not.throw(Error);
            expect(() => new SMPTE(128, FrameRate.FR_29_97)).to.not.throw(Error);
            expect(() => new SMPTE(128, FrameRate.FR_30)).to.not.throw(Error);
            expect(() => new SMPTE(128, FrameRate.FR_50)).to.not.throw(Error);
            expect(() => new SMPTE(128, FrameRate.FR_59_94)).to.not.throw(Error);
            expect(() => new SMPTE(128, FrameRate.FR_60)).to.not.throw(Error);
        });

        it('supports drop frame only for 29.97 frameRate', function () {
            expect(() => new SMPTE(128, FrameRate.FR_23_976, true)).to.throw(Error);
            expect(() => new SMPTE(128, FrameRate.FR_24, true)).to.throw(Error);
            expect(() => new SMPTE(128, FrameRate.FR_25, true)).to.throw(Error);
            expect(() => new SMPTE(128, FrameRate.FR_30, true)).to.throw(Error);
            expect(() => new SMPTE(128, FrameRate.FR_50, true)).to.throw(Error);
            expect(() => new SMPTE(128, FrameRate.FR_59_94, true)).to.throw(Error);
            expect(() => new SMPTE(128, FrameRate.FR_60, true)).to.throw(Error);
        });
    });

    describe('.consts', function () {
        it('should expose an object', function () {
            expect(SMPTE.consts).to.be.an('object');
        });

        it('should have all FrameRates', function () {
            expect(SMPTE.consts).to.include(FrameRate);
        });
    });

    describe('.isValidTimecode()', function () {
        const isValidTimecode = SMPTE.isValidTimecode;

        it('should accept SMPTE Timecodes', function () {
            expect(isValidTimecode('00:00:00:00')).to.be.true;
            expect(isValidTimecode('00:00:00;00', FrameRate.FR_29_97, true)).to.be.true;
            expect(isValidTimecode('00;00;00;00', FrameRate.FR_29_97, true)).to.be.true;
        });

        it('should reject non SMPTE Timecodes', function () {
            // NDF Timecodes
            expect(isValidTimecode('00:00:00;00')).to.be.false;
            expect(isValidTimecode('00:00;00:00')).to.be.false;
            expect(isValidTimecode('00;00:00:00')).to.be.false;
            expect(isValidTimecode('00:00;00;00')).to.be.false;
            expect(isValidTimecode('00;00:00;00')).to.be.false;
            expect(isValidTimecode('00;00;00:00')).to.be.false;
            expect(isValidTimecode('00;00;00;00')).to.be.false;

            // DF Timecodes
            expect(isValidTimecode('00:00:00:00', FrameRate.FR_29_97, true)).to.be.false;
            expect(isValidTimecode('00:00;00:00', FrameRate.FR_29_97, true)).to.be.false;
            expect(isValidTimecode('00:00;00;00', FrameRate.FR_29_97, true)).to.be.false;
            expect(isValidTimecode('00;00:00:00', FrameRate.FR_29_97, true)).to.be.false;
            expect(isValidTimecode('00;00:00;00', FrameRate.FR_29_97, true)).to.be.false;
            expect(isValidTimecode('00;00;00:00', FrameRate.FR_29_97, true)).to.be.false;
        });
    });

    describe('.isFramerateSupported()', function () {
        const isFramerateSupported = SMPTE.isFramerateSupported;

        it('should validate supported framerates', function () {
            expect(isFramerateSupported(FrameRate.FR_23_976)).to.be.true;
            expect(isFramerateSupported(FrameRate.FR_24)).to.be.true;
            expect(isFramerateSupported(FrameRate.FR_25)).to.be.true;
            expect(isFramerateSupported(FrameRate.FR_29_97)).to.be.true;
            expect(isFramerateSupported(FrameRate.FR_50)).to.be.true;
            expect(isFramerateSupported(FrameRate.FR_59_94)).to.be.true;
            expect(isFramerateSupported(FrameRate.FR_60)).to.be.true;
        });

        it('should validate not supported framerates', function () {
            expect(isFramerateSupported(23)).to.be.false;
            expect(isFramerateSupported(26)).to.be.false;
            expect(isFramerateSupported(1)).to.be.false;
            expect(isFramerateSupported(35)).to.be.false;
            expect(isFramerateSupported(100)).to.be.false;
        });
    });

    describe('.fromSeconds()', function () {
        const fromSeconds = SMPTE.fromSeconds;

        it('should accept seconds as number only', function () {
            expect(fromSeconds(1).frameCount).to.equal(24);
            expect(() => fromSeconds('1')).to.throw(Error);
            expect(() => fromSeconds(1, '')).to.throw(Error);
        });

        it('should properly return frame count (24 fps)', function () {
            expect(fromSeconds(0).frameCount).to.equal(0);

            expect(fromSeconds(0.021).frameCount).to.equal(0);
            expect(fromSeconds(0.039).frameCount).to.equal(0);
            expect(fromSeconds(0.042).frameCount).to.equal(1);
            expect(fromSeconds(0.084).frameCount).to.equal(2);
            expect(fromSeconds(300).frameCount).to.equal(7200);
            expect(fromSeconds(600).frameCount).to.equal(14400);
        });

        it('should properly return frame count (25 fps)', function () {
            expect(fromSeconds(0.039, FrameRate.FR_25).frameCount).to.equal(0);
            expect(fromSeconds(0.040, FrameRate.FR_25).frameCount).to.equal(1);
            expect(fromSeconds(0.079, FrameRate.FR_25).frameCount).to.equal(1);
            expect(fromSeconds(0.080, FrameRate.FR_25).frameCount).to.equal(2);
            expect(fromSeconds(300, FrameRate.FR_25).frameCount).to.equal(7500);
            expect(fromSeconds(600, FrameRate.FR_25).frameCount).to.equal(15000);
        });

        it('should properly return frame count (23.97 fps)', function () {
            expect(fromSeconds(0.041, FrameRate.FR_23_976).frameCount).to.equal(0);
            expect(fromSeconds(0.042, FrameRate.FR_23_976).frameCount).to.equal(1);
            expect(fromSeconds(0.083, FrameRate.FR_23_976).frameCount).to.equal(1);
            expect(fromSeconds(0.084, FrameRate.FR_23_976).frameCount).to.equal(2);
            expect(fromSeconds(300.376, FrameRate.FR_23_976).frameCount).to.equal(7201);
            expect(fromSeconds(600.751, FrameRate.FR_23_976).frameCount).to.equal(14403);
        });

        it('should properly return frame count (29.97 fps)', function () {
            expect(fromSeconds(0.033, FrameRate.FR_29_97).frameCount).to.equal(0);
            expect(fromSeconds(0.034, FrameRate.FR_29_97).frameCount).to.equal(1);
            expect(fromSeconds(0.066, FrameRate.FR_29_97).frameCount).to.equal(1);
            expect(fromSeconds(0.067, FrameRate.FR_29_97).frameCount).to.equal(2);
            expect(fromSeconds(300, FrameRate.FR_29_97).frameCount).to.equal(8991);
            expect(fromSeconds(600, FrameRate.FR_29_97).frameCount).to.equal(17982);
        });

        it('should properly return frame count (30 fps)', function () {
            expect(fromSeconds(0.033, FrameRate.FR_30).frameCount).to.equal(0);
            expect(fromSeconds(0.034, FrameRate.FR_30).frameCount).to.equal(1);
            expect(fromSeconds(0.066, FrameRate.FR_30).frameCount).to.equal(1);
            expect(fromSeconds(0.067, FrameRate.FR_30).frameCount).to.equal(2);
            expect(fromSeconds(300, FrameRate.FR_30).frameCount).to.equal(9000);
            expect(fromSeconds(600, FrameRate.FR_30).frameCount).to.equal(18000);
        });

        it('should properly return frame count (50 fps)', function () {
            expect(fromSeconds(0.01, FrameRate.FR_50).frameCount).to.equal(0);
            expect(fromSeconds(0.050, FrameRate.FR_50).frameCount).to.equal(2);
            expect(fromSeconds(0.066, FrameRate.FR_50).frameCount).to.equal(3);
            expect(fromSeconds(0.110, FrameRate.FR_50).frameCount).to.equal(5);
            expect(fromSeconds(300, FrameRate.FR_50).frameCount).to.equal(15000);
            expect(fromSeconds(600, FrameRate.FR_50).frameCount).to.equal(30000);
        });

        it('should properly return frame count (59.97 fps)', function () {
            expect(fromSeconds(0.01, FrameRate.FR_59_94).frameCount).to.equal(0);
            expect(fromSeconds(0.050, FrameRate.FR_59_94).frameCount).to.equal(2);
            expect(fromSeconds(0.066, FrameRate.FR_59_94).frameCount).to.equal(3);
            expect(fromSeconds(0.110, FrameRate.FR_59_94).frameCount).to.equal(6);
            expect(fromSeconds(300, FrameRate.FR_59_94).frameCount).to.equal(17982);
            expect(fromSeconds(600, FrameRate.FR_59_94).frameCount).to.equal(35964);
        });

        it('should properly return frame count (60 fps)', function () {
            expect(fromSeconds(0.01, FrameRate.FR_60).frameCount).to.equal(0);
            expect(fromSeconds(0.050, FrameRate.FR_60).frameCount).to.equal(3);
            expect(fromSeconds(0.066, FrameRate.FR_60).frameCount).to.equal(3);
            expect(fromSeconds(0.1, FrameRate.FR_60).frameCount).to.equal(6);
            expect(fromSeconds(300, FrameRate.FR_60).frameCount).to.equal(18000);
            expect(fromSeconds(600, FrameRate.FR_60).frameCount).to.equal(36000);
        });
    });
});
