"use strict";
/* file : utils.ts
MIT License

Copyright (c) 2017-2020 Thomas Minier & Arnaud Grall

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultSeed = exports.isEmptyBuffer = exports.xorBuffer = exports.randomInt = exports.numberToHex = exports.allocateArray = exports.BufferError = void 0;
/**
 * BufferError
 */
exports.BufferError = 'The buffer class must be available, if you are a browser user use the buffer package (https://www.npmjs.com/package/buffer)';
/**
 * Create a new array fill with a base value
 * @param size - The size of the array
 * @param defaultValue - The default value used to fill the array. If it's a function, it will be invoked to get the default value.
 * @return A newly allocated array
 * @memberof Utils
 */
function allocateArray(size, defaultValue) {
    var array = new Array(size);
    var getDefault = typeof defaultValue === 'function'
        ? defaultValue
        : function () { return defaultValue; };
    for (var ind = 0; ind < size; ind++) {
        array[ind] = getDefault();
    }
    return array;
}
exports.allocateArray = allocateArray;
/**
 * Return a number to its Hex format by padding zeroes if length mod 4 != 0
 * @param elem the element to transform in HEX
 * @returns the HEX number padded of zeroes
 */
function numberToHex(elem) {
    var e = Number(elem).toString(16);
    if (e.length % 4 !== 0) {
        e = '0'.repeat(4 - (e.length % 4)) + e;
    }
    return e;
}
exports.numberToHex = numberToHex;
/**
 * Generate a random int between two bounds (included)
 * @param min - The lower bound
 * @param max - The upper bound
 * @param random - Function used to generate random floats
 * @return A random int bewteen lower and upper bound (included)
 * @memberof Utils
 * @author Thomas Minier
 */
function randomInt(min, max, random) {
    if (random === undefined) {
        random = Math.random;
    }
    min = Math.ceil(min);
    max = Math.floor(max);
    var rn = random();
    return Math.floor(rn * (max - min + 1)) + min;
}
exports.randomInt = randomInt;
/**
 * Return the non-destructive XOR of two buffers
 * @param a - The buffer to copy, then to xor with b
 * @param b - The buffer to xor with
 * @return The results of the XOR between the two buffers
 * @author Arnaud Grall
 */
function xorBuffer(a, b) {
    var length = Math.max(a.length, b.length);
    var buffer = Buffer.allocUnsafe(length).fill(0);
    for (var i = 0; i < length; ++i) {
        if (i < a.length && i < b.length) {
            buffer[length - i - 1] = a[a.length - i - 1] ^ b[b.length - i - 1];
        }
        else if (i < a.length && i >= b.length) {
            buffer[length - i - 1] ^= a[a.length - i - 1];
        }
        else if (i < b.length && i >= a.length) {
            buffer[length - i - 1] ^= b[b.length - i - 1];
        }
    }
    // now need to remove leading zeros in the buffer if any
    var start = 0;
    var it = buffer.values();
    var value = it.next();
    while (!value.done && value.value === 0) {
        start++;
        value = it.next();
    }
    return buffer.slice(start);
}
exports.xorBuffer = xorBuffer;
/**
 * Return true if the buffer is empty, i.e., all value are equals to 0.
 * @param  buffer - The buffer to inspect
 * @return True if the buffer only contains zero, False otherwise
 * @author Arnaud Grall
 */
function isEmptyBuffer(buffer) {
    var e_1, _a;
    if (buffer === null || !buffer)
        return true;
    try {
        for (var buffer_1 = __values(buffer), buffer_1_1 = buffer_1.next(); !buffer_1_1.done; buffer_1_1 = buffer_1.next()) {
            var value = buffer_1_1.value;
            if (value !== 0) {
                return false;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (buffer_1_1 && !buffer_1_1.done && (_a = buffer_1.return)) _a.call(buffer_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return true;
}
exports.isEmptyBuffer = isEmptyBuffer;
/**
 * Return the default seed used in the package
 * @return A seed as a floating point number
 * @author Arnaud Grall
 */
function getDefaultSeed() {
    return 0x1234567890;
}
exports.getDefaultSeed = getDefaultSeed;
