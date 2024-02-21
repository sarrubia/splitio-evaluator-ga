"use strict";
/* file : bloom-filter.ts
MIT License

Copyright (c) 2017 Thomas Minier & Arnaud Grall

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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var base_filter_1 = __importDefault(require("../base-filter"));
var bit_set_1 = __importDefault(require("./bit-set"));
var exportable_1 = require("../exportable");
var formulas_1 = require("../formulas");
/**
 * A Bloom filter is a space-efficient probabilistic data structure, conceived by Burton Howard Bloom in 1970,
 * that is used to test whether an element is a member of a set. False positive matches are possible, but false negatives are not.
 *
 * Reference: Bloom, B. H. (1970). Space/time trade-offs in hash coding with allowable errors. Communications of the ACM, 13(7), 422-426.
 * @see {@link http://crystal.uta.edu/~mcguigan/cse6350/papers/Bloom.pdf} for more details about classic Bloom Filters.
 * @author Thomas Minier
 * @author Arnaud Grall
 */
var BloomFilter = /** @class */ (function (_super) {
    __extends(BloomFilter, _super);
    /**
     * Constructor
     * @param size - The number of cells
     * @param nbHashes - The number of hash functions used
     */
    function BloomFilter(size, nbHashes) {
        var _this = _super.call(this) || this;
        if (nbHashes < 1) {
            throw new Error("A BloomFilter cannot uses less than one hash function, while you tried to use ".concat(nbHashes, "."));
        }
        _this._size = size;
        _this._nbHashes = nbHashes;
        _this._filter = new bit_set_1.default(size);
        return _this;
    }
    BloomFilter_1 = BloomFilter;
    /**
     * Create an optimal bloom filter providing the maximum of elements stored and the error rate desired
     * @param  nbItems      - The maximum number of item to store
     * @param  errorRate  - The error rate desired for a maximum of items inserted
     * @return A new {@link BloomFilter}
     */
    BloomFilter.create = function (nbItems, errorRate) {
        var size = (0, formulas_1.optimalFilterSize)(nbItems, errorRate);
        var hashes = (0, formulas_1.optimalHashes)(size, nbItems);
        return new this(size, hashes);
    };
    /**
     * Build a new Bloom Filter from an existing iterable with a fixed error rate
     * @param items - The iterable used to populate the filter
     * @param errorRate - The error rate, i.e. 'false positive' rate, targeted by the filter
     * @param seed - The random number seed (optional)
     * @return A new Bloom Filter filled with the iterable's elements
     * @example
     * ```js
     * // create a filter with a false positive rate of 0.1
     * const filter = BloomFilter.from(['alice', 'bob', 'carl'], 0.1);
     * ```
     */
    BloomFilter.from = function (items, errorRate, seed) {
        var array = Array.from(items);
        var filter = BloomFilter_1.create(array.length, errorRate);
        if (typeof seed === 'number') {
            filter.seed = seed;
        }
        array.forEach(function (element) { return filter.add(element); });
        return filter;
    };
    Object.defineProperty(BloomFilter.prototype, "size", {
        /**
         * Get the optimal size of the filter
         * @return The size of the filter
         */
        get: function () {
            return this._size;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BloomFilter.prototype, "length", {
        /**
         * Get the number of bits currently set in the filter
         * @return The filter length
         */
        get: function () {
            return this._filter.bitCount();
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Add an element to the filter
     * @param element - The element to add
     * @example
     * ```js
     * const filter = new BloomFilter(15, 0.1);
     * filter.add('foo');
     * ```
     */
    BloomFilter.prototype.add = function (element) {
        var indexes = this._hashing.getIndexes(element, this._size, this._nbHashes, this.seed);
        for (var i = 0; i < indexes.length; i++) {
            this._filter.add(indexes[i]);
        }
    };
    /**
     * Test an element for membership
     * @param element - The element to look for in the filter
     * @return False if the element is definitively not in the filter, True is the element might be in the filter
     * @example
     * ```js
     * const filter = new BloomFilter(15, 0.1);
     * filter.add('foo');
     * console.log(filter.has('foo')); // output: true
     * console.log(filter.has('bar')); // output: false
     * ```
     */
    BloomFilter.prototype.has = function (element) {
        var indexes = this._hashing.getIndexes(element, this._size, this._nbHashes, this.seed);
        for (var i = 0; i < indexes.length; i++) {
            if (!this._filter.has(indexes[i])) {
                return false;
            }
        }
        return true;
    };
    /**
     * Get the current false positive rate (or error rate) of the filter
     * @return The current false positive rate of the filter
     * @example
     * ```js
     * const filter = new BloomFilter(15, 0.1);
     * console.log(filter.rate()); // output: something around 0.1
     * ```
     */
    BloomFilter.prototype.rate = function () {
        return Math.pow(1 - Math.exp(-this.length / this._size), this._nbHashes);
    };
    /**
     * Check if another Bloom Filter is equal to this one
     * @param  other - The filter to compare to this one
     * @return True if they are equal, false otherwise
     */
    BloomFilter.prototype.equals = function (other) {
        if (this._size !== other._size || this._nbHashes !== other._nbHashes) {
            return false;
        }
        return this._filter.equals(other._filter);
    };
    var BloomFilter_1;
    __decorate([
        (0, exportable_1.Field)(),
        __metadata("design:type", Number)
    ], BloomFilter.prototype, "_size", void 0);
    __decorate([
        (0, exportable_1.Field)(),
        __metadata("design:type", Number)
    ], BloomFilter.prototype, "_nbHashes", void 0);
    __decorate([
        (0, exportable_1.Field)(function (f) { return f.export(); }, function (data) {
            // create the bitset from new and old array-based exported structure
            if (Array.isArray(data)) {
                var bs_1 = new bit_set_1.default(data.length);
                data.forEach(function (val, index) {
                    if (val !== 0) {
                        bs_1.add(index);
                    }
                });
                return bs_1;
            }
            else {
                return bit_set_1.default.import(data);
            }
        }),
        __metadata("design:type", bit_set_1.default
        /**
         * Constructor
         * @param size - The number of cells
         * @param nbHashes - The number of hash functions used
         */
        )
    ], BloomFilter.prototype, "_filter", void 0);
    BloomFilter = BloomFilter_1 = __decorate([
        (0, exportable_1.AutoExportable)('BloomFilter', ['_seed']),
        __param(0, (0, exportable_1.Parameter)('_size')),
        __param(1, (0, exportable_1.Parameter)('_nbHashes')),
        __metadata("design:paramtypes", [Number, Number])
    ], BloomFilter);
    return BloomFilter;
}(base_filter_1.default));
exports.default = BloomFilter;
