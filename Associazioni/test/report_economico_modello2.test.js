// Copyright [2018] [Banana.ch SA - Lugano Switzerland]
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
//


// @id = report_economico_modello2.test
// @api = 1.0
// @pubdate = 2018-06-22
// @publisher = Banana.ch SA
// @description = <TEST report_economico_modello2.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../report_economico_modello2.js
// @timeout = -1



// Register test case to be executed
Test.registerTestCase(new ReportEconomicoModello2Test());

// Here we define the class, the name of the class is not important
function ReportEconomicoModello2Test() {

}

// This method will be called at the beginning of the test case
ReportEconomicoModello2Test.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
ReportEconomicoModello2Test.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ReportEconomicoModello2Test.prototype.init = function() {

}

// This method will be called after every test method is executed
ReportEconomicoModello2Test.prototype.cleanup = function() {

}

//Test contabilità semplice
ReportEconomicoModello2Test.prototype.testBananaAppSemplice = function() {

	var banDoc = Banana.application.openDocument("file:script/../test/testcases/semplice_aps.ac2");
	Test.assert(banDoc);

	loadParam(banDoc);
	loadForm(banDoc);
	loadBalances(banDoc);
	preProcess(banDoc);
	calcTotals(["amount"]);
	formatValues(["amount"]);

	var report = printReport(banDoc);
	Test.logger.addReport("Test report ecomomico modello 2 (contabilità semplice)", report);

}

//Test contabilità doppia
ReportEconomicoModello2Test.prototype.testBananaAppDoppia = function() {

	var banDoc = Banana.application.openDocument("file:script/../test/testcases/doppia_aps.ac2");
	Test.assert(banDoc);

	loadParam(banDoc);
	loadForm(banDoc);
	loadBalances(banDoc);
	preProcess(banDoc);
	calcTotals(["amount"]);
	formatValues(["amount"]);

	var report = printReport(banDoc);
	Test.logger.addReport("Test report ecomomico modello 2 (contabilità doppia)", report);

}



