export function padNumber (number) {
    if (typeof number !== 'number') {
        return undefined;
    }

    return number.toString().padStart(2, '0');
}

export const frameRates = [
    23.976,
    24,
    25,
    29.97,
    30,
];

export const errors = {
    dfError: 'Only 29.97 frame rate has drop frame support!',
    unsupportedFr: 'Unsupported framerate',
    invalidTm: 'Invalid timecode string',
    negativeFc: 'Negative frame count not supported',
    diffFr: 'Different frame rate timecodes can not be added',
    invalidParam: 'Timecode operations can only be made between Timecode objects, frame count or seconds',
};
