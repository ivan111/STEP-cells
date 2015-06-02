(function() {
    "use strict";

    sc.panels.VarsTable = VarsTable;


    function VarsTable(stepCells, conf) {
        if (!conf.minNumRows) {
            conf.minNumRows = 0;
        }

        var varsPosMap = {};
        var numVars = 0;

        var table = createVarsTable(stepCells, conf);

        stepCells.addBeforeStepListener(clearSelected);
        stepCells.vars.addChangeVarListener(onChangeVar);

        if (!conf.isStaticVars) {
            stepCells.addResetListener(clearVarsTable);
            stepCells.addCallListener(clearVarsTable);
            stepCells.addReturnListener(setVarsTable);
        }


        function clearSelected() {
            var nodes = table.getElementsByClassName("selected");
            for (var i = nodes.length - 1; i >= 0; i--) {
                nodes[i].className = "";
            }
        }


        function clearVarsTable() {
            varsPosMap = {};
            numVars = 0;

            for (var i = table.rows.length - 1; i > conf.minNumRows; i--) {
                table.deleteRow(i);
            }

            for (i = conf.minNumRows; i > 0; i--) {
                table.rows[i].cells[0].innerHTML = "　";
                table.rows[i].cells[1].innerHTML = "　";
            }

            clearSelected();
        }


        function setVarsTable() {
            clearVarsTable();

            stepCells.vars.foreach(function (varName, varValue) {
                onChangeVar(stepCells, varName, varValue, true, -1);
            });
        }


        function onChangeVar(scs, varName, varValue, flagNew) {
            if (!conf.showPrivateVar && varName[0] === "_") {
                return;
            }

            if (flagNew) {
                varsPosMap[varName] = numVars;
                numVars++;

                if (numVars <= conf.minNumRows) {
                    var index = numVars - 1;
                    var tr = table.getElementsByClassName("sc-vars-" + index)[0];
                } else {
                    index = table.rows.length - 1;
                    tr = table.insertRow(-1);
                    tr.className = "sc-vars-" + index;
                    tr.insertCell(0);
                    tr.insertCell(1);
                }
            } else {
                index = varsPosMap[varName];
                tr = table.getElementsByClassName("sc-vars-" + index)[0];
            }

            tr.cells[0].innerHTML = varName;
            tr.cells[1].innerHTML = formatVarVal(varValue);
            tr.cells[1].className = "selected";
        }
    }


    function createVarsTable(stepCells, conf) {
        var panel = conf.container;
        helpers.addClass(panel, "sc-vars-table-panel");

        var table = document.createElement("table");
        table.className = "sc-table sc-vars-table";

        var arr = ["<tr><th>Name</th><th class='sc-var-value'>Value</th></tr>"];

        if (conf.minNumRows) {
            for (var i = 0; i < conf.minNumRows; i++) {
                arr.push("<tr class='sc-vars-");
                arr.push(i);
                arr.push("'><td>　</td><td>　</td></tr>");
            }
        }

        table.innerHTML = arr.join("");
        panel.appendChild(table);

        return table;
    }


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
