"use strict";
/* file : exportable.ts
MIT License

Copyright (c) 2017-2020 Thomas Minier & Arnaud Grall

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
// !disable all rules referring to `any` for exportable because we are dealing with all types so any is allowed
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoExportable = exports.Parameter = exports.Field = exports.Exportable = exports.cloneObject = exports.cloneField = void 0;
require("reflect-metadata");
/**
 * Clone a field of a filter (array, object or any primary type)
 * @param  {*} v - Value to clone
 * @return {*} Cloned value
 */
function cloneField(v) {
    if (v === null || v === undefined) {
        return v;
    }
    if (Array.isArray(v)) {
        return v.map(cloneField);
    }
    else if (typeof v === 'object') {
        if ('saveAsJSON' in v) {
            return v.saveAsJSON();
        }
        return Object.assign({}, v);
    }
    return v;
}
exports.cloneField = cloneField;
/**
 * Get a function used to clone an object
 * @param type - Object type
 * @param fields - Object's fields to clone
 * @return A function that clones the given fields of an input object
 */
function cloneObject(type) {
    var fields = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        fields[_i - 1] = arguments[_i];
    }
    return function (obj) {
        var json = { type: type };
        fields.forEach(function (field) {
            json[field] = cloneField(obj[field]);
        });
        return json;
    };
}
exports.cloneObject = cloneObject;
/**
 * Turn a datastructure into an exportable one, so it can be serialized from/to JSON objects.
 * @param specs - An object that describes how the datastructure should be exported/imported
 * @author Thomas Minier
 */
function Exportable(specs) {
    return function (target) {
        target.prototype.saveAsJSON = function () {
            return specs.export(this);
        };
        target.fromJSON = function (json) {
            return specs.import(json);
        };
        return target;
    };
}
exports.Exportable = Exportable;
var METADATA_CLASSNAME = Symbol('bloom-filters:exportable:class-name');
var METADATA_FIELDS = Symbol('bloom-filters:exportable:fields');
var METADATA_PARAMETERS = Symbol('bloom-filters:exportable:constructor-parameters');
/**
 * Register a field to be exportable/importable
 * @param importer - Function invoked on the JSON field to convert it into JavaScript
 */
function Field(exporter, importer) {
    if (exporter === undefined) {
        exporter = cloneField;
    }
    if (importer === undefined) {
        importer = function (v) { return v; };
    }
    return function (target, propertyKey) {
        var fields = [];
        if (Reflect.hasMetadata(METADATA_FIELDS, target)) {
            fields = Reflect.getMetadata(METADATA_FIELDS, target);
        }
        fields.push({
            name: propertyKey,
            exporter: exporter,
            importer: importer, // eslint-disable-line @typescript-eslint/no-non-null-assertion
        });
        Reflect.defineMetadata(METADATA_FIELDS, fields, target);
    };
}
exports.Field = Field;
function Parameter(fieldName) {
    return function (target, propertyKey, parameterIndex) {
        var parameters = new Map();
        if (Reflect.hasMetadata(METADATA_PARAMETERS, target)) {
            parameters = Reflect.getMetadata(METADATA_PARAMETERS, target);
        }
        parameters.set(fieldName, parameterIndex);
        Reflect.defineMetadata(METADATA_PARAMETERS, parameters, target);
    };
}
exports.Parameter = Parameter;
/**
 * Augment a TypeScript class to make it exportable/importable, using @Field and @Parameter decorator
 * @param className - Name of the exportable/importable class
 */
function AutoExportable(className, otherFields) {
    if (otherFields === void 0) { otherFields = []; }
    return function (target) {
        Reflect.defineMetadata(METADATA_CLASSNAME, className, target.prototype);
        if (!Reflect.hasMetadata(METADATA_FIELDS, target.prototype) ||
            otherFields.length === 0) {
            throw new SyntaxError('No exported fields declared when @AutoExportable is called');
        }
        // define empty parameters map, for object with a constructor without parameters
        if (!Reflect.hasMetadata(METADATA_PARAMETERS, target)) {
            Reflect.defineMetadata(METADATA_PARAMETERS, new Map(), target);
        }
        target.prototype.saveAsJSON = function () {
            var _this = this;
            var json = {
                type: Reflect.getMetadata(METADATA_CLASSNAME, target.prototype),
            };
            // export fields defined using the @Field decorator
            var fields = Reflect.getMetadata(METADATA_FIELDS, target.prototype);
            fields.forEach(function (field) {
                json[field.name] = field.exporter(_this[field.name]);
            });
            // export fields declared through the otherFields parameter
            otherFields.forEach(function (field) {
                json[field] = cloneField(_this[field]);
            });
            return json;
        };
        target.fromJSON = function (json) {
            var className = Reflect.getMetadata(METADATA_CLASSNAME, target.prototype);
            var parameters = Reflect.getMetadata(METADATA_PARAMETERS, target);
            var fields = Reflect.getMetadata(METADATA_FIELDS, target.prototype);
            // validate the input JSON
            if (json.type !== className) {
                throw new Error("Cannot create an object ".concat(className, " from a JSON export with type \"").concat(json.type, "\"") // eslint-disable-line @typescript-eslint/restrict-template-expressions
                );
            }
            var constructorArgs = [];
            var copyFields = [];
            otherFields
                .map(function (name) { return ({ name: name, importer: function (v) { return v; } }); })
                .concat(fields)
                .forEach(function (field) {
                if (!(field.name in json)) {
                    throw new Error("Invalid import: required field \"".concat(field, "\" not found in JSON export \"").concat(json, "\"") // eslint-disable-line @typescript-eslint/restrict-template-expressions
                    );
                }
                // build constructor/copy arguments
                if (parameters.has(field.name)) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    constructorArgs[parameters.get(field.name)] = field.importer(json[field.name]);
                }
                else {
                    copyFields.push({
                        name: field.name,
                        value: field.importer(json[field.name]),
                    });
                }
            });
            // build new object
            var obj = new (target.bind.apply(target, __spreadArray([void 0], __read(constructorArgs), false)))();
            // write non-constructor exported fields
            copyFields.forEach(function (arg) {
                obj[arg.name] = arg.value;
            });
            return obj;
        };
    };
}
exports.AutoExportable = AutoExportable;
