import BaseFilter from '../base-filter';
import CountMinSketch from './count-min-sketch';
/**
 * An element in a MinHeap
 * @author Thomas Minier
 */
interface HeapElement {
    value: string;
    frequency: number;
}
/**
 * An element in a TopK
 * @author Thomas Minier
 */
interface TopkElement extends HeapElement {
    rank: number;
}
/**
 * A MinHeap stores items sorted by ascending frequency
 * @author Thomas Minier
 */
declare class MinHeap {
    _content: HeapElement[];
    constructor();
    /**
     * Get the number of items in the heap
     */
    get length(): number;
    get content(): HeapElement[];
    set content(value: HeapElement[]);
    /**
     * Access an item at a given index
     * @param index - Index of the item
     * @return The item or `undefined` if the index is out of the array
     */
    get(index: number): HeapElement | undefined;
    /**
     * Add a new element to the heap and keep items sorted by ascending frequency
     * @param element - Element to insert
     */
    add(element: HeapElement): void;
    /**
     * Remove an item at a given index and keep items sorted by ascending frequency
     * @param index - Index of the item to remove
     */
    remove(index: number): void;
    /**
     * Remove and returns the element with the smallest frequency in the heap
     * @return The element with the smallest frequency in the heap
     */
    popMin(): HeapElement | undefined;
    /**
     * Get the index of an element by its value
     * @param value - Value of the element to search for
     * @return Index of the element or -1 if it is not in the heap
     */
    indexOf(value: string): number;
    /**
     * Clear the content of the heap
     */
    clear(): void;
}
/**
 * A TopK computes the ranking of elements in a multiset (by an arbitrary score) and returns the `k` results with the highest scores.
 * This implementation of the TopK problem sorts items based on their estimated cardinality in the multiset.
 * It is based on a Count Min Sketch, for estimating the cardinality of items, and a MinHeap, for implementing a sliding window over the `k` results with the highest scores.
 * @author Thomas Minier
 * @author Arnaud Grall
 */
export default class TopK extends BaseFilter {
    _k: number;
    _errorRate: number;
    _accuracy: number;
    _sketch: CountMinSketch;
    _heap: MinHeap;
    /**
     * Constructor
     * @param k - How many elements to store
     * @param errorRate - The error rate
     * @param accuracy  - The probability of accuracy
     */
    constructor(k: number, errorRate: number, accuracy: number);
    /**
     * Add an element to the TopK
     * @param element - Element to add
     */
    add(element: string, count?: number): void;
    /**
     * Clear the content of the TopK
     */
    clear(): void;
    /**
     * Get the top-k values as an array of objects {value: string, frequency: number, rank: number}
     * @return The top-k values as an array of objects {value: string, frequency: number, rank: number}
     */
    values(): TopkElement[];
    /**
     * Get the top-k values as an iterator that yields objects {value: string, frequency: number, rank: number}.
     * WARNING: With this method, values are produced on-the-fly, hence you should not modify the TopK
     * while the iteration is not completed, otherwise the generated values may not respect the TopK properties.
     * @return The top-k values as an iterator of object {value: string, frequency: number, rank: number}
     */
    iterator(): Iterator<TopkElement>;
}
export {};
