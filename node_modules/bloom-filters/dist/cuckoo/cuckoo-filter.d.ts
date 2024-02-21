import WritableFilter from '../interfaces/writable-filter';
import BaseFilter from '../base-filter';
import Bucket from './bucket';
import { HashableInput } from '../utils';
/**
 * Cuckoo filters improve on Bloom filters by supporting deletion, limited counting,
 * and bounded False positive rate with similar storage efficiency as a standard Bloom filter.
 *
 * Reference: Fan, B., Andersen, D. G., Kaminsky, M., & Mitzenmacher, M. D. (2014, December). Cuckoo filter: Practically better than bloom.
 * In Proceedings of the 10th ACM International on Conference on emerging Networking Experiments and Technologies (pp. 75-88). ACM.
 * @see {@link https://www.cs.cmu.edu/~dga/papers/cuckoo-conext2014.pdf} for more details about Cuckoo filters
 * @author Thomas Minier & Arnaud Grall
 */
export default class CuckooFilter extends BaseFilter implements WritableFilter<HashableInput> {
    _filter: Array<Bucket<string>>;
    _size: number;
    _bucketSize: number;
    _fingerprintLength: number;
    _length: number;
    _maxKicks: number;
    /**
     * Constructor
     * @param size - The filter size
     * @param fLength - The length of the fingerprints
     * @param bucketSize - The size of the buckets in the filter
     * @param maxKicks - (optional) The max number of kicks when resolving collision at insertion, default to 1
     */
    constructor(size: number, fLength: number, bucketSize: number, maxKicks?: number);
    /**
     * Return a new optimal CuckooFilter given the number of maximum elements to store and the error rate desired
     * @param  size - The number of items to store
     * @param  errorRate - The desired error rate
     * @param  bucketSize - The number of buckets desired per cell
     * @param  maxKicks - The number of kicks done when a collision occurs
     * @return A Cuckoo Filter optimal for these parameters
     */
    static create(size: number, errorRate: number, bucketSize?: number, maxKicks?: number): CuckooFilter;
    /**
     * Build a new optimal CuckooFilter from an iterable with a fixed error rate
     * @param items - Iterable used to populate the filter
     * @param errorRate - The error rate of the filter
     * @param  bucketSize - The number of buckets desired per cell
     * @param  maxKicks - The number of kicks done when a collision occurs
     * @return A new Cuckoo Filter filled with the iterable's elements
     */
    static from(items: Iterable<HashableInput>, errorRate: number, bucketSize?: number, maxKicks?: number): CuckooFilter;
    /**
     * Get the filter size
     */
    get size(): number;
    /**
     * Get the filter full size, i.e., the total number of cells
     */
    get fullSize(): number;
    /**
     * Get the filter length, i.e. the current number of elements in the filter
     */
    get length(): number;
    /**
     * Get the length of the fingerprints in the filter
     */
    get fingerprintLength(): number;
    /**
     * Get the size of the buckets in the filter
     */
    get bucketSize(): number;
    /**
     * Get the max number of kicks when resolving collision at insertion
     */
    get maxKicks(): number;
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
    add(element: HashableInput, throwError?: boolean, destructive?: boolean): boolean;
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
    remove(element: HashableInput): boolean;
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
    has(element: HashableInput): boolean;
    /**
     * Return the false positive rate for this cuckoo filter
     * @return The false positive rate
     */
    rate(): number;
    /**
     * Return the load of this filter
     * @return {Object} load: is the load, size is the number of entries, free is the free number of entries, used is the number of entry used
     */
    _computeHashTableLoad(): {
        used: number;
        free: number;
        size: number;
        load: number;
    };
    /**
     * For a element, compute its fingerprint and the index of its two buckets
     * @param element - The element to hash
     * @return The fingerprint of the element and the index of its two buckets
     * @private
     */
    _locations(element: HashableInput): {
        fingerprint: string;
        firstIndex: number;
        secondIndex: number;
    };
    /**
     * Check if another Cuckoo filter is equal to this one
     * @param  filter - The cuckoo filter to compare to this one
     * @return True if they are equal, false otherwise
     */
    equals(filter: CuckooFilter): boolean;
}
