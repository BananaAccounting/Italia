// Copyright [2024] [Banana.ch SA - Lugano Switzerland]
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


// @id = ch.banana.it.extension.asd.rendicontogestionale.test
// @api = 1.0
// @pubdate = 2024-01-05
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.it.extension.asd.rendicontogestionale.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.it.extension.asd.rendicontogestionale.js
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
	 * Test 1:
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/asd_gestionale_patrimoniale_test.ac2");
	Test.assert(banDoc);

    userParam = {};
  	userParam.selectionStartDate = "2022-01-01";
  	userParam.selectionEndDate = "2022-12-31";
  	userParam.title = "RENDICONTO GESTIONALE ANNO 2022";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.textbegin = '';
	userParam.column = 'Gr1';
	userParam.printcolumn = false;

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportNormale(banDoc, paramReport, "");
	Test.logger.addReport("Test 1: 'rendiconto gestionale', column Gr1", report);

	/**
	 * Test 2: tutorial template
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/asd_gestionale_patrimoniale_test.ac2");
	Test.assert(banDoc);

    userParam = {};
  	userParam.selectionStartDate = "2020-01-01";
  	userParam.selectionEndDate = "2020-12-31";
  	userParam.title = "RENDICONTO GESTIONALE ANNO 2020";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.textbegin = '';
	userParam.column = 'Gr1';
	userParam.printcolumn = false;

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportNormale(banDoc, paramReport, "");
	Test.logger.addReport("Test 2: 'rendiconto gestionale', column Gr1", report);

	/**
	 * Test 3: tutorial template, print gr1 column
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/asd_gestionale_patrimoniale_test.ac2");
	Test.assert(banDoc);

    userParam = {};
  	userParam.selectionStartDate = "2020-01-01";
  	userParam.selectionEndDate = "2020-12-31";
  	userParam.title = "RENDICONTO GESTIONALE ANNO 2020";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.textbegin = '';
	userParam.column = 'Gr1';
	userParam.printcolumn = true;

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportNormale(banDoc, paramReport, "");
	Test.logger.addReport("Test 3: 'rendiconto gestionale', stampa colonna raggruppamento", report);



	/**
	 * Test 4: report di controllo
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/asd_gestionale_patrimoniale_test.ac2");
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
	userParam.textbegin = '';
	userParam.column = 'Gr1';
	userParam.printcolumn = true;
	userParam.stampareportcontrollo = true;

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportControllo(banDoc, paramReport);

	Test.logger.addReport("Test 4: report di controllo - Rendiconto Gestionale", report);

}
