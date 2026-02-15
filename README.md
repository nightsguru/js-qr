# JSQR

Lightweight, zero-dependency JavaScript library for QR code generation. Works in any browser with a single `<script>` tag.

## Features

- **Zero dependencies** — pure JavaScript, no build tools required
- **Multiple rendering modes** — SVG, Canvas, Data URL, HTML Table
- **Visual styles** — square modules, rounded dots
- **Full QR specification** — versions 1-40, error correction L/M/Q/H
- **Encoding modes** — Numeric, Alphanumeric, Byte (UTF-8)
- **UMD module** — works with `<script>`, CommonJS, AMD
- **Customizable** — colors, sizes, margins, dot scale

## Quick Start

```html
<script src="jsqr.js"></script>

<div id="qr-container"></div>

<script>
  var qr = JSQR("https://example.com", {
    ecLevel: "M",
    moduleSize: 8,
    foreground: "#1a1a2e",
    background: "#ffffff"
  });

  qr.appendTo("#qr-container");
</script>
```

## Installation

Download `jsqr.js` and include it in your HTML:

```html
<script src="jsqr.js"></script>
```

Or use as a CommonJS module:

```js
const JSQR = require("./jsqr");
```

## API Reference

### Constructor

```js
var qr = JSQR(data, options);
var qr = new JSQR(data, options);
var qr = JSQR.generate(data, options);
```

### Options

| Option       | Type   | Default     | Description                        |
| ------------ | ------ | ----------- | ---------------------------------- |
| `ecLevel`    | String | `"M"`       | Error correction: `L`, `M`, `Q`, `H` |
| `moduleSize` | Number | `10`        | Size of each module in pixels      |
| `margin`     | Number | `4`         | Quiet zone margin in modules       |
| `foreground` | String | `"#000000"` | Module color                       |
| `background` | String | `"#FFFFFF"` | Background color                   |
| `style`      | String | `"square"`  | Module style: `square` or `dots`   |
| `dotScale`   | Number | `0.85`      | Dot size ratio (only for `dots` style) |
| `borderRadius` | Number | `0`       | SVG background border radius       |

### Instance Methods

#### `toSVG(options?)`
Returns QR code as an SVG string.

```js
var svg = qr.toSVG();
document.getElementById("container").innerHTML = svg;
```

#### `toCanvas(canvasElement, options?)`
Renders QR code onto a canvas element.

```js
var canvas = document.getElementById("my-canvas");
qr.toCanvas(canvas);
```

#### `toDataURL(options?)`
Returns a base64 Data URL (PNG by default).

```js
var img = new Image();
img.src = qr.toDataURL();
```

#### `toTable(options?)`
Returns QR code as an HTML table string.

```js
document.getElementById("container").innerHTML = qr.toTable();
```

#### `toBoolean2D()`
Returns the raw matrix as a 2D boolean array.

```js
var matrix = qr.toBoolean2D();
```

#### `appendTo(element, options?)`
Appends the QR code to a DOM element. Supports CSS selectors or element references.

```js
qr.appendTo("#container");
qr.appendTo(document.body);
qr.appendTo("#canvas-target", { renderer: "canvas" });
```

### Static Methods

```js
var svg = JSQR.toSVG("data", options);
var url = JSQR.toDataURL("data", options);
JSQR.toCanvas("data", canvasElement, options);
```

### Instance Properties

| Property      | Type   | Description                 |
| ------------- | ------ | --------------------------- |
| `version`     | Number | QR version (1-40)           |
| `size`        | Number | Matrix size (modules)       |
| `moduleCount` | Number | Same as `size`              |
| `data`        | String | Original input data         |
| `matrix`      | Object | Internal matrix object      |

## Error Correction Levels

| Level | Recovery | Use Case                          |
| ----- | -------- | --------------------------------- |
| L     | ~7%      | Maximum data capacity             |
| M     | ~15%     | General purpose (default)         |
| Q     | ~25%     | Industrial / outdoor environments |
| H     | ~30%     | High reliability, logos overlay   |

## Examples

### Custom Colors

```js
JSQR("Hello", {
  foreground: "#6d28d9",
  background: "#faf5ff"
}).appendTo("#container");
```

### Dot Style

```js
JSQR("Hello", {
  style: "dots",
  dotScale: 0.75,
  foreground: "#059669"
}).appendTo("#container");
```

### Generate PNG Download

```js
var qr = JSQR("Hello");
var canvas = document.createElement("canvas");
qr.toCanvas(canvas);
canvas.toBlob(function (blob) {
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "qr.png";
  a.click();
});
```

### Node.js / CommonJS

```js
const JSQR = require("./jsqr");
const fs = require("fs");

var svg = JSQR.toSVG("https://example.com", { moduleSize: 4 });
fs.writeFileSync("qr.svg", svg);
```

## Browser Support

Chrome, Firefox, Safari, Edge, Opera — all modern browsers. IE11 compatible.

## License

MIT
