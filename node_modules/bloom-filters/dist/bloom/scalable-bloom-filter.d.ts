import ClassicFilter from '../interfaces/classic-filter';
import BaseFilter from '../base-filter';
import { HashableInput } from '../utils';
import PartitionBloomFilter from './partitioned-bloom-filter';
/**
 * A Scalable Bloom Filter is a variant of Bloom Filters that can adapt dynamically to the
number of elements stored, while assuring a maximum false positive probability
 *
 * Reference: ALMEIDA, Paulo Sérgio, BAQUERO, Carlos, PREGUIÇA, Nuno, et al. Scalable bloom filters. Information Processing Letters, 2007, vol. 101, no 6, p. 255-261.
 * @see {@link https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.725.390&rep=rep1&type=pdf}
 * @author Thomas Minier & Arnaud Grall
 */
export default class ScalableBloomFilter extends BaseFilter implements ClassicFilter<HashableInput> {
    /**
     * Static value, will power the size of the new set, by default we will follow a power of 2.
     */
    static _s: number;
    /**
     * The initial size of this filter in number of elements, not in bytes.
     */
    _initial_size: number;
    /**
     * The error rate desired.
     */
    _error_rate: number;
    /**
     * The load factor of each filter, By default: 0.5 half of the set
     */
    _ratio: number;
    /**
     * Internal Partition Bloom Filters
     */
    _filters: PartitionBloomFilter[];
    constructor(_initial_size?: number, _error_rate?: number, _ratio?: number);
    /**
     * @override
     * Return the current seed.
     * For obscure reason we must code this function...
     */
    get seed(): number;
    /**
     * @override
     * Set the seed for this structure. If you override the seed after adding data,
     * all the filters will be updated and you may get wrong indexes for already indexed data
     * due to the seed change. So only change it once before adding data.
     * @param  seed the new seed that will be used in this structure
     */
    set seed(seed: number);
    /**
     * Add a new element to the filter
     * @param element
     */
    add(element: HashableInput): void;
    /**
     * Return True if the element has been found, false otherwise.
     * Check until we found the value in a filter otherwise stop on the first value found.
     * @param element
     * @returns
     */
    has(element: HashableInput): boolean;
    /**
     * Return the current capacity (number of elements) of this filter
     * @returns
     */
    capacity(): number;
    /**
     * Return the current false positive rate of this structure
     * @returns
     */
    rate(): number;
    /**
     * Check if two ScalableBloomFilter are equal
     * @param filter
     * @returns
     */
    equals(filter: ScalableBloomFilter): boolean;
    /**
     * Create a Scalable Bloom Filter based on Partitionned Bloom Filter.
     * @param _size the starting size of the filter
     * @param _error_rate ther error rate desired of the filter
     * @param _ratio the load factor desired
     * @returns
     */
    static create(_size: number, _error_rate: number, _ratio?: number): ScalableBloomFilter;
}
