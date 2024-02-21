/// <reference types="node" />
import BaseFilter from '../base-filter';
declare const inspect: unique symbol;
/**
 * A cell is an internal datastructure of an {@link InvertibleBloomFilter}.
 * It is composed of an idSum (the XOR of all element inserted in that cell), a hashSum (the XOR of all hashed element in that cell) and a counter (the number of elements inserted in that cell).
 * @author Arnaud Grall
 * @author Thomas Minier
 */
export default class Cell extends BaseFilter {
    _idSum: Buffer;
    _hashSum: Buffer;
    _count: number;
    /**
     * Constructor.
     * To create an empty cell, you might want to use the static Cell#empty() method.
     * @param idSum - The XOR of all element inserted in that cell
     * @param hashSum - The XOR of all hashed element in that cell
     * @param count - The number of elements inserted in that cell
     */
    constructor(idSum: Buffer, hashSum: Buffer, count: number);
    /**
     * Create an empty cell
     * @return An empty Cell
     */
    static empty(): Cell;
    [inspect](): string;
    /**
     * Get the id sum of the Cell (The XOR of all element inserted in that cell)
     */
    get idSum(): Buffer;
    /**
     * Get the hash sum of the Cell (The XOR of all hashed element in that cell)
     */
    get hashSum(): Buffer;
    /**
     * Get the number of elements inserted in that cell
     */
    get count(): number;
    /**
     * Add an element in this cell
     * @param idSum - The element to XOR in this cell
     * @param hashSum - The hash of the element to XOR in this cell
     */
    add(idSum: Buffer, hashSum: Buffer): void;
    /**
     * Perform the XOR operation between this Cell and another one and returns a resulting Cell.
     * A XOR between two cells is the XOR between their id sum and hash sum,
     * and the difference between their count.
     * @param cell - Cell to perform XOR with
     * @return A new Cell, resulting from the XOR operation
     */
    xorm(cell: Cell): Cell;
    /**
     * Test if the Cell is empty
     * @return True if the Cell is empty, False otherwise
     */
    isEmpty(): boolean;
    /**
     * Test if another Cell is equals to this one
     * @param  cell - The cell to compare with
     * @return True if the two Cells are equals, False otherwise
     */
    equals(cell: Cell): boolean;
    /**
     * Test if the cell is "Pure".
     * A pure cell is a cell with a counter equal to 1 or -1, and with a hash sum equal to the id sum
     * @return True if the cell ius pure, False otherwise
     */
    isPure(): boolean;
}
export {};
