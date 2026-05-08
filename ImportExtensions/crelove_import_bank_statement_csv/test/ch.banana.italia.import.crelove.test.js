// Copyright [2026] [Banana.ch SA - Lugano Switzerland]
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// @id = ch.banana.italia.import.crelove
// @api = 1.0
// @pubdate = 2026-05-07
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.italia.import.crelove>
// @task = app.command
// @doctype = *.*
// @docproperties =
// @outputformat = none
// @inputdataform = none
// @includejs = ../../import.utilities.js
// @includejs = ../ch.banana.italia.import.crelove.js
// @timeout = -1

Test.registerTestCase(new TestImportCRELOVETrans());

function TestImportCRELOVETrans() {
}

TestImportCRELOVETrans.prototype.initTestCase = function () {
   this.testLogger = Test.logger;
   this.progressBar = Banana.application.progressBar;
}

TestImportCRELOVETrans.prototype.cleanupTestCase = function () {
}

TestImportCRELOVETrans.prototype.init = function () {
}

TestImportCRELOVETrans.prototype.cleanup = function () {
}

TestImportCRELOVETrans.prototype.testImport = function () {
   var fileNameList = [];

   fileNameList.push("file:script/../test/testcases/csv_crelove_example_format1_20260507.csv");

   var parentLogger = this.testLogger;
   this.progressBar.start(fileNameList.length);

   for (var i = 0; i < fileNameList.length; i++) {
      var fileName = fileNameList[i];
      this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileName));

      var file = Banana.IO.getLocalFile(fileName);
      Test.assert(file);
      var fileContent = file.read();
      Test.assert(fileContent);
      var transactions = exec(fileContent, true);
      this.testLogger.addCsv('', transactions);

      if (!this.progressBar.step())
         break;
   }

   this.progressBar.finish();
}
