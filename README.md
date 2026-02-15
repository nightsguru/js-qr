# JSQR

Lightweight, zero-dependency JavaScript library for QR code generation. Works in any browser with a single `<script>` tag.

## Features

- **Zero dependencies** — pure JavaScript, no build tools required
- **6 module styles** — square, dots, rounded, diamond, star, liquid
- **Center logo embedding** — place any image in the QR center with automatic zone clearing
- **Gradient fill** — linear gradient across modules with configurable angle
- **Multiple rendering modes** — SVG, Canvas, Data URL, HTML Table
- **Full QR specification** — versions 1-40, error correction L/M/Q/H
- **Encoding modes** — Numeric, Alphanumeric, Byte (UTF-8)
- **UMD module** — works with `<script>`, CommonJS, AMD

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

| Option       | Type   | Default     | Description                            |
| ------------ | ------ | ----------- | -------------------------------------- |
| `ecLevel`    | String | `"M"`       | Error correction: `L`, `M`, `Q`, `H`  |
| `moduleSize` | Number | `10`        | Size of each module in pixels          |
| `margin`     | Number | `4`         | Quiet zone margin in modules           |
| `foreground` | String | `"#000000"` | Module color                           |
| `background` | String | `"#FFFFFF"` | Background color                       |
| `style`      | String | `"square"`  | Module style (see below)               |
| `dotScale`   | Number | `0.85`      | Dot size ratio (only for `dots` style) |
| `borderRadius` | Number | `0`       | SVG background border radius           |
| `logo`       | Object | `null`      | Center logo configuration (see below)  |
| `gradient`   | Object | `null`      | Gradient fill configuration (see below)|

### Module Styles

| Style      | Description                                                     |
| ---------- | --------------------------------------------------------------- |
| `square`   | Classic square modules                                          |
| `dots`     | Circular dots with configurable `dotScale`                      |
| `rounded`  | Squares with rounded corners (35% radius)                       |
| `diamond`  | Rotated diamond/rhombus shapes                                  |
| `star`     | 5-pointed star shapes                                           |
| `liquid`   | Organic blob shapes — neighbors merge smoothly via adaptive radii |

```js
JSQR("Hello", { style: "liquid" }).appendTo("#container");
```

### Logo Configuration

Place an image in the center of the QR code. The library automatically clears the center zone of modules and overlays the logo with a padded background. Use error correction `Q` or `H` for best results with logos.

```js
JSQR("Hello", {
  ecLevel: "H",
  logo: {
    src: "logo.png",
    size: 0.2,
    padding: 6,
    borderRadius: 8,
    background: "#FFFFFF"
  }
}).appendTo("#container");
```

| Logo Option      | Type   | Default     | Description                        |
| ---------------- | ------ | ----------- | ---------------------------------- |
| `src`            | String | —           | Image URL or data URI (required)   |
| `size`           | Number | `0.2`       | Logo size as ratio of QR total size (0.0–0.3) |
| `padding`        | Number | `4`         | Padding around logo in pixels      |
| `borderRadius`   | Number | `4`         | Corner radius of logo background   |
| `background`     | String | `"#FFFFFF"` | Background color behind logo       |

### Gradient Configuration

Apply a linear gradient across all modules instead of a solid foreground color.

```js
JSQR("Hello", {
  gradient: {
    colors: ["#7c3aed", "#06b6d4"],
    angle: 135
  }
}).appendTo("#container");
```

| Gradient Option | Type   | Default          | Description                      |
| --------------- | ------ | ---------------- | -------------------------------- |
| `colors`        | Array  | `[foreground]`   | Array of color stops             |
| `angle`         | Number | `0`              | Gradient angle in degrees        |

### Instance Methods

#### `toSVG(options?)`
Returns QR code as an SVG string.

```js
var svg = qr.toSVG();
document.getElementById("container").innerHTML = svg;
```

#### `toCanvas(canvasElement, options?)`
Renders QR code onto a canvas element. Logo is drawn asynchronously on canvas.

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

### Static Properties

| Property       | Type   | Description                                    |
| -------------- | ------ | ---------------------------------------------- |
| `JSQR.version` | String | Library version                                |
| `JSQR.STYLES`  | Array  | Available styles list                          |
| `JSQR.ECL`     | Object | Error correction level constants               |

## Error Correction Levels

| Level | Recovery | Use Case                          |
| ----- | -------- | --------------------------------- |
| L     | ~7%      | Maximum data capacity             |
| M     | ~15%     | General purpose (default)         |
| Q     | ~25%     | With small logos                   |
| H     | ~30%     | With large logos, high reliability |

## Examples

### Custom Colors

```js
JSQR("Hello", {
  foreground: "#6d28d9",
  background: "#faf5ff"
}).appendTo("#container");
```

### Liquid Style with Gradient

```js
JSQR("Hello", {
  style: "liquid",
  gradient: {
    colors: ["#ec4899", "#8b5cf6", "#06b6d4"],
    angle: 45
  }
}).appendTo("#container");
```

### Logo with High EC

```js
JSQR("https://mysite.com", {
  ecLevel: "H",
  style: "rounded",
  logo: {
    src: "brand-logo.png",
    size: 0.22,
    padding: 8,
    borderRadius: 12,
    background: "#ffffff"
  }
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

var svg = JSQR.toSVG("https://example.com", {
  moduleSize: 4,
  style: "rounded",
  gradient: { colors: ["#000", "#333"], angle: 90 }
});
fs.writeFileSync("qr.svg", svg);
```

## Browser Support

Chrome, Firefox, Safari, Edge, Opera — all modern browsers. IE11 compatible (core generation).

