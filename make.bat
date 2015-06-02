@echo off
SET FILE_LIST=..\yaseuma\js\helpers.js
SET FILE_LIST=%FILE_LIST% ..\vtree2\js\vtree.js
SET FILE_LIST=%FILE_LIST% ..\yaseuma\js\inst2num.js
SET FILE_LIST=%FILE_LIST% js\step-cells.js
SET FILE_LIST=%FILE_LIST% js\step-cells.exec.js
SET FILE_LIST=%FILE_LIST% js\vars.js
SET FILE_LIST=%FILE_LIST% js\panel-buttons.js
SET FILE_LIST=%FILE_LIST% js\panel-vars.js
SET FILE_LIST=%FILE_LIST% js\panel-console.js
SET FILE_LIST=%FILE_LIST% js\panel-code.js
SET FILE_LIST=%FILE_LIST% js\panel-asm.js
SET FILE_LIST=%FILE_LIST% js\panel-tree.js
SET FILE_LIST=%FILE_LIST% js\panel-call-tree.js
SET FILE_LIST=%FILE_LIST% js\panel-table.js
@echo on

java  -jar ..\tools\compiler.jar  --js_output_file=js\step-cells.min.js %FILE_LIST%

pause
