import BaseFilter from '../base-filter';
import CountingFilter from '../interfaces/counting-filter';
import { HashableInput } from '../utils';
/**
 * The count–min sketch (CM sketch) is a probabilistic data structure that serves as a frequency table of events in a stream of data.
 * It uses hash functions to map events to frequencies, but unlike a hash table uses only sub-linear space, at the expense of overcounting some events due to collisions.
 *
 * Reference: Cormode, G., & Muthukrishnan, S. (2005). An improved data stream summary: the count-min sketch and its applications. Journal of Algorithms, 55(1), 58-75.
 * @see {@link http://vaffanculo.twiki.di.uniroma1.it/pub/Ing_algo/WebHome/p14_Cormode_JAl_05.pdf} for more details on Count Min Sketch
 * @extends Exportable
 * @author Thomas Minier & Arnaud Grall
 */
export default class CountMinSketch extends BaseFilter implements CountingFilter<HashableInput> {
    _columns: number;
    _rows: number;
    _matrix: Array<Array<number>>;
    _allSums: number;
    /**
     * Constructor
     * @param columns - Number of columns
     * @param rows - Number of rows
     */
    constructor(columns: number, rows: number);
    /**
     * Create a count-min sketch, with a target error rate and probability of accuracy
     * @param  errorRate - The error rate
     * @param  accuracy  - The probability of accuracy
     * @return A new Count Min Sketch optimal for the input parameters
     */
    static create(errorRate: number, accuracy?: number): CountMinSketch;
    /**
     * Create a Count Min Sketch from a set of items, with a target error rate and probability of accuracy
     * @param items - An iterable to yield items to be inserted into the filter
     * @param  errorRate - The error rate
     * @param  accuracy  - The probability of accuracy
     * @return A new Count Min Sketch filled with the iterable's items.
     */
    static from(items: Iterable<HashableInput>, errorRate: number, accuracy?: number): CountMinSketch;
    /**
     * Return the number of columns in the sketch
     */
    get columns(): number;
    /**
     * Return the number of rows in the sketch
     */
    get rows(): number;
    /**
     * Get the sum of all counts in the sketch
     */
    get sum(): number;
    /**
     * Update the count min sketch with a new occurrence of an element
     * @param element - The new element
     * @param count - Number of occurences of the elemnt (defauls to one)
     */
    update(element: HashableInput, count?: number): void;
    /**
     * Perform a point query: estimate the number of occurence of an element
     * @param element - The element we want to count
     * @return The estimate number of occurence of the element
     */
    count(element: HashableInput): number;
    /**
     * Check if another Count Min Sketch is equal to this one
     * @param  filter - The filter to compare to this one
     * @return True if they are equal, false otherwise
     */
    equals(other: CountMinSketch): boolean;
    /**
     * Merge (in place) this sketch with another sketch, if they have the same number of columns and rows.
     * @param sketch - The sketch to merge with
     */
    merge(sketch: CountMinSketch): void;
    /**
     * Clone the sketch
     * @return A new cloned sketch
     */
    clone(): CountMinSketch;
}
