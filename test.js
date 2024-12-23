const { jstack, call, end, extern, func, pop, take, loop, store, mut, dup } = require(".");
const assert = require("node:assert");
const std = require("./std");
const EventEmitter = require("node:events");

jstack([
    ...std,

    (test, val, msg) => assert(test === val, msg), 3, extern`assert_eq`,
    jstack, 1, extern`eval`,

    "! TEST 1 !", call`log`,
    [
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
    ], call`eval`, 0, call`get`, 6,
    "test 1 failed", call`assert_eq`,

    "! TEST 2 !", call`log`,
    [
        ...std,

        1, 2, 3,
        (a, b, c) => a == 1 && b == 2 && c == 3,
        3, call`call`,
    ], call`eval`, 0, call`get`, true,
    "test 2 failed", call`assert_eq`,

    "! TEST 3 !", call`log`,
    [
        ...std.objects,
        ...std.util,

        [],
        3, store`i`,
        loop,   pop`i`,
                1, call`sub`,
                dup, mut`i`,
                0, call`gq`,
            end,

            pop`i`, call`swap`, 'push', 1, call`applym`,
        end,
    ], call`eval`, 0, call`get`, call`len`, 3,
    "test 3 failed", call`assert_eq`,

    "! TEST 4 !", call`log`,
    () => new EventEmitter(), 0, call`call`, dup,
    [
        ...std,

        func, call`arrayof`,
            0, call`get`,
            call`log`,
        end,

        take`hdl fn`,
            "hello", pop`fn`, pop`hdl`, "on", 2, call`callm`,
        end,
    ],
    "unshift", 1, call`applym`,
    call`eval`, pop,

    take`emit`,
        "hello", "Heyyy!", pop`emit`, "emit", 2, call`callm`, pop,
        "hello", "Message 2", pop`emit`, "emit", 2, call`callm`, pop,
        "hello", "Message 3", pop`emit`, "emit", 2, call`callm`, pop,
    end,
]);