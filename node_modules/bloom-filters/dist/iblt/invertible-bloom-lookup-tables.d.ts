/// <reference types="node" />
import BaseFilter from '../base-filter';
import WritableFilter from '../interfaces/writable-filter';
import Cell from './cell';
/**
 * The reason why an Invertible Bloom Lookup Table decoding operation has failed
 */
export interface IBLTDecodingErrorReason {
    cell: Cell | null;
    iblt: InvertibleBloomFilter;
}
/**
 * The results of decoding an Invertible Bloom Lookup Table
 */
export interface IBLTDecodingResults {
    success: boolean;
    reason?: IBLTDecodingErrorReason;
    additional: Buffer[];
    missing: Buffer[];
}
/**
 * An Invertible Bloom Lookup Table is a space-efficient and probabilistic data-structure for solving the set-difference problem efficiently without the use of logs or other prior context. It computes the set difference with communication proportional to the size of the difference between the sets being compared.
 * They can simultaneously calculate D(A−B) and D(B−A) using O(d) space. This data structure encodes sets in a fashion that is similar in spirit to Tornado codes’ construction [6], in that it randomly combines elements using the XOR function
 * Reference: Eppstein, D., Goodrich, M. T., Uyeda, F., & Varghese, G. (2011). What's the difference?: efficient set reconciliation without prior context. ACM SIGCOMM Computer Communication Review, 41(4), 218-229.
 * @see {@link http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.220.6282&rep=rep1&type=pdf} for more details about Invertible Bloom Lookup Tables
 * @author Arnaud Grall
 * @author Thomas Minier
 */
export default class InvertibleBloomFilter extends BaseFilter implements WritableFilter<Buffer> {
    _size: number;
    _hashCount: number;
    _elements: Array<Cell>;
    /**
     * Construct an Invertible Bloom Lookup Table
     * @param size - The number of cells in the InvertibleBloomFilter. It should be set to d * alpha, where d is the number of difference and alpha is a constant
     * @param hashCount - The number of hash functions used (empirically studied to be 3 or 4 in most cases)
     */
    constructor(size: number, hashCount?: number);
    /**
     * Create an Invertible Bloom filter optimal for an expected size and error rate.
     * @param nbItems - Number of items expected to insert into the IBLT
     * @param errorRate - Expected error rate
     * @return A new Invertible Bloom filter optimal for the given parameters.
     */
    static create(nbItems: number, errorRate: number): InvertibleBloomFilter;
    /**
     * Create an Invertible Bloom filter from a set of Buffer and optimal for an error rate.
     * @param items - An iterable to yield Buffers to be inserted into the filter
     * @param errorRate - Expected error rate
     * @return A new Invertible Bloom filter filled with the iterable's items.
     */
    static from(items: Iterable<Buffer>, errorRate: number): InvertibleBloomFilter;
    /**
     * Return the number of hash functions used
     * @return {Number}
     */
    get hashCount(): number;
    /**
     * Get the number of cells of the filter
     */
    get size(): number;
    /**
     * Get the number of elements added in the filter
     * Complexity in time: O(alpha*d)
     */
    get length(): number;
    /**
     * Return the cells used to store elements in this InvertibleBloomFilter
     */
    get elements(): Cell[];
    /**
     * Add an element to the InvertibleBloomFilter
     * @param element - The element to insert
     */
    add(element: Buffer): void;
    /**
     * Remove an element from the filter
     * @param element - The element to remove
     * @return True if the element has been removed, False otheriwse
     */
    remove(element: Buffer): boolean;
    /**
     * Test if an item is in the filter.
     * @param  element - The element to test
     * @return False if the element is not in the filter, true if "may be" in the filter.
     */
    has(element: Buffer): boolean;
    /**
     * List all entries from the filter using a Generator.
     * The generator ends with True if the operation has not failed, False otheriwse.
     * It is not recommended to modify an IBLT while listing its entries!
     * @return A generator that yields all filter's entries.
     */
    listEntries(): Generator<Buffer, boolean>;
    /**
     * Substract the filter with another {@link InvertibleBloomFilter}, and returns the resulting filter.
     * @param  remote - The filter to substract with
     * @return A new InvertibleBloomFilter which is the XOR of the local and remote one
     */
    substract(iblt: InvertibleBloomFilter): InvertibleBloomFilter;
    /**
     * Test if two InvertibleBloomFilters are equals
     * @param iblt - The filter to compare with
     * @return True if the two filters are equals, False otherwise
     */
    equals(iblt: InvertibleBloomFilter): boolean;
    /**
     * Decode an InvertibleBloomFilter based on its substracted version
     * @return The results of the deconding process
     */
    decode(additional?: Buffer[], missing?: Buffer[]): IBLTDecodingResults;
}
