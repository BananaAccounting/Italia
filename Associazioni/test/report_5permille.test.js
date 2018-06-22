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


// @id = report_5permille.test
// @api = 1.0
// @pubdate = 2018-06-22
// @publisher = Banana.ch SA
// @description = <TEST report_5permille.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../report_5permille.js
// @timeout = -1



// Register test case to be executed
Test.registerTestCase(new Report5permilleTest());

// Here we define the class, the name of the class is not important
function Report5permilleTest() {

}

// This method will be called at the beginning of the test case
Report5permilleTest.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
Report5permilleTest.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
Report5permilleTest.prototype.init = function() {

}

// This method will be called after every test method is executed
Report5permilleTest.prototype.cleanup = function() {

}

//Test contabilità semplice
Report5permilleTest.prototype.testBananaAppSemplice = function() {

	var banDoc = Banana.application.openDocument("file:script/../test/testcases/semplice_aps.ac2");
	Test.assert(banDoc);

	var itemSelected = ":5X16";
	var accounts1 = banDoc.table("Categories");
	var accounts2 = ""; //tabella anno precedente
	var file2 = ""; //file anno precedente

	loadGroups();
	loadAccountsMap(banDoc, itemSelected, accounts1, accounts2, file2);

	var report = printReport(banDoc, itemSelected, accounts1, accounts2, file2);
	Test.logger.addReport("Test report 5 per mille (contabilità semplice)", report);

}

//Test contabilità doppia
Report5permilleTest.prototype.testBananaAppDoppia = function() {

	var banDoc = Banana.application.openDocument("file:script/../test/testcases/doppia_aps.ac2");
	Test.assert(banDoc);

	var itemSelected = ":5X16";
	var accounts1 = banDoc.table("Accounts");
	var accounts2 = ""; //tabella anno precedente
	var file2 = ""; //file anno precedente

	loadGroups();
	loadAccountsMap(banDoc, itemSelected, accounts1, accounts2, file2);

	var report = printReport(banDoc, itemSelected, accounts1, accounts2, file2);
	Test.logger.addReport("Test report 5 per mille (contabilità doppia)", report);

}



