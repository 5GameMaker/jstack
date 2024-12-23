const assert = require("node:assert");
const { call, end, extern, jstack, func, pop, take, loop, store, mut, dup } = require(".");
const std = require("./std");
const EventEmitter = require("node:events");

console.log("! TEST 1 !");
assert(jstack([
    (a, b) => a + b, 2, extern`add`,

    func`do`,
        ...jstack([ // fanciest const fn
            ...std.objects,
            -1, 4, call`add`,
        ]),
        take`x y z`, // 1, 2, 3
            pop`x`,
            pop`z`,
            call`add`,
            pop`y`,
            call`add`,
        end,
    end,

    1, 2,

    call`do`,
])[0] == 6, "test 1 failed");

console.log("! TEST 2 !");
assert(jstack([
    ...std,

    1, 2, 3,
    (a, b, c) => a == 1 && b == 2 && c == 3,
    3, call`call`,
])[0] === true, "test 2 failed");

console.log("! TEST 3 !");
assert(jstack([
    ...std.objects,

    [],
    3, store`i`,
    loop,   pop`i`,
            1, call`sub`,
            dup, mut`i`,
            0, call`gq`,
        end,

        take`arr`, pop`arr`,
            pop`i`, pop`arr`, 'push', 1, call`callm`, pop,
        end,
    end,
])[0].length == 3, "test 3 failed");

console.log("! TEST 4 !");
const handler = new EventEmitter();
jstack([
    ...std,

    handler,

    func, call`arrayof`,
        0, call`get`,
        call`log`,
    end,

    take`hdl fn`,
        "hello", pop`fn`, pop`hdl`, "on", 2, call`callm`,
    end,
]);

handler.emit("hello", "Heyyy!");
handler.emit("hello", "Message 2");
handler.emit("hello", "Message 3");