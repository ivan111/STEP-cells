(function() {
    "use strict";


    var RE_MUTATOR_METHODS = /push|pop|shift|unshift|splice|reverse|sort/;

    var NOP = y.inst2numMap.nop;
    var VAR = y.inst2numMap.var;
    var SLICE = y.inst2numMap.slice;
    var LIST = y.inst2numMap.list;
    var DICT = y.inst2numMap.dict;
    var RET_VAL = y.inst2numMap.ret_val;
    var OP_ASSIGN = y.inst2numMap["="];
    var OP_AND = y.inst2numMap.and;
    var OP_OR = y.inst2numMap.or;
    var OP_NOT = y.inst2numMap.not;
    var OP_ADD = y.inst2numMap["+"];
    var OP_SUB = y.inst2numMap["-"];
    var OP_MUL = y.inst2numMap["*"];
    var OP_DIV = y.inst2numMap["/"];
    var OP_EQ = y.inst2numMap["=="];
    var OP_NOT_EQ = y.inst2numMap["!="];
    var OP_LT = y.inst2numMap["<"];
    var OP_LE = y.inst2numMap["<="];
    var OP_GT = y.inst2numMap[">"];
    var OP_GE = y.inst2numMap[">="];
    var JMP = y.inst2numMap.jmp;
    var JMP_IF_FALSE = y.inst2numMap.jmp_f;
    var EXEC = y.inst2numMap.exec;
    var CALL = y.inst2numMap.call;
    var RETURN = y.inst2numMap.ret;
    var SKIP = y.inst2numMap.skip;
    var FOR = y.inst2numMap.for;
    var FIELD = y.inst2numMap.field;
    var METHOD = y.inst2numMap.method;
    var NEW = y.inst2numMap.new;
    var BREAK = y.inst2numMap.break;
    var CONTINUE = y.inst2numMap.cont;


    // ジャンプするなら this.jmp にジャンプ先を入れる。
    sc.StepCells.prototype.exec = function (inst, pos) {
        if (!helpers.isArray(inst)) {
            return inst;
        }

        switch (inst[0]) {
            case NOP:
                break;

            case SKIP:
                // skip だけの行だと、その行では止まらない。
                // 処理自体をスキップするわけではなく、
                // 指定した命令は実行される。
                // [skip, 命令]
                return this.exec(inst[1]);

            case VAR:
                // 一時変数 : [var, 一時変数番号]
                // 通常変数 : [var, 変数名]

                var name = inst[1];

                if (typeof name === "number") {
                    return this.tmp[name];
                }

                if (name in this.js) {
                    return this.js[name];
                }

                return this.vars(name);

            case SLICE:
                // 引数が１つなら配列参照
                // ２つなら slice
                // [slice, obj, start, [end]]

                var obj = this.exec(inst[1]);
                var start = this.exec(inst[2]);

                if (inst.length === 4) {
                    var end = this.exec(inst[3]);
                    return obj.slice(start, end);
                }

                return obj[start];

            case LIST:
                // [list, item0, item1, item2, ...]

                var arr = [];

                for (var i = 1; i < inst.length; i++) {
                    arr.push(this.exec(inst[i]));
                }

                return arr;

            case DICT:
                // [dict, [key0 value0], [key1, value1], ...]

                var dict = {};

                for (i = 1; i < inst.length; i++) {
                    var pair = inst[i];
                    dict[pair[0]] = this.exec(pair[1]);
                }

                return dict;

            case RET_VAL:
                return this.retVal;

            case OP_ASSIGN:
                var v = this.exec(inst[2]);

                assignVar(this, inst[1], v);

                return v;

            case OP_AND:
                return this.exec(inst[1]) && this.exec(inst[2]);

            case OP_OR:
                return this.exec(inst[1]) || this.exec(inst[2]);

            case OP_NOT:
                return !this.exec(inst[1]);

            case OP_ADD:
                return this.exec(inst[1]) + this.exec(inst[2]);

            case OP_SUB:
                if (inst.length === 3) {
                    return this.exec(inst[1]) - this.exec(inst[2]);
                }

                return -this.exec(inst[1]);

            case OP_MUL:
                return this.exec(inst[1]) * this.exec(inst[2]);

            case OP_DIV:
                return this.exec(inst[1]) / this.exec(inst[2]);

            case OP_EQ:
                return this.exec(inst[1]) === this.exec(inst[2]);

            case OP_NOT_EQ:
                return this.exec(inst[1]) !== this.exec(inst[2]);

            case OP_LT:
                return this.exec(inst[1]) < this.exec(inst[2]);

            case OP_LE:
                return this.exec(inst[1]) <= this.exec(inst[2]);

            case OP_GT:
                return this.exec(inst[1]) > this.exec(inst[2]);

            case OP_GE:
                return this.exec(inst[1]) >= this.exec(inst[2]);

            case JMP:
            case BREAK:
            case CONTINUE:
                this.jmp = [inst[1], inst[2]];
                break;

            case JMP_IF_FALSE:
                if (!this.result) {
                    this.jmp = [inst[1], inst[2]];
                }

                break;

            case EXEC:
                // JavaScript 組み込みの関数を呼び出す
                // [exec, funcName, [arg0, arg1, arg2, ...]]

                var args = execArgs(this, inst[2]);
                return this.aExec(inst[1], args, pos);

            case CALL:
                // ユーザが def で定義した関数を呼び出す
                // [call, funcName, [arg0, arg1, arg2, ...]]

                args = execArgs(this, inst[2]);
                this.aCall(inst[1], args, pos);
                break;

            case RETURN:
                if (inst.length >= 1) {
                    var ret = this.exec(inst[1]);
                }

                this.aReturn(ret);
                break;

            case FOR:
                // [for, var, array]

                arr = this.tmp[inst[2]];

                if (arr.length === 0) {
                    return false;
                }

                v = arr.shift();

                assignVar(this, inst[1], v);

                return true;

            case FIELD:
                // obj.fieldName
                // [field, obj, fieldName]

                obj = this.exec(inst[1]);
                return obj[inst[2]];

            case METHOD:
                // obj.methodName(arg0, arg1, ...)
                // [method, obj, methodName, [arg0, arg1, ...]]

                obj = this.exec(inst[1]);
                var methodName = inst[2];
                args = execArgs(this, inst[3]);

                ret = obj[methodName].apply(obj, args);

                if (RE_MUTATOR_METHODS.test(methodName)) {
                    notifyChangeVar(this, inst[1]);
                }

                return ret;

            case NEW:
                // new funcName(arg0, arg1, ...)
                // [new, execと同じ]

                var aExec = inst[1];
                if (aExec[0] !== EXEC) {
                    break;
                }

                args = execArgs(this, aExec[2]);
                return this.aNew(aExec[1], args);

            default:
                throw "unknown instruction: " + inst[0];
        }

        return null;
    };


    function execArgs(stepCells, instArgs) {
        var args = [];

        instArgs.forEach(function (arg) {
            args.push(stepCells.exec(arg));
        });

        return args;
    }


    function assignVar(stepCells, left, v) {
        if (typeof left === "number") {  // 一時変数
            stepCells.tmp[left] = v;
        } else if (left[0] === VAR) {  // 通常変数
            if (left[1] in stepCells.js) {
                stepCells.js[left[1]] = v;
            } else {
                stepCells.vars(left[1], v);
            }
        } else if (left[0] === SLICE) {  // 配列
            var obj = stepCells.exec(left[1]);
            var start = stepCells.exec(left[2]);

            obj[start] = v;
            notifyChangeVar(stepCells, left[1]);
        } else {  // field
            var field = left;

            obj = stepCells.exec(field[1]);
            obj[field[2]] = v;
        }
    }


    // 変数が変更されたことを通知する
    function notifyChangeVar(stepCells, inst) {
        if (!helpers.isArray(inst)) {
            return;
        }

        if (inst[0] === VAR) {  // 通常変数の配列
            var name = inst[1];
            var val = stepCells.vars(name);
            var vars = stepCells.vars;
        }

        if (vars) {
            vars(name, val);
        }
    }


    sc.StepCells.prototype.aNew = function (funcName, args) {
        if (funcName === "RegExp") {
            if (args.length === 2) {
                return new RegExp(args[0], args[1]);
            }

            return new RegExp(args[0]);
        }

        throw "undefined new function: " + funcName;
    };


    sc.StepCells.prototype.aExec = function (funcName, args, pos) {
        if (funcName in this.js) {
            this.execPos = pos;

            return this.js[funcName].apply(this, args);
        }

        throw "undefined function: " + funcName;
    };


    sc.StepCells.prototype.aCall = function (funcName, args, pos) {
        if (pos[1] + 1 < this.code[pos[0]].length) {
            var retAddr = [pos[0], pos[1] + 1];
        } else {
            retAddr = [pos[0] + 1, 0];
        }

        this.frames.push({
            retAddr: retAddr,
            tmp: this.tmp
        });

        this.tmp = [];

        this.notifyCall(this, funcName, args, pos[0]);

        var def = this.defs[funcName];
        var params = def.params;

        if (params) {
            for (var i = 0; i < params.length; i++) {
                var param = params[i];
                var arg = args[i];

                this.vars(param, arg);
            }
        }

        this.jmp = def.pos;
    };


    sc.StepCells.prototype.aReturn = function (retVal) {
        var frame = this.frames.pop();

        this.tmp = frame.tmp;

        this.retVal = retVal;

        this.notifyReturn(this, retVal);

        this.jmp = frame.retAddr;
    };


    sc.StepCells.prototype.print = function (s) {
        this.notifyPrint(this, s);
    };


    sc.StepCells.prototype.comment = function (lineNo, comment) {
        if (arguments.length === 1) {
            comment = lineNo;
            lineNo = this.pos[0];
        }

        this.panels.codeTable.comment(lineNo, comment);
    };


    sc.StepCells.prototype.varComment = function (lineNo) {
        var start = 1;
        var no = lineNo;

        if ((arguments.length % 2) === 0) {
            no = this.pos[0];
            start = 0;
        }

        var arr = [];

        for (var i = start; i < arguments.length; i += 2) {
            var varName = arguments[i];
            var varValue = arguments[i + 1];
            var comment = [varName, " = ", formatVarVal(varValue)].join("");
            arr.push(comment);
        }

        this.panels.codeTable.comment(no, arr.join(", "));
    };


    sc.StepCells.prototype.removeComment = function (lineNo) {
        this.panels.codeTable.removeComment(lineNo);
    };


    function formatVarVal(val) {
        if (typeof val === "string") {
            val = ["\"", val, "\""].join("");
        } else if (helpers.isArray(val)) {
            val = ["[", val, "]"].join("");
        } else if (typeof val === "object") {
            var arr = ["{"];
            var first = true;

            for (var key in val) {
                if (first) {
                    first = false;
                } else {
                    arr.push(", ");
                }

                arr.push(key);
                arr.push(": ");
                arr.push(val[key]);
            }

            arr.push("}");

            val = arr.join("");
        } else {
            val = "" + val;
        }

        val = val.replace("\n", "\\n");

        return val;
    }
})();
