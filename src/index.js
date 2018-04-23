import {
    padNumber,
    frameRates,
    errors,
} from './helpers.js';

export default class Timecode {
    constructor (time, fr = 24, df = false) {
        if (fr !== 29.97 && df) {
            throw new Error('Only 29.97 frame rate has drop frame support');
        }

        this.frameRate = fr;
        this.attributes = { df, roundFr: Math.round(fr) };

        if (typeof time === 'number') {
            if (time < 0) {
                throw new Error('Negative frames not supported');
            }

            this.frameCount = Math.round(time);
        } else {
            this.frameCount = Timecode.frameCountFromTimecode(time, fr, df);
        }
    }

    set frameCount (fc) {
        this._frameCount = fc;

        let _fc = this.attributes.df ? this.dropFrame() : this._frameCount;

        this.hours = Math.floor(_fc / (this.attributes.roundFr * 3600)) % 24;
        this.minutes = Math.floor(_fc / (this.attributes.roundFr * 60)) % 60;
        this.seconds = Math.floor(_fc / this.attributes.roundFr) % 60;
        this.frames = _fc % this.attributes.roundFr;
    }

    get frameCount () {
        return this._frameCount;
    }

    addFromSeconds (seconds) {
        this.add(Timecode.timecodeFromSeconds(seconds, this.frameRate, this.attributes.df));
    }

    subtractFromSeconds (seconds) {
        let tc = Timecode.timecodeFromSeconds(seconds, this.frameRate, this.attributes.df);
        this.add(-tc.frameCount);
    }

    add (time) {
        if (typeof time === 'number') {
            this.frameCount += time;
            return this;
        }

        if (!(time instanceof Timecode)) {
            time = new Timecode(time, this.frameRate, this.attributes.df);
        } else if (time.frameRate !== this.frameRate) {
            throw new Error('Different frame rate timecodes can not be added');
        }

        // Prevent from add 2 unnecessary frame when frames are already dropped
        if (this.attributes.df && this.frames - 2 >= 0 && time.frames - 2 >= 0) {
            this.frameCount -= 2;
        }

        this.frameCount += time.frameCount;

        return this;
    }

    subtract (time) {
        if (typeof time === 'number') {
            if (time >= this.frameCount) {
                this.frameCount = 0;
                return this;
            }
            return this.add(-time);
        }

        let tc;

        if (!(time instanceof Timecode)) {
            tc = new Timecode(time, this.frameRate, this.attributes.df);
        } else if (time.frameRate !== this.frameRate) {
            throw new Error('Different frame rate timecodes can not be added');
        } else if (Timecode.isValidTimecode(time, this.frameRate, this.attributes.df)) {
            let subtract = Timecode.frameCountFromTimecode(time, this.frameRate, this.attributes.df);
            this.add(-subtract);
        } else if (time instanceof Timecode) {
            this.add(-time.frameCount);
        } else {
            throw new Error(errors.invalidParam);
        }
    }

    /**
     * Calculate frame count based on drop frame concept
     */
    dropFrame () {
        let _fc = this._frameCount;
        let d = Math.floor(_fc / 17982);
        let m = _fc % 17982;

        if (m < 2) {
            m += 2;
        }

        _fc += (18 * d) + (2 * (Math.floor((m - 2) / 1798)));

        return _fc;
    }

    /**
     * Returns a string with the SMPTE timecode representation
     * @param {String} format Format of the Timecode string to be returned
     */
    toString (format = undefined) {
        let df = this.attributes.df;
        let validTm = Timecode.isTimecodeFormatValid(format, df);

        let separators = format && validTm
            ? format.match(/:|;/g)
            : [
                ':',
                ':',
                df ? ';' : ':',
            ];

        if (format !== undefined && !validTm) {
            throw new Error('Invalid timecode string');
        }

        return padNumber(this.hours) + separators[0]
            + padNumber(this.minutes) + separators[1]
            + padNumber(this.seconds) + separators[2]
            + padNumber(this.frames);
    }

    static isTimecodeFormatValid (timecode, df) {
        if (typeof timecode !== 'string') {
            return false;
        }

        if (!df && timecode.includes(';')) {
            return false;
        }

        if (df && timecode[8] !== ';') {
            return false;
        }

        return /^(?:[0-1][0-9]|2[0-3])(:|;)(?:[0-5][0-9])\1(?:[0-5][0-9])(:|;)(?:[0-2][0-9])$/.test(timecode);
    }

    /**
     * Checks if a timecode is valid according to SMPTE standard
     * @param {String} timecode Timecode to be evaluated
     * @param {Boolean} df Boolean indicating if timecode is drop frame
     */
    static isValidTimecode (timecode, fr = undefined, df) {
        if (!Timecode.isTimecodeFormatValid(timecode, df)) {
            return false;
        }

        if (!frameRates.includes(fr)) {
            return false;
        }

        let frames = parseInt(timecode.slice(9, 11));
        let minutes = parseInt(timecode.slice(3, 5));

        if (typeof fr === 'number' && parseInt(frames) >= Math.round(fr)) {
            return false;
        }

        if (df && (minutes % 10) !== 0 && frames < 2) {
            return false;
        }

        return true;
    }

    static frameCountFromTimecode (timecode, fr = 24, df = false) {
        if (!Timecode.isValidTimecode(timecode, fr, df)) {
            throw new Error('Invalid timecode');
        }

        let roundFr = Math.round(fr);
        let parts = timecode.split(/:|;/).map(part => parseInt(part));
        let _fc = (roundFr * 60 * 60 * parts[0])
            + (roundFr * 60 * parts[1])
            + (roundFr * parts[2])
            + parts[3];

        if (df) {
            let totalMinutes = (60 * parts[0]) + parts[1];

            return _fc - (2 * (totalMinutes - Math.floor(totalMinutes / 10)));
        }

        return _fc;
    }

    static timecodeFromSeconds (seconds, fr = 24, df = false) {
        if (!frameRates.includes(fr)) {
            throw new Error('Frame rate not supported');
        }

        return new Timecode(seconds * fr, fr, df);
    }
}
