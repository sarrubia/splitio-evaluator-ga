import { HashFunction, MinHash } from './min-hash';
/**
 * A factory to create MinHash sketches using the same set of hash functions.
 *
 * **WARNING**: Only the MinHash produced by the same factory can be compared between them.
 * @author Thomas Minier
 */
export default class MinHashFactory {
    _nbHashes: number;
    _maxValue: number;
    _hashFunctions: HashFunction[];
    /**
     * Constructor
     * @param nbHashes - Number of hash functions to use for comouting the MinHash signature
     * @param maxValue - The highest value that can be found in the set to compare
     */
    constructor(nbHashes: number, maxValue: number);
    /**
     * Create a new MinHash set
     * @return A new MinHash set
     */
    create(): MinHash;
}
