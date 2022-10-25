// Copyright [2022] [Banana.ch SA - Lugano Switzerland]
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


// @id = ch.banana.it.extension.rendicontogestionale.mod.b.test
// @api = 1.0
// @pubdate = 2022-10-19
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.it.extension.rendicontogestionale.mod.b.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.it.extension.rendicontogestionale.mod.b.js
// @timeout = -1



// Register test case to be executed
Test.registerTestCase(new ReportModBTest());

// Here we define the class, the name of the class is not important
function ReportModBTest() {

}

// This method will be called at the beginning of the test case
ReportModBTest.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
ReportModBTest.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ReportModBTest.prototype.init = function() {

}

// This method will be called after every test method is executed
ReportModBTest.prototype.cleanup = function() {

}

ReportModBTest.prototype.testBananaExtension = function() {

    let banDoc;
    let userParam;
    let paramReport;
    let report;

	/**
	 * Test 1: column Gr
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/ets_test_gestionale_pieno.ac2");
	Test.assert(banDoc);

    userParam = {};
  	userParam.selectionStartDate = "2022-01-01";
  	userParam.selectionEndDate = "2022-12-31";
  	userParam.title = "RENDICONTO GESTIONALE (MOD. B) ANNO 2022";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.column = 'Gr';
	userParam.printcolumn = false;
	userParam.printcostifigurativi = true;

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportNormale(banDoc, paramReport, "");
	Test.logger.addReport("Test 'rendiconto gestionale (MOD. B)'", report);


	/**
	 * Test 2: column Gr1
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/ets_test_gestionale_gr_gr1.ac2");
	Test.assert(banDoc);

    userParam = {};
  	userParam.selectionStartDate = "2022-01-01";
  	userParam.selectionEndDate = "2022-12-31";
  	userParam.title = "RENDICONTO GESTIONALE (MOD. B) ANNO 2022";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.column = 'Gr1';
	userParam.printcolumn = false;
	userParam.printcostifigurativi = true;

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportNormale(banDoc, paramReport, "");
	Test.logger.addReport("Test 2: 'rendiconto gestionale (MOD. B)', column Gr1", report);

	/**
	 * Test 3: tutorial template
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/11094-entrate-uscite-ets-rendiconto-cassa-tutorial.ac2");
	Test.assert(banDoc);

    userParam = {};
  	userParam.selectionStartDate = "2020-01-01";
  	userParam.selectionEndDate = "2020-12-31";
  	userParam.title = "RENDICONTO GESTIONALE (MOD. B) ANNO 2020";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.column = 'Gr1';
	userParam.printcolumn = false;
	userParam.printcostifigurativi = true;

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportNormale(banDoc, paramReport, "");
	Test.logger.addReport("Test 3: 'rendiconto gestionale (MOD. B)', column Gr1", report);

	/**
	 * Test 4: tutorial template, print gr1 column
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/11094-entrate-uscite-ets-rendiconto-cassa-tutorial.ac2");
	Test.assert(banDoc);

    userParam = {};
  	userParam.selectionStartDate = "2020-01-01";
  	userParam.selectionEndDate = "2020-12-31";
  	userParam.title = "RENDICONTO GESTIONALE (MOD. B) ANNO 2020";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.column = 'Gr1';
	userParam.printcolumn = true;
	userParam.printcostifigurativi = true;

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportNormale(banDoc, paramReport, "");
	Test.logger.addReport("Test 4: 'rendiconto gestionale (MOD. B)', stampa colonna raggruppamento", report);



	/**
	 * Test 5: report di controllo
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/11094-entrate-uscite-ets-rendiconto-cassa-tutorial.ac2");
	Test.assert(banDoc);

    userParam = {};
  	userParam.selectionStartDate = "2020-01-01";
  	userParam.selectionEndDate = "2020-12-31";
  	userParam.title = "XXX";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.column = 'Gr1';
	userParam.printcolumn = true;
	userParam.printcostifigurativi = true;
	userParam.stampareportcontrollo = true;

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportControllo(banDoc, paramReport);

	Test.logger.addReport("Test 4: report di controllo - Rendiconto Gestionale", report);

}
