# JStack Syntax

The entirety of syntax is just the `jstack` function and a bunch of symbols
to mimic keywords.

```javascript
const { jstack, call } = require("jstack");
const std = require("jstack/std");

jstack([
    ...std.log,

    "Hello, world!", call`log`,
]);
```

## Keywords

**`end`**

End of a block. Reaching the end of a block goes up one scope.

**`dup`**

Duplicate the last value on stack.

**`store`**

Pop a value from stuck and store it in current scope.

```javascript
const { jstack, store } = require("jstack");
jstack([
    10, store`value`, // 10 is now stored in scope and stack is now empty
]);
```

**`pop`**

Without an argument, remove the last value from stack. Provided a
name, push a corresponding nearest value from scope tree on stack.

```javascript
const { jstack, pop, store } = require("jstack");
jstack([
    10, store`value`,

    pop`value`, // 10 is now on stack
    pop,        // stack is now empty
]);
```

**`take`**

Take elements from stack and assign them into a temporary scope.

```javascript
const { jstack, take, end } = require("jstack");
jstack([
    1, 2, 3,
    take`a b c` // Reverse values on stack
        pop`c`,
        pop`b`,
        pop`a`,
    end,
]);
```

**`mut`**

Mutate an existing variable in scope.

```javascript
const { jstack, take, end, mut, pop, store } = require("jstack");
const std = require("jstack/std");
jstack([
    ...std.objects,

    1, store`value`,

    take``,
        pop`value`,
        1, call`add`,
        mut`value`, // 'value' is now 2
    end,

    take``,
        pop`value`,
        1, call`add`,
        store`value`, // 'value' is now 3
    end,

    pop`value`, // 'value' is still 2
]);
```

**`func`**

Define a *named* or an *anonymous* function.

Named functions are placed in scope, later being able to be accessed via `call`.

```javascript
const { jstack, call, end, func } = require("jstack");
jstack([
    func`fun`
        2,
    end,

    call`fun`,
]);
```

Anonymous functions are stored on stack, allowing them to be passed as values.
When called from JavaScript, all arguments are appended to the stack with an
addition of argument count as the last argument.

The last value on the stack is then popped and returned. If stack was empty,
`undefined` is returned instead.

```javascript
const { jstack, func, end, pop, call } = require("jstack");
const std = require("jstack/std");
jstack([
    ...std.objects,
    ...std.log,

    func, // Returns the first argument
        pop, // Removing argc
    end,

    "Hi", 1, call`call`, call`log`,
]);
```

Keep in mind that anonymous functions share runtime's stack, so if you're working
with async, be sure to store whatever temporary data outside of stack to prevent
undefined behavior.

**`extern`**

Bind a JavaScript function to the scope.

On the stack there must be a function object and the amount of arguments that
function accepts.

After being called, function's return value will be pushed on stack.

```javascript
const { jstack, extern, call } = require("jstack");
jstack([
    (a, b) => a + b, 2, extern`add`,

    1, 2, call`add`, // 3
]);
```

**`call`**

Execute a named function.

For JavaScript functions, they must first be binded via `extern`. For a
shorthand, call `call` from jstack's util library.

```javascript
const { jstack, call } = require("jstack");
const std = require("jstack/std");
jstack([
    ...std.util,

    () => console.log("Hello, world!"), 0, call`call`,
]);
```

While anonymous functions are stored as regular JavaScript functions, they
operate on the same stack as where they were created. Since they pop the return
value from the stack, calling anonymous functions via `call` does not require
any additional stack operations.

```javascript
const { jstack, call } = require("jstack");
const std = require("jstack/std");
jstack([
    ...std.util,

    func,
        pop,
        "Hello!",
    end,

    0, call`call`, // "Hello!"
]);
```

If the function has fully cleared the stack, similar code will push `undefined`.
While this is not noticible in most cases, this could potentially break code that
checks specific locations on the stack. To avoid inconsistent results, try pushing
`undefined` onto the stack beforehand.

**loop**

Loop for as long as a condition is true.

`loop` creates two scopes: one for condition and one for loop body.

If condition leaves a falsy value on top the stack, the loop exists.

```javascript
const { jstack, call, loop, end, call } = require("jstack");
const std = require("jstack/std");
jstack([
    ...std.objects,
    ...std.log,

    3,
    loop, 1, call`sub`, end,
        dup, call`log`, // 3, 2, 1
    end,
]);
```