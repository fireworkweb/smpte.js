import { padNumber } from './utils.js';

export default class SMPTE {
    constructor (time, fr = SMPTE.defaults.frameRate, df = SMPTE.defaults.dropFrame) {
        if (fr !== 29.97 && df) {
            throw new Error('Only 29.97 frame rate has drop frame support');
        }

        if (! SMPTE.isFramerateSupported(fr)) {
            throw new Error('Frame rate not supported');
        }

        this.attributes = { df, frameRate: fr, roundFr: Math.round(fr) };

        if (typeof time === 'number') {
            if (time < 0) {
                throw new Error('Negative frames not supported');
            }

            this.frameCount = Math.floor(time);

            return;
        }

        if (time instanceof Date) {
            let midnight = new Date(time.getTime());
            midnight.setHours(0, 0, 0, 0);
            time = (time - midnight) * this.attributes.frameRate;

            this.frameCount = Math.floor(time / 1000);

            return;
        }

        if (typeof time === 'object') {
            let separator = df ? ';' : ':';

            time = {
                hours: padNumber(time.hours),
                minutes: padNumber(time.minutes),
                seconds: padNumber(time.seconds),
                frames: padNumber(time.frames),
            };

            time = Object.keys(time)
                .reduce(
                    (prev, key) => prev += `${time[key] !== undefined ? time[key] : '00'}${separator}`,
                    ""
                )
                .slice(0, -1);
        }

        this.frameCount = SMPTE.frameCountFromTimecode(time, fr, df);
    }

    get frameCount () {
        return this._frameCount;
    }

    set frameCount (fc) {
        this._frameCount = fc;

        let _fc = this.attributes.df ? this.dropFrame() : this._frameCount;

        this._hours = Math.floor(_fc / (this.attributes.roundFr * 3600)) % 24;
        this._minutes = Math.floor(_fc / (this.attributes.roundFr * 60)) % 60;
        this._seconds = Math.floor(_fc / this.attributes.roundFr) % 60;
        this._frames = _fc % this.attributes.roundFr;
    }

    get hours () {
        return this._hours;
    }

    set hours (value) {
        this._hours = value;

        this._frameCount = SMPTE.frameCountFromTimecode(
            this.toString(),
            this.attributes.frameRate,
            this.attributes.df,
        );
    }

    get minutes () {
        return this._minutes;
    }

    set minutes (value) {
        this._minutes = value;

        this._updateFramecount();
    }

    get seconds () {
        return this._seconds;
    }

    set seconds (value) {
        this._seconds = value;

        this._updateFramecount();
    }

    get frames () {
        return this._frames;
    }

    set frames (value) {
        this._frames = value;

        this._updateFramecount();
    }

    _updateFramecount () {
        this._frameCount = SMPTE.frameCountFromTimecode(
            this.toString(),
            this.attributes.frameRate,
            this.attributes.df,
        );
    }

    get durationInSeconds () {
        return this.frameCount / this.attributes.frameRate;
    }

    /**
     * Adds a number of seconds to the current timecode object
     * @param {Number} seconds Number in seconds
     */
    addFromSeconds (seconds) {
        let tm = SMPTE.fromSeconds(seconds, this.attributes.frameRate, this.attributes.df);

        return this.add(tm);
    }

    /**
     * Substracts a number of seconds from the current timecode object
     * @param {Number} seconds Number in seconds
     */
    subtractFromSeconds (seconds) {
        let tc = SMPTE.fromSeconds(seconds, this.attributes.frameRate, this.attributes.df);

        return this.subtract(tc);
    }

    /**
     * Adds a timecode or a frame count to the current SMPTE object
     * @param {Number|String|Object} time Frame count, SMPTE object or string to be added
     */
    add (time, operation = 1) {
        if (!(time instanceof SMPTE)) {
            time = new SMPTE(time, this.attributes.frameRate, this.attributes.df);
        } else if (time.attributes.frameRate !== this.attributes.frameRate) {
            throw new Error('Different frame rate timecodes can not be added');
        }

        this.frameCount += (time.frameCount * operation);

        return this;
    }

    /**
     * Substracts a timecode or a frame count from the current SMPTE object
     * @param {Number|String|Object} time Frame count, SMPTE object or string to be subtracted
     */
    subtract (time) {
        return this.frameCount === 0 ? this : this.add(time, -1);
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
        let validTm = SMPTE.isTimecodeFormatValid(format, df);
        let separator = df ? ';' : ':';

        let separators = format && validTm
            ? format.match(/:|;/g)
            : [
                separator,
                separator,
                separator,
            ];

        if (format !== undefined && !validTm) {
            throw new Error('Invalid timecode string');
        }

        return padNumber(this.hours) + separators[0]
            + padNumber(this.minutes) + separators[1]
            + padNumber(this.seconds) + separators[2]
            + padNumber(this.frames);
    }

    /**
     * Converts a SMPTE object to a date object
     */
    toDate () {
        let tcInMs = (this.frameCount / this.attributes.frameRate) * 1000;
        let date = new Date();
        date.setHours(0, 0, 0, 0);

        return new Date(date.valueOf() + tcInMs);
    }
}
