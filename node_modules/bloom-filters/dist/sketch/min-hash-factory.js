"use strict";
/* file: min-hash-factory.ts
MIT License

Copyright (c) 2019-2020 Thomas Minier

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the 'Software'), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
Object.defineProperty(exports, "__esModule", { value: true });
var min_hash_1 = require("./min-hash");
var lodash_1 = require("lodash");
/**
 * Test if a number is a prime number
 * @param x - Number to test
 * @return True if the input is a prime number, False otherwise
 */
function isPrime(x) {
    if (x !== 2 && x % 2 === 0) {
        return false;
    }
    for (var i = 2; i < Math.sqrt(x); i++) {
        if (x % i === 0) {
            return false;
        }
    }
    return true;
}
/**
 * Find the fist prime number superior to a number
 * @param x - Input number
 * @return The fist prime number superior to the input number
 */
function closestPrime(x) {
    var i = 0;
    var stop = false;
    var to_return = i;
    while (!stop) {
        if (isPrime(x + i)) {
            to_return = x + i;
            stop = true;
        }
        i++;
    }
    return to_return;
}
/**
 * A factory to create MinHash sketches using the same set of hash functions.
 *
 * **WARNING**: Only the MinHash produced by the same factory can be compared between them.
 * @author Thomas Minier
 */
var MinHashFactory = /** @class */ (function () {
    /**
     * Constructor
     * @param nbHashes - Number of hash functions to use for comouting the MinHash signature
     * @param maxValue - The highest value that can be found in the set to compare
     */
    function MinHashFactory(nbHashes, maxValue) {
        this._nbHashes = nbHashes;
        this._maxValue = maxValue;
        this._hashFunctions = [];
        // generate hash functions
        var c = closestPrime(this._maxValue);
        for (var i = 0; i < this._nbHashes; i++) {
            var a = (0, lodash_1.random)(0, this._maxValue, false);
            var b = (0, lodash_1.random)(0, this._maxValue, false);
            this._hashFunctions.push({ a: a, b: b, c: c });
        }
    }
    /**
     * Create a new MinHash set
     * @return A new MinHash set
     */
    MinHashFactory.prototype.create = function () {
        return new min_hash_1.MinHash(this._nbHashes, this._hashFunctions);
    };
    return MinHashFactory;
}());
exports.default = MinHashFactory;
