import 'reflect-metadata';
interface ImportExportSpecs<T> {
    export: (instance: T) => any;
    import: (json: any) => T;
}
/**
 * Clone a field of a filter (array, object or any primary type)
 * @param  {*} v - Value to clone
 * @return {*} Cloned value
 */
export declare function cloneField(v: any): any;
/**
 * Get a function used to clone an object
 * @param type - Object type
 * @param fields - Object's fields to clone
 * @return A function that clones the given fields of an input object
 */
export declare function cloneObject(type: string, ...fields: string[]): any;
/**
 * Turn a datastructure into an exportable one, so it can be serialized from/to JSON objects.
 * @param specs - An object that describes how the datastructure should be exported/imported
 * @author Thomas Minier
 */
export declare function Exportable<T>(specs: ImportExportSpecs<T>): (target: any) => any;
/**
 * Register a field to be exportable/importable
 * @param importer - Function invoked on the JSON field to convert it into JavaScript
 */
export declare function Field<F>(exporter?: (elt: F) => any, importer?: (json: any) => F): (target: any, propertyKey: string) => void;
export declare function Parameter(fieldName: string): (target: any, propertyKey: string, parameterIndex: number) => void;
/**
 * Augment a TypeScript class to make it exportable/importable, using @Field and @Parameter decorator
 * @param className - Name of the exportable/importable class
 */
export declare function AutoExportable<T>(className: string, otherFields?: string[]): (target: any) => void;
export {};
