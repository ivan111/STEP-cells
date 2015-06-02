(function() {
    "use strict";

    window.stepTest = stepTest;
    window.loadSrc = loadSrc;
    window.myStep = myStep;


    var buttonsContainer;
    var varsTableContainer;
    var consoleContainer;
    var asmTableContainer;
    var treeContainer;
    var callTreeContainer;
    var message;
    var stepCells;


    function stepTest() {
        buttonsContainer = document.getElementById("buttons-container");
        varsTableContainer = document.getElementById("vars-table-container");
        consoleContainer = document.getElementById("console-container");
        asmTableContainer = document.getElementById("asm-table-container");
        treeContainer = document.getElementById("tree-container");
        callTreeContainer = document.getElementById("call-tree-container");
        message = document.getElementById("message");


        loadSrc();
    }


    var hankaku = [
        "char 0x41\n",
        "........\n",
        "...**...\n",
        "...**...\n",
        "...**...\n",
        "...**...\n",
        "..*..*..\n",
        "..*..*..\n",
        "..*..*..\n",
        "..*..*..\n",
        ".******.\n",
        ".*....*.\n",
        ".*....*.\n",
        ".*....*.\n",
        "***..***\n",
        "........\n",
        "........\n"
    ];


    function loadSrc() {
        var src = document.getElementById("src").value;

        message.innerHTML = "";

        try {
            var code = y.generate(src);
            var html = code.toHTMLTable();

            y.assemble(code);

            code.js = {
                hankaku: hankaku,

                startsWith: function (str, s) {
                    return str.indexOf(s) === 0;
                },

                join: function (str, s) {
                    var arr = [];
                    for (var i = 0; i < str.length; i++) {
                        arr.push(str[i]);
                    }

                    return arr.join(s);
                }
            };

            stepCells = new sc.StepCells(code.defs, code.code, code.js);

            stepCells.addErrorListener(function (scs, e) {
                message.innerHTML = e;
            });

            buttonsContainer.innerHTML = "";
            varsTableContainer.innerHTML = "";
            consoleContainer.innerHTML = "";
            asmTableContainer.innerHTML = "";
            treeContainer.innerHTML = "";
            callTreeContainer.innerHTML = "";

            stepCells.panels.buttons = new sc.panels.Buttons(stepCells, { container: buttonsContainer, showRunButton: true });
            stepCells.panels.varsTable = new sc.panels.VarsTable(stepCells, { container: varsTableContainer, minNumRows: 6 });
            stepCells.panels.Console = new sc.panels.Console(stepCells, { container: consoleContainer });
            stepCells.panels.AsmTable = new sc.panels.AsmTable(stepCells, { container: asmTableContainer, html: html });
            stepCells.panels.Tree = new sc.panels.Tree(stepCells, { container: treeContainer, width: 960, height: 300 });
            stepCells.panels.CallTree = new sc.panels.CallTree(stepCells, { container: callTreeContainer, width: 960, height: 300 });

            stepCells.reset();
        } catch (e) {
            message.innerHTML = e;
        }
    }


    function myStep() {
        if (stepCells) {
            stepCells.step();
        }
    }
})();
