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
// @pubdate = 2020-11-11
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

	/**
	 *	Test with Gr column
	 */
	var banDoc = Banana.application.openDocument("file:script/../test/testcases/ets_test_cassa_gr_gr1.ac2");
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

	var reportStructure = createReportStructureRendicontoCassa();

	const bReport = new BReport(banDoc, userParam, reportStructure);
	bReport.validateGroups(userParam.column);
	bReport.loadBalances();
	bReport.calculateTotals(["currentAmount", "previousAmount"]);
	bReport.formatValues(["currentAmount", "previousAmount"]);
	bReport.excludeEntries();

	var report = printRendicontoModD(banDoc, userParam, bReport, "");
	Test.logger.addReport("Test 'rendiconto cassa (MOD. D)'", report);


	/**
	 *	Test with Gr1 column
	 */
	var banDoc = Banana.application.openDocument("file:script/../test/testcases/ets_test_cassa_gr_gr1.ac2");
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
	userParam.column = 'Gr1';

	var reportStructure = createReportStructureRendicontoCassa();

	const bReport1 = new BReport(banDoc, userParam, reportStructure);
	bReport1.validateGroups(userParam.column);
	bReport1.loadBalances();
	bReport1.calculateTotals(["currentAmount", "previousAmount"]);
	bReport1.formatValues(["currentAmount", "previousAmount"]);
	bReport1.excludeEntries();

	var report = printRendicontoModD(banDoc, userParam, bReport1, "");
	Test.logger.addReport("Test GR1 'rendiconto cassa (MOD. D)'", report);


	/**
	 *	Test using the tutorial template
	 */
	var banDoc = Banana.application.openDocument("file:script/../test/testcases/11094-entrate-uscite-ets-rendiconto-cassa-tutorial.ac2");
	Test.assert(banDoc);

	var userParam = {};
  	userParam.selectionStartDate = "2020-01-01";
  	userParam.selectionEndDate = "2020-12-31";
  	userParam.title = "RENDICONTO CASSA (MOD. D) ANNO 2020";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.column = 'Gr1';

	var reportStructure = createReportStructureRendicontoCassa();

	const bReport2 = new BReport(banDoc, userParam, reportStructure);
	bReport2.validateGroups(userParam.column);
	bReport2.loadBalances();
	bReport2.calculateTotals(["currentAmount", "previousAmount"]);
	bReport2.formatValues(["currentAmount", "previousAmount"]);
	bReport2.excludeEntries();

	var report = printRendicontoModD(banDoc, userParam, bReport2, "");
	Test.logger.addReport("Test GR1 'rendiconto cassa (MOD. D)'", report);

}
