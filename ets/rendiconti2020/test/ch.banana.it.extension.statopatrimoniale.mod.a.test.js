// Copyright [2021] [Banana.ch SA - Lugano Switzerland]
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


// @id = ch.banana.it.extension.statopatrimoniale.mod.a.test
// @api = 1.0
// @pubdate = 2021-06-02
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.it.extension.statopatrimoniale.mod.a.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.it.extension.statopatrimoniale.mod.a.js
// @timeout = -1



// Register test case to be executed
Test.registerTestCase(new ReportModATest());

// Here we define the class, the name of the class is not important
function ReportModATest() {

}

// This method will be called at the beginning of the test case
ReportModATest.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
ReportModATest.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ReportModATest.prototype.init = function() {

}

// This method will be called after every test method is executed
ReportModATest.prototype.cleanup = function() {

}

ReportModATest.prototype.testBananaExtension = function() {

	/**
	 * Test 1 with all groups balances
	*/

	var banDoc = Banana.application.openDocument("file:script/../test/testcases/ets_test_gestionale_pieno.ac2");
	Test.assert(banDoc);

	var userParam = {};
  	userParam.selectionStartDate = "2022-01-01";
  	userParam.selectionEndDate = "2022-12-31";
  	userParam.title = "STATO PATRIMONIALE (MOD. A) ANNO 2022";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.column = 'Gr';
	userParam.printcolumn = false;
	userParam.printpreviousyear = true;
	userParam.compattastampa = false;

	var reportStructure = createReportStructureStatoPatrimoniale();

	const bReport = new BReport(banDoc, userParam, reportStructure);
	bReport.validateGroups(userParam.column);
	bReport.loadBalances();
	bReport.calculateTotals(["currentAmount", "previousAmount"]);
	bReport.formatValues(["currentAmount", "previousAmount"]);
	bReport.excludeEntries();

	var report = printRendicontoModA(banDoc, userParam, bReport, "");
	Test.logger.addReport("Test 1: rendiconto 'Stato Patrimoniale (MOD. A)'", report);


	/**
	 * Test 2 without groups balances that can be excluded
	*/
	var banDoc = Banana.application.openDocument("file:script/../test/testcases/ets_test_gestionale_vuoto.ac2");
	Test.assert(banDoc);

	var userParam = {};
  	userParam.selectionStartDate = "2022-01-01";
  	userParam.selectionEndDate = "2022-12-31";
  	userParam.title = "STATO PATRIMONIALE (MOD. A) ANNO 2022";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.column = 'Gr';
	userParam.printcolumn = false;
	userParam.printpreviousyear = true;
	userParam.compattastampa = true;

	var reportStructure = createReportStructureStatoPatrimoniale();

	const bReport1 = new BReport(banDoc, userParam, reportStructure);
	bReport1.validateGroups(userParam.column);
	bReport1.loadBalances();
	bReport1.calculateTotals(["currentAmount", "previousAmount"]);
	bReport1.formatValues(["currentAmount", "previousAmount"]);
	bReport1.excludeEntries();

	var report = printRendicontoModA(banDoc, userParam, bReport1, "");
	Test.logger.addReport("Test 2: rendiconto 'Stato Patrimoniale (MOD. A)'", report);


	/**
	 * Test 3 with all groups balances using the Gr1 column
	*/
	var banDoc = Banana.application.openDocument("file:script/../test/testcases/ets_test_gestionale_gr_gr1.ac2");
	Test.assert(banDoc);

	var userParam = {};
  	userParam.selectionStartDate = "2022-01-01";
  	userParam.selectionEndDate = "2022-12-31";
  	userParam.title = "STATO PATRIMONIALE (MOD. A) ANNO 2022";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.column = 'Gr1';
	userParam.printcolumn = false;
	userParam.printpreviousyear = true;
	userParam.compattastampa = true;

	var reportStructure = createReportStructureStatoPatrimoniale();

	const bReport2 = new BReport(banDoc, userParam, reportStructure);
	bReport2.validateGroups(userParam.column);
	bReport2.loadBalances();
	bReport2.calculateTotals(["currentAmount", "previousAmount"]);
	bReport2.formatValues(["currentAmount", "previousAmount"]);
	bReport2.excludeEntries();

	var report = printRendicontoModA(banDoc, userParam, bReport2, "");
	Test.logger.addReport("Test 3: rendiconto 'Stato Patrimoniale (MOD. A)', colonna Gr1", report);

	/**
	 * Test 4 using the tutorial template
	*/
	var banDoc = Banana.application.openDocument("file:script/../test/testcases/11094-entrate-uscite-ets-rendiconto-cassa-tutorial.ac2");
	Test.assert(banDoc);

	var userParam = {};
  	userParam.selectionStartDate = "2020-01-01";
  	userParam.selectionEndDate = "2020-12-31";
  	userParam.title = "STATO PATRIMONIALE (MOD. A) ANNO 2020";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.column = 'Gr1';
	userParam.printcolumn = false;
	userParam.printpreviousyear = true;
	userParam.compattastampa = false;

	var reportStructure = createReportStructureStatoPatrimoniale();

	const bReport3 = new BReport(banDoc, userParam, reportStructure);
	bReport3.validateGroups(userParam.column);
	bReport3.loadBalances();
	bReport3.calculateTotals(["currentAmount", "previousAmount"]);
	bReport3.formatValues(["currentAmount", "previousAmount"]);
	bReport3.excludeEntries();

	var report = printRendicontoModA(banDoc, userParam, bReport3, "");
	Test.logger.addReport("Test 4: rendiconto 'Stato Patrimoniale (MOD. A)', colonna Gr1", report);

	/**
	 * Test 5 using the tutorial template, with Gr1 column
	*/
	var banDoc = Banana.application.openDocument("file:script/../test/testcases/11094-entrate-uscite-ets-rendiconto-cassa-tutorial.ac2");
	Test.assert(banDoc);

	var userParam = {};
  	userParam.selectionStartDate = "2020-01-01";
  	userParam.selectionEndDate = "2020-12-31";
  	userParam.title = "STATO PATRIMONIALE (MOD. A) ANNO 2020";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.column = 'Gr1';
	userParam.printcolumn = true;
	userParam.printpreviousyear = true;
	userParam.compattastampa = false;

	var reportStructure = createReportStructureStatoPatrimoniale();

	const bReport5 = new BReport(banDoc, userParam, reportStructure);
	bReport5.validateGroups(userParam.column);
	bReport5.loadBalances();
	bReport5.calculateTotals(["currentAmount", "previousAmount"]);
	bReport5.formatValues(["currentAmount", "previousAmount"]);
	bReport5.excludeEntries();

	var report = printRendicontoModA(banDoc, userParam, bReport5, "");
	Test.logger.addReport("Test 5: rendiconto 'Stato Patrimoniale (MOD. A)', stampa colonna raggruppamento", report);

}

