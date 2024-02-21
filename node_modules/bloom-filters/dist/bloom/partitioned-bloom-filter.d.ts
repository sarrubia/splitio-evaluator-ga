import BaseFilter from '../base-filter';
import ClassicFilter from '../interfaces/classic-filter';
import { HashableInput } from '../utils';
import BitSet from './bit-set';
/**
 * A Partitioned Bloom Filter is a variation of a classic Bloom filter.
 *
 * This filter works by partitioning the M-sized bit array into k slices of size m = M/k bits, k = nb of hash functions in the filter.
 * Each hash function produces an index over m for its respective slice.
 * Thus, each element is described by exactly k bits, meaning the distribution of false positives is uniform across all elements.
 *
 * Be careful, as a Partitioned Bloom Filter have much higher collison risks that a classic Bloom Filter on small sets of data.
 *
 * Reference: Chang, F., Feng, W. C., & Li, K. (2004, March). Approximate caches for packet classification. In INFOCOM 2004. Twenty-third AnnualJoint Conference of the IEEE Computer and Communications Societies (Vol. 4, pp. 2196-2207). IEEE.
 * @see {@link https://pdfs.semanticscholar.org/0e18/e24b37a1f4196fddf8c9ff8e4368b74cfd88.pdf} for more details about Partitioned Bloom Filters
 * @author Thomas Minier & Arnaud Grall
 */
export default class PartitionedBloomFilter extends BaseFilter implements ClassicFilter<HashableInput> {
    _size: number;
    _nbHashes: number;
    _loadFactor: number;
    _m: number;
    _filter: Array<BitSet>;
    _capacity: number;
    /**
     * Constructor
     * @param size - The total number of cells
     * @param nbHashes - The number of hash functions
     * @param loadFactor - The load factor
     * @param capacity - The filter capacity
     */
    constructor(size: number, nbHashes: number, loadFactor: number, capacity?: number);
    /**
     * Return a PartitionedBloomFilter for a given number of elements and under a given error rate
     * @param  size - The max allowable number of items to insert
     * @param  errorRate - The desired error rate
     * @return A new PartitionedBloomFilter optimal for the given parameters
     */
    static create(size: number, errorRate: number, loadFactor?: number): PartitionedBloomFilter;
    /**
     * Build a new Partitioned Bloom Filter from an existing iterable with a fixed error rate
     * @param items - The iterable used to populate the filter
     * @param errorRate - The error rate, i.e. 'false positive' rate, targetted by the filter
     * @param loadFactor - The filter's load factor
     * @return A new Bloom Filter filled with the iterable's elements
     * @example
     * ```js
     * // create a filter with a false positive rate of 0.1
     * const filter = PartitionedBloomFilter.from(['alice', 'bob', 'carl'], 0.1);
     * ```
     */
    static from(items: Iterable<HashableInput>, errorRate: number, loadFactor?: number): PartitionedBloomFilter;
    /**
     * Get the filter capacity, i.e. the maximum number of elements it will contains
     */
    get capacity(): number;
    /**
     * Get the size of the filter
     */
    get size(): number;
    /**
     * Get the filter's load factor
     */
    get loadFactor(): number;
    /**
     * Add an element to the filter
     * @param element - The element to add
     * @example
     * ```js
     * const filter = new PartitionedBloomFilter(15, 0.1);
     * filter.add('foo');
     * ```
     */
    add(element: HashableInput): void;
    /**
     * Test an element for membership
     * @param element - The element to look for in the filter
     * @return False if the element is definitively not in the filter, True is the element might be in the filter
     * @example
     * ```js
     * const filter = new PartitionedBloomFilter(15, 0.1);
     * filter.add('foo');
     * console.log(filter.has('foo')); // output: true
     * console.log(filter.has('bar')); // output: false
     * ```
     */
    has(element: HashableInput): boolean;
    /**
     * Compute the current false positive rate (or error rate) of the filter
     * @return The current false positive rate of the filter
     * @example
     * ```js
     * const filter = PartitionedBloomFilter.create(15, 0.1);
     * console.log(filter.rate()); // output: something around 0.1
     * ```
     */
    rate(): number;
    /**
     * Check if another Partitioned Bloom Filter is equal to this one
     * @param  filter - The filter to compare to this one
     * @return True if they are equal, false otherwise
     */
    equals(other: PartitionedBloomFilter): boolean;
    /**
     * Return the current load of this filter, iterate on all buckets
     * @return An integer between 0 and 1, where 0 = filter empty and 1 = filter full
     */
    _currentload(): number;
}
