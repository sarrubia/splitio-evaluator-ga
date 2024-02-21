"use strict";
/* file : cuckoo-filter.ts
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var base_filter_1 = __importDefault(require("../base-filter"));
var bucket_1 = __importDefault(require("./bucket"));
var exportable_1 = require("../exportable");
var utils_1 = require("../utils");
/**
 * Compute the optimal fingerprint length in bytes for a given bucket size
 * and a false positive rate.
 * @param  {int} size - The filter bucket size
 * @param  {int} rate - The error rate, i.e. 'false positive' rate, targetted by the filter
 * @return {int} The optimal fingerprint length in bytes
 * @private
 */
function computeFingerpintLength(size, rate) {
    var f = Math.ceil(Math.log2(1 / rate) + Math.log2(2 * size));
    return Math.ceil(f / 8); // because we use 64-bits hashes
}
/**
 * Cuckoo filters improve on Bloom filters by supporting deletion, limited counting,
 * and bounded False positive rate with similar storage efficiency as a standard Bloom filter.
 *
 * Reference: Fan, B., Andersen, D. G., Kaminsky, M., & Mitzenmacher, M. D. (2014, December). Cuckoo filter: Practically better than bloom.
 * In Proceedings of the 10th ACM International on Conference on emerging Networking Experiments and Technologies (pp. 75-88). ACM.
 * @see {@link https://www.cs.cmu.edu/~dga/papers/cuckoo-conext2014.pdf} for more details about Cuckoo filters
 * @author Thomas Minier & Arnaud Grall
 */
var CuckooFilter = /** @class */ (function (_super) {
    __extends(CuckooFilter, _super);
    /**
     * Constructor
     * @param size - The filter size
     * @param fLength - The length of the fingerprints
     * @param bucketSize - The size of the buckets in the filter
     * @param maxKicks - (optional) The max number of kicks when resolving collision at insertion, default to 1
     */
    function CuckooFilter(size, fLength, bucketSize, maxKicks) {
        if (maxKicks === void 0) { maxKicks = 500; }
        var _this = _super.call(this) || this;
        _this._filter = (0, utils_1.allocateArray)(size, function () { return new bucket_1.default(bucketSize); });
        _this._size = size;
        _this._bucketSize = bucketSize;
        _this._fingerprintLength = fLength;
        _this._length = 0;
        _this._maxKicks = maxKicks;
        return _this;
    }
    CuckooFilter_1 = CuckooFilter;
    /**
     * Return a new optimal CuckooFilter given the number of maximum elements to store and the error rate desired
     * @param  size - The number of items to store
     * @param  errorRate - The desired error rate
     * @param  bucketSize - The number of buckets desired per cell
     * @param  maxKicks - The number of kicks done when a collision occurs
     * @return A Cuckoo Filter optimal for these parameters
     */
    CuckooFilter.create = function (size, errorRate, bucketSize, maxKicks) {
        if (bucketSize === void 0) { bucketSize = 4; }
        if (maxKicks === void 0) { maxKicks = 500; }
        var fl = computeFingerpintLength(bucketSize, errorRate);
        var capacity = Math.ceil(size / bucketSize / 0.955);
        return new CuckooFilter_1(capacity, fl, bucketSize, maxKicks);
    };
    /**
     * Build a new optimal CuckooFilter from an iterable with a fixed error rate
     * @param items - Iterable used to populate the filter
     * @param errorRate - The error rate of the filter
     * @param  bucketSize - The number of buckets desired per cell
     * @param  maxKicks - The number of kicks done when a collision occurs
     * @return A new Cuckoo Filter filled with the iterable's elements
     */
    CuckooFilter.from = function (items, errorRate, bucketSize, maxKicks) {
        if (bucketSize === void 0) { bucketSize = 4; }
        if (maxKicks === void 0) { maxKicks = 500; }
        var array = Array.from(items);
        var filter = CuckooFilter_1.create(array.length, errorRate, bucketSize, maxKicks);
        array.forEach(function (item) { return filter.add(item); });
        return filter;
    };
    Object.defineProperty(CuckooFilter.prototype, "size", {
        /**
         * Get the filter size
         */
        get: function () {
            return this._size;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CuckooFilter.prototype, "fullSize", {
        /**
         * Get the filter full size, i.e., the total number of cells
         */
        get: function () {
            return this.size * this.bucketSize;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CuckooFilter.prototype, "length", {
        /**
         * Get the filter length, i.e. the current number of elements in the filter
         */
        get: function () {
            return this._length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CuckooFilter.prototype, "fingerprintLength", {
        /**
         * Get the length of the fingerprints in the filter
         */
        get: function () {
            return this._fingerprintLength;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CuckooFilter.prototype, "bucketSize", {
        /**
         * Get the size of the buckets in the filter
         */
        get: function () {
            return this._bucketSize;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CuckooFilter.prototype, "maxKicks", {
        /**
         * Get the max number of kicks when resolving collision at insertion
         */
        get: function () {
            return this._maxKicks;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Add an element to the filter, if false is returned, it means that the filter is considered as full.
     * @param element - The element to add
     * @return True if the insertion is a success, False if the filter is full
     * @example
     * ```js
     * const filter = new CuckooFilter(15, 3, 2);
     * filter.add('alice');
     * filter.add('bob');
     * ```
     */
    CuckooFilter.prototype.add = function (element, throwError, destructive) {
        if (throwError === void 0) { throwError = false; }
        if (destructive === void 0) { destructive = false; }
        // TODO do the recovery if return false or throw error because we altered values
        var locations = this._locations(element);
        // store fingerprint in an available empty bucket
        if (this._filter[locations.firstIndex].isFree()) {
            this._filter[locations.firstIndex].add(locations.fingerprint);
        }
        else if (this._filter[locations.secondIndex].isFree()) {
            this._filter[locations.secondIndex].add(locations.fingerprint);
        }
        else {
            // buckets are full, we must relocate one of them
            var index = this.random() < 0.5 ? locations.firstIndex : locations.secondIndex;
            var movedElement = locations.fingerprint;
            var logs = [];
            for (var nbTry = 0; nbTry < this._maxKicks; nbTry++) {
                var rndIndex = (0, utils_1.randomInt)(0, this._filter[index].length - 1, this.random);
                var tmp = this._filter[index].at(rndIndex); // eslint-disable-line @typescript-eslint/no-non-null-assertion
                logs.push([index, rndIndex, tmp]);
                this._filter[index].set(rndIndex, movedElement);
                movedElement = tmp;
                // movedElement = this._filter[index].set(rndswapRandom(movedElement, this._rng)
                var newHash = this._hashing.hashAsInt(movedElement, this.seed);
                index = Math.abs(index ^ Math.abs(newHash)) % this._filter.length;
                // add the moved element to the bucket if possible
                if (this._filter[index].isFree()) {
                    this._filter[index].add(movedElement);
                    this._length++;
                    return true;
                }
            }
            if (!destructive) {
                // rollback all modified entries to their initial states
                for (var i = logs.length - 1; i >= 0; i--) {
                    var log = logs[i];
                    this._filter[log[0]].set(log[1], log[2]);
                }
            }
            // considered full
            if (throwError) {
                // rollback all operations
                throw new Error("The Cuckoo Filter is full, cannot insert element \"".concat(element, "\"") // eslint-disable-line @typescript-eslint/restrict-template-expressions
                );
            }
            else {
                return false;
            }
        }
        this._length++;
        return true;
    };
    /**
     * Remove an element from the filter
     * @param element - The element to remove
     * @return True if the element has been removed from the filter, False if it wasn't in the filter
     * @example
     * ```js
     * const filter = new CuckooFilter(15, 3, 2);
     * filter.add('alice');
     * filter.add('bob');
     *
     * // remove an element
     * filter.remove('bob');
     * ```
     */
    CuckooFilter.prototype.remove = function (element) {
        var locations = this._locations(element);
        if (this._filter[locations.firstIndex].has(locations.fingerprint)) {
            this._filter[locations.firstIndex].remove(locations.fingerprint);
            this._length--;
            return true;
        }
        else if (this._filter[locations.secondIndex].has(locations.fingerprint)) {
            this._filter[locations.secondIndex].remove(locations.fingerprint);
            this._length--;
            return true;
        }
        return false;
    };
    /**
     * Test an element for membership
     * @param element - The element to look for in the filter
     * @return False if the element is definitively not in the filter, True is the element might be in the filter
     * @example
     * ```js
     * const filter = new CuckooFilter(15, 3, 2);
     * filter.add('alice');
     *
     * console.log(filter.has('alice')); // output: true
     * console.log(filter.has('bob')); // output: false
     * ```
     */
    CuckooFilter.prototype.has = function (element) {
        var locations = this._locations(element);
        return (this._filter[locations.firstIndex].has(locations.fingerprint) ||
            this._filter[locations.secondIndex].has(locations.fingerprint));
    };
    /**
     * Return the false positive rate for this cuckoo filter
     * @return The false positive rate
     */
    CuckooFilter.prototype.rate = function () {
        var load = this._computeHashTableLoad();
        var c = this._fingerprintLength / load.load;
        return Math.pow(2, Math.log2(2 * this._bucketSize) - load.load * c);
    };
    /**
     * Return the load of this filter
     * @return {Object} load: is the load, size is the number of entries, free is the free number of entries, used is the number of entry used
     */
    CuckooFilter.prototype._computeHashTableLoad = function () {
        var max = this._filter.length * this._bucketSize;
        var used = this._filter.reduce(function (acc, val) { return acc + val.length; }, 0);
        return {
            used: used,
            free: max - used,
            size: max,
            load: used / max,
        };
    };
    /**
     * For a element, compute its fingerprint and the index of its two buckets
     * @param element - The element to hash
     * @return The fingerprint of the element and the index of its two buckets
     * @private
     */
    CuckooFilter.prototype._locations = function (element) {
        var hashes = this._hashing.hashIntAndString(element, this.seed);
        var hash = hashes.int;
        if (this._fingerprintLength > hashes.string.length) {
            throw new Error("The fingerprint length (".concat(this._fingerprintLength, ") is higher than the hash length (").concat(hashes.string.length, "). Please reduce the fingerprint length or report if it is an unexpected behavior."));
        }
        var fingerprint = hashes.string.substring(0, this._fingerprintLength);
        var firstIndex = Math.abs(hash);
        var secondHash = Math.abs(this._hashing.hashAsInt(fingerprint, this.seed));
        var secondIndex = Math.abs(firstIndex ^ secondHash);
        var res = {
            fingerprint: fingerprint,
            firstIndex: firstIndex % this._size,
            secondIndex: secondIndex % this._size,
        };
        return res;
    };
    /**
     * Check if another Cuckoo filter is equal to this one
     * @param  filter - The cuckoo filter to compare to this one
     * @return True if they are equal, false otherwise
     */
    CuckooFilter.prototype.equals = function (filter) {
        var i = 0;
        var res = true;
        while (res && i < this._filter.length) {
            var bucket = this._filter[i];
            if (!filter._filter[i].equals(bucket)) {
                res = false;
            }
            i++;
        }
        return res;
    };
    var CuckooFilter_1;
    CuckooFilter = CuckooFilter_1 = __decorate([
        (0, exportable_1.Exportable)({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            export: (0, exportable_1.cloneObject)('CuckooFilter', '_size', '_fingerprintLength', '_length', '_maxKicks', '_filter', '_seed'),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            import: function (json) {
                /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
                if (json.type !== 'CuckooFilter' ||
                    !('_size' in json) ||
                    !('_fingerprintLength' in json) ||
                    !('_length' in json) ||
                    !('_maxKicks' in json) ||
                    !('_filter' in json) ||
                    !('_seed' in json)) {
                    throw new Error('Cannot create a CuckooFilter from a JSON export which does not represent a cuckoo filter');
                }
                var filter = new CuckooFilter_1(json._size, json._fingerprintLength, json._bucketSize, json._maxKicks);
                filter._length = json._length;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                filter._filter = json._filter.map(function (j) {
                    var bucket = new bucket_1.default(j._size);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    j._elements.forEach(function (elt, i) {
                        if (elt !== null) {
                            bucket._elements[i] = elt;
                            bucket._length++;
                        }
                    });
                    return bucket;
                });
                filter.seed = json._seed;
                return filter;
                /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
            },
        }),
        __metadata("design:paramtypes", [Number, Number, Number, Object])
    ], CuckooFilter);
    return CuckooFilter;
}(base_filter_1.default));
exports.default = CuckooFilter;
