const end = Symbol("end");
const dup = Symbol("dup");
const loop = Symbol("loop");
function func(name) {
    if (name instanceof Array) name = name[0];
    return sys({op: func, name});
}
function take(name) {
    const vars = [name].flat().join(" ").split(/ +/g);
    return sys({op: take, vars});
}
function pop(name) {
    if (name instanceof Array) name = name[0];
    return sys({op: pop, name});
}
function call(name) {
    if (name instanceof Array) name = name[0];
    return sys({op: call, name});
}
function extern(name) {
    if (name instanceof Array) name = name[0];
    return sys({op: extern, name});
}
function store(name) {
    if (name instanceof Array) name = name[0];
    return sys({op: store, name});
}
function mut(name) {
    if (name instanceof Array) name = name[0];
    return sys({op: mut, name});
}

const sys = o => ({o, sys});
const gets = o => o.o || {};
const issys = o => typeof o == 'object' && o.sys == sys
    || [end, func, take, pop, call, extern, dup, store, loop, mut].includes(o);
const mkscope = (exit = _ => {}) => ({
    vars: new Map(),
    funcs: new Map(),
    exit,
});

function sfind(scopes, check, select) {
    if (!select) select = check;
    for (let i = scopes.length - 1; i >= 0; i--)
        if (check(scopes[i])) return select(scopes[i]);
}

const mkctx = (debug, program, stack, scopes, i) => ({
    debug, program, stack, scopes, i,
});

/**
 * Move pointer to the nearest `end`.
 *
 * Pointer will be set to the next position after `end`.
 */
function ptrtoend(ctx, message, terminate = 0, level = 0) {
    const { debug, program, i } = ctx;
    do {
        const op = program[i[0]];
        if (issys(op)) {
            if (op == end) level--;
            else if (op == loop) level += 2;
            else if (op == func) level++;
            else if (gets(op).op == func) level++;
            else if (gets(op).op == take) level++;
        }
        debug(">>", op, level);
        i[0]++;
    } while (i[0] < program.length && level > terminate);
    if (level > terminate) raise(ctx, message);
}

function raise(ctx, message) {
    const { program, stack, scopes, i } = ctx;
    const { inspect } = require('util');
    throw Error(`${message}\n\nSymbol: ${i[0]} (${inspect(program[i[0]])})\nStack: ${inspect(stack)}\nScopes: ${inspect(scopes)}\n\nError: An unexpected error occured in jstack runtime.`);
}

function jstack(program, debug = () => void 0) {
    const stack = [];
    const scopes = [mkscope(_ => {throw Error("unexpected 'end'")})];

    const ctx = mkctx(debug, program, stack, scopes, [0]);

    try {
        return execute(ctx);
    } catch (why) {
        raise(ctx, why);
    }
}

function execute(ctx) {
    const { debug, program, stack, scopes, i } = ctx;

    debug("program start", i[0], program);

    for (; i[0] < program.length; i[0]++) {
        const op = program[i[0]];

        if (issys(op)) {
            debug(i[0], "sys", op);
            if (op == end) {
                const scope = scopes.pop();
                scope.exit(scope);
            }
            else if (op == pop) {
                if (!stack.length) raise(ctx, "stack has been popped");
                stack.pop();
            }
            else if (op == dup) {
                if (!stack.length) raise(ctx, "you stare into the abyss. abyss stares back at you");
                stack.push(stack[stack.length - 1]);
            }
            else if (op == loop) {
                const checkptr = i[0];

                ptrtoend(ctx, "unterminated loop");
                const exitptr = i[0] - 1;

                i[0] = checkptr;

                let bodyscope;
                let checkscope;

                bodyscope = _ => {
                    scopes.push(mkscope(bodyscope));
                    scopes.push(mkscope(checkscope));
                    i[0] = checkptr;
                };
                checkscope = _ => {
                    if (!stack.length) raise(ctx, "exited loop check with an empty stack");
                    debug(stack);
                    if (stack.pop()) return;
                    scopes.pop();
                    i[0] = exitptr;
                };

                scopes.push(mkscope(bodyscope));
                scopes.push(mkscope(checkscope));
            }
            else if (op == func) {
                const start = i[0] + 1;
                ptrtoend(ctx, "unterminated anonimous function");
                i[0]--;
                const fun = (...args) => {
                    const o = [start];
                    const nscp = [...scopes, mkscope(_ => o[0] = program.length)];
                    stack.push(...args);
                    stack.push(args.length);
                    const nctx = mkctx(debug, program, stack, nscp, o);
                    return execute(nctx).pop();
                };
                stack.push(fun);
            }
            else if (gets(op).op == extern) {
                if (stack.length < 2) raise(ctx, "expected at least 2 elements on the stack");

                const name = gets(op).name;
                if (issys(name)) raise(ctx, "programming is too meta");
                if (typeof name != 'string' && typeof name != 'symbol') raise(ctx, "function name must be a string");

                const args = stack.pop();
                if (issys(args)) raise(ctx, "argument count does not compute");
                if (typeof args != 'number' || args % 1) raise(ctx, "args count must be a number");

                const fun = stack.pop();
                if (issys(args)) raise(ctx, "function metamorphis");
                if (!(fun instanceof Function) || args % 1) raise(ctx, "function must be a function");

                const scope = scopes[scopes.length - 1];

                if (scope.funcs.has(name)) raise(ctx, `overriding an existing function '${String(name)}'`);
                scope.funcs.set(name, {args, fun});
            }
            else if (gets(op).op == call) {
                const name = gets(op).name;
                if (issys(name)) raise(ctx, "but there was no response");
                if (typeof name != 'string' && typeof name != 'symbol') raise(ctx, "the call remained unanswered");

                const func = sfind(scopes, x => x.funcs.get(name));
                if (!func) raise(ctx, `couldn't find a function named '${String(name)}'`);

                if (func.fun) {
                    const args = func.args;
                    if (stack.length < args) raise(ctx, `expected at least ${args} elements on the stack`);
                    const argv = new Array(args).fill().map(_ => stack.pop()).reverse();
                    debug(i[0], "native call", func.fun, argv);
                    stack.push(func.fun(...argv));
                }
                else {
                    const now = i[0];
                    i[0] = func.ptr;
                    scopes.push(mkscope(_ => i[0] = now));
                }
            }
            else if (gets(op).op == func) {
                const name = gets(op).name;
                if (issys(name)) raise(ctx, "internal is the function");
                if (typeof name != 'string' && typeof name != 'symbol') raise(ctx, "function is aliently named");

                const ptr = i[0];

                let level = 0;
                ptrtoend(ctx, `unterminated function '${String(name)}'`);
                i[0]--;
                if (scopes[scopes.length - 1].funcs.has(name)) raise(ctx, `overriding an existing function '${String(name)}'`);
                scopes[scopes.length - 1].funcs.set(name, {ptr});
            }
            else if (gets(op).op == take) {
                const vars = gets(op).vars;

                if (stack.length < vars.length) raise(ctx, `expected at least ${vars.length} elements on the stack`);
                const scope = mkscope();
                for (let o = vars.length - 1; o >= 0; o--) {
                    const val = stack.pop();
                    const name = vars[o];
                    debug(i[0], "take assign", o, name, val);
                    scope.vars.set(name, val);
                }
                scopes.push(scope);
            }
            else if (gets(op).op == pop) {
                const name = gets(op).name;
                if (issys(name)) raise(ctx, "syntax has been popped");
                if (typeof name != 'string') raise(ctx, "variable of unknown name");

                const value = sfind(
                    scopes,
                    scope => scope.vars.has(name),
                    scope => [scope.vars.get(name)],
                );
                if (!value) raise(ctx, `undefined variable '${name}'`);
                stack.push(value[0]);
            }
            else if (gets(op).op == store) {
                const name = gets(op).name;
                if (issys(name)) raise(ctx, "already stored");
                if (typeof name != 'string') raise(ctx, "variable of unknown name");

                if (!stack.length) raise(ctx, "nothing to store");

                const scope = scopes[scopes.length - 1];
                scope.vars.set(name, stack.pop());
            }
            else if (gets(op).op == mut) {
                const name = gets(op).name;
                if (issys(name)) raise(ctx, "already stored");
                if (typeof name != 'string') raise(ctx, "variable of unknown name");

                if (!stack.length) raise(ctx, "nothing to store");

                let o;
                for (o = scopes.length - 1; o >= 0; o--) {
                    const scope = scopes[o];
                    if (!scope.vars.has(name)) continue;
                    scope.vars.set(name, stack.pop());
                    break;
                }
                if (o < 0) raise(ctx, `could not find var '${name}'`);
            }
            else debug(i[0], "/!\\ sys not implemented");
        }
        else {
            debug(i[0], "push", op);
            stack.push(op);
        }
    }

    debug("return", stack);

    return stack;
}

module.exports = {
    jstack, call, extern, end, func,
    take, pop, dup, loop, mut, store,
};
