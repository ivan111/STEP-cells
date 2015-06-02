(function() {
    "use strict";

    sc.panels.CodeTable = CodeTable;


    function CodeTable(stepCells, conf) {
        var table = conf.codeTable;
        this.table = table;
        var pos = [0, 0];

        stepCells.addStepListener(function (scs, newPos, oldPos) {
            setSelected(table, false, oldPos);
            setSelected(table, true, newPos);

            pos = newPos.slice(0);
        });

        stepCells.addResetListener(function () {
            setSelected(table, false, pos);
        });

        for (var i = 0; i < table.rows.length; i++) {
            var row = table.rows[i];
            row.onclick = createOnLineNoClick(stepCells, row, i + 1);
        }
    }


    CodeTable.prototype.removeAllComments = function () {
        var elements = document.getElementsByClassName("sc-comment");

        while (elements.length > 0) {
            elements[0].parentNode.removeChild(elements[0]);
        }
    };


    CodeTable.prototype.removeComment = function (lineNo) {
        var row = this.getRow(lineNo);

        if (!row) {
            return;
        }

        var elements = row.getElementsByClassName("sc-comment");

        while (elements.length > 0) {
            elements[0].parentNode.removeChild(elements[0]);
        }
    };


    CodeTable.prototype.comment = function (lineNo, comment) {
        var row = this.getRow(lineNo);

        if (!row) {
            return;
        }

        this.setCommentTextTag(row, comment);
    };


    CodeTable.prototype.getRow = function (lineNo) {
        var i = lineNo - 1;

        if (i < 0 || i >= this.table.rows.length) {
            return null;
        }

        return this.table.rows[i];
    };


    CodeTable.prototype.setCommentTextTag = function (row, comment) {
        var comments = row.getElementsByClassName("sc-comment-text");

        if (comments.length > 0) {
            var commentTextElem = comments[0];
        } else {
            var commentElem = document.createElement("span");
            commentElem.className = "sc-comment";
            commentElem.innerHTML = "<span class='sc-comment-space'>&nbsp;&nbsp;</span><span class='sc-comment-text'></span>";

            var pres = row.cells[1].getElementsByTagName("pre");

            if (pres.length !== 1) {
                return;
            }

            var pre = pres[0];

            pre.appendChild(commentElem);

            commentTextElem = commentElem.getElementsByClassName("sc-comment-text")[0];
        }

        commentTextElem.innerHTML = comment;
    };


    function setSelected(table, isSet, pos) {
        var y = pos[0] - 1;

        if (y >= 0 && y < table.rows.length) {
            var row = table.rows[y];

            if (isSet) {
                helpers.addClass(row, "selected");
            } else {
                helpers.removeClass(row, "selected");
            }
        }
    }


    function createOnLineNoClick(stepCells, row, lineNo) {
        return function () {
            if (stepCells.breakpoints[lineNo]) {
                helpers.removeClass(row, "breakpoint");
                stepCells.breakpoints[lineNo] = false;
            } else {
                helpers.addClass(row, "breakpoint");
                stepCells.breakpoints[lineNo] = true;
            }
        };
    }
})();
