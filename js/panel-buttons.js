(function() {
    "use strict";

    sc.panels.Buttons = Buttons;


    function Buttons(stepCells, conf) {
        setConf(conf);
        createButtonsPanel(stepCells, conf);
    }


    function setConf(conf) {
        if (!conf.stepButtonText) {
            conf.stepButtonText = "STEP";
        }

        if (!conf.runButtonText) {
            conf.runButtonText = "RUN";
        }

        if (!conf.pauseButtonText) {
            conf.pauseButtonText = "PAUSE";
        }

        if (!conf.resetButtonText) {
            conf.resetButtonText = "RESET";
        }
    }


    function createButtonsPanel(stepCells, conf) {
        var panel = conf.container;
        helpers.addClass(panel, "sc-buttons-panel");

        var arr = [];
        arr.push("<input class='sc-step-button' type='button' value='");
        arr.push(conf.stepButtonText);
        arr.push("' />");

        if (conf.showRunButton) {
            arr.push("<input class='sc-run-button' type='button' value='");
            arr.push(conf.runButtonText);
            arr.push("' />");
        }

        arr.push("<input class='sc-reset-button' type='button' value=");
        arr.push(conf.resetButtonText);
        arr.push(" />");

        panel.innerHTML = arr.join("");

        var stepBtn = panel.getElementsByClassName("sc-step-button")[0];
        stepBtn.onclick = function () { stepCells.step(); };

        if (conf.showRunButton) {
            var runBtn = panel.getElementsByClassName("sc-run-button")[0];
            runBtn.onclick = function () {
                if (stepCells.isRunning) {
                    stepCells.pause();
                } else {
                    stepCells.run();
                }
            };

            stepCells.onCompleteListeners.push(function () { stepCells.pause(); });
            stepCells.addRunListener(function () { runBtn.value = conf.pauseButtonText; });
            stepCells.addPauseListener(function () { runBtn.value = conf.runButtonText; });
        }

        var resetBtn = panel.getElementsByClassName("sc-reset-button")[0];
        resetBtn.onclick = function () { stepCells.reset(); };
    }
})();
