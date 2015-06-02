(function() {
    "use strict";

    sc.panels.Table = Table;


    function Table(stepCells, conf) {
        this.table = conf.table;
    }


    Table.prototype.getCell = function (rowNo, colNo) {
        if (rowNo < 0 || rowNo >= this.table.rows.length) {
            return null;
        }

        var row = this.table.rows[rowNo];

        if (colNo < 0 || colNo >= row.cells.length) {
            return null;
        }

        return row.cells[colNo];
    };


    Table.prototype.setCell = function (data, rowNo, colNo) {
        var cell = this.getCell(rowNo, colNo);

        if (!cell) {
            return;
        }

        cell.innerHTML = data;
    };


    Table.prototype.clear = function () {
        this.foreach(function (cell) {
            cell.innerHTML = "&nbsp;";
        });
    };


    Table.prototype.clearClassName = function () {
        this.foreach(function (cell) {
            cell.className = "";
        });
    };


    Table.prototype.insertRow = function (data, rowNo) {
        if (arguments.length === 1) {
            rowNo = -1;
        }

        var row = this.table.insertRow(rowNo);

        data.forEach(function (d) {
            var cell = row.insertCell(-1);
            cell.innerHTML = d;
        });
    };


    Table.prototype.insertColumn = function (data, colNo) {
        if (arguments.length === 1) {
            colNo = -1;
        }

        var table = this.table;

        data.forEach(function (d, rowNo) {
            var row = table.rows[rowNo];
            var cell = row.insertCell(colNo);
            cell.innerHTML = d;
        });
    };


    Table.prototype.deleteAll = function () {
        this.table.innerHTML = "";
    };


    Table.prototype.deleteRow = function (rowNo) {
        if (arguments.length === 0) {
            rowNo = -1;
        }

        this.table.deleteRow(rowNo);
    };


    Table.prototype.deleteColumn = function (colNo) {
        if (arguments.length === 0) {
            colNo = -1;
        }

        for (var rowNo = 0; rowNo < this.table.rows.length; rowNo++) {
            var row = this.table.rows[rowNo];
            row.deleteCell(colNo);
        }
    };


    Table.prototype.setClassName = function (className, rowNo, colNo) {
        var cell = this.getCell(rowNo, colNo);

        if (!cell) {
            return;
        }

        cell.className = className;
    };


    Table.prototype.foreach = function (callback) {
        for (var rowNo = 0; rowNo < this.table.rows.length; rowNo++) {
            var row = this.table.rows[rowNo];

            for (var colNo = 0; colNo < row.cells.length; colNo++) {
                var cell = row.cells[colNo];
                callback(cell);
            }
        }
    };


    Table.prototype.rowForEach = function (rowNo, callback) {
        var row = this.table.rows[rowNo];

        for (var colNo = 0; colNo < row.cells.length; colNo++) {
            var cell = row.cells[colNo];
            callback(cell);
        }
    };


    Table.prototype.columnForEach = function (colNo, callback) {
        for (var rowNo = 0; rowNo < this.table.rows.length; rowNo++) {
            var row = this.table.rows[rowNo];
            var cell = row.cells[colNo];
            callback(cell);
        }
    };
})();
