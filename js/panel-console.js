(function() {
    "use strict";

    sc.panels.Console = Console;


    function Console(stepCells, conf) {
        var consoleText = "";
        var aConsole = createConsolePanel(stepCells, conf);

        stepCells.addPrintListener(function () {
            var args = [];
            for (var i = 1; i < arguments.length; i++) {
                args.push(format(arguments[i]));
            }

            consoleText += args.join(" ");
            aConsole.innerHTML = consoleText;

            aConsole.scrollTop = aConsole.scrollHeight;
        });

        stepCells.addResetListener(function () {
            consoleText = "";
            aConsole.innerHTML = "";
        });
    }


    function createConsolePanel(stepCells, conf) {
        var panel = conf.container;
        helpers.addClass(panel, "sc-console-panel");

        var cols = conf.cols || 80;
        var rows = conf.rows || 10;

        panel.innerHTML = ["<textarea class='sc-console' readonly cols='",
            cols, "' rows='", rows, "'></textarea>"].join("");

        return panel.getElementsByClassName("sc-console")[0];
    }


    function format(val) {
        if (helpers.isArray(val)) {
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

        return val;
    }
})();
