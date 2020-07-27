// Copyright [2020] [Banana.ch SA - Lugano Switzerland]
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


// @id = ch.banana.it.extension.rendicontocassa.mod.d.test
// @api = 1.0
// @pubdate = 2020-07-27
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.it.extension.rendicontocassa.mod.d.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.it.extension.rendicontocassa.mod.d.js
// @timeout = -1



// Register test case to be executed
Test.registerTestCase(new ReportModDTest());

// Here we define the class, the name of the class is not important
function ReportModDTest() {

}

// This method will be called at the beginning of the test case
ReportModDTest.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
ReportModDTest.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ReportModDTest.prototype.init = function() {

}

// This method will be called after every test method is executed
ReportModDTest.prototype.cleanup = function() {

}

ReportModDTest.prototype.testBananaExtension = function() {

	var banDoc = Banana.application.openDocument("file:script/../test/testcases/ets_test_cassa.ac2");
	Test.assert(banDoc);

	var userParam = {};
  	userParam.selectionStartDate = "2022-01-01";
  	userParam.selectionEndDate = "2022-12-31";
  	userParam.title = "RENDICONTO CASSA (MOD. D) ANNO 2022";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.column = 'Gr';

	var dataStructure = loadDataStructure("REPORT_TYPE_MOD_D");

	const bReport = new BReport(banDoc, userParam, dataStructure);
	bReport.loadBalances();
	bReport.calculateTotals(["currentAmount", "previousAmount"]);
	bReport.formatValues(["currentAmount", "previousAmount"]);
	bReport.excludeEntries();

	var report = printRendicontoModD(banDoc, userParam, bReport, "");
	Test.logger.addReport("Test 'rendiconto cassa (MOD. D)'", report);
}
