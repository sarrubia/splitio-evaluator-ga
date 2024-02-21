"use strict";
/* file : counting-bloom-filter.ts
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
var exportable_1 = require("../exportable");
var formulas_1 = require("../formulas");
var utils_1 = require("../utils");
/**
 * A Counting Bloom filter works in a similar manner as a regular Bloom filter; however, it is able to keep track of insertions and deletions. In a counting Bloom filter, each entry in the Bloom filter is a small counter associated with a basic Bloom filter bit.
 *
 * Reference: F. Bonomi, M. Mitzenmacher, R. Panigrahy, S. Singh, and G. Varghese, “An Improved Construction for Counting Bloom Filters,” in 14th Annual European Symposium on Algorithms, LNCS 4168, 2006, pp.
684–695.
 * @author Thomas Minier & Arnaud Grall
 */
var CountingBloomFilter = /** @class */ (function (_super) {
    __extends(CountingBloomFilter, _super);
    /**
     * Constructor
     * @param size - The size of the filter
     * @param nbHashes - The number of hash functions
     */
    function CountingBloomFilter(size, nbHashes) {
        var _this = _super.call(this) || this;
        if (nbHashes < 1) {
            throw new Error("A CountingBloomFilter must used at least one hash function, but you tried to use ".concat(nbHashes, " functions. Consider increasing it."));
        }
        _this._size = size; // fm.optimalFilterSize(capacity, errorRate)
        _this._nbHashes = nbHashes; // fm.optimalHashes(this._size, capacity)
        // the filter contains tuples [bit, counter]
        _this._filter = (0, utils_1.allocateArray)(_this._size, function () { return [0, 0]; });
        _this._length = 0;
        return _this;
    }
    CountingBloomFilter_1 = CountingBloomFilter;
    /**
     * Allocate a CountingBloomFilter with a target maximum capacity and error rate
     * @param  capacity - The maximum capacity of the filter
     * @param  errorRate - The error rate of the filter
     * @return A new {@link CountingBloomFilter}
     */
    CountingBloomFilter.create = function (capacity, errorRate) {
        var s = (0, formulas_1.optimalFilterSize)(capacity, errorRate);
        return new CountingBloomFilter_1(s, (0, formulas_1.optimalHashes)(s, capacity));
    };
    /**
     * Build a new Bloom Filter from an iterable with a fixed error rate
     * @param items - Iterable used to populate the filter
     * @param errorRate - The error rate of the filter
     * @return A new Bloom Filter filled with the iterable's elements
     * @example
     * ```js
     * // create a filter with a false positive rate of 0.1
     * const filter = CountingBloomFilter.from(['alice', 'bob', 'carl'], 0.1);
     * ```
     */
    CountingBloomFilter.from = function (items, errorRate) {
        var array = Array.from(items);
        var filter = CountingBloomFilter_1.create(array.length, errorRate);
        array.forEach(function (element) { return filter.add(element); });
        return filter;
    };
    Object.defineProperty(CountingBloomFilter.prototype, "size", {
        /**
         * Get the optimal size of the filter
         */
        get: function () {
            return this._size;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CountingBloomFilter.prototype, "length", {
        /**
         * Get the number of elements currently in the filter
         */
        get: function () {
            return this._length;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Add an element to the filter
     * @param element - The element to add
     * @example
     * ```js
     * const filter = new CountingBloomFilter(15, 0.1);
     * filter.add('foo');
     * ```
     */
    CountingBloomFilter.prototype.add = function (element) {
        var indexes = this._hashing.getIndexes(element, this._size, this._nbHashes, this.seed);
        for (var i = 0; i < indexes.length; i++) {
            // increment counter
            this._filter[indexes[i]][1] += 1;
            // set bit if necessary
            if (this._filter[indexes[i]][1] > 0) {
                this._filter[indexes[i]][0] = 1;
            }
        }
        this._length++;
    };
    /**
     * Remove an element from the filter
     * @param element - The element to delete
     * @example
     * ```js
     * const filter = new CountingBloomFilter(15, 0.1);
     * filter.remove('foo');
     * ```
     */
    CountingBloomFilter.prototype.remove = function (element) {
        var indexes = this._hashing.getIndexes(element, this._size, this._nbHashes, this.seed);
        var success = true;
        for (var i = 0; i < indexes.length; i++) {
            // decrement counter
            this._filter[indexes[i]][1] -= 1;
            // set bit if necessary
            if (this._filter[indexes[i]][1] <= 0) {
                this._filter[indexes[i]][0] = 0;
            }
        }
        this._length--;
        return success;
    };
    /**
     * Test an element for membership
     * @param element - The element to look for in the filter
     * @return False if the element is definitively not in the filter, True is the element might be in the filter
     * @example
     * ```js
     * const filter = new CountingBloomFilter(15, 0.1);
     * filter.add('foo');
     * console.log(filter.has('foo')); // output: true
     * console.log(filter.has('bar')); // output: false
     * ```
     */
    CountingBloomFilter.prototype.has = function (element) {
        var indexes = this._hashing.getIndexes(element, this._size, this._nbHashes, this.seed);
        for (var i = 0; i < indexes.length; i++) {
            if (!this._filter[indexes[i]][0]) {
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
    CountingBloomFilter.prototype.rate = function () {
        return Math.pow(1 - Math.exp((-this._nbHashes * this._length) / this._size), this._nbHashes);
    };
    /**
     * Check if another Counting Bloom Filter is equal to this one
     * @param  filter - The filter to compare to this one
     * @return True if they are equal, false otherwise
     */
    CountingBloomFilter.prototype.equals = function (other) {
        if (this._size !== other._size ||
            this._nbHashes !== other._nbHashes ||
            this._length !== other._length) {
            return false;
        }
        return this._filter.every(function (value, index) {
            return other._filter[index][0] === value[0] &&
                other._filter[index][1] === value[1];
        });
    };
    var CountingBloomFilter_1;
    __decorate([
        (0, exportable_1.Field)(),
        __metadata("design:type", Number)
    ], CountingBloomFilter.prototype, "_size", void 0);
    __decorate([
        (0, exportable_1.Field)(),
        __metadata("design:type", Number)
    ], CountingBloomFilter.prototype, "_nbHashes", void 0);
    __decorate([
        (0, exportable_1.Field)(),
        __metadata("design:type", Array)
    ], CountingBloomFilter.prototype, "_filter", void 0);
    __decorate([
        (0, exportable_1.Field)(),
        __metadata("design:type", Number)
    ], CountingBloomFilter.prototype, "_length", void 0);
    CountingBloomFilter = CountingBloomFilter_1 = __decorate([
        (0, exportable_1.AutoExportable)('CountingBloomFilter', ['_seed']),
        __param(0, (0, exportable_1.Parameter)('_size')),
        __param(1, (0, exportable_1.Parameter)('_nbHashes')),
        __metadata("design:paramtypes", [Number, Number])
    ], CountingBloomFilter);
    return CountingBloomFilter;
}(base_filter_1.default));
exports.default = CountingBloomFilter;
