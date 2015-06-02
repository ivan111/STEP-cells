(function() {
    "use strict";

    sc.createVars = createVars;


    function createVars(stepCells) {
        var varsMap = {};
        var varsList = [];
        var frames = [];


        helpers.createEvent(my, "ChangeVar");

        stepCells.addResetListener(function () {
            varsMap = {};
            varsList = [];
            frames = [];
        });


        function my(varName, varValue) {
            if (arguments.length === 1) {
                if (varName in varsMap) {
                    return varsMap[varName];
                }

                for (var i = frames.length - 1; i >= 0; i--) {
                    var frame = frames[i];

                    if (varName in frame.varsMap) {
                        return frame.varsMap[varName];
                    }
                }

                //throw "undefined variable: " + varName;
                return undefined;
            }

            if (arguments.length !== 2) {
                throw "number of args error";
            }

            assign(varsMap, varsList, varName, varValue);

            return my;
        }


        my.global = function (varName, varValue) {
            if (frames.length === 0) {
                return my(varName, varValue);
            }

            assign(frames[0].varsMap, frames[0].varsList, varName, varValue);

            return my;
        };


        function assign(map, list, varName, varValue) {
            if (varName in map) {
                var flagNew = false;
            } else {
                flagNew = true;
                list.push(varName);
            }

            map[varName] = varValue;
            var i = list.indexOf(varName);
            my.notifyChangeVar(stepCells, varName, varValue, flagNew, i);
        }


        my.foreach = function (callback) {
            varsList.forEach(function (varName) {
                callback(varName, varsMap[varName]);
            });
        };


        // 関数呼び出しのために、現在の変数をスタックへ保存
        my.save = function () {
            frames.push({
                varsMap: varsMap,
                varsList: varsList
            });

            varsMap = {};
            varsList = [];
        };


        // 関数呼び出しから戻るために、スタックから変数を元に戻す
        my.restore = function () {
            var frame = frames.pop();

            varsMap = frame.varsMap;
            varsList = frame.varsList;
        };


        stepCells.addCallListener(my.save);
        stepCells.addReturnListener(my.restore);


        return my;
    }
})();
