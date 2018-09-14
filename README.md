# smpte.js

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
    timecode.add(timecodeToAdd)
    .add(anotherTimecodeToAdd)
    .toString('00:00:00;00')
);
// 00:00:01;03
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

// or using the new operator
let tm = new SMPTE('00:01:00:00', 24, false);
```

### Properties

SMPTE objects provide the following properties once an object is created:

| Property               | Type      | Description                  |
| ---------------------- | --------- | ---------------------------- |
| `framecount`           | `Number`  | Total number of frames       |
| `hours`                | `Number`  | Hours number                 |
| `minutes`              | `Number`  | Minutes number               |
| `seconds`              | `Number`  | Seconds number               |
| `frames`               | `Number`  | Frames number                |
| `durationInSeconds`    | `Number`  | Timecode duration in seconds |
| `attributes.df`        | `Boolean` | Drop frame indicator         |
| `attributes.frameRate` | `Number`  | Frame rate in FPS            |

### Methods

Each SMPTE object provides the following methods:

#### `addFromSeconds(seconds)` - [**chainable**](#chainable)
Adds a number of seconds to the current timecode object.
* `seconds`: `Number` indicating the seconds to be added.

#### `subtractFromSeconds(seconds)` - [**chainable**](#chainable)
Substracts a timecode or a frame count from the current SMPTE object.
* `seconds`: `Number` indicating the seconds to be subtracted.

#### `add(time, operation = 1)` - [**chainable**](#chainable)
Adds a timecode or a frame count to the current SMPTE object.
* `time`: `Number|String|SMPTE` indicating the value to be added.
* `operation`: `Number` used to get the sign of the `time`.

#### `subtract(time)` - [**chainable**](#chainable)
Substracts a timecode or a frame count from the current SMPTE object.
* `time`: `Number|String|SMPTE` indicating the value to be subtracted.

#### `toString(format = undefined)`
Returns a string with the SMPTE timecode representation.
* `format`: `String` mask to form the string.

#### `toDate()`
Converts a SMPTE object to a date object.

#### `isTimecodeFormatValid(timecode, df)` - **static**
Checks if a timecode string is in a valid format.
* `timecode`: `String` to be evaluated.
* `df`: `Boolean` indicating if is drop frame representation.

#### `isValidTimecode(timecode, fr = defaults.frameRate, df = defaults.dropFrame)` - **static**
Checks if a timecode is valid according to SMPTE standard.
* `timecode`: `String` to be evaluated.
* `fr`: `Number` indicating the frame rate.
* `df`: `Boolean` indicating if is drop frame representation.

#### `frameCountFromTimecode(timecode, fr = defaults.frameRate, df = defaults.dropFrame)` - **static**
Gets the frame count given a timecode string.
* `timecode`: `String` timecode.
* `fr`: `Number` indicating the frame rate.
* `df`: `Boolean` indicating if is drop frame representation.

#### `isFramerateSupported(framerate)` - **static**
Checks if a frame rate is supported.
* `framerate`: `Number` indicating the frame rate.

### Default values
You can easily change the default value accessing the static `default` object from the SMPTE class and change the `frameRate` or the `dropFrame` property.

```javascript
import SMPTE from 'smpte.js';

SMPTE.defaults.frameRate = 29.97;
SMPTE.defaults.dropFrame = true;
```

## Definitions

### [Chainable](https://en.wikipedia.org/wiki/Method_chaining)
Returns an object, allowing the calls to be chained together in a single statement without requiring variables to store the intermediate results.

## Contributing
All contribution is welcome, please feel free to open tickets and pull requests.

## License
[MIT.](https://github.com/fireworkweb/smpte.js/blob/master/LICENSE)
