"use strict";
/* file: min-hash.ts
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
exports.MinHash = void 0;
var base_filter_1 = __importDefault(require("../base-filter"));
var exportable_1 = require("../exportable");
var utils_1 = require("../utils");
/**
 * An error thrown when we try to compute the Jaccard Similarity with an empty MinHash
 * @author Thomas Minier
 */
var EmptyMinHashError = /** @class */ (function (_super) {
    __extends(EmptyMinHashError, _super);
    function EmptyMinHashError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return EmptyMinHashError;
}(Error));
/**
 * Apply a hash function to a number to produce a hash
 * @param x - Value to hash
 * @param fn - HashFunction to apply
 * @return The hashed value
 */
function applyHashFunction(x, fn) {
    return (fn.a * x + fn.b) % fn.c;
}
/**
 * MinHash (or the min-wise independent permutations locality sensitive hashing scheme) is a technique for quickly estimating how similar two sets are.
 * It is able to estimate the Jaccard similarity between two large sets of numbers using random hashing.
 *
 * **WARNING**: Only the MinHash produced by the same {@link MinHashFactory} can be compared between them.
 *
 * @see "On the resemblance and containment of documents", by Andrei Z. Broder, in Compression and Complexity of Sequences: Proceedings, Positano, Amalfitan Coast, Salerno, Italy, June 11-13, 1997.
 * @author Thomas Minier
 */
var MinHash = /** @class */ (function (_super) {
    __extends(MinHash, _super);
    /**
     * Constructor
     * @param nbHashes - Number of hash functions to use for comouting the MinHash signature
     * @param hashFunctions - Hash functions used to compute the signature
     */
    function MinHash(nbHashes, hashFunctions) {
        var _this = _super.call(this) || this;
        _this._nbHashes = nbHashes;
        _this._hashFunctions = hashFunctions;
        _this._signature = (0, utils_1.allocateArray)(_this._nbHashes, Infinity);
        return _this;
    }
    Object.defineProperty(MinHash.prototype, "nbHashes", {
        /**
         * Get the number of hash functions used by the MinHash
         */
        get: function () {
            return this._nbHashes;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Test if the signature of the MinHash is empty
     * @return True if the MinHash is empty, False otherwise
     */
    MinHash.prototype.isEmpty = function () {
        return this._signature[0] === Infinity;
    };
    /**
     * Insert a value into the MinHash and update its signature.
     * @param value - Value to insert
     */
    MinHash.prototype.add = function (value) {
        for (var i = 0; i < this._nbHashes; i++) {
            var hash = applyHashFunction(value, this._hashFunctions[i]);
            this._signature[i] = Math.min(this._signature[i], hash);
        }
    };
    /**
     * Ingest a set of values into the MinHash, in an efficient manner, and update its signature.
     * @param values - Set of values to load
     */
    MinHash.prototype.bulkLoad = function (values) {
        var _this = this;
        var _loop_1 = function (i) {
            var candidateSignatures = values.map(function (value) {
                return applyHashFunction(value, _this._hashFunctions[i]);
            });
            // get the minimum of the candidate Signatures
            // dont supply too much parameters to Math.min or Math.max with risk of getting stack error
            // so we compute an iterative minimum
            var min = candidateSignatures[0];
            for (var i_1 = 1; i_1 < candidateSignatures.length; i_1++) {
                if (min > candidateSignatures[i_1]) {
                    min = candidateSignatures[i_1];
                }
            }
            this_1._signature[i] = Math.min(this_1._signature[i], min);
        };
        var this_1 = this;
        for (var i = 0; i < this._nbHashes; i++) {
            _loop_1(i);
        }
    };
    /**
     * Estimate the Jaccard similarity coefficient with another MinHash signature
     * @param other - MinHash to compare with
     * @return The estimated Jaccard similarity coefficient between the two sets
     */
    MinHash.prototype.compareWith = function (other) {
        if (this.isEmpty() || other.isEmpty()) {
            throw new EmptyMinHashError('Cannot compute a Jaccard similairty with a MinHash that contains no values');
        }
        // fix: we need to check for the number of equal signatures, not uniq equal signatures
        // lodash intersection ends with a uniq set of values
        var count = 0;
        for (var i = 0; i < this._nbHashes; i++) {
            if (this._signature[i] === other._signature[i]) {
                count++;
            }
        }
        return count / this._nbHashes;
    };
    __decorate([
        (0, exportable_1.Field)(),
        __metadata("design:type", Number)
    ], MinHash.prototype, "_nbHashes", void 0);
    __decorate([
        (0, exportable_1.Field)(),
        __metadata("design:type", Array)
    ], MinHash.prototype, "_hashFunctions", void 0);
    __decorate([
        (0, exportable_1.Field)(),
        __metadata("design:type", Array)
    ], MinHash.prototype, "_signature", void 0);
    MinHash = __decorate([
        (0, exportable_1.AutoExportable)('MinHash', ['_seed']),
        __param(0, (0, exportable_1.Parameter)('_nbHashes')),
        __param(1, (0, exportable_1.Parameter)('_hashFunctions')),
        __metadata("design:paramtypes", [Number, Array])
    ], MinHash);
    return MinHash;
}(base_filter_1.default));
exports.MinHash = MinHash;
