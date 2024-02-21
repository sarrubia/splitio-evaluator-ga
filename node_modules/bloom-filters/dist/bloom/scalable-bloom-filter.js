"use strict";
/* file : scalable-bloom-filter.ts
MIT License

Copyright (c) 2022 Thomas Minier & Arnaud Grall

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
var partitioned_bloom_filter_1 = __importDefault(require("./partitioned-bloom-filter"));
var seedrandom_1 = __importDefault(require("seedrandom"));
/**
 * A Scalable Bloom Filter is a variant of Bloom Filters that can adapt dynamically to the
number of elements stored, while assuring a maximum false positive probability
 *
 * Reference: ALMEIDA, Paulo Sérgio, BAQUERO, Carlos, PREGUIÇA, Nuno, et al. Scalable bloom filters. Information Processing Letters, 2007, vol. 101, no 6, p. 255-261.
 * @see {@link https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.725.390&rep=rep1&type=pdf}
 * @author Thomas Minier & Arnaud Grall
 */
var ScalableBloomFilter = /** @class */ (function (_super) {
    __extends(ScalableBloomFilter, _super);
    function ScalableBloomFilter(_initial_size, _error_rate, _ratio) {
        if (_initial_size === void 0) { _initial_size = 8; }
        if (_error_rate === void 0) { _error_rate = 0.01; }
        if (_ratio === void 0) { _ratio = 0.5; }
        var _this = _super.call(this) || this;
        /**
         * Internal Partition Bloom Filters
         */
        _this._filters = [];
        _this._initial_size = _initial_size;
        _this._error_rate = _error_rate;
        _this._ratio = _ratio;
        _this._filters.push(partitioned_bloom_filter_1.default.create(_this._initial_size, _this._error_rate, _this._ratio));
        _this._filters[_this._filters.length - 1].seed = _this.seed;
        return _this;
    }
    ScalableBloomFilter_1 = ScalableBloomFilter;
    Object.defineProperty(ScalableBloomFilter.prototype, "seed", {
        /**
         * @override
         * Return the current seed.
         * For obscure reason we must code this function...
         */
        get: function () {
            return this._seed;
        },
        /**
         * @override
         * Set the seed for this structure. If you override the seed after adding data,
         * all the filters will be updated and you may get wrong indexes for already indexed data
         * due to the seed change. So only change it once before adding data.
         * @param  seed the new seed that will be used in this structure
         */
        set: function (seed) {
            var _this = this;
            this._seed = seed;
            this._rng = (0, seedrandom_1.default)("".concat(this._seed));
            this._filters.forEach(function (filter) {
                filter.seed = _this.seed;
            });
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Add a new element to the filter
     * @param element
     */
    ScalableBloomFilter.prototype.add = function (element) {
        // determine if we need to create a new filter
        var currentFilter = this._filters[this._filters.length - 1];
        if (currentFilter._currentload() > currentFilter._loadFactor) {
            // create a new filter
            var newSize = this._initial_size *
                Math.pow(ScalableBloomFilter_1._s, this._filters.length + 1) *
                Math.LN2;
            var newErrorRate = this._error_rate * Math.pow(this._ratio, this._filters.length);
            this._filters.push(partitioned_bloom_filter_1.default.create(newSize, newErrorRate, this._ratio));
            this._filters[this._filters.length - 1].seed = this.seed;
        }
        // get the newly created filter
        this._filters[this._filters.length - 1].add(element);
    };
    /**
     * Return True if the element has been found, false otherwise.
     * Check until we found the value in a filter otherwise stop on the first value found.
     * @param element
     * @returns
     */
    ScalableBloomFilter.prototype.has = function (element) {
        return this._filters.some(function (filter) { return filter.has(element); });
    };
    /**
     * Return the current capacity (number of elements) of this filter
     * @returns
     */
    ScalableBloomFilter.prototype.capacity = function () {
        return this._filters.map(function (f) { return f._capacity; }).reduce(function (p, c) { return p + c; }, 0);
    };
    /**
     * Return the current false positive rate of this structure
     * @returns
     */
    ScalableBloomFilter.prototype.rate = function () {
        return this._filters[this._filters.length - 1].rate();
    };
    /**
     * Check if two ScalableBloomFilter are equal
     * @param filter
     * @returns
     */
    ScalableBloomFilter.prototype.equals = function (filter) {
        // assert the seed, the ratio and the capacity are equals
        if (this.seed !== filter.seed ||
            this._ratio !== filter._ratio ||
            this.capacity() !== filter.capacity()) {
            return false;
        }
        return this._filters.every(function (currentFilter, index) {
            return filter._filters[index].equals(currentFilter);
        });
    };
    /**
     * Create a Scalable Bloom Filter based on Partitionned Bloom Filter.
     * @param _size the starting size of the filter
     * @param _error_rate ther error rate desired of the filter
     * @param _ratio the load factor desired
     * @returns
     */
    ScalableBloomFilter.create = function (_size, _error_rate, _ratio) {
        if (_ratio === void 0) { _ratio = 0.5; }
        return new ScalableBloomFilter_1(_size, _error_rate, _ratio);
    };
    var ScalableBloomFilter_1;
    /**
     * Static value, will power the size of the new set, by default we will follow a power of 2.
     */
    ScalableBloomFilter._s = 2;
    __decorate([
        (0, exportable_1.Field)(),
        __metadata("design:type", Number)
    ], ScalableBloomFilter.prototype, "_initial_size", void 0);
    __decorate([
        (0, exportable_1.Field)(),
        __metadata("design:type", Number)
    ], ScalableBloomFilter.prototype, "_error_rate", void 0);
    __decorate([
        (0, exportable_1.Field)(),
        __metadata("design:type", Number)
    ], ScalableBloomFilter.prototype, "_ratio", void 0);
    __decorate([
        (0, exportable_1.Field)(function (filters) {
            return filters.map(function (filter) { return filter.saveAsJSON(); });
        }, // eslint-disable-line @typescript-eslint/no-unsafe-return
        function (array) {
            return array.map(function (data) { return partitioned_bloom_filter_1.default.fromJSON(data); });
        }),
        __metadata("design:type", Array)
    ], ScalableBloomFilter.prototype, "_filters", void 0);
    ScalableBloomFilter = ScalableBloomFilter_1 = __decorate([
        (0, exportable_1.AutoExportable)('ScalableBloomFilter', ['_seed']),
        __param(0, (0, exportable_1.Parameter)('_initial_size')),
        __param(1, (0, exportable_1.Parameter)('_error_rate')),
        __param(2, (0, exportable_1.Parameter)('_ratio')),
        __metadata("design:paramtypes", [Object, Object, Object])
    ], ScalableBloomFilter);
    return ScalableBloomFilter;
}(base_filter_1.default));
exports.default = ScalableBloomFilter;
