import BaseFilter from '../base-filter';
/**
 * The parameters of a Hash function used in the MinHash algorithm
 * @author Thomas Minier
 */
export interface HashFunction {
    a: number;
    b: number;
    c: number;
}
/**
 * MinHash (or the min-wise independent permutations locality sensitive hashing scheme) is a technique for quickly estimating how similar two sets are.
 * It is able to estimate the Jaccard similarity between two large sets of numbers using random hashing.
 *
 * **WARNING**: Only the MinHash produced by the same {@link MinHashFactory} can be compared between them.
 *
 * @see "On the resemblance and containment of documents", by Andrei Z. Broder, in Compression and Complexity of Sequences: Proceedings, Positano, Amalfitan Coast, Salerno, Italy, June 11-13, 1997.
 * @author Thomas Minier
 */
export declare class MinHash extends BaseFilter {
    _nbHashes: number;
    _hashFunctions: HashFunction[];
    _signature: number[];
    /**
     * Constructor
     * @param nbHashes - Number of hash functions to use for comouting the MinHash signature
     * @param hashFunctions - Hash functions used to compute the signature
     */
    constructor(nbHashes: number, hashFunctions: HashFunction[]);
    /**
     * Get the number of hash functions used by the MinHash
     */
    get nbHashes(): number;
    /**
     * Test if the signature of the MinHash is empty
     * @return True if the MinHash is empty, False otherwise
     */
    isEmpty(): boolean;
    /**
     * Insert a value into the MinHash and update its signature.
     * @param value - Value to insert
     */
    add(value: number): void;
    /**
     * Ingest a set of values into the MinHash, in an efficient manner, and update its signature.
     * @param values - Set of values to load
     */
    bulkLoad(values: number[]): void;
    /**
     * Estimate the Jaccard similarity coefficient with another MinHash signature
     * @param other - MinHash to compare with
     * @return The estimated Jaccard similarity coefficient between the two sets
     */
    compareWith(other: MinHash): number;
}
