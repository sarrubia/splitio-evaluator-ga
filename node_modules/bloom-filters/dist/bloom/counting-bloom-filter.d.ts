import BaseFilter from '../base-filter';
import WritableFilter from '../interfaces/writable-filter';
import { HashableInput } from '../utils';
/**
 * A Counting Bloom filter works in a similar manner as a regular Bloom filter; however, it is able to keep track of insertions and deletions. In a counting Bloom filter, each entry in the Bloom filter is a small counter associated with a basic Bloom filter bit.
 *
 * Reference: F. Bonomi, M. Mitzenmacher, R. Panigrahy, S. Singh, and G. Varghese, “An Improved Construction for Counting Bloom Filters,” in 14th Annual European Symposium on Algorithms, LNCS 4168, 2006, pp.
684–695.
 * @author Thomas Minier & Arnaud Grall
 */
export default class CountingBloomFilter extends BaseFilter implements WritableFilter<HashableInput> {
    _size: number;
    _nbHashes: number;
    _filter: Array<Array<number>>;
    _length: number;
    /**
     * Constructor
     * @param size - The size of the filter
     * @param nbHashes - The number of hash functions
     */
    constructor(size: number, nbHashes: number);
    /**
     * Allocate a CountingBloomFilter with a target maximum capacity and error rate
     * @param  capacity - The maximum capacity of the filter
     * @param  errorRate - The error rate of the filter
     * @return A new {@link CountingBloomFilter}
     */
    static create(capacity: number, errorRate: number): CountingBloomFilter;
    /**
     * Build a new Bloom Filter from an iterable with a fixed error rate
     * @param items - Iterable used to populate the filter
     * @param errorRate - The error rate of the filter
     * @return A new Bloom Filter filled with the iterable's elements
     * @example
     * ```js
     * // create a filter with a false positive rate of 0.1
     * const filter = CountingBloomFilter.from(['alice', 'bob', 'carl'], 0.1);
     * ```
     */
    static from(items: Iterable<HashableInput>, errorRate: number): CountingBloomFilter;
    /**
     * Get the optimal size of the filter
     */
    get size(): number;
    /**
     * Get the number of elements currently in the filter
     */
    get length(): number;
    /**
     * Add an element to the filter
     * @param element - The element to add
     * @example
     * ```js
     * const filter = new CountingBloomFilter(15, 0.1);
     * filter.add('foo');
     * ```
     */
    add(element: HashableInput): void;
    /**
     * Remove an element from the filter
     * @param element - The element to delete
     * @example
     * ```js
     * const filter = new CountingBloomFilter(15, 0.1);
     * filter.remove('foo');
     * ```
     */
    remove(element: HashableInput): boolean;
    /**
     * Test an element for membership
     * @param element - The element to look for in the filter
     * @return False if the element is definitively not in the filter, True is the element might be in the filter
     * @example
     * ```js
     * const filter = new CountingBloomFilter(15, 0.1);
     * filter.add('foo');
     * console.log(filter.has('foo')); // output: true
     * console.log(filter.has('bar')); // output: false
     * ```
     */
    has(element: HashableInput): boolean;
    /**
     * Get the current false positive rate (or error rate) of the filter
     * @return The current false positive rate of the filter
     * @example
     * ```js
     * const filter = new BloomFilter(15, 0.1);
     * console.log(filter.rate()); // output: something around 0.1
     * ```
     */
    rate(): number;
    /**
     * Check if another Counting Bloom Filter is equal to this one
     * @param  filter - The filter to compare to this one
     * @return True if they are equal, false otherwise
     */
    equals(other: CountingBloomFilter): boolean;
}
