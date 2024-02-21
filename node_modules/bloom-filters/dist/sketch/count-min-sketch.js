"use strict";
/* file : count-min-sketch.ts
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var base_filter_1 = __importDefault(require("../base-filter"));
var exportable_1 = require("../exportable");
var utils_1 = require("../utils");
/**
 * The count–min sketch (CM sketch) is a probabilistic data structure that serves as a frequency table of events in a stream of data.
 * It uses hash functions to map events to frequencies, but unlike a hash table uses only sub-linear space, at the expense of overcounting some events due to collisions.
 *
 * Reference: Cormode, G., & Muthukrishnan, S. (2005). An improved data stream summary: the count-min sketch and its applications. Journal of Algorithms, 55(1), 58-75.
 * @see {@link http://vaffanculo.twiki.di.uniroma1.it/pub/Ing_algo/WebHome/p14_Cormode_JAl_05.pdf} for more details on Count Min Sketch
 * @extends Exportable
 * @author Thomas Minier & Arnaud Grall
 */
var CountMinSketch = /** @class */ (function (_super) {
    __extends(CountMinSketch, _super);
    /**
     * Constructor
     * @param columns - Number of columns
     * @param rows - Number of rows
     */
    function CountMinSketch(columns, rows) {
        var _this = _super.call(this) || this;
        _this._columns = columns;
        _this._rows = rows;
        _this._matrix = (0, utils_1.allocateArray)(_this._rows, function () {
            return (0, utils_1.allocateArray)(_this._columns, 0);
        });
        _this._allSums = 0;
        return _this;
    }
    CountMinSketch_1 = CountMinSketch;
    /**
     * Create a count-min sketch, with a target error rate and probability of accuracy
     * @param  errorRate - The error rate
     * @param  accuracy  - The probability of accuracy
     * @return A new Count Min Sketch optimal for the input parameters
     */
    CountMinSketch.create = function (errorRate, accuracy) {
        if (accuracy === void 0) { accuracy = 0.999; }
        // columns = Math.ceil(Math.E / epsilon) and rows = Math.ceil(Math.log(1 / delta))
        var columns = Math.ceil(Math.E / errorRate);
        var rows = Math.ceil(Math.log(1 / accuracy));
        return new CountMinSketch_1(columns, rows);
    };
    /**
     * Create a Count Min Sketch from a set of items, with a target error rate and probability of accuracy
     * @param items - An iterable to yield items to be inserted into the filter
     * @param  errorRate - The error rate
     * @param  accuracy  - The probability of accuracy
     * @return A new Count Min Sketch filled with the iterable's items.
     */
    CountMinSketch.from = function (items, errorRate, accuracy) {
        var e_1, _a;
        if (accuracy === void 0) { accuracy = 0.999; }
        var filter = CountMinSketch_1.create(errorRate, accuracy);
        try {
            for (var items_1 = __values(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
                var item = items_1_1.value;
                filter.update(item);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (items_1_1 && !items_1_1.done && (_a = items_1.return)) _a.call(items_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return filter;
    };
    Object.defineProperty(CountMinSketch.prototype, "columns", {
        /**
         * Return the number of columns in the sketch
         */
        get: function () {
            return this._columns;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CountMinSketch.prototype, "rows", {
        /**
         * Return the number of rows in the sketch
         */
        get: function () {
            return this._rows;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CountMinSketch.prototype, "sum", {
        /**
         * Get the sum of all counts in the sketch
         */
        get: function () {
            return this._allSums;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Update the count min sketch with a new occurrence of an element
     * @param element - The new element
     * @param count - Number of occurences of the elemnt (defauls to one)
     */
    CountMinSketch.prototype.update = function (element, count) {
        if (count === void 0) { count = 1; }
        this._allSums += count;
        var indexes = this._hashing.getIndexes(element, this._columns, this._rows, this.seed);
        for (var i = 0; i < this._rows; i++) {
            this._matrix[i][indexes[i]] += count;
        }
    };
    /**
     * Perform a point query: estimate the number of occurence of an element
     * @param element - The element we want to count
     * @return The estimate number of occurence of the element
     */
    CountMinSketch.prototype.count = function (element) {
        var min = Infinity;
        var indexes = this._hashing.getIndexes(element, this._columns, this._rows, this.seed);
        for (var i = 0; i < this._rows; i++) {
            var v = this._matrix[i][indexes[i]];
            min = Math.min(v, min);
        }
        return min;
    };
    /**
     * Check if another Count Min Sketch is equal to this one
     * @param  filter - The filter to compare to this one
     * @return True if they are equal, false otherwise
     */
    CountMinSketch.prototype.equals = function (other) {
        if (this._columns !== other._columns || this._rows !== other._rows) {
            return false;
        }
        for (var i = 0; i < this._rows; i++) {
            for (var j = 0; j < this._columns; j++) {
                if (this._matrix[i][j] !== other._matrix[i][j]) {
                    return false;
                }
            }
        }
        return true;
    };
    /**
     * Merge (in place) this sketch with another sketch, if they have the same number of columns and rows.
     * @param sketch - The sketch to merge with
     */
    CountMinSketch.prototype.merge = function (sketch) {
        if (this._columns !== sketch._columns) {
            throw new Error('Cannot merge two sketches with different number of columns');
        }
        if (this._rows !== sketch._rows) {
            throw new Error('Cannot merge two sketches with different number of rows');
        }
        for (var i = 0; i < this._rows; i++) {
            for (var j = 0; j < this._columns; j++) {
                this._matrix[i][j] += sketch._matrix[i][j];
            }
        }
    };
    /**
     * Clone the sketch
     * @return A new cloned sketch
     */
    CountMinSketch.prototype.clone = function () {
        var sketch = new CountMinSketch_1(this._columns, this._rows);
        sketch.merge(this);
        sketch.seed = this.seed;
        return sketch;
    };
    var CountMinSketch_1;
    __decorate([
        (0, exportable_1.Field)(),
        __metadata("design:type", Number)
    ], CountMinSketch.prototype, "_columns", void 0);
    __decorate([
        (0, exportable_1.Field)(),
        __metadata("design:type", Number)
    ], CountMinSketch.prototype, "_rows", void 0);
    __decorate([
        (0, exportable_1.Field)(),
        __metadata("design:type", Array)
    ], CountMinSketch.prototype, "_matrix", void 0);
    __decorate([
        (0, exportable_1.Field)(),
        __metadata("design:type", Number)
    ], CountMinSketch.prototype, "_allSums", void 0);
    CountMinSketch = CountMinSketch_1 = __decorate([
        (0, exportable_1.AutoExportable)('CountMinSketch', ['_seed']),
        __param(0, (0, exportable_1.Parameter)('_columns')),
        __param(1, (0, exportable_1.Parameter)('_rows')),
        __metadata("design:paramtypes", [Number, Number])
    ], CountMinSketch);
    return CountMinSketch;
}(base_filter_1.default));
exports.default = CountMinSketch;
