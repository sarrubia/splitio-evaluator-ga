"use strict";
/* file : xor-filter.ts
MIT License

Copyright (c) 2017 Arnaud Grall

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
// Code inspired by the java implementation (https://github.com/FastFilter/fastfilter_java/blob/master/fastfilter/src/main/java/org/fastfilter/xor/Xor8.java)
var base_filter_1 = __importDefault(require("../base-filter"));
var exportable_1 = require("../exportable");
var utils_1 = require("../utils");
var xxhashjs_1 = __importDefault(require("xxhashjs"));
var long_1 = __importDefault(require("long"));
var base64_arraybuffer_1 = require("base64-arraybuffer");
var CONSTANTS = new Map();
CONSTANTS.set(8, 0xff);
CONSTANTS.set(16, 0xffff);
/**
 * XOR-Filter for 8-bits and 16-bits fingerprint length.
 *
 * To use for fixed sets of elements only
 * Inspired from @see https://github.com/FastFilter/fastfilter_java
 * @author Arnaud GRALL
 * @example
 * ```js
 * const xor8 = new XorFilter(1) // default fingerprint of 8 bits
 * xor8.add(['a'])
 * xor8.has('a') // true
 * xor8.has('b') // false
 * const xor16 = new XorFilter(1, 16)
 * xor16.add(['a'])
 * xor16.has('a') // true
 * xor16.has('b') // false
 * ```
 */
var XorFilter = /** @class */ (function (_super) {
    __extends(XorFilter, _super);
    /**
     * Create an empty XorFilter for a number of `size` elements.
     * The fingerprint length can be choosen
     * @param size
     * @param bits_per_fingerprint
     */
    function XorFilter(size, bits_per_fingerprint) {
        var _this = _super.call(this) || this;
        _this.ALLOWED_FINGERPRINT_SIZES = [8, 16];
        _this.HASHES = 3;
        _this.OFFSET = 32;
        _this.FACTOR_TIMES_100 = 123;
        /**
         * Number of bits per fingerprint
         */
        _this._bits = 8;
        // try to use the Buffer class or reject by throwing an error
        if (!Buffer) {
            throw new Error(utils_1.BufferError);
        }
        if (bits_per_fingerprint) {
            if (!_this.ALLOWED_FINGERPRINT_SIZES.includes(bits_per_fingerprint)) {
                throw new Error("bits_per_fingerprint parameter must be one of: [".concat(_this.ALLOWED_FINGERPRINT_SIZES.join(','), "], got: ").concat(bits_per_fingerprint));
            }
            _this._bits = bits_per_fingerprint;
        }
        if (size <= 0) {
            throw new Error('a XorFilter must be calibrated for a given number of elements');
        }
        _this._size = size;
        var arrayLength = _this._getOptimalFilterSize(_this._size);
        _this._blockLength = arrayLength / _this.HASHES;
        _this._filter = (0, utils_1.allocateArray)(arrayLength, function () {
            return Buffer.allocUnsafe(_this._bits / 8).fill(0);
        });
        return _this;
    }
    XorFilter_1 = XorFilter;
    /**
     * Return False if the element is not in the filter, True if it might be in the set with certain probability.
     * @param element
     * @returns
     */
    XorFilter.prototype.has = function (element) {
        var hash = this._hash64(element instanceof long_1.default
            ? element
            : this._hashable_to_long(element, this.seed), this.seed);
        var fingerprint = this._fingerprint(hash).toInt();
        var r0 = long_1.default.fromInt(hash.toInt());
        var r1 = long_1.default.fromInt(hash.rotl(21).toInt());
        var r2 = long_1.default.fromInt(hash.rotl(42).toInt());
        var h0 = this._reduce(r0, this._blockLength);
        var h1 = this._reduce(r1, this._blockLength) + this._blockLength;
        var h2 = this._reduce(r2, this._blockLength) + 2 * this._blockLength;
        var l0 = this._readBuffer(this._filter[h0]);
        var l1 = this._readBuffer(this._filter[h1]);
        var l2 = this._readBuffer(this._filter[h2]);
        var xored = fingerprint ^ l0 ^ l1 ^ l2;
        var constant = CONSTANTS.get(this._bits); // eslint-disable-line @typescript-eslint/no-non-null-assertion
        return (xored & constant) === 0;
    };
    /**
     * Add elements to the filter, modify the filter in place.
     * Warning: Another call will override the previously created filter.
     * @param elements
     * @example
     * ```js
     * const xor = new XorFilter(1, 8)
     * xor.add(['alice'])
     * xor.has('alice') // true
     * xor.has('bob') // false
     * ```
     */
    XorFilter.prototype.add = function (elements) {
        if (elements.length !== this._size) {
            throw new Error("This filter has been created for exactly ".concat(this._size, " elements"));
        }
        else {
            this._create(elements, this._filter.length);
        }
    };
    /**
     * Return True if the other XorFilter is equal
     * @param filter
     * @returns
     */
    XorFilter.prototype.equals = function (filter) {
        // first check the seed
        if (this.seed !== filter.seed) {
            return false;
        }
        // check the number of bits per fingerprint used
        if (this._bits !== filter._bits) {
            return false;
        }
        // check the number of elements inserted
        if (this._size !== filter._size) {
            return false;
        }
        // now check each entry of the filter
        var broken = true;
        var i = 0;
        while (broken && i < this._filter.length) {
            if (!filter._filter[i].equals(this._filter[i])) {
                broken = false;
            }
            else {
                i++;
            }
        }
        return broken;
    };
    /**
     * Return a XorFilter for a specified set of elements
     * @param elements
     * @returns
     */
    XorFilter.create = function (elements, bits_per_fingerprint) {
        var a = new XorFilter_1(elements.length, bits_per_fingerprint);
        a.add(elements);
        return a;
    };
    // ===================================
    // ==== PRIVATE METHODS/FUNCTIONS ====
    // ===================================
    /**
     * @internal
     * @private
     * Return the optimal xor filter size
     * @param size
     * @returns
     */
    XorFilter.prototype._getOptimalFilterSize = function (size) {
        // optimal size
        var s = long_1.default.ONE.multiply(this.FACTOR_TIMES_100)
            .multiply(size)
            .divide(100)
            .add(this.OFFSET);
        // return a size which is a multiple of hashes for optimal blocklength
        return s.add(-s.mod(this.HASHES)).toInt();
    };
    /**
     * @internal
     * @private
     * Read the buffer provided as int8, int16 or int32le based on the size of the finger prints
     * @param buffer
     * @returns
     */
    XorFilter.prototype._readBuffer = function (buffer) {
        var val;
        switch (this._bits) {
            case 16:
                val = buffer.readInt16LE();
                break;
            case 8:
            default:
                val = buffer.readInt8();
                break;
        }
        return val;
    };
    /**
     * @internal
     * @private
     * Generate the fingerprint of the hash
     * @param hash hash of the element
     * @returns
     */
    XorFilter.prototype._fingerprint = function (hash) {
        return hash.and((1 << this._bits) - 1);
    };
    /**
     * @internal
     * @private
     * Transform any HashableInput into its Long representation
     * @param element
     * @param seed
     * @returns
     */
    XorFilter.prototype._hashable_to_long = function (element, seed) {
        return long_1.default.fromString(xxhashjs_1.default.h64(element, seed).toString(10), 10);
    };
    /**
     * @internal
     * @private
     * Hash a long into a Long
     * @param element
     * @returns
     */
    XorFilter.prototype._hash64 = function (element, seed) {
        var h = element.add(seed);
        h = h
            .xor(h.shiftRightUnsigned(33))
            .multiply(long_1.default.fromString('0xff51afd7ed558ccd', 16));
        h = h = h
            .xor(h.shiftRightUnsigned(33))
            .multiply(long_1.default.fromString('0xc4ceb9fe1a85ec53', 16));
        h = h.xor(h.shiftRightUnsigned(33));
        return h;
    };
    /**
     * Perform a modulo reduction using an optimiaze technique
     * @param hash
     * @param size
     * @returns
     */
    XorFilter.prototype._reduce = function (hash, size) {
        // http://lemire.me/blog/2016/06/27/a-fast-alternative-to-the-modulo-reduction/
        return hash
            .and(long_1.default.fromString('0xffffffff', 16))
            .multiply(size)
            .shiftRightUnsigned(32)
            .toInt();
    };
    /**
     * Hash the element
     * @param element
     * @param seed
     * @returns
     */
    XorFilter.prototype._getHash = function (element, seed, index) {
        var hash = this._hash64(element, seed);
        var r = hash.rotl(21 * index);
        var rn = this._reduce(r, this._blockLength);
        var sum = rn + index * this._blockLength;
        return sum;
    };
    /**
     * Create the filter representing the elements to store.
     * We eliminate all duplicated entries before creating the array.
     * Follow the algorithm 2 and 3 of the paper (@see https://arxiv.org/pdf/1912.08258.pdf)
     * Inspired by Go impl from (@see https://github.com/FastFilter/xorfilter/blob/master/xorfilter.go)
     * @param elements array of elements to add in the filter
     * @param arraylength length of the filter
     * @returns
     */
    XorFilter.prototype._create = function (elements, arrayLength) {
        var _this = this;
        var reverseOrder = (0, utils_1.allocateArray)(this._size, long_1.default.ZERO);
        var reverseH = (0, utils_1.allocateArray)(this._size, 0);
        var reverseOrderPos;
        var _loop_1 = function () {
            this_1.seed = this_1.nextInt32();
            var t2count = (0, utils_1.allocateArray)(arrayLength, 0);
            var t2 = (0, utils_1.allocateArray)(arrayLength, long_1.default.ZERO);
            elements
                .map(function (k) {
                if (k instanceof long_1.default) {
                    return k;
                }
                else {
                    return _this._hashable_to_long(k, _this.seed);
                }
            })
                .forEach(function (k) {
                for (var hi = 0; hi < _this.HASHES; hi++) {
                    var h = _this._getHash(k, _this.seed, hi);
                    t2[h] = t2[h].xor(k);
                    if (t2count[h] > 120) {
                        // probably something wrong with the hash function
                        throw new Error("Probably something wrong with the hash function, t2count[".concat(h, "]=").concat(t2count[h]));
                    }
                    t2count[h]++;
                }
            });
            reverseOrderPos = 0;
            var alone = (0, utils_1.allocateArray)(this_1.HASHES, function () {
                return (0, utils_1.allocateArray)(_this._blockLength, 0);
            });
            var alonePos = (0, utils_1.allocateArray)(this_1.HASHES, 0);
            for (var nextAlone = 0; nextAlone < this_1.HASHES; nextAlone++) {
                for (var i_1 = 0; i_1 < this_1._blockLength; i_1++) {
                    if (t2count[nextAlone * this_1._blockLength + i_1] === 1) {
                        alone[nextAlone][alonePos[nextAlone]++] =
                            nextAlone * this_1._blockLength + i_1;
                    }
                }
            }
            var found = -1;
            var i = 0;
            while (i !== -1) {
                i = -1;
                for (var hi = 0; hi < this_1.HASHES; hi++) {
                    if (alonePos[hi] > 0) {
                        i = alone[hi][--alonePos[hi]];
                        found = hi;
                        break;
                    }
                }
                if (i === -1) {
                    // no entry found
                    break;
                }
                if (t2count[i] <= 0) {
                    continue;
                }
                var k = t2[i];
                if (t2count[i] !== 1) {
                    throw new Error('At this step, the count must not be different of 1');
                }
                --t2count[i];
                for (var hi = 0; hi < this_1.HASHES; hi++) {
                    if (hi !== found) {
                        var h = this_1._getHash(k, this_1.seed, hi);
                        var newCount = --t2count[h];
                        if (newCount === 1) {
                            alone[hi][alonePos[hi]++] = h;
                        }
                        t2[h] = t2[h].xor(k);
                    }
                }
                reverseOrder[reverseOrderPos] = k;
                reverseH[reverseOrderPos] = found;
                reverseOrderPos++;
            }
        };
        var this_1 = this;
        do {
            _loop_1();
        } while (reverseOrderPos !== this._size);
        for (var i = reverseOrderPos - 1; i >= 0; i--) {
            var k = reverseOrder[i];
            var found = reverseH[i];
            var change = -1;
            var hash = this._hash64(k, this.seed);
            var xor = this._fingerprint(hash).toInt();
            for (var hi = 0; hi < this.HASHES; hi++) {
                var h = this._getHash(k, this.seed, hi);
                if (found === hi) {
                    change = h;
                }
                else {
                    xor ^= this._readBuffer(this._filter[h]);
                }
            }
            // the value is in 32 bits format, so we must cast it to the desired number of bytes
            var buf = Buffer.from((0, utils_1.allocateArray)(4, 0));
            buf.writeInt32LE(xor);
            this._filter[change] = buf.slice(0, this._bits / 8);
        }
    };
    var XorFilter_1;
    __decorate([
        (0, exportable_1.Field)(function (d) { return d.map(base64_arraybuffer_1.encode); }, function (d) { return d.map(function (e) { return Buffer.from((0, base64_arraybuffer_1.decode)(e)); }); }),
        __metadata("design:type", Array)
    ], XorFilter.prototype, "_filter", void 0);
    __decorate([
        (0, exportable_1.Field)(),
        __metadata("design:type", Object)
    ], XorFilter.prototype, "_bits", void 0);
    __decorate([
        (0, exportable_1.Field)(),
        __metadata("design:type", Number)
    ], XorFilter.prototype, "_size", void 0);
    __decorate([
        (0, exportable_1.Field)(),
        __metadata("design:type", Number)
    ], XorFilter.prototype, "_blockLength", void 0);
    XorFilter = XorFilter_1 = __decorate([
        (0, exportable_1.AutoExportable)('XorFilter', ['_seed']),
        __param(0, (0, exportable_1.Parameter)('_size')),
        __param(1, (0, exportable_1.Parameter)('_bits')),
        __metadata("design:paramtypes", [Number, Number])
    ], XorFilter);
    return XorFilter;
}(base_filter_1.default));
exports.default = XorFilter;
