# smpte.js

[![Build Status](https://travis-ci.com/fireworkweb/smpte.js.svg?branch=master)](https://travis-ci.com/fireworkweb/smpte.js)

Easily deal with Timecode SMPTE format.

## Installation

Using `npm` or `yarn`:
```
npm install smpte.js

yarn add smpte.js
```

## Usage

### Example
Using `ES6` sintax:
```javascript
import SMPTE from 'smpte.js';

SMPTE.defaults.frameRate = 29.97;
SMPTE.defaults.dropFrame = true;

let timecode = new SMPTE(1);
let timecodeToAdd = new SMPTE('00;00;00;02');
let anotherTimecodeToAdd = SMPTE.fromSeconds(1);

console.log(
    timecode
        .add(timecodeToAdd)
        .add(anotherTimecodeToAdd)
        .toString('00:00:00;00')
);
// 00:00:01;03

let invalidTm = new SMPTE('00:01:00:23', 24, true);
// Error: Only 29.97 frame rate has drop frame support

let invalidTm = new SMPTE('00:01:00:59', 60, false);
// Error: Frame rate not supported

let invalidTm = new SMPTE(-1440, 24, false);
// Error: Negative frames not supported

let invalidTm = new SMPTE('00:00:00:24', 24, false);
// Error: Invalid timecode
```

### Object Instantiation
SMPTE objects can be instatianted from frame count, [date object](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Date), seconds, timecode integer parts or directly from timecode string.

```javascript
// Frame count
let tm = SMPTE.fromFrames(1440, 24, false);

// Date object
let tm = SMPTE.fromDate(Date.now(), 24, false);

// Seconds
let tm = SMPTE.fromSeconds(60, 24, false);

// Timecode integer parts
let tm = SMPTE.fromParts(0, 1, 0, 0, 24, false);

// Timecode string
let tm = SMPTE.fromTimecode('00:01:00:00', 24, false);

// or using the constructor
let tm = new SMPTE('00:01:00:00', 24, false);
```

### Properties

SMPTE objects provide the following properties once an object is instantiated:

| Property               | Type      | get                | set                | Description                  |
| ---------------------- | --------- | ------------------ | ------------------ | ---------------------------- |
| `frameCount`           | `Number`  | :white_check_mark: | :white_check_mark: | Total number of frames       |
| `hours`                | `Number`  | :white_check_mark: | :white_check_mark: | Hours number                 |
| `minutes`              | `Number`  | :white_check_mark: | :white_check_mark: | Minutes number               |
| `seconds`              | `Number`  | :white_check_mark: | :white_check_mark: | Seconds number               |
| `frames`               | `Number`  | :white_check_mark: | :white_check_mark: | Frames number                |
| `durationInSeconds`    | `Number`  | :white_check_mark: | :x:                | Timecode duration in seconds |
| `attributes.df`        | `Boolean` | :white_check_mark: | :white_check_mark: | Global drop frame indicator  |
| `attributes.frameRate` | `Number`  | :white_check_mark: | :white_check_mark: | Global Frame rate in FPS     |

### Methods

Each SMPTE object provides the following methods:

#### `addFromSeconds(seconds)`
Adds a number of seconds to the current timecode object.
* `seconds`: `Number` indicating the seconds to be added.
* `return`: Reference to the changed `SMPTE` object

##### Example:
```javascript
let tc = SMPTE.fromSeconds(2, 24, false);
console.log(tc.addFromSeconds(2).toString())
// 00:00:04:00
```

#### `subtractFromSeconds(seconds)`
Substracts a timecode or a frame count from the current SMPTE object.
* `seconds`: `Number` indicating the seconds to be subtracted.
* `return`: Reference to the changed `SMPTE` object

##### Example:
```javascript
let tc = SMPTE.fromSeconds(2, 24, false);
console.log(tc.subtractFromSeconds(2).toString())
// 00:00:00:00
```

#### `add(time, operation = 1)`
Adds a timecode or a frame count to the current SMPTE object.
* `time`: `Number|String|SMPTE` indicating the value to be added.
* `operation`: `Number` used to get the sign of the `time`.
* `return`: Reference to the changed `SMPTE` object

##### Example:
```javascript
let tc = SMPTE.fromTimecode('00:01:00:00', 24, false);
console.log(tc.add('00:00:30:00').toString())
// 00:01:30:00
```

#### `subtract(time)`
Substracts a timecode or a frame count from the current SMPTE object.
* `time`: `Number|String|SMPTE` indicating the value to be subtracted.
* `return`: Reference to the altered `SMPTE` object

##### Example:
```javascript
let tc = SMPTE.fromTimecode('00:00:01:00', 24, false);
console.log(tc.subtract(4).toString())
// 00:00:00:20
```

#### `toString(format = undefined)`
Returns a string with the SMPTE timecode representation.
* `format`: `String` mask to form the string.
* `return`: Timecode `string`.

##### Example:
```javascript
console.log(new SMPTE(48, 24, false).toString())
// 00:00:02:00
```

#### `toDate()`
Converts a SMPTE object to a date object.
* `return`: Respective `Date` object.
```javascript
console.log(new SMPTE(48, 24, false).toDate().getSeconds())
// 2
```

#### `isTimecodeFormatValid(timecode, df)` - **static**
Checks if a timecode string is in a valid format.
* `timecode`: `String` to be evaluated.
* `df`: `Boolean` indicating if is drop frame representation.
* `return`: `Boolean`.
```javascript
console.log(SMPTE.isTimecodeFormatValid('24:59:59:29', false));
// false
console.log(SMPTE.isTimecodeFormatValid('23:59:59:29', false));
// true

console.log(SMPTE.isTimecodeFormatValid('24:59:59:29', true));
// false
console.log(SMPTE.isTimecodeFormatValid('24:59:59;29', true));
// true
```

#### `isValidTimecode(timecode, fr = defaults.frameRate, df = defaults.dropFrame)` - **static**
Checks if a timecode is valid according to SMPTE standard.
* `timecode`: `String` to be evaluated.
* `fr`: `Number` indicating the frame rate.
* `df`: `Boolean` indicating if is drop frame representation.
* `return`: `Boolean`.
```javascript
console.log(SMPTE.isValidTimecode('23:59:59:24', 24, false));
// false
console.log(SMPTE.isValidTimecode('23:59:59:23', 24, false));
// true
```

#### `frameCountFromTimecode(timecode, fr = defaults.frameRate, df = defaults.dropFrame)` - **static**
Gets the frame count given a timecode string.
* `timecode`: `String` timecode.
* `fr`: `Number` indicating the frame rate.
* `df`: `Boolean` indicating if is drop frame representation.
* `return`: `Number`.
```javascript
console.log(SMPTE.frameCountFromTimecode('00:01:00;02', 29.97, true))
// 1800
console.log(SMPTE.frameCountFromTimecode('00:01:00:00', 29.97, false))
// 1800
```

#### `isFramerateSupported(framerate)` - **static**
Checks if a frame rate is supported.
* `framerate`: `Number` indicating the frame rate.
* `return`: `Boolean`.
```javascript
console.log(SMPTE.isFramerateSupported(59.94))
// false
console.log(SMPTE.isFramerateSupported(25))
// true
```

### Default values
You can easily change the default value accessing the static `default` object from the SMPTE class and change the `frameRate` or the `dropFrame` property.

```javascript
import SMPTE from 'smpte.js';

SMPTE.defaults.frameRate = 29.97;
SMPTE.defaults.dropFrame = true;
```

## Contributing
All contribution is welcome, please feel free to open tickets and pull requests.

## License
[MIT.](LICENSE)
