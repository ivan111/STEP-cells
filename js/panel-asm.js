(function() {
    "use strict";

    sc.panels.AsmTable = AsmTable;


    function AsmTable(stepCells, conf) {
        var table = createAsmTable(stepCells, conf);
        var pos = [0, 0];

        stepCells.addStepListener(function (scs, newPos, oldPos) {
            setSelected(table, false, oldPos);
            setSelected(table, true, newPos);

            pos = newPos.slice(0);
        });

        stepCells.addResetListener(function () {
            setSelected(table, false, pos);
        });
    }


    function createAsmTable(stepCells, conf) {
        var panel = conf.container;
        helpers.addClass(panel, "sc-asm-table-panel");

        var table = document.createElement("table");
        table.className = "sc-table sc-asm-table";
        table.innerHTML = conf.html;
        panel.appendChild(table);

        return table;
    }


    function setSelected(table, isSet, pos) {
        var y = pos[0];
        var x = pos[1] + 1;

        if (y >= 0 && y < table.rows.length) {
            var row = table.rows[y];

            if (x >= 0 && x < row.cells.length) {
                if (isSet) {
                    row.cells[x].className = "selected";
                } else {
                    row.cells[x].className = "";
                }
            }
        }
    }
})();
