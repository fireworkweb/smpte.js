import { expect } from 'chai';
import SMPTE from '../../src/index.js';

describe('SMPTE', function () {
    describe('.constructor(time, frameRate=24, df=false)', function () {
        it('requires smpte timecode string or frame count as argument', function () {
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
            expect(() => new SMPTE('00:00:00;00', 29.97, false)).to.throw(Error);
            expect(() => new SMPTE('00;00;00;00', 29.97, false)).to.throw(Error);
            expect(() => new SMPTE('00:00:00;00', 29.97, true)).to.not.throw(Error);
            expect(() => new SMPTE('00;00;00;00', 29.97, true)).to.not.throw(Error);
        });

        it('supports only 23.976, 24, 25, 29.97 or 30 frame rate', function () {
            expect(() => new SMPTE(128, 59.94)).to.throw(Error);
            expect(() => new SMPTE(128, 23.976)).to.not.throw(Error);
            expect(() => new SMPTE(128, 24)).to.not.throw(Error);
            expect(() => new SMPTE(128, 25)).to.not.throw(Error);
            expect(() => new SMPTE(128, 29.97)).to.not.throw(Error);
            expect(() => new SMPTE(128, 30)).to.not.throw(Error);
        });

        it('supports drop frame only for 29.97 frameRate', function () {
            expect(() => new SMPTE(128, 23.976, true)).to.throw(Error);
            expect(() => new SMPTE(128, 24, true)).to.throw(Error);
            expect(() => new SMPTE(128, 25, true)).to.throw(Error);
            expect(() => new SMPTE(128, 30, true)).to.throw(Error);
            expect(() => new SMPTE(128, 29.97, true)).to.not.throw(Error);
        });
    });

    describe('.isValidTimecode()', function () {
        const isValidTimecode = SMPTE.isValidTimecode;

        it('should accept SMPTE Timecodes', function () {
            expect(isValidTimecode('00:00:00:00')).to.be.true;
            expect(isValidTimecode('00:00:00;00', 29.97, true)).to.be.true;
            expect(isValidTimecode('00;00;00;00', 29.97, true)).to.be.true;
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
            expect(isValidTimecode('00:00:00:00', 29.97, true)).to.be.false;
            expect(isValidTimecode('00:00;00:00', 29.97, true)).to.be.false;
            expect(isValidTimecode('00:00;00;00', 29.97, true)).to.be.false;
            expect(isValidTimecode('00;00:00:00', 29.97, true)).to.be.false;
            expect(isValidTimecode('00;00:00;00', 29.97, true)).to.be.false;
            expect(isValidTimecode('00;00;00:00', 29.97, true)).to.be.false;
        });
    });

    describe('.isFramerateSupported()', function () {
        const isFramerateSupported = SMPTE.isFramerateSupported;

        it('should validate supported framerates', function () {
            expect(isFramerateSupported(23.976)).to.be.true;
            expect(isFramerateSupported(24)).to.be.true;
            expect(isFramerateSupported(25)).to.be.true;
            expect(isFramerateSupported(29.97)).to.be.true;
            expect(isFramerateSupported(30)).to.be.true;
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

        it('should properly return frame count from milliseconds', function () {
            expect(fromSeconds(0).frameCount).to.equal(0);
            expect(fromSeconds(0.042).frameCount).to.equal(1);
            expect(fromSeconds(0.084).frameCount).to.equal(2);
            expect(fromSeconds(0.021).frameCount).to.equal(0);
            expect(fromSeconds(0.039).frameCount).to.equal(0);
            expect(fromSeconds(0.039, 25).frameCount).to.equal(0);
            expect(fromSeconds(0.040, 25).frameCount).to.equal(1);
            expect(fromSeconds(0.079, 25).frameCount).to.equal(1);
            expect(fromSeconds(0.080, 25).frameCount).to.equal(2);
        });
    });
});
