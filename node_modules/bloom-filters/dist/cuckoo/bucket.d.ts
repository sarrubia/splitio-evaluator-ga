/**
 * A Bucket is a container of a fixed number of values, used in various bloom filters.
 * @extends Exportable
 * @author Thomas Minier
 * @private
 */
export default class Bucket<T> {
    _elements: Array<T | null>;
    _size: number;
    _length: number;
    /**
     * Constructor
     * @param size - The maximum number of elements in the bucket
     */
    constructor(size: number);
    /**
     * Get the maximum number of element in the bucket
     */
    get size(): number;
    /**
     * Get the number of elements currenlty in the bucket
     */
    get length(): number;
    /**
     * Test if the bucket has any space available
     * @return True if te bucket has any space available, False if if its full
     */
    isFree(): boolean;
    /**
     * Get the index of the first empty slot in the bucket
     * @return The index of the first empty slot, or -1 if the bucket is full
     */
    nextEmptySlot(): number;
    /**
     * Get the element at the given index in the bucket
     * @param index - The index to access
     * @return The element at the given index
     */
    at(index: number): T | null;
    /**
     * Try to add an element to the bucket
     * @param element - The element to add in the bucket
     * @return True if the insertion is a success, False if the bucket is full
     */
    add(element: T | null): boolean;
    /**
     * Try to remove an element from the bucket
     * @param element - The element to remove from the bucket
     * @return True if the element has been successfully removed, False if it was not in the bucket
     */
    remove(element: T): boolean;
    /**
     * Test an element for membership
     * @param element - The element to look for in the bucket
     * @return True is the element is in the bucket, otherwise False
     */
    has(element: T): boolean;
    /**
     * Set an element at the given index in the bucket
     * @param index - The index at where the element should be inserted
     * @param element - The element to insert
     */
    set(index: number, element: T | null): void;
    /**
     * Unset the element at the given index
     * @param index - The index of the element that should be unset
     */
    unset(index: number): void;
    /**
     * Randomly swap an element of the bucket with a given element, then return the replaced element
     * @param element - The element to be inserted
     * @param random - Factory function used to generate random function
     * @return The element that have been swapped with the parameter
     */
    swapRandom(element: T, random?: () => number): T | null;
    /**
     * Swap an element of the bucket with a given index and element, then return the replaced element
     * @param index - The index at where the element should be inserted
     * @param element - The element to be inserted
     * @return The element that have been swapped with the parameter
     */
    swap(index: number, element: T): T | null;
    /**
     * Test if two buckets are equals: they have the same size, length and content
     * @param bucket - The other bucket with which to compare
     * @return True if the two buckets are equals, False otherwise
     */
    equals(bucket: Bucket<T>): boolean;
}
