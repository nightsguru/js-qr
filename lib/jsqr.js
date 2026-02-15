(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.JSQR = factory();
    }
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    var ECL = { L: 0, M: 1, Q: 2, H: 3 };
    var MODE = { NUMERIC: 1, ALPHANUMERIC: 2, BYTE: 4 };
    var ALPHANUMERIC_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

    var FORMAT_EC_INDICATOR = [1, 0, 3, 2];

    var TOTAL_CODEWORDS = [
        26, 44, 70, 100, 134, 172, 196, 242, 292, 346,
        404, 466, 532, 581, 655, 733, 815, 901, 991, 1085,
        1156, 1258, 1364, 1474, 1588, 1706, 1828, 1921, 2051, 2185,
        2323, 2465, 2611, 2761, 2876, 3034, 3196, 3362, 3532, 3706
    ];

    var EC_CODEWORDS_PER_BLOCK = [
        [7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
        [10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
        [13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
        [17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
    ];

    var NUM_EC_BLOCKS = [
        [1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
        [1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
        [1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
        [1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]
    ];

    var CAPACITY = [
        [19, 34, 55, 80, 108, 136, 156, 194, 232, 274, 324, 370, 428, 461, 523, 589, 647, 721, 795, 861, 932, 1006, 1094, 1174, 1276, 1370, 1468, 1531, 1631, 1735, 1843, 1955, 2071, 2191, 2306, 2434, 2566, 2702, 2812, 2956],
        [16, 28, 44, 64, 86, 108, 124, 154, 182, 216, 254, 290, 334, 365, 415, 453, 507, 563, 627, 669, 714, 782, 860, 914, 1000, 1062, 1128, 1193, 1267, 1373, 1455, 1541, 1631, 1725, 1812, 1914, 1992, 2102, 2216, 2334],
        [13, 22, 34, 48, 62, 76, 88, 110, 132, 154, 180, 206, 244, 261, 295, 325, 367, 397, 445, 485, 512, 568, 614, 664, 718, 754, 808, 871, 911, 985, 1033, 1115, 1171, 1231, 1286, 1354, 1426, 1502, 1582, 1666],
        [9, 16, 26, 36, 46, 60, 66, 86, 100, 122, 140, 158, 180, 197, 223, 253, 283, 313, 341, 385, 406, 442, 464, 514, 538, 596, 628, 661, 701, 745, 793, 845, 901, 961, 986, 1054, 1096, 1142, 1222, 1276]
    ];

    var ALIGNMENT_POSITIONS = [
        [],
        [6, 18],
        [6, 22],
        [6, 26],
        [6, 30],
        [6, 34],
        [6, 22, 38],
        [6, 24, 42],
        [6, 26, 46],
        [6, 28, 50],
        [6, 30, 54],
        [6, 32, 58],
        [6, 34, 62],
        [6, 26, 46, 66],
        [6, 26, 48, 70],
        [6, 26, 50, 74],
        [6, 30, 54, 78],
        [6, 30, 56, 82],
        [6, 30, 58, 86],
        [6, 34, 62, 90],
        [6, 28, 50, 72, 94],
        [6, 26, 50, 74, 98],
        [6, 30, 54, 78, 102],
        [6, 28, 54, 80, 106],
        [6, 32, 58, 84, 110],
        [6, 30, 58, 86, 114],
        [6, 34, 62, 90, 118],
        [6, 26, 50, 74, 98, 122],
        [6, 30, 54, 78, 102, 126],
        [6, 26, 52, 78, 104, 130],
        [6, 30, 56, 82, 108, 134],
        [6, 34, 60, 86, 112, 138],
        [6, 30, 58, 86, 114, 142],
        [6, 34, 62, 90, 118, 146],
        [6, 30, 54, 78, 102, 126, 150],
        [6, 24, 50, 76, 102, 128, 154],
        [6, 28, 54, 80, 106, 132, 158],
        [6, 32, 58, 84, 110, 136, 162],
        [6, 26, 54, 82, 110, 138, 166],
        [6, 30, 58, 86, 114, 142, 170]
    ];

    var VERSION_INFO = [
        0, 0, 0, 0, 0, 0, 0x07C94, 0x085BC, 0x09A99, 0x0A4D3, 0x0BBF6, 0x0C762, 0x0D847, 0x0E60D, 0x0F928,
        0x10B78, 0x1145D, 0x12A17, 0x13532, 0x149A6, 0x15683, 0x168C9, 0x177EC, 0x18EC4, 0x191E1, 0x1AFAB,
        0x1B08E, 0x1CC1A, 0x1D33F, 0x1ED75, 0x1F250, 0x209D5, 0x216F0, 0x228BA, 0x2379F, 0x24B0B, 0x2542E,
        0x26A64, 0x27541, 0x28C69
    ];

    function GaloisField() {
        this.exp = new Uint8Array(256);
        this.log = new Uint8Array(256);
        var x = 1;
        for (var i = 0; i < 255; i++) {
            this.exp[i] = x;
            this.log[x] = i;
            x <<= 1;
            if (x >= 256) x ^= 0x11D;
        }
        this.exp[255] = this.exp[0];
    }

    GaloisField.prototype.multiply = function (a, b) {
        if (a === 0 || b === 0) return 0;
        return this.exp[(this.log[a] + this.log[b]) % 255];
    };

    GaloisField.prototype.polyMultiply = function (p1, p2) {
        var result = new Uint8Array(p1.length + p2.length - 1);
        for (var i = 0; i < p1.length; i++) {
            for (var j = 0; j < p2.length; j++) {
                result[i + j] ^= this.multiply(p1[i], p2[j]);
            }
        }
        return result;
    };

    GaloisField.prototype.generatorPoly = function (degree) {
        var g = new Uint8Array([1]);
        for (var i = 0; i < degree; i++) {
            g = this.polyMultiply(g, new Uint8Array([1, this.exp[i]]));
        }
        return g;
    };

    GaloisField.prototype.remainder = function (data, genDegree) {
        var gen = this.generatorPoly(genDegree);
        var result = new Uint8Array(data.length + genDegree);
        result.set(data);
        for (var i = 0; i < data.length; i++) {
            if (result[i] === 0) continue;
            for (var j = 1; j < gen.length; j++) {
                result[i + j] ^= this.multiply(gen[j], result[i]);
            }
        }
        return result.slice(data.length);
    };

    var gf = new GaloisField();

    function detectMode(data) {
        if (/^\d+$/.test(data)) return MODE.NUMERIC;
        for (var i = 0; i < data.length; i++) {
            if (ALPHANUMERIC_CHARS.indexOf(data.charAt(i)) === -1) return MODE.BYTE;
        }
        return MODE.ALPHANUMERIC;
    }

    function getCharCountBits(version, mode) {
        if (version <= 9) return mode === MODE.NUMERIC ? 10 : mode === MODE.ALPHANUMERIC ? 9 : 8;
        if (version <= 26) return mode === MODE.NUMERIC ? 12 : mode === MODE.ALPHANUMERIC ? 11 : 16;
        return mode === MODE.NUMERIC ? 14 : mode === MODE.ALPHANUMERIC ? 13 : 16;
    }

    function utf8ByteLength(str) {
        var len = 0;
        for (var i = 0; i < str.length; i++) {
            var code = str.charCodeAt(i);
            if (code <= 0x7F) len += 1;
            else if (code <= 0x7FF) len += 2;
            else if (code >= 0xD800 && code <= 0xDBFF) { len += 4; i++; }
            else len += 3;
        }
        return len;
    }

    function utf8Encode(str) {
        var bytes = [];
        for (var i = 0; i < str.length; i++) {
            var code = str.charCodeAt(i);
            if (code <= 0x7F) {
                bytes.push(code);
            } else if (code <= 0x7FF) {
                bytes.push(0xC0 | (code >> 6), 0x80 | (code & 0x3F));
            } else if (code >= 0xD800 && code <= 0xDBFF) {
                var hi = code, lo = str.charCodeAt(++i);
                var cp = ((hi - 0xD800) << 10) + (lo - 0xDC00) + 0x10000;
                bytes.push(0xF0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3F), 0x80 | ((cp >> 6) & 0x3F), 0x80 | (cp & 0x3F));
            } else {
                bytes.push(0xE0 | (code >> 12), 0x80 | ((code >> 6) & 0x3F), 0x80 | (code & 0x3F));
            }
        }
        return bytes;
    }

    function selectVersion(data, mode, ecLevel) {
        var dataLen = mode === MODE.BYTE ? utf8ByteLength(data) : data.length;
        for (var v = 1; v <= 40; v++) {
            var cap = CAPACITY[ecLevel][v - 1];
            var bits = 4 + getCharCountBits(v, mode);
            if (mode === MODE.NUMERIC) {
                bits += Math.floor(dataLen / 3) * 10;
                var rem = dataLen % 3;
                if (rem === 2) bits += 7;
                else if (rem === 1) bits += 4;
            } else if (mode === MODE.ALPHANUMERIC) {
                bits += Math.floor(dataLen / 2) * 11 + (dataLen % 2) * 6;
            } else {
                bits += dataLen * 8;
            }
            if (Math.ceil(bits / 8) <= cap) return v;
        }
        throw new Error("Data too long for QR code");
    }

    function BitBuffer() {
        this.buffer = [];
        this.length = 0;
    }

    BitBuffer.prototype.put = function (value, numBits) {
        for (var i = numBits - 1; i >= 0; i--) {
            this.buffer.push((value >>> i) & 1);
            this.length++;
        }
    };

    BitBuffer.prototype.getBytes = function () {
        var bytes = [];
        for (var i = 0; i < this.buffer.length; i += 8) {
            var b = 0;
            for (var j = 0; j < 8; j++) {
                b <<= 1;
                if (i + j < this.buffer.length) b |= this.buffer[i + j];
            }
            bytes.push(b);
        }
        return bytes;
    };

    function encodeData(data, mode, version, ecLevel) {
        var buf = new BitBuffer();
        buf.put(mode, 4);

        if (mode === MODE.NUMERIC) {
            buf.put(data.length, getCharCountBits(version, mode));
            for (var i = 0; i < data.length; i += 3) {
                var group = data.substring(i, Math.min(i + 3, data.length));
                buf.put(parseInt(group, 10), group.length === 3 ? 10 : (group.length === 2 ? 7 : 4));
            }
        } else if (mode === MODE.ALPHANUMERIC) {
            buf.put(data.length, getCharCountBits(version, mode));
            for (var i = 0; i < data.length; i += 2) {
                if (i + 1 < data.length) {
                    buf.put(ALPHANUMERIC_CHARS.indexOf(data.charAt(i)) * 45 + ALPHANUMERIC_CHARS.indexOf(data.charAt(i + 1)), 11);
                } else {
                    buf.put(ALPHANUMERIC_CHARS.indexOf(data.charAt(i)), 6);
                }
            }
        } else {
            var bytes = utf8Encode(data);
            buf.put(bytes.length, getCharCountBits(version, mode));
            for (var i = 0; i < bytes.length; i++) buf.put(bytes[i], 8);
        }

        var totalDataCodewords = CAPACITY[ecLevel][version - 1];
        var totalBits = totalDataCodewords * 8;
        buf.put(0, Math.min(4, totalBits - buf.length));
        while (buf.length % 8 !== 0) buf.put(0, 1);
        var padBytes = [0xEC, 0x11];
        var padIndex = 0;
        while (buf.length < totalBits) { buf.put(padBytes[padIndex % 2], 8); padIndex++; }

        return buf.getBytes();
    }

    function interleaveBlocks(dataBytes, version, ecLevel) {
        var ecPerBlock = EC_CODEWORDS_PER_BLOCK[ecLevel][version - 1];
        var numBlocks = NUM_EC_BLOCKS[ecLevel][version - 1];
        var totalCodewords = TOTAL_CODEWORDS[version - 1];
        var shortBlockTotal = Math.floor(totalCodewords / numBlocks);
        var longBlocks = totalCodewords % numBlocks;
        var shortBlocks = numBlocks - longBlocks;
        var shortBlockData = shortBlockTotal - ecPerBlock;

        var dataBlocks = [];
        var ecBlocks = [];
        var offset = 0;

        for (var i = 0; i < numBlocks; i++) {
            var blockDataLen = (i < shortBlocks) ? shortBlockData : shortBlockData + 1;
            var blockData = dataBytes.slice(offset, offset + blockDataLen);
            offset += blockDataLen;
            dataBlocks.push(blockData);
            ecBlocks.push(Array.from(gf.remainder(new Uint8Array(blockData), ecPerBlock)));
        }

        var result = [];
        var maxDataLen = shortBlockData + 1;
        for (var col = 0; col < maxDataLen; col++) {
            for (var blk = 0; blk < numBlocks; blk++) {
                if (col < dataBlocks[blk].length) result.push(dataBlocks[blk][col]);
            }
        }
        for (var col = 0; col < ecPerBlock; col++) {
            for (var blk = 0; blk < numBlocks; blk++) {
                result.push(ecBlocks[blk][col]);
            }
        }

        return result;
    }

    function QRMatrix(version) {
        this.version = version;
        this.size = version * 4 + 17;
        this.modules = [];
        this.reserved = [];
        for (var r = 0; r < this.size; r++) {
            this.modules.push(new Array(this.size).fill(false));
            this.reserved.push(new Array(this.size).fill(false));
        }
    }

    QRMatrix.prototype.set = function (row, col, value, reserve) {
        this.modules[row][col] = value;
        if (reserve) this.reserved[row][col] = true;
    };

    QRMatrix.prototype.placeFinderPattern = function (row, col) {
        for (var r = -1; r <= 7; r++) {
            for (var c = -1; c <= 7; c++) {
                var pr = row + r, pc = col + c;
                if (pr < 0 || pr >= this.size || pc < 0 || pc >= this.size) continue;
                var isBlack = (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
                    (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
                    (r >= 2 && r <= 4 && c >= 2 && c <= 4);
                this.set(pr, pc, isBlack, true);
            }
        }
    };

    QRMatrix.prototype.placeAlignmentPattern = function (row, col) {
        for (var r = -2; r <= 2; r++) {
            for (var c = -2; c <= 2; c++) {
                this.set(row + r, col + c, Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0), true);
            }
        }
    };

    QRMatrix.prototype.placeTimingPatterns = function () {
        for (var i = 8; i < this.size - 8; i++) {
            var val = i % 2 === 0;
            if (!this.reserved[6][i]) this.set(6, i, val, true);
            if (!this.reserved[i][6]) this.set(i, 6, val, true);
        }
    };

    QRMatrix.prototype.placeFunctionPatterns = function () {
        this.placeFinderPattern(0, 0);
        this.placeFinderPattern(0, this.size - 7);
        this.placeFinderPattern(this.size - 7, 0);

        if (this.version >= 2) {
            var positions = ALIGNMENT_POSITIONS[this.version - 1];
            for (var i = 0; i < positions.length; i++) {
                for (var j = 0; j < positions.length; j++) {
                    if (this.reserved[positions[i]][positions[j]]) continue;
                    this.placeAlignmentPattern(positions[i], positions[j]);
                }
            }
        }

        this.placeTimingPatterns();
        this.set(this.size - 8, 8, true, true);

        for (var i = 0; i < 8; i++) {
            this.reserved[8][i] = true;
            this.reserved[8][this.size - 1 - i] = true;
            this.reserved[i][8] = true;
            this.reserved[this.size - 1 - i][8] = true;
        }
        this.reserved[8][8] = true;

        if (this.version >= 7) {
            for (var i = 0; i < 6; i++) {
                for (var j = 0; j < 3; j++) {
                    this.reserved[i][this.size - 11 + j] = true;
                    this.reserved[this.size - 11 + j][i] = true;
                }
            }
        }
    };

    QRMatrix.prototype.placeDataBits = function (dataBits) {
        var bitIndex = 0;
        var upward = true;
        for (var col = this.size - 1; col >= 0; col -= 2) {
            if (col === 6) col = 5;
            for (var ri = 0; ri < this.size; ri++) {
                var row = upward ? this.size - 1 - ri : ri;
                for (var dc = 0; dc <= 1; dc++) {
                    var c = col - dc;
                    if (c < 0 || this.reserved[row][c]) continue;
                    if (bitIndex < dataBits.length) {
                        this.modules[row][c] = dataBits[bitIndex] === 1;
                    }
                    bitIndex++;
                }
            }
            upward = !upward;
        }
    };

    QRMatrix.prototype.applyMask = function (maskNum) {
        var maskFn = getMaskFunction(maskNum);
        for (var r = 0; r < this.size; r++) {
            for (var c = 0; c < this.size; c++) {
                if (!this.reserved[r][c] && maskFn(r, c)) {
                    this.modules[r][c] = !this.modules[r][c];
                }
            }
        }
    };

    QRMatrix.prototype.placeFormatInfo = function (ecLevel, maskNum) {
        var formatBits = getFormatBits(ecLevel, maskNum);
        for (var i = 0; i < 15; i++) {
            var bit = ((formatBits >> (14 - i)) & 1) === 1;
            if (i < 6) this.modules[8][i] = bit;
            else if (i < 8) this.modules[8][i + 1] = bit;
            else this.modules[8][this.size - 15 + i] = bit;

            if (i < 8) this.modules[this.size - 1 - i][8] = bit;
            else if (i < 9) this.modules[15 - i][8] = bit;
            else this.modules[15 - i - 1][8] = bit;
        }
    };

    QRMatrix.prototype.placeVersionInfo = function () {
        if (this.version < 7) return;
        var versionBits = VERSION_INFO[this.version];
        for (var i = 0; i < 18; i++) {
            var bit = ((versionBits >> i) & 1) === 1;
            var row = Math.floor(i / 3);
            var col = this.size - 11 + (i % 3);
            this.modules[row][col] = bit;
            this.modules[col][row] = bit;
        }
    };

    QRMatrix.prototype.calculatePenalty = function () {
        return this._penaltyRule1() + this._penaltyRule2() + this._penaltyRule3() + this._penaltyRule4();
    };

    QRMatrix.prototype._penaltyRule1 = function () {
        var penalty = 0;
        for (var r = 0; r < this.size; r++) {
            var cnt = 1;
            for (var c = 1; c < this.size; c++) {
                if (this.modules[r][c] === this.modules[r][c - 1]) { cnt++; if (cnt === 5) penalty += 3; else if (cnt > 5) penalty += 1; }
                else cnt = 1;
            }
        }
        for (var c = 0; c < this.size; c++) {
            var cnt = 1;
            for (var r = 1; r < this.size; r++) {
                if (this.modules[r][c] === this.modules[r - 1][c]) { cnt++; if (cnt === 5) penalty += 3; else if (cnt > 5) penalty += 1; }
                else cnt = 1;
            }
        }
        return penalty;
    };

    QRMatrix.prototype._penaltyRule2 = function () {
        var penalty = 0;
        for (var r = 0; r < this.size - 1; r++) {
            for (var c = 0; c < this.size - 1; c++) {
                var v = this.modules[r][c];
                if (v === this.modules[r][c + 1] && v === this.modules[r + 1][c] && v === this.modules[r + 1][c + 1]) penalty += 3;
            }
        }
        return penalty;
    };

    QRMatrix.prototype._penaltyRule3 = function () {
        var penalty = 0;
        var p1 = [true, false, true, true, true, false, true, false, false, false, false];
        var p2 = [false, false, false, false, true, false, true, true, true, false, true];
        for (var r = 0; r < this.size; r++) {
            for (var c = 0; c <= this.size - 11; c++) {
                var m1 = true, m2 = true;
                for (var k = 0; k < 11; k++) {
                    if (this.modules[r][c + k] !== p1[k]) m1 = false;
                    if (this.modules[r][c + k] !== p2[k]) m2 = false;
                }
                if (m1 || m2) penalty += 40;
            }
        }
        for (var c = 0; c < this.size; c++) {
            for (var r = 0; r <= this.size - 11; r++) {
                var m1 = true, m2 = true;
                for (var k = 0; k < 11; k++) {
                    if (this.modules[r + k][c] !== p1[k]) m1 = false;
                    if (this.modules[r + k][c] !== p2[k]) m2 = false;
                }
                if (m1 || m2) penalty += 40;
            }
        }
        return penalty;
    };

    QRMatrix.prototype._penaltyRule4 = function () {
        var dark = 0, total = this.size * this.size;
        for (var r = 0; r < this.size; r++) for (var c = 0; c < this.size; c++) if (this.modules[r][c]) dark++;
        var percent = (dark / total) * 100;
        var prev5 = Math.floor(percent / 5) * 5;
        return Math.min(Math.abs(prev5 - 50) / 5, Math.abs(prev5 + 5 - 50) / 5) * 10;
    };

    QRMatrix.prototype.clone = function () {
        var m = new QRMatrix(this.version);
        for (var r = 0; r < this.size; r++) {
            for (var c = 0; c < this.size; c++) {
                m.modules[r][c] = this.modules[r][c];
                m.reserved[r][c] = this.reserved[r][c];
            }
        }
        return m;
    };

    function getMaskFunction(maskNum) {
        switch (maskNum) {
            case 0: return function (r, c) { return (r + c) % 2 === 0; };
            case 1: return function (r) { return r % 2 === 0; };
            case 2: return function (r, c) { return c % 3 === 0; };
            case 3: return function (r, c) { return (r + c) % 3 === 0; };
            case 4: return function (r, c) { return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0; };
            case 5: return function (r, c) { return (r * c) % 2 + (r * c) % 3 === 0; };
            case 6: return function (r, c) { return ((r * c) % 2 + (r * c) % 3) % 2 === 0; };
            case 7: return function (r, c) { return ((r + c) % 2 + (r * c) % 3) % 2 === 0; };
        }
    }

    function getFormatBits(ecLevel, maskNum) {
        var ecIndicator = FORMAT_EC_INDICATOR[ecLevel];
        var data = (ecIndicator << 3) | maskNum;
        var bits = data << 10;
        var gen = 0x537;
        for (var i = 14; i >= 10; i--) {
            if ((bits >> i) & 1) bits ^= gen << (i - 10);
        }
        bits = (data << 10) | bits;
        bits ^= 0x5412;
        return bits;
    }

    function generateMatrix(data, ecLevel) {
        var eclIndex = typeof ecLevel === "string" ? ECL[ecLevel.toUpperCase()] : ecLevel;
        if (eclIndex === undefined) eclIndex = ECL.M;

        var mode = detectMode(data);
        var version = selectVersion(data, mode, eclIndex);
        var dataCodewords = encodeData(data, mode, version, eclIndex);
        var finalData = interleaveBlocks(dataCodewords, version, eclIndex);

        var dataBits = [];
        for (var i = 0; i < finalData.length; i++) {
            for (var b = 7; b >= 0; b--) dataBits.push((finalData[i] >> b) & 1);
        }

        var matrix = new QRMatrix(version);
        matrix.placeFunctionPatterns();
        matrix.placeDataBits(dataBits);

        var bestMask = 0, bestPenalty = Infinity;
        for (var maskNum = 0; maskNum < 8; maskNum++) {
            var candidate = matrix.clone();
            candidate.applyMask(maskNum);
            candidate.placeFormatInfo(eclIndex, maskNum);
            candidate.placeVersionInfo();
            var penalty = candidate.calculatePenalty();
            if (penalty < bestPenalty) { bestPenalty = penalty; bestMask = maskNum; }
        }

        matrix.applyMask(bestMask);
        matrix.placeFormatInfo(eclIndex, bestMask);
        matrix.placeVersionInfo();

        return matrix;
    }

    function isInLogoZone(r, c, size, logoRatio) {
        if (!logoRatio) return false;
        var center = size / 2;
        var half = (size * logoRatio) / 2;
        return r >= center - half && r < center + half && c >= center - half && c < center + half;
    }

    function svgGradientDefs(opts) {
        if (!opts.gradient) return { defs: "", fill: opts.foreground };
        var g = opts.gradient;
        var angle = (g.angle || 0) * Math.PI / 180;
        var x1 = 50 - Math.cos(angle) * 50, y1 = 50 - Math.sin(angle) * 50;
        var x2 = 50 + Math.cos(angle) * 50, y2 = 50 + Math.sin(angle) * 50;
        var stops = "";
        var colors = g.colors || [opts.foreground, opts.foreground];
        for (var i = 0; i < colors.length; i++) {
            stops += '<stop offset="' + Math.round((i / (colors.length - 1)) * 100) + '%" stop-color="' + colors[i] + '"/>';
        }
        return {
            defs: '<defs><linearGradient id="qrg" x1="' + x1 + '%" y1="' + y1 + '%" x2="' + x2 + '%" y2="' + y2 + '%">' + stops + '</linearGradient></defs>',
            fill: "url(#qrg)"
        };
    }

    function svgLogoImage(opts, totalSize) {
        if (!opts.logo || !opts.logo.src) return "";
        var logoSize = totalSize * (opts.logo.size || 0.2);
        var logoPad = opts.logo.padding || 4;
        var logoX = (totalSize - logoSize) / 2, logoY = (totalSize - logoSize) / 2;
        var bgSize = logoSize + logoPad * 2;
        var bgX = logoX - logoPad, bgY = logoY - logoPad;
        var bgRadius = opts.logo.borderRadius || 4;
        var bgColor = opts.logo.background || opts.background || "#FFFFFF";
        return '<rect x="' + bgX + '" y="' + bgY + '" width="' + bgSize + '" height="' + bgSize + '" rx="' + bgRadius + '" fill="' + bgColor + '"/>' +
            '<image x="' + logoX + '" y="' + logoY + '" width="' + logoSize + '" height="' + logoSize + '" href="' + opts.logo.src + '" preserveAspectRatio="xMidYMid slice"' + (bgRadius ? ' clip-path="inset(0 round ' + bgRadius + 'px)"' : '') + '/>';
    }

    function renderModuleSVG(r, c, opts, matrix, fill) {
        var s = opts.moduleSize;
        var x = (c + opts.margin) * s, y = (r + opts.margin) * s;

        if (opts.style === "dots") {
            var dotR = (s * (opts.dotScale || 0.85)) / 2;
            return '<circle cx="' + (x + s / 2) + '" cy="' + (y + s / 2) + '" r="' + dotR + '" fill="' + fill + '"/>';
        }
        if (opts.style === "rounded") {
            var rr = s * 0.35;
            return '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" rx="' + rr + '" fill="' + fill + '"/>';
        }
        if (opts.style === "diamond") {
            var h = s / 2, cx = x + h, cy = y + h;
            return '<path d="M' + cx + ' ' + y + ' L' + (x + s) + ' ' + cy + ' L' + cx + ' ' + (y + s) + ' L' + x + ' ' + cy + ' Z" fill="' + fill + '"/>';
        }
        if (opts.style === "star") {
            var cx = x + s / 2, cy = y + s / 2, outer = s / 2, inner = s / 4.5, pts = [];
            for (var i = 0; i < 5; i++) {
                var aO = (i * 72 - 90) * Math.PI / 180, aI = ((i * 72) + 36 - 90) * Math.PI / 180;
                pts.push((cx + outer * Math.cos(aO)).toFixed(2) + ',' + (cy + outer * Math.sin(aO)).toFixed(2));
                pts.push((cx + inner * Math.cos(aI)).toFixed(2) + ',' + (cy + inner * Math.sin(aI)).toFixed(2));
            }
            return '<polygon points="' + pts.join(' ') + '" fill="' + fill + '"/>';
        }
        if (opts.style === "liquid") {
            var sz = matrix.size;
            var top = r > 0 && matrix.modules[r - 1][c], bot = r < sz - 1 && matrix.modules[r + 1][c];
            var lft = c > 0 && matrix.modules[r][c - 1], rgt = c < sz - 1 && matrix.modules[r][c + 1];
            var rad = s * 0.42;
            var tlr = (!top && !lft) ? rad : 0, trr = (!top && !rgt) ? rad : 0;
            var brr = (!bot && !rgt) ? rad : 0, blr = (!bot && !lft) ? rad : 0;
            var d = 'M' + (x + tlr) + ' ' + y + ' H' + (x + s - trr) +
                (trr ? ' A' + trr + ' ' + trr + ' 0 0 1 ' + (x + s) + ' ' + (y + trr) : ' H' + (x + s)) +
                ' V' + (y + s - brr) +
                (brr ? ' A' + brr + ' ' + brr + ' 0 0 1 ' + (x + s - brr) + ' ' + (y + s) : ' V' + (y + s)) +
                ' H' + (x + blr) +
                (blr ? ' A' + blr + ' ' + blr + ' 0 0 1 ' + x + ' ' + (y + s - blr) : ' H' + x) +
                ' V' + (y + tlr) +
                (tlr ? ' A' + tlr + ' ' + tlr + ' 0 0 1 ' + (x + tlr) + ' ' + y : ' V' + y) + ' Z';
            return '<path d="' + d + '" fill="' + fill + '"/>';
        }
        return '<rect x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" fill="' + fill + '"/>';
    }

    function renderSVGUnified(matrix, options) {
        var opts = Object.assign({ moduleSize: 10, margin: 4, foreground: "#000000", background: "#FFFFFF", borderRadius: 0, style: "square", dotScale: 0.85 }, options);
        var size = matrix.size, totalSize = (size + opts.margin * 2) * opts.moduleSize;
        var gradInfo = svgGradientDefs(opts), fill = gradInfo.fill;
        var logoRatio = opts.logo ? (opts.logo.size || 0.2) + 0.05 : 0;
        var parts = [];
        parts.push('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ' + totalSize + ' ' + totalSize + '" width="' + totalSize + '" height="' + totalSize + '">');
        if (gradInfo.defs) parts.push(gradInfo.defs);
        parts.push('<rect width="' + totalSize + '" height="' + totalSize + '" fill="' + opts.background + '"' + (opts.borderRadius ? ' rx="' + opts.borderRadius + '"' : '') + '/>');
        for (var r = 0; r < size; r++) {
            for (var c = 0; c < size; c++) {
                if (matrix.modules[r][c] && !isInLogoZone(r, c, size, logoRatio)) {
                    parts.push(renderModuleSVG(r, c, opts, matrix, fill));
                }
            }
        }
        parts.push(svgLogoImage(opts, totalSize));
        parts.push('</svg>');
        return parts.join('');
    }

    function canvasCreateFill(ctx, opts, totalSize) {
        if (opts.gradient) {
            var g = opts.gradient, angle = (g.angle || 0) * Math.PI / 180;
            var cx = totalSize / 2, cy = totalSize / 2, len = totalSize * 0.7;
            var grad = ctx.createLinearGradient(cx - Math.cos(angle) * len, cy - Math.sin(angle) * len, cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
            var colors = g.colors || [opts.foreground, opts.foreground];
            for (var i = 0; i < colors.length; i++) grad.addColorStop(i / (colors.length - 1), colors[i]);
            return grad;
        }
        return opts.foreground;
    }

    function drawModuleCanvas(ctx, r, c, opts, matrix) {
        var s = opts.moduleSize, x = (c + opts.margin) * s, y = (r + opts.margin) * s;

        if (opts.style === "dots") {
            ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, (s * (opts.dotScale || 0.85)) / 2, 0, Math.PI * 2); ctx.fill(); return;
        }
        if (opts.style === "rounded") {
            var rr = s * 0.35;
            ctx.beginPath(); ctx.moveTo(x + rr, y); ctx.arcTo(x + s, y, x + s, y + s, rr); ctx.arcTo(x + s, y + s, x, y + s, rr); ctx.arcTo(x, y + s, x, y, rr); ctx.arcTo(x, y, x + s, y, rr); ctx.closePath(); ctx.fill(); return;
        }
        if (opts.style === "diamond") {
            var h = s / 2;
            ctx.beginPath(); ctx.moveTo(x + h, y); ctx.lineTo(x + s, y + h); ctx.lineTo(x + h, y + s); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill(); return;
        }
        if (opts.style === "star") {
            var cx = x + s / 2, cy = y + s / 2, outer = s / 2, inner = s / 4.5;
            ctx.beginPath();
            for (var i = 0; i < 5; i++) {
                var aO = (i * 72 - 90) * Math.PI / 180, aI = ((i * 72) + 36 - 90) * Math.PI / 180;
                ctx[i === 0 ? 'moveTo' : 'lineTo'](cx + outer * Math.cos(aO), cy + outer * Math.sin(aO));
                ctx.lineTo(cx + inner * Math.cos(aI), cy + inner * Math.sin(aI));
            }
            ctx.closePath(); ctx.fill(); return;
        }
        if (opts.style === "liquid") {
            var sz = matrix.size;
            var top = r > 0 && matrix.modules[r - 1][c], bot = r < sz - 1 && matrix.modules[r + 1][c];
            var lft = c > 0 && matrix.modules[r][c - 1], rgt = c < sz - 1 && matrix.modules[r][c + 1];
            var rad = s * 0.42;
            var tlr = (!top && !lft) ? rad : 0, trr = (!top && !rgt) ? rad : 0;
            var brr = (!bot && !rgt) ? rad : 0, blr = (!bot && !lft) ? rad : 0;
            ctx.beginPath(); ctx.moveTo(x + tlr, y); ctx.lineTo(x + s - trr, y);
            if (trr) ctx.arcTo(x + s, y, x + s, y + trr, trr); ctx.lineTo(x + s, y + s - brr);
            if (brr) ctx.arcTo(x + s, y + s, x + s - brr, y + s, brr); ctx.lineTo(x + blr, y + s);
            if (blr) ctx.arcTo(x, y + s, x, y + s - blr, blr); ctx.lineTo(x, y + tlr);
            if (tlr) ctx.arcTo(x, y, x + tlr, y, tlr); ctx.closePath(); ctx.fill(); return;
        }
        ctx.fillRect(x, y, s, s);
    }

    function renderCanvas(matrix, canvas, options) {
        var opts = Object.assign({ moduleSize: 10, margin: 4, foreground: "#000000", background: "#FFFFFF", style: "square", dotScale: 0.85 }, options);
        var size = matrix.size, totalSize = (size + opts.margin * 2) * opts.moduleSize;
        canvas.width = totalSize; canvas.height = totalSize;
        var ctx = canvas.getContext("2d");
        var logoRatio = opts.logo ? (opts.logo.size || 0.2) + 0.05 : 0;
        ctx.fillStyle = opts.background; ctx.fillRect(0, 0, totalSize, totalSize);
        ctx.fillStyle = canvasCreateFill(ctx, opts, totalSize);
        for (var r = 0; r < size; r++) {
            for (var c = 0; c < size; c++) {
                if (matrix.modules[r][c] && !isInLogoZone(r, c, size, logoRatio)) drawModuleCanvas(ctx, r, c, opts, matrix);
            }
        }
        if (opts.logo && opts.logo.src && typeof Image !== "undefined") {
            var logoSize = totalSize * (opts.logo.size || 0.2), logoPad = opts.logo.padding || 4;
            var logoX = (totalSize - logoSize) / 2, logoY = (totalSize - logoSize) / 2;
            var bgSize = logoSize + logoPad * 2, bgX = logoX - logoPad, bgY = logoY - logoPad;
            var bgRadius = opts.logo.borderRadius || 4, bgColor = opts.logo.background || opts.background || "#FFFFFF";
            ctx.fillStyle = bgColor; ctx.beginPath();
            ctx.moveTo(bgX + bgRadius, bgY); ctx.arcTo(bgX + bgSize, bgY, bgX + bgSize, bgY + bgSize, bgRadius);
            ctx.arcTo(bgX + bgSize, bgY + bgSize, bgX, bgY + bgSize, bgRadius); ctx.arcTo(bgX, bgY + bgSize, bgX, bgY, bgRadius);
            ctx.arcTo(bgX, bgY, bgX + bgSize, bgY, bgRadius); ctx.closePath(); ctx.fill();
            var img = new Image(); img.crossOrigin = "anonymous";
            img.onload = function () {
                ctx.save(); ctx.beginPath(); ctx.moveTo(logoX + bgRadius, logoY);
                ctx.arcTo(logoX + logoSize, logoY, logoX + logoSize, logoY + logoSize, bgRadius);
                ctx.arcTo(logoX + logoSize, logoY + logoSize, logoX, logoY + logoSize, bgRadius);
                ctx.arcTo(logoX, logoY + logoSize, logoX, logoY, bgRadius);
                ctx.arcTo(logoX, logoY, logoX + logoSize, logoY, bgRadius); ctx.closePath(); ctx.clip();
                ctx.drawImage(img, logoX, logoY, logoSize, logoSize); ctx.restore();
            };
            img.src = opts.logo.src;
        }
        return canvas;
    }

    function renderDataURL(matrix, options) {
        var opts = Object.assign({ format: "image/png" }, options);
        var canvas = document.createElement("canvas");
        renderCanvas(matrix, canvas, opts);
        return canvas.toDataURL(opts.format);
    }

    function renderTable(matrix, options) {
        var opts = Object.assign({ moduleSize: 4, foreground: "#000000", background: "#FFFFFF", borderRadius: 0 }, options);
        var parts = ['<table style="border-collapse:collapse;border-spacing:0;margin:0;padding:0;' + (opts.borderRadius ? 'border-radius:' + opts.borderRadius + 'px;overflow:hidden;' : '') + '">'];
        for (var r = 0; r < matrix.size; r++) {
            parts.push("<tr>");
            for (var c = 0; c < matrix.size; c++) {
                var color = matrix.modules[r][c] ? opts.foreground : opts.background;
                parts.push('<td style="width:' + opts.moduleSize + 'px;height:' + opts.moduleSize + 'px;background:' + color + ';padding:0;margin:0;border:0"></td>');
            }
            parts.push("</tr>");
        }
        parts.push("</table>");
        return parts.join("");
    }

    function JSQR(data, options) {
        if (!(this instanceof JSQR)) return new JSQR(data, options);
        this.options = Object.assign({
            ecLevel: "M", moduleSize: 10, margin: 4, foreground: "#000000", background: "#FFFFFF",
            style: "square", dotScale: 0.85, borderRadius: 0, logo: null, gradient: null
        }, options);
        this.data = data;
        this.matrix = generateMatrix(data, this.options.ecLevel);
        this.version = this.matrix.version;
        this.size = this.matrix.size;
        this.moduleCount = this.size;
    }

    JSQR.prototype.toSVG = function (options) {
        return renderSVGUnified(this.matrix, Object.assign({}, this.options, options));
    };

    JSQR.prototype.toCanvas = function (canvas, options) {
        return renderCanvas(this.matrix, canvas, Object.assign({}, this.options, options));
    };

    JSQR.prototype.toDataURL = function (options) {
        return renderDataURL(this.matrix, Object.assign({}, this.options, options));
    };

    JSQR.prototype.toTable = function (options) {
        return renderTable(this.matrix, Object.assign({}, this.options, options));
    };

    JSQR.prototype.toBoolean2D = function () {
        var result = [];
        for (var r = 0; r < this.size; r++) result.push(this.matrix.modules[r].slice());
        return result;
    };

    JSQR.prototype.appendTo = function (element, options) {
        var mergedOpts = Object.assign({}, this.options, options);
        var container = typeof element === "string" ? document.querySelector(element) : element;
        if (!container) throw new Error("Target element not found");
        if (mergedOpts.renderer === "canvas") {
            var canvas = document.createElement("canvas");
            this.toCanvas(canvas, mergedOpts);
            container.appendChild(canvas);
            return canvas;
        }
        var div = document.createElement("div");
        div.innerHTML = this.toSVG(mergedOpts);
        var svg = div.firstChild;
        container.appendChild(svg);
        return svg;
    };

    JSQR.version = "1.1.0";
    JSQR.ECL = ECL;
    JSQR.MODE = MODE;
    JSQR.STYLES = ["square", "dots", "rounded", "diamond", "star", "liquid"];

    JSQR.generate = function (data, options) { return new JSQR(data, options); };
    JSQR.toSVG = function (data, options) { return new JSQR(data, options).toSVG(); };
    JSQR.toDataURL = function (data, options) { return new JSQR(data, options).toDataURL(); };
    JSQR.toCanvas = function (data, canvas, options) { return new JSQR(data, options).toCanvas(canvas); };

    return JSQR;
});
