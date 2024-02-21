"use strict";
/* file: cell.ts
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
var utils_1 = require("../utils");
var exportable_1 = require("../exportable");
var base_filter_1 = __importDefault(require("../base-filter"));
var inspect = Symbol.for('nodejs.util.inspect.custom');
/**
 * A cell is an internal datastructure of an {@link InvertibleBloomFilter}.
 * It is composed of an idSum (the XOR of all element inserted in that cell), a hashSum (the XOR of all hashed element in that cell) and a counter (the number of elements inserted in that cell).
 * @author Arnaud Grall
 * @author Thomas Minier
 */
var Cell = /** @class */ (function (_super) {
    __extends(Cell, _super);
    /**
     * Constructor.
     * To create an empty cell, you might want to use the static Cell#empty() method.
     * @param idSum - The XOR of all element inserted in that cell
     * @param hashSum - The XOR of all hashed element in that cell
     * @param count - The number of elements inserted in that cell
     */
    function Cell(idSum, hashSum, count) {
        var _this = _super.call(this) || this;
        _this._idSum = idSum;
        _this._hashSum = hashSum;
        _this._count = count;
        return _this;
    }
    Cell_1 = Cell;
    /**
     * Create an empty cell
     * @return An empty Cell
     */
    Cell.empty = function () {
        return new Cell_1(Buffer.allocUnsafe(0).fill(0), Buffer.allocUnsafe(0).fill(0), 0);
    };
    Cell.prototype[inspect] = function () {
        return "Cell:<".concat(JSON.stringify(this._idSum.toJSON().data), ", ").concat(JSON.stringify(this._hashSum.toJSON().data), ", ").concat(this._count, ">");
    };
    Object.defineProperty(Cell.prototype, "idSum", {
        /**
         * Get the id sum of the Cell (The XOR of all element inserted in that cell)
         */
        get: function () {
            return this._idSum;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "hashSum", {
        /**
         * Get the hash sum of the Cell (The XOR of all hashed element in that cell)
         */
        get: function () {
            return this._hashSum;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "count", {
        /**
         * Get the number of elements inserted in that cell
         */
        get: function () {
            return this._count;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Add an element in this cell
     * @param idSum - The element to XOR in this cell
     * @param hashSum - The hash of the element to XOR in this cell
     */
    Cell.prototype.add = function (idSum, hashSum) {
        this._idSum = (0, utils_1.xorBuffer)(this._idSum, idSum);
        this._hashSum = (0, utils_1.xorBuffer)(this._hashSum, hashSum);
        this._count++;
    };
    /**
     * Perform the XOR operation between this Cell and another one and returns a resulting Cell.
     * A XOR between two cells is the XOR between their id sum and hash sum,
     * and the difference between their count.
     * @param cell - Cell to perform XOR with
     * @return A new Cell, resulting from the XOR operation
     */
    Cell.prototype.xorm = function (cell) {
        return new Cell_1((0, utils_1.xorBuffer)(this._idSum, cell.idSum), (0, utils_1.xorBuffer)(this._hashSum, cell.hashSum), this._count - cell.count);
    };
    /**
     * Test if the Cell is empty
     * @return True if the Cell is empty, False otherwise
     */
    Cell.prototype.isEmpty = function () {
        return (this._idSum.equals(Buffer.from('')) &&
            this._hashSum.equals(Buffer.from('')) &&
            this._count === 0);
    };
    /**
     * Test if another Cell is equals to this one
     * @param  cell - The cell to compare with
     * @return True if the two Cells are equals, False otherwise
     */
    Cell.prototype.equals = function (cell) {
        return (this._count === cell.count &&
            this._idSum.equals(cell.idSum) &&
            this._hashSum.equals(cell.hashSum));
    };
    /**
     * Test if the cell is "Pure".
     * A pure cell is a cell with a counter equal to 1 or -1, and with a hash sum equal to the id sum
     * @return True if the cell ius pure, False otherwise
     */
    Cell.prototype.isPure = function () {
        // A pure cell cannot be empty or must have a count equals to 1 or -1
        if (this.isEmpty() || (this._count !== 1 && this._count !== -1)) {
            return false;
        }
        // compare the hashes
        var hashes = this._hashing.hashTwiceAsString(JSON.stringify(this._idSum.toJSON()), this.seed);
        return this._hashSum.equals(Buffer.from(hashes.first));
    };
    var Cell_1;
    __decorate([
        (0, exportable_1.Field)(function (elt) { return elt.toString(); }, Buffer.from),
        __metadata("design:type", Buffer
        // eslint-disable-next-line @typescript-eslint/unbound-method
        )
    ], Cell.prototype, "_idSum", void 0);
    __decorate([
        (0, exportable_1.Field)(function (elt) { return elt.toString(); }, Buffer.from),
        __metadata("design:type", Buffer)
    ], Cell.prototype, "_hashSum", void 0);
    __decorate([
        (0, exportable_1.Field)(),
        __metadata("design:type", Number)
    ], Cell.prototype, "_count", void 0);
    Cell = Cell_1 = __decorate([
        (0, exportable_1.AutoExportable)('Cell', ['_seed']),
        __param(0, (0, exportable_1.Parameter)('_idSum')),
        __param(1, (0, exportable_1.Parameter)('_hashSum')),
        __param(2, (0, exportable_1.Parameter)('_count')),
        __metadata("design:paramtypes", [Buffer,
            Buffer, Number])
    ], Cell);
    return Cell;
}(base_filter_1.default));
exports.default = Cell;
