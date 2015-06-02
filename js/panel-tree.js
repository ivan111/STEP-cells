(function() {
    "use strict";

    sc.panels.Tree = Tree;


    function Tree(stepCells, conf) {
        var svg = createTreePanel(stepCells, conf);
        var vt = vtree(svg, conf.width, conf.height);

        stepCells.addResetListener(function () {
            stepCells.js.vtree = vt;
            vt.root(null).update();
        });
    }


    function createTreePanel(stepCells, conf) {
        var panel = conf.container;
        helpers.addClass(panel, "sc-tree-panel");

        panel.innerHTML = "<svg class='sc-tree-svg'></svg>";

        return panel.getElementsByClassName("sc-tree-svg")[0];
    }
})();
