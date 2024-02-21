"use strict";
/* file : api.ts
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
exports.ScalableBloomFilter = exports.DeprecatedHashing = exports.Hashing = exports.Cell = exports.InvertibleBloomFilter = exports.CuckooFilter = exports.MinHashFactory = exports.MinHash = exports.TopK = exports.HyperLogLog = exports.CountMinSketch = exports.PartitionedBloomFilter = exports.CountingBloomFilter = exports.XorFilter = exports.BitSet = exports.BloomFilter = exports.BaseFilter = void 0;
var base_filter_1 = require("./base-filter");
Object.defineProperty(exports, "BaseFilter", { enumerable: true, get: function () { return __importDefault(base_filter_1).default; } });
var bloom_filter_1 = require("./bloom/bloom-filter");
Object.defineProperty(exports, "BloomFilter", { enumerable: true, get: function () { return __importDefault(bloom_filter_1).default; } });
var bit_set_1 = require("./bloom/bit-set");
Object.defineProperty(exports, "BitSet", { enumerable: true, get: function () { return __importDefault(bit_set_1).default; } });
var xor_filter_1 = require("./bloom/xor-filter");
Object.defineProperty(exports, "XorFilter", { enumerable: true, get: function () { return __importDefault(xor_filter_1).default; } });
var counting_bloom_filter_1 = require("./bloom/counting-bloom-filter");
Object.defineProperty(exports, "CountingBloomFilter", { enumerable: true, get: function () { return __importDefault(counting_bloom_filter_1).default; } });
var partitioned_bloom_filter_1 = require("./bloom/partitioned-bloom-filter");
Object.defineProperty(exports, "PartitionedBloomFilter", { enumerable: true, get: function () { return __importDefault(partitioned_bloom_filter_1).default; } });
var count_min_sketch_1 = require("./sketch/count-min-sketch");
Object.defineProperty(exports, "CountMinSketch", { enumerable: true, get: function () { return __importDefault(count_min_sketch_1).default; } });
var hyperloglog_1 = require("./sketch/hyperloglog");
Object.defineProperty(exports, "HyperLogLog", { enumerable: true, get: function () { return __importDefault(hyperloglog_1).default; } });
var topk_1 = require("./sketch/topk");
Object.defineProperty(exports, "TopK", { enumerable: true, get: function () { return __importDefault(topk_1).default; } });
var min_hash_1 = require("./sketch/min-hash");
Object.defineProperty(exports, "MinHash", { enumerable: true, get: function () { return min_hash_1.MinHash; } });
var min_hash_factory_1 = require("./sketch/min-hash-factory");
Object.defineProperty(exports, "MinHashFactory", { enumerable: true, get: function () { return __importDefault(min_hash_factory_1).default; } });
var cuckoo_filter_1 = require("./cuckoo/cuckoo-filter");
Object.defineProperty(exports, "CuckooFilter", { enumerable: true, get: function () { return __importDefault(cuckoo_filter_1).default; } });
var invertible_bloom_lookup_tables_1 = require("./iblt/invertible-bloom-lookup-tables");
Object.defineProperty(exports, "InvertibleBloomFilter", { enumerable: true, get: function () { return __importDefault(invertible_bloom_lookup_tables_1).default; } });
var cell_1 = require("./iblt/cell");
Object.defineProperty(exports, "Cell", { enumerable: true, get: function () { return __importDefault(cell_1).default; } });
var hashing_1 = require("./hashing/hashing");
Object.defineProperty(exports, "Hashing", { enumerable: true, get: function () { return __importDefault(hashing_1).default; } });
var deprecated_hashing_1 = require("./hashing/deprecated_hashing");
Object.defineProperty(exports, "DeprecatedHashing", { enumerable: true, get: function () { return __importDefault(deprecated_hashing_1).default; } });
var scalable_bloom_filter_1 = require("./bloom/scalable-bloom-filter");
Object.defineProperty(exports, "ScalableBloomFilter", { enumerable: true, get: function () { return __importDefault(scalable_bloom_filter_1).default; } });
