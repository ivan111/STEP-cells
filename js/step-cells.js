(function() {
    "use strict";

    window.sc = {};

    sc.panels = {};

    sc.StepCells = StepCells;


    var eventNames = ["BeforeStep", "Step", "Run", "Pause", "Reset", "Complete", "Call", "Return", "Print", "Error"];


    function StepCells(defs, code, js) {
        var stepCells = this;

        eventNames.forEach(function (eventName) {
            helpers.createEvent(stepCells, eventName);
        });

        js = initJs(this, js);

        this.defs = defs;
        this.code = code;
        this.js = js;
        this.panels = {};
        this.vars = sc.createVars(this);
        this.runClock = 10;
        this.isRunning = false;
        this.breakpoints = [];
    }


    function initJs(stepCells, js) {
        js = js || {};

        if (!js.setup) {
            js.setup = function () {};
        }

        if (js.print) {
            throw "js.print is reserved";
        }

        js.print = function () {
            var a = Array.prototype.slice.call(arguments, 0);
            a.unshift(stepCells);
            stepCells.notifyPrint.apply(null, a);
        };


        if (js.pause) {
            throw "js.pause is reserved";
        }

        js.pause = function () {
            stepCells.jmp = stepCells.execPos;
            stepCells.pause();
        };


        if (js.range) {
            throw "js.range is reserved";
        }

        js.range = function () {
            var arr = [];
            var start = 0;
            var stop;
            var step = 1;

            if (arguments.length === 1) {
                stop = arguments[0];
            } else if (arguments.length === 2) {
                start = arguments[0];
                stop = arguments[1];
            } else if (arguments.length === 3) {
                start = arguments[0];
                stop = arguments[1];
                step = arguments[2];
            } else {
                throw "range arguments number error";
            }

            for (var i = start; i < stop; i += step) {
                arr.push(i);
            }

            return arr;
        };


        return js;
    }


    StepCells.prototype.step = function () {
        try {
            var oldPos = this.pos.slice(0);

            this.notifyBeforeStep(this, oldPos);

            var jmp = runLine(this);

            if (jmp) {
                var pos = jmp;
            } else {
                pos = [this.pos[0] + 1, 0];
            }

            this.pos = runSkip(this, pos);

            this.notifyStep(this, this.pos, oldPos);

            if (this.isRunning && this.breakpoints[this.pos[0]]) {
                this.pause();
            }

            if (this.isRunning && this.pos[0] >= this.code.length) {
                this.notifyComplete(this);
            }
        } catch (e) {
            this.pause();

            this.notifyError(this, e);
        }
    };


    StepCells.prototype.run = function () {
        if (!this.isRunning) {
            var env = this;

            this.isRunning = true;
            this.runTimerId = setInterval(function () {
                env.step();
            }, 1000 / this.runClock);

            this.notifyRun(this);
        }
    };


    StepCells.prototype.pause = function () {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.runTimerId);

            this.notifyPause(this);
        }
    };


    StepCells.prototype.reset = function () {
        this.notifyReset(this);

        this.pos = [0, 0];

        this.tmp = [];
        this.frames = [];
        this.retVal = undefined;

        this.step();
    };


    function runLine(stepCells) {
        var insts = stepCells.code[stepCells.pos[0]];

        if (!insts) {
            return undefined;
        }

        for (var i = stepCells.pos[1]; i < insts.length; i++) {
            var inst = insts[i];
            stepCells.jmp = null;

            stepCells.result = stepCells.exec(inst, [stepCells.pos[0], i]);

            if (!helpers.isNullOrUndef(stepCells.jmp)) {
                return stepCells.jmp;
            }
        }
    }


    function isSkip(inst) {
        if (!helpers.isArray(inst)) {
            return false;
        }

        if (inst[0] === y.inst2numMap.nop ||
                inst[0] === y.inst2numMap.skip ||
                inst[0] === y.inst2numMap.jmp ||
                inst[0] === y.inst2numMap.jmp_f) {
            return true;
        }

        return false;
    }


    function runSkip(stepCells, pos) {
        for (;;) {
            var insts = stepCells.code[pos[0]];

            if (!insts) {
                return [pos[0], 0];
            }

            for (var i = pos[1]; i < insts.length; i++) {
                var inst = insts[i];

                if (!isSkip(inst)) {
                    return [pos[0], i];
                }

                stepCells.jmp = null;

                stepCells.exec(inst, [pos[0], i]);

                if (!helpers.isNullOrUndef(stepCells.jmp)) {
                    pos = stepCells.jmp;
                    break;
                }
            }

            if (i === insts.length) {
                pos = [pos[0] + 1, 0];
            }
        }
    }
})();
