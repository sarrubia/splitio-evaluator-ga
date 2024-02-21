"use strict";
/* file : base-filter.ts
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var seedrandom_1 = __importDefault(require("seedrandom"));
var hashing_1 = __importDefault(require("./hashing/hashing"));
var utils_1 = require("./utils");
/**
 * A base class for implementing probailistic filters
 * @author Thomas Minier
 * @author Arnaud Grall
 */
var BaseFilter = /** @class */ (function () {
    function BaseFilter() {
        this._seed = (0, utils_1.getDefaultSeed)();
        this._rng = (0, seedrandom_1.default)("".concat(this._seed));
        this._hashing = new hashing_1.default();
    }
    Object.defineProperty(BaseFilter.prototype, "seed", {
        /**
         * Get the seed used in this structure
         */
        get: function () {
            return this._seed;
        },
        /**
         * Set the seed for this structure
         * @param  seed the new seed that will be used in this structure
         */
        set: function (seed) {
            this._seed = seed;
            this._rng = (0, seedrandom_1.default)("".concat(this._seed));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseFilter.prototype, "random", {
        /**
         * Get a function used to draw random number
         * @return A factory function used to draw random integer
         */
        get: function () {
            return this._rng;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Return a next random seeded int32 integer
     * @returns
     */
    BaseFilter.prototype.nextInt32 = function () {
        return this._rng.int32();
    };
    /**
     * Save the current structure as a JSON
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    BaseFilter.prototype.saveAsJSON = function () {
        throw new Error('not-implemented');
    };
    /**
     * Load an Object from a provided JSON object
     * @param json the JSON object to load
     * @return Return the Object loaded from the provided JSON object
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    BaseFilter.fromJSON = function (json) {
        throw new Error("not-implemented");
    };
    return BaseFilter;
}());
exports.default = BaseFilter;
