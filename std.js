const { func, take, extern, end, pop, call, dup } = require('.');

/**
 * JStack utility library.
 *
 * Provides extra functions.
 *
 * ```javascript
 * jstack([
 *     ...require("jstack/std").util,
 *
 *     "Fatal.", call`panic`,
 * ]);
 * ```
 */
const util = [
    w => {throw Error(w)}, 1, extern`panic`,

    func`swap`, take`a b`, pop`b`, pop`a`, end, end,
    func`arrayof`, (...e) => e, call`swap`, extern`a`, call`a`, end,
];

/**
 * JStack logging library.
 *
 * Passes through JavaScript's `console` api.
 *
 * ```javascript
 * jstack([
 *     ...require("jstack/std").log,
 *     ...require("jstack/std").objects,
 *
 *     "Hello!", call`log`,
 *     "Uhh...", call`warn`,
 *     "Oh no", call`error`,
 * ]);
 * ```
 */
const log = [
    console.log, 1, extern`!js.console.log`,
    console.warn, 1, extern`!js.console.warn`,
    console.error, 1, extern`!js.console.error`,

    func`log`, call`!js.console.log`, pop, end,
    func`warn`, call`!js.console.warn`, pop, end,
    func`error`, call`!js.console.error`, pop, end,

    func`logv`, dup, call`log`, end,
    func`warnv`, dup, call`warn`, end,
    func`errorv`, dup, call`error`, end,
];

/**
 * JStack objects library.
 *
 * Allows manipulations on JavaScript objects.
 *
 * ```javascript
 * jstack([
 *     ...require("jstack/std").log,
 *     ...require("jstack/std").objects,
 *
 *     { x: 2 },
 *     "x", call`get`, call`log`, // 2
 *     10, call`set`,
 *     call`typeof`, call`log`,   // "object"
 * ]);
 * ```
 */
const objects = [
    (o, f, v) => o[f] = v, 3, extern`!js.set`,
    (a, o) => a.push(o), 2, extern`!js.push`,
    (f, o) => f.bind(o), 2, extern`!js.bind`,

    (o, f) => Object.hasOwn(o, f), 2, extern`has`,
    (o, f) => o[f], 2, extern`get`,
    (a, b) => a + b, 2, extern`add`,
    (a, b) => a - b, 2, extern`sub`,
    (a, b) => a / b, 2, extern`div`,
    (a, b) => a * b, 2, extern`mul`,
    (a, b) => a % b, 2, extern`mod`,
    (a, b) => a == b, 2, extern`eq`,
    (a, b) => a < b, 2, extern`le`,
    (a, b) => a > b, 2, extern`gr`,
    (a, b) => a <= b, 2, extern`lq`,
    (a, b) => a >= b, 2, extern`gq`,
    (a, b) => a || b, 2, extern`or`,
    (a, b) => a && b, 2, extern`and`,
    (a, b) => a ^ b, 2, extern`xor`,
    (a) => !a, 1, extern`not`,
    a => String(a), 1, extern`str`,
    a => a.length, 1, extern`len`,

    func`set`, call`!js.set`, pop, end,
    func`call`, extern`temp`, call`temp`, end,
    func`callm`, take`obj fn argc`,
        pop`obj`, pop`fn`, call`get`,
        pop`obj`, call`!js.bind`,
        pop`argc`, call`call`,
    end, end,
];

/**
 * JStack standard library.
 *
 * Introduces functionality that is not present in
 * the interpreter itself.
 */
const std = [...objects, ...log, ...util];
std.std = std;
std.objects = objects;
std.log = log;
std.util = util;

module.exports = std;