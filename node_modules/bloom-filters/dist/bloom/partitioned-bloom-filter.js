"use strict";
/* file : partitioned-bloom-filter.ts
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
var utils_1 = require("../utils");
var bit_set_1 = __importDefault(require("./bit-set"));
/**
 * Return the optimal number of hashes needed for a given error rate and load factor
 * P = p^k <=> k = ln(P)/ln(p)
 * @param  errorRate - The provided error rate
 * @param  loadFactor - The load factor, ideally 0.5
 * @return The number of hash function to use
 */
function computeOptimalNumberOfhashes(errorRate, loadFactor) {
    // P = p^k <=> k = ln(P)/ln(p)
    return Math.ceil(Math.log(errorRate) / Math.log(loadFactor));
}
/**
 * Return the total number of bits needed for this filter
 * n = M*(ln(p)ln(1-p))/(-ln(P)) <=> M = (n*-ln(P)/(ln(p)ln(1-p))
 * @param  size - The number of desired items
 * @param  rate - The error rate desired
 * @param  loadFactor - The load factor desired
 * @return The total number of cells this filter will have
 */
function computeOptimalNumberOfCells(size, rate, loadFactor) {
    // n=M*(ln(p)ln(1-p))/(-ln(P)) <=> M=(n*-ln(P)/(ln(p)ln(1-p))
    return Math.ceil((size * -Math.log(rate)) / (Math.log(loadFactor) * Math.log(1 - loadFactor)));
}
/**
 * Return the maximum number of items this filter can store
 * @param  totalBits - The total number of cells in the filter
 * @param  loadFactor - The load factor desired
 * @param  nbHashes - The number of hash functions used
 * @return The maximum number of items this filter store
 */
function computeNumberOfItems(totalBits, loadFactor, nbHashes) {
    return Math.ceil((totalBits * (Math.log(loadFactor) * Math.log(1 - loadFactor))) /
        -(nbHashes * Math.log(loadFactor)));
}
/**
 * A Partitioned Bloom Filter is a variation of a classic Bloom filter.
 *
 * This filter works by partitioning the M-sized bit array into k slices of size m = M/k bits, k = nb of hash functions in the filter.
 * Each hash function produces an index over m for its respective slice.
 * Thus, each element is described by exactly k bits, meaning the distribution of false positives is uniform across all elements.
 *
 * Be careful, as a Partitioned Bloom Filter have much higher collison risks that a classic Bloom Filter on small sets of data.
 *
 * Reference: Chang, F., Feng, W. C., & Li, K. (2004, March). Approximate caches for packet classification. In INFOCOM 2004. Twenty-third AnnualJoint Conference of the IEEE Computer and Communications Societies (Vol. 4, pp. 2196-2207). IEEE.
 * @see {@link https://pdfs.semanticscholar.org/0e18/e24b37a1f4196fddf8c9ff8e4368b74cfd88.pdf} for more details about Partitioned Bloom Filters
 * @author Thomas Minier & Arnaud Grall
 */
var PartitionedBloomFilter = /** @class */ (function (_super) {
    __extends(PartitionedBloomFilter, _super);
    /**
     * Constructor
     * @param size - The total number of cells
     * @param nbHashes - The number of hash functions
     * @param loadFactor - The load factor
     * @param capacity - The filter capacity
     */
    function PartitionedBloomFilter(size, nbHashes, loadFactor, capacity) {
        var _this = _super.call(this) || this;
        _this._size = size;
        _this._nbHashes = nbHashes;
        _this._loadFactor = loadFactor;
        _this._m = Math.ceil(_this._size / _this._nbHashes);
        _this._filter = (0, utils_1.allocateArray)(_this._nbHashes, function () { return new bit_set_1.default(_this._m); });
        _this._capacity =
            capacity !== undefined
                ? capacity
                : computeNumberOfItems(_this._size, loadFactor, nbHashes);
        return _this;
    }
    PartitionedBloomFilter_1 = PartitionedBloomFilter;
    /**
     * Return a PartitionedBloomFilter for a given number of elements and under a given error rate
     * @param  size - The max allowable number of items to insert
     * @param  errorRate - The desired error rate
     * @return A new PartitionedBloomFilter optimal for the given parameters
     */
    PartitionedBloomFilter.create = function (size, errorRate, loadFactor) {
        if (loadFactor === void 0) { loadFactor = 0.5; }
        var capacity = computeOptimalNumberOfCells(size, errorRate, loadFactor);
        var nbHashes = computeOptimalNumberOfhashes(errorRate, loadFactor);
        return new PartitionedBloomFilter_1(capacity, nbHashes, loadFactor, size);
    };
    /**
     * Build a new Partitioned Bloom Filter from an existing iterable with a fixed error rate
     * @param items - The iterable used to populate the filter
     * @param errorRate - The error rate, i.e. 'false positive' rate, targetted by the filter
     * @param loadFactor - The filter's load factor
     * @return A new Bloom Filter filled with the iterable's elements
     * @example
     * ```js
     * // create a filter with a false positive rate of 0.1
     * const filter = PartitionedBloomFilter.from(['alice', 'bob', 'carl'], 0.1);
     * ```
     */
    PartitionedBloomFilter.from = function (items, errorRate, loadFactor) {
        if (loadFactor === void 0) { loadFactor = 0.5; }
        var array = Array.from(items);
        var filter = PartitionedBloomFilter_1.create(array.length, errorRate, loadFactor);
        array.forEach(function (element) { return filter.add(element); });
        return filter;
    };
    Object.defineProperty(PartitionedBloomFilter.prototype, "capacity", {
        /**
         * Get the filter capacity, i.e. the maximum number of elements it will contains
         */
        get: function () {
            return this._capacity;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PartitionedBloomFilter.prototype, "size", {
        /**
         * Get the size of the filter
         */
        get: function () {
            return this._size;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PartitionedBloomFilter.prototype, "loadFactor", {
        /**
         * Get the filter's load factor
         */
        get: function () {
            return this._loadFactor;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Add an element to the filter
     * @param element - The element to add
     * @example
     * ```js
     * const filter = new PartitionedBloomFilter(15, 0.1);
     * filter.add('foo');
     * ```
     */
    PartitionedBloomFilter.prototype.add = function (element) {
        var indexes = this._hashing.getIndexes(element, this._m, this._nbHashes, this.seed);
        for (var i = 0; i < this._nbHashes; i++) {
            this._filter[i].add(indexes[i]);
        }
    };
    /**
     * Test an element for membership
     * @param element - The element to look for in the filter
     * @return False if the element is definitively not in the filter, True is the element might be in the filter
     * @example
     * ```js
     * const filter = new PartitionedBloomFilter(15, 0.1);
     * filter.add('foo');
     * console.log(filter.has('foo')); // output: true
     * console.log(filter.has('bar')); // output: false
     * ```
     */
    PartitionedBloomFilter.prototype.has = function (element) {
        var indexes = this._hashing.getIndexes(element, this._m, this._nbHashes, this.seed);
        for (var i = 0; i < this._nbHashes; i++) {
            if (!this._filter[i].has(indexes[i])) {
                return false;
            }
        }
        return true;
    };
    /**
     * Compute the current false positive rate (or error rate) of the filter
     * @return The current false positive rate of the filter
     * @example
     * ```js
     * const filter = PartitionedBloomFilter.create(15, 0.1);
     * console.log(filter.rate()); // output: something around 0.1
     * ```
     */
    PartitionedBloomFilter.prototype.rate = function () {
        // get the error rate for the first bucket (1 - (1 - 1/m)^n), where m is the size of a slice and n is the number of inserted elements
        var p = this._currentload();
        // P = p^k
        return Math.pow(p, this._nbHashes);
    };
    /**
     * Check if another Partitioned Bloom Filter is equal to this one
     * @param  filter - The filter to compare to this one
     * @return True if they are equal, false otherwise
     */
    PartitionedBloomFilter.prototype.equals = function (other) {
        if (this._size !== other._size ||
            this._nbHashes !== other._nbHashes ||
            this._loadFactor !== other._loadFactor) {
            return false;
        }
        return this._filter.every(function (array, outerIndex) {
            return other._filter[outerIndex].equals(array);
        });
    };
    /**
     * Return the current load of this filter, iterate on all buckets
     * @return An integer between 0 and 1, where 0 = filter empty and 1 = filter full
     */
    PartitionedBloomFilter.prototype._currentload = function () {
        var values = this._filter.map(function (bucket) {
            return bucket.bitCount();
        });
        var used = values.reduce(function (a, b) { return a + b; }, 0);
        return used / this._size;
    };
    var PartitionedBloomFilter_1;
    __decorate([
        (0, exportable_1.Field)(),
        __metadata("design:type", Number)
    ], PartitionedBloomFilter.prototype, "_size", void 0);
    __decorate([
        (0, exportable_1.Field)(),
        __metadata("design:type", Number)
    ], PartitionedBloomFilter.prototype, "_nbHashes", void 0);
    __decorate([
        (0, exportable_1.Field)(),
        __metadata("design:type", Number)
    ], PartitionedBloomFilter.prototype, "_loadFactor", void 0);
    __decorate([
        (0, exportable_1.Field)(),
        __metadata("design:type", Number)
    ], PartitionedBloomFilter.prototype, "_m", void 0);
    __decorate([
        (0, exportable_1.Field)(function (sets) { return sets.map(function (s) { return s.export(); }); }, function (array) {
            return array.map(function (data) {
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
            });
        }),
        __metadata("design:type", Array)
    ], PartitionedBloomFilter.prototype, "_filter", void 0);
    __decorate([
        (0, exportable_1.Field)(),
        __metadata("design:type", Number)
    ], PartitionedBloomFilter.prototype, "_capacity", void 0);
    PartitionedBloomFilter = PartitionedBloomFilter_1 = __decorate([
        (0, exportable_1.AutoExportable)('PartitionedBloomFilter', ['_seed']),
        __param(0, (0, exportable_1.Parameter)('_size')),
        __param(1, (0, exportable_1.Parameter)('_nbHashes')),
        __param(2, (0, exportable_1.Parameter)('_loadFactor')),
        __param(3, (0, exportable_1.Parameter)('_capacity')),
        __metadata("design:paramtypes", [Number, Number, Number, Number])
    ], PartitionedBloomFilter);
    return PartitionedBloomFilter;
}(base_filter_1.default));
exports.default = PartitionedBloomFilter;
