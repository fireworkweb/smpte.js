import { expect } from 'chai';
import SMPTE from '../../src/index.js';

describe('SMPTE', function () {
    describe('.constructor(time, frameRate=24, df=false)', function () {
        it('requires smpte timecode string or frame count as argument', function () {
            expect(() => new SMPTE(0)).to.not.throw(Error);
            expect(() => new SMPTE('00:00:00:00')).to.not.throw(Error);

            expect(() => new SMPTE(-128)).to.throw(Error);
            expect(() => new SMPTE('abcde')).to.throw(Error);
            expect(() => new SMPTE(true)).to.throw(Error);
            expect(() => new SMPTE({})).to.throw(Error);
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
            expect(isValidTimecode('00:00:00:00'))
                .to.be.true;
            expect(isValidTimecode('00:00:00;00', 29.97, true))
                .to.be.true;
            expect(isValidTimecode('00;00;00;00', 29.97, true))
                .to.be.true;
        });

        it('should reject non SMPTE Timecodes', function () {
            // NDF Timecodes
            expect(isValidTimecode('00:00:00;00'))
                .to.be.false;
            expect(isValidTimecode('00:00;00:00'))
                .to.be.false;
            expect(isValidTimecode('00;00:00:00'))
                .to.be.false;
            expect(isValidTimecode('00:00;00;00'))
                .to.be.false;
            expect(isValidTimecode('00;00:00;00'))
                .to.be.false;
            expect(isValidTimecode('00;00;00:00'))
                .to.be.false;
            expect(isValidTimecode('00;00;00;00'))
                .to.be.false;

            // DF Timecodes
            expect(isValidTimecode('00:00:00:00', 29.97, true))
                .to.be.false;
            expect(isValidTimecode('00:00;00:00', 29.97, true))
                .to.be.false;
            expect(isValidTimecode('00:00;00;00', 29.97, true))
                .to.be.false;
            expect(isValidTimecode('00;00:00:00', 29.97, true))
                .to.be.false;
            expect(isValidTimecode('00;00:00;00', 29.97, true))
                .to.be.false;
            expect(isValidTimecode('00;00;00:00', 29.97, true))
                .to.be.false;
        });
    });
});
