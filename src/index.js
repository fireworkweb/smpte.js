import SMPTE from './core.js';
import defaults from './defaults.js';
import FrameRate from './framerate.js';

const supportedFRs = Object.freeze([
    FrameRate.FR_23_976,
    FrameRate.FR_24,
    FrameRate.FR_25,
    FrameRate.FR_29_97,
    FrameRate.FR_30,
    FrameRate.FR_50,
    FrameRate.FR_59_94,
    FrameRate.FR_60,
]);

/**
 * Creates a SMPTE object given a frame number or a date object
 * @param {Number|Date} type Frame number or date object
 * @param {Number} fr Frame rate number
 * @param {Boolean} df Boolean indicating if timecode is drop frame
 */
function instantiate (type, fr = SMPTE.defaults.frameRate, df = SMPTE.defaults.dropFrame) {
    return new SMPTE(type, fr, df);
}

/**
 * Creates a SMPTE object given a Timecode string
 */
SMPTE.fromTimecode = instantiate;

/**
 * Creates a SMPTE object given a frame number
 */
SMPTE.fromFrames = instantiate;

/**
 * Creates a SMPTE object given a date object
 */
SMPTE.fromDate = instantiate;

/**
 * Creates a SMPTE object given a number in seconds
 * @param {Number} seconds Seconds number
 * @param {Number} fr Frame rate number
 * @param {Boolean} df Boolean indicating if timecode is drop frame
 */
SMPTE.fromSeconds = function (seconds, fr = SMPTE.defaults.frameRate, df = SMPTE.defaults.dropFrame) {
    if (typeof seconds !== 'number') {
        throw new Error('First argument must be a number');
    }

    if (! SMPTE.isFramerateSupported(fr)) {
        throw new Error('Frame rate not supported');
    }

    return new SMPTE(Math.trunc(seconds * fr), fr, df);
};

/**
 * Creates a SMPTE object given each part of the timecode
 * @param {Number} hours Number indicating hours
 * @param {Number} minutes Number indicating minutes
 * @param {Number} seconds Number indicating seconds
 * @param {Number} frames Number indicating frames
 * @param {Number} fr Frame rate number
 * @param {Boolean} df Boolean indicating if timecode is drop frame
 */
SMPTE.fromParts = function (
    hours = 0,
    minutes = 0,
    seconds = 0,
    frames = 0,
    fr = SMPTE.defaults.frameRate,
    df = SMPTE.defaults.dropFrame
) {
    return new SMPTE({hours, minutes, seconds, frames}, fr, df);
};

/**
 * Creates a SMPTE object given an array of parts of the timecode
 * @param {Array} timecode Array containing parts of the timecode
 * @param {Number} fr Frame rate number
 * @param {Boolean} df Boolean indicating if timecode is drop frame
 */
SMPTE.fromArray = function (
    timecode,
    fr = SMPTE.defaults.frameRate,
    df = SMPTE.defaults.dropFrame
) {
    if (! Array.isArray(timecode)) {
        throw new Error('First argument must be an array');
    }

    const strTimecode = timecode
        .map(part => part.toString().padStart(2, '0'))
        .join(df ? ';' : ':');

    if (! SMPTE.isTimecodeFormatValid(strTimecode)) {
        throw new Error('Invalid timecode');
    }

    const [
        hours,
        minutes,
        seconds,
        frames,
    ] = timecode;

    return new SMPTE({hours, minutes, seconds, frames}, fr, df);
};

/**
 * Checks if a timecode string is in a valid format
 * @param {String} timecode Timecode string to be evaluated
 * @param {Boolean} df Boolean indicating if is drop frame representation
 */
SMPTE.isTimecodeFormatValid = function (timecode, df) {
    if (typeof timecode !== 'string') {
        return false;
    }

    if (! df && timecode.includes(';')) {
        return false;
    }

    if (df && timecode[8] !== ';') {
        return false;
    }

    return /^(?:[0-1][0-9]|2[0-3])(:|;)(?:[0-5][0-9])\1(?:[0-5][0-9])(:|;)(?:[0-2][0-9])$/.test(timecode);
};

/**
 * Checks if a timecode is valid according to SMPTE standard
 * @param {String} timecode Timecode to be evaluated
 * @param {Number} fr Frame rate number
 * @param {Boolean} df Boolean indicating if timecode is drop frame
 */
SMPTE.isValidTimecode = function (timecode, fr = SMPTE.defaults.frameRate, df = SMPTE.defaults.dropFrame) {
    if (! SMPTE.isTimecodeFormatValid(timecode, df)) {
        return false;
    }

    let parts = timecode.split(/:|;/).map(part => parseInt(part));

    if (typeof fr === 'number' && parts[3] >= Math.round(fr)) {
        return false;
    }

    if (df && (parts[1] % 10 !== 0 && parts[3] < 2 && parts[2] === 0)) {
        return false;
    }

    return true;
};

/**
 * Gets the frame count given a timecode string
 * @param {String} timecode Timecode string
 * @param {Number} fr Frame rate number
 * @param {Boolean} df Boolean indicating if timecode is drop frame
 */
SMPTE.frameCountFromTimecode = function (timecode, fr = SMPTE.defaults.frameRate, df = SMPTE.defaults.dropFrame) {
    if (! SMPTE.isValidTimecode(timecode, fr, df)) {
        throw new Error('Invalid timecode');
    }

    let parts = timecode.split(/:|;/).map(part => parseInt(part)),
        roundFr = Math.round(fr),
        _fc = (roundFr * 60 * 60 * parts[0])
            + (roundFr * 60 * parts[1])
            + (roundFr * parts[2])
            + parts[3];

    if (df) {
        let totalMinutes = (60 * parts[0]) + parts[1];

        return _fc - (2 * (totalMinutes - Math.floor(totalMinutes / 10)));
    }

    return _fc;
};

SMPTE.consts = Object.assign({}, FrameRate);
SMPTE.defaults = defaults;
SMPTE.supportedFrameRates = supportedFRs;

SMPTE.isFramerateSupported = function (framerate) {
    return SMPTE.supportedFrameRates.includes(framerate);
};

export default SMPTE;
