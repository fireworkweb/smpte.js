function padNumber (number) {
    if (typeof number !== 'number') {
        return undefined;
    }

    return number.toString().padStart(2, '0');
}

const frameRates = [
    23.976,
    24,
    25,
    29.97,
    30,
];

export default class SMPTE {
    constructor (time, fr = 24, df = false) {
        if (fr !== 29.97 && df) {
            throw new Error('Only 29.97 frame rate has drop frame support');
        }

        if (! frameRates.includes(fr)) {
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
        let tm = SMPTE.timecodeFromSeconds(seconds, this.attributes.frameRate, this.attributes.df);

        return this.add(tm);
    }

    /**
     * Substracts a number of seconds from the current timecode object
     * @param {Number} seconds Number in seconds
     */
    subtractFromSeconds (seconds) {
        let tc = SMPTE.timecodeFromSeconds(seconds, this.attributes.frameRate, this.attributes.df);

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

    /**
     * Checks if a timecode string is in a valid format
     * @param {String} timecode Timecode string to be evaluated
     * @param {Boolean} df Boolean indicating if is drop frame representation
     */
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
     * @param {Number} fr Frame rate number
     * @param {Boolean} df Boolean indicating if timecode is drop frame
     */
    static isValidTimecode (timecode, fr = undefined, df) {
        if (!SMPTE.isTimecodeFormatValid(timecode, df)) {
            return false;
        }

        let parts = timecode.split(/:|;/).map(part => parseInt(part));

        if (typeof fr === 'number' && parts[3] >= Math.round(fr)) {
            return false;
        }

        if (df && (parts[1] % 10) !== 0 && parts[3] < 2 && parts[2] === 0) {
            return false;
        }

        return true;
    }

    /**
     * Gets the frame count given a timecode string
     * @param {String} timecode Timecode string
     * @param {Number} fr Frame rate number
     * @param {Boolean} df Boolean indicating if timecode is drop frame
     */
    static frameCountFromTimecode (timecode, fr = 29.97, df = false) {
        if (!SMPTE.isValidTimecode(timecode, fr, df)) {
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

    /**
     * Creates a SMPTE object given a number in seconds
     * @param {Number} seconds Seconds number
     * @param {Number} fr Frame rate number
     * @param {Boolean} df Boolean indicating if timecode is drop frame
     */
    static timecodeFromSeconds (seconds, fr = 24, df = false) {
        let _fc = seconds;

        _fc *= df ? fr : Math.round(fr);

        return new SMPTE(Math.round(_fc), fr, df);
    }
}
