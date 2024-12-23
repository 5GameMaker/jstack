# JStack

A stack-based "programming language" written in JavaScript.

**Performance**: This is a VM written in JavaScript.  
**Usability**: It's JavaScript.  
**Production Readiness**: Oh god.  
**Tooling**: JavaScript.

## Syntax

```javascript
const { call, end, extern, jstack, func, pop, take } = require("jstack");

jstack([
    x => console.log(x), 2, extern`log`,

    "Hello, world!", call`log`,
]);
```

## TypeScript support

We have .d.ts files for all your TypeScript needs (they won't verify the validity
of your code tho).

## Test coverage

Barely any. Feel free to PR full test suites for std and jstack itself.