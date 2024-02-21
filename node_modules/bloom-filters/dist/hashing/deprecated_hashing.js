"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var hashing_1 = __importDefault(require("./hashing"));
/**
 * @deprecated
 * Hashing class to use before v1.3.7
 */
var DeprecatedHashing = /** @class */ (function (_super) {
    __extends(DeprecatedHashing, _super);
    function DeprecatedHashing() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * Apply Double Hashing to produce a n-hash
         * @param  n - The indice of the hash function we want to produce
         * @param  hashA - The result of the first hash function applied to a value.
         * @param  hashB - The result of the second hash function applied to a value.
         * @param  size - The size of the datastructures associated to the hash context (ex: the size of a Bloom Filter)
         * @return The result of hash_n applied to a value.
         * @returns
         */
        _this.doubleHashing = function (n, hashA, hashB, size) {
            return Math.abs((hashA + n * hashB) % size);
        };
        return _this;
    }
    /**
     * Generate N indexes on range [0, size)
     * It uses the double hashing technique to generate the indexes.
     * It hash twice the value only once before generating the indexes.
     * Warning: you can have a lot of modulo collisions.
     * @param  element    - The element to hash
     * @param  size       - The range on which we can generate the index, exclusive
     * @param  hashCount  - The number of indexes we want
     * @return An array of indexes on range [0, size)
     */
    DeprecatedHashing.prototype.getIndexes = function (element, size, hashCount, seed) {
        return this.getDistinctIndexes(element, size, hashCount, seed);
    };
    /**
     * Generate a set of distinct indexes on interval [0, size) using the double hashing technique
     * This function is the old method called by a lot of filters.
     * To work in the current version, replace, the getIndexes function of the filters by this one
     * @param  element  - The element to hash
     * @param  size     - the range on which we can generate an index [0, size) = size
     * @param  number   - The number of indexes desired
     * @param  seed     - The seed used
     * @return A array of indexes
     * @author Arnaud Grall
     */
    DeprecatedHashing.prototype.getDistinctIndexes = function (element, size, number, seed) {
        var _this = this;
        if (seed === undefined) {
            seed = (0, utils_1.getDefaultSeed)();
        }
        var getDistinctIndicesBis = function (n, elem, size, count, indexes) {
            if (indexes === void 0) { indexes = []; }
            if (indexes.length === count) {
                return indexes;
            }
            else {
                var hashes = _this.hashTwice(elem, seed + (size % n)); // eslint-disable-line @typescript-eslint/no-non-null-assertion
                var ind = _this.doubleHashing(n, hashes.first, hashes.second, size);
                if (indexes.includes(ind)) {
                    // console.log('generate index: %d for %s', ind, elem)
                    return getDistinctIndicesBis(n + 1, elem, size, count, indexes);
                }
                else {
                    // console.log('already found: %d for %s', ind, elem)
                    indexes.push(ind);
                    return getDistinctIndicesBis(n + 1, elem, size, count, indexes);
                }
            }
        };
        return getDistinctIndicesBis(1, element, size, number);
    };
    return DeprecatedHashing;
}(hashing_1.default));
exports.default = DeprecatedHashing;
