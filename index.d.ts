export type Sys = unique symbol;
/**
 * End a statement
 *
 * ```javascript
 * const { jstack, func, end } = require("jstack");
 *
 * jstack([
 *     func, end,
 * ]);
 * ```
 */
export const end: unique symbol & Sys;
/**
 * Duplicate a value on stack
 *
 * ```javascript
 * const { jstack, dup } = require("jstack");
 *
 * jstack([
 *     1, dup, // We now have 2 1's
 * ]);
 * ```
 */
export const dup: unique symbol & Sys;
/**
 * Loop while expression is true.
 *
 * ```javascript
 * const { jstack, loop, end } = require("jstack");
 *
 * jstack([
 *     loop, 1, end,
 *         // Loop never ends!
 *     end,
 * ]);
 * ```
 */
export const loop: unique symbol & Sys;
/**
 * Move values on stack to variables.
 *
 * ```javascript
 * const { jstack, pop, take, end } = require("jstack");
 *
 * jstack([
 *     1, 2,
 *
 *     take`a b`
 *         pop`b`, pop`a`, // Reverse values on stack
 *     end,
 * ]);
 * ```
 */
export const take: ((name: [string | symbol][] | [string | symbol] | string | symbol) => Sys) & Sys;
/**
 * Create a function.
 *
 * ```javascript
 * const { jstack, func, end } = require("jstack");
 *
 * jstack([
 *     func,
 *         // Comfy "do nothing" anonymous function
 *     end,
 * ]);
 * ```
 */
export const func: ((name?: [string | symbol] | string | symbol) => Sys) & Sys;
/**
 * Remove top value from stack / push a variable on stack.
 *
 * ```javascript
 * const { jstack, pop, take, end } = require("jstack");
 *
 * jstack([
 *     1, 2,
 *
 *     take`a b`
 *         pop`b`, pop`a`, // Reverse values on stack
 *     end,
 *
 *     pop, // Get rid of them afterwards
 *     pop,
 * ]);
 * ```
 */
export const pop: ((name?: [string | symbol] | string | symbol) => Sys) & Sys;
/**
 * Call a named function.
 *
 * ```javascript
 * const { jstack, call, extern, func, end } = require("jstack");
 * const std = require("jstack/std");
 *
 * jstack([
 *     ...std,
 *
 *     func`printHello`,
 *         "Hello, ", call`swap`, call`add`, call`log`,
 *     end,
 *     "John", call`printHello`, // "Hello, John!"
 * ]);
 * ```
 */
export const call: ((name: [string | symbol] | string | symbol) => Sys) & Sys;
/**
 * Bind a native function.
 *
 * ```javascript
 * const { jstack, call, extern } = require("jstack");
 *
 * function printHello(name) {
 *     console.log(`Hello, ${name}!`);
 * }
 *
 * jstack([
 *     printHello, 1, extern`printHello`,
 *     "John", call`printHello`, // "Hello, John!"
 * ]);
 * ```
 */
export const extern: ((name: [string | symbol] | string | symbol) => Sys) & Sys;
/**
 * Store a variable.
 *
 * ```javascript
 * const { jstack, store, take, end } = require("jstack");
 *
 * jstack([
 *     1, store`value`,
 *     take``,
 *         2, store`value`,
 *     end,
 *     // 'value' is 1
 * ]);
 * ```
 */
export const store: ((name: [string | symbol] | string | symbol) => Sys) & Sys;
/**
 * Mutate a variable.
 *
 * ```javascript
 * const { jstack, mut, store, take, end } = require("jstack");
 *
 * jstack([
 *     1, store`value`,
 *     take``,
 *         2, mut`value`,
 *     end,
 *     // 'value' is 2
 * ]);
 * ```
 */
export const mut: ((name: [string | symbol] | string | symbol) => Sys) & Sys;
/**
 * Spawn and eval JStack runtime.
 *
 * @param program A program to execute.
 * @param debug A debug log function.
 * @returns Stack array.
 */
export function jstack(program: any[], debug?: (...args: any[]) => void): any[];