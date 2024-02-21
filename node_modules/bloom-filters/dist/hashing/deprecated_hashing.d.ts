import { HashableInput } from '../utils';
import Hashing from './hashing';
/**
 * @deprecated
 * Hashing class to use before v1.3.7
 */
export default class DeprecatedHashing extends Hashing {
    /**
     * Apply Double Hashing to produce a n-hash
     * @param  n - The indice of the hash function we want to produce
     * @param  hashA - The result of the first hash function applied to a value.
     * @param  hashB - The result of the second hash function applied to a value.
     * @param  size - The size of the datastructures associated to the hash context (ex: the size of a Bloom Filter)
     * @return The result of hash_n applied to a value.
     * @returns
     */
    doubleHashing: (n: number, hashA: number, hashB: number, size: number) => number;
    /**
     * Generate N indexes on range [0, size)
     * It uses the double hashing technique to generate the indexes.
     * It hash twice the value only once before generating the indexes.
     * Warning: you can have a lot of modulo collisions.
     * @param  element    - The element to hash
     * @param  size       - The range on which we can generate the index, exclusive
     * @param  hashCount  - The number of indexes we want
     * @return An array of indexes on range [0, size)
     */
    getIndexes(element: HashableInput, size: number, hashCount: number, seed?: number): number[];
    /**
     * Generate a set of distinct indexes on interval [0, size) using the double hashing technique
     * This function is the old method called by a lot of filters.
     * To work in the current version, replace, the getIndexes function of the filters by this one
     * @param  element  - The element to hash
     * @param  size     - the range on which we can generate an index [0, size) = size
     * @param  number   - The number of indexes desired
     * @param  seed     - The seed used
     * @return A array of indexes
     * @author Arnaud Grall
     */
    getDistinctIndexes(element: HashableInput, size: number, number: number, seed?: number): Array<number>;
}
