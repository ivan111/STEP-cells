(function() {
    "use strict";

    sc.panels.CallTree = CallTree;


    function CallTree(stepCells, conf) {
        if (typeof conf.showReturnValue === "undefined") {
            conf.showReturnValue = true;
        }

        var svg = createCallTreePanel(stepCells, conf);
        var vt = vtree(svg, conf.width, conf.height);
        stepCells.js.callTree = vt;
        var node;
        var func2type = {};
        var numFuncs = 0;  // ナム・ファンクスっち、トム・ハンクスみたいで笑ける


        stepCells.js.appendCallTreeChild = function (child) {
            if (node) {
                if (!node.children) {
                    node.children = [];
                }

                if (!child.className) {
                    child.className = "sc-call-tree-child-node";
                }

                node.children.push(child);
                vt.update(node);
            }
        };


        stepCells.addResetListener(function () {
            node = null;
            vt.root(null).update();
        });


        stepCells.addCallListener(function (scs, funcName, args) {
            var parent = node;

            var child = {};

            if (!(funcName in func2type)) {
                var no = numFuncs % 6;
                func2type[funcName] = no;
                numFuncs++;
            }

            var className = "node-type-" + func2type[funcName];
            child.className = className;

            if (conf.useNodeChar) {
                child.nodeChar = funcName;
            } else {
                child.nodeText = [funcName, "(", args.join(", "), ")"].join("");
            }

            if (node) {
                if (!node.children) {
                    node.children = [];
                }

                node.children.push(child);
                node = child;
            } else {
                node = child;
                vt.root(node);
            }

            vt.update(parent);
        });


        stepCells.addReturnListener(function (scs, val) {
            if (conf.showReturnValue && typeof val !== "undefined") {
                if (conf.useNodeChar) {
                    node.nodeText = val;
                } else {
                    node.nodeText = [node.nodeText, ": ", val].join("");
                }

                if (node) {
                    vt.updateNodeText(node);
                }
            }

            node = node.parent;
        });
    }


    function createCallTreePanel(stepCells, conf) {
        var panel = conf.container;
        helpers.addClass(panel, "sc-call-tree-panel");

        panel.innerHTML = "<svg class='sc-tree-svg'></svg>";

        return panel.getElementsByClassName("sc-tree-svg")[0];
    }
})();
