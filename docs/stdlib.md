# Standard library

JStack's standard library is located in `jstack/std`.

Libraries can be imported by expanding them into the code.

```js
const { jstack, call } = require("jstack");
const std = require("jstack/std");

jstack([
    ...std.log,

    "Hello!", call`log`,
]);
```

Expanding `std` will import the entirety of standard library.

## Log

Logging library imports logging functions from JavaScript.

`<message: any> log` -> `console.log`  
`<message: any> warn` -> `console.warn`  
`<message: any> error` -> `console.error`

These functions will consume the top value on the stack and output it
in console. For non-destructive counterparts see functions below.

`<value: any> logv -> <value: any>`  
`<value: any> warnv -> <value: any>`  
`<value: any> errorv -> <value: any>`

## Util

Collection of helper functions.

`<message: any> panic -> never`  
Throws an error.

`<a: any> <b: any> swap -> <b: any> <a: any>`  
Swap two top stack values.

`<...els: any[]> <count: number> arrayof -> <array: any[]>`  
Pop `count` values from stack and put them into the array.
Values are stores in bottom-to-top order.

## Objects

Object manipulation utilities.

`<object: any> <prop: PropertyName> has -> boolean`  
Check if object has a property.

`<object: any> <prop: PropertyName> get -> any`  
Get a property of an object.

`<object: any> <prop: PropertyName> <value: any> set`  
Set a property of an object.

`<a: any> <b: any> add -> any`  
`<a: any> <b: any> sub -> any`  
`<a: any> <b: any> mul -> any`  
`<a: any> <b: any> div -> any`  
`<a: any> <b: any> mod -> any`  
`<a: any> <b: any> le -> boolean`  
`<a: any> <b: any> lq -> boolean`  
`<a: any> <b: any> eq -> boolean`  
`<a: any> <b: any> gq -> boolean`  
`<a: any> <b: any> gr -> boolean`  
`<a: any> <b: any> or -> any`  
`<a: any> <b: any> and -> any`  
`<a: any> <b: any> xor -> any`  
`<a: any> not -> any`  
`<a: any> str -> string`  
`<a: any> len -> number`
Perform an operation.

`<...argv: any[]> <fn: function> <argc: number> call -> any`  
`<...argv: any[]> <this: any> <fn: PropertyName> <argc: number> callm -> any`  
Call a function.

`<...argv: any[]> <this: any> <fn: PropertyName> <argc: number> applym -> any`  
Call a function and return `this`.