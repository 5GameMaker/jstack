declare type StdLib = any[];
declare namespace StdLib {
    /**
     * JStack standard library.
     *
     * Introduces functionality that is not present in
     * the interpreter itself.
     */
    const std: StdLib;

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
    const objects: any[];

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
    const log: any[];

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
    const util: any[];
}

export = StdLib;