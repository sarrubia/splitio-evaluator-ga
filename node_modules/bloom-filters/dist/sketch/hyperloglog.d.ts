import BaseFilter from '../base-filter';
import { HashableInput } from '../utils';
/**
 * HyperLogLog is an algorithm for the count-distinct problem, approximating the number of distinct elements in a multiset.
 * @see HyperLogLog: the analysis of a near-optimal cardinality estimation algorithm {@link http://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf}
 * @author Thomas Minier
 */
export default class HyperLogLog extends BaseFilter {
    /**
     * The number of registers, denoted m in the algorithm
     */
    _nbRegisters: number;
    /**
     * Number of bytes to take per hash, denoted b in the algorithm (b = log2(m))
     */
    _nbBytesPerHash: number;
    /**
     * The bias-correction constant, denoted alpha in the algorithm
     */
    _correctionBias: number;
    /**
     * The registers used to store data
     */
    _registers: Array<number>;
    /**
     * Constructor
     * @param nbRegisters - The number of registers to use
     */
    constructor(nbRegisters: number);
    /**
     * Get the number of registers used by the HyperLogLog
     */
    get nbRegisters(): number;
    /**
     * Update The multiset with a new element
     * @param element - Element to add
     */
    update(element: HashableInput): void;
    /**
     * Estimate the cardinality of the multiset
     * @return The estimated cardinality of the multiset
     */
    count(round?: boolean): number;
    /**
     * Compute the accuracy of the cardinality estimation produced by this HyperLogLog
     * @return The accuracy of the cardinality estimation
     */
    accuracy(): number;
    /**
     * Perform the union with another HyperLogLog multiset
     * @param other - Multiset ot merge with
     * @return The union of the two multisets
     */
    merge(other: HyperLogLog): HyperLogLog;
    /**
     * Check if another HyperLogLog is equal to this one
     * @param  other - The HyperLogLog to compare to this one
     * @return True if they are equal, false otherwise
     */
    equals(other: HyperLogLog): boolean;
}
