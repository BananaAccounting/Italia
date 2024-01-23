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


// @id = ch.banana.it.extension.asd.rendicontocassa.test
// @api = 1.0
// @pubdate = 2024-01-23
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.it.extension.asd.rendicontocassa.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.it.extension.asd.rendicontocassa.js
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

    let banDoc;
    let userParam;
    let paramReport;
    let report;

	/**
	 *	Test
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/asd_cassa_test.ac2");
	Test.assert(banDoc);

    userParam = {};
  	userParam.selectionStartDate = "2024-01-01";
  	userParam.selectionEndDate = "2024-12-31";
  	userParam.title = "RENDICONTO CASSA ANNO 2024";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.textbegin = '';
	userParam.column = 'Gr1';

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportNormale(banDoc, paramReport, "");
	Test.logger.addReport("Test 1 'rendiconto cassa'", report);


	/**
	 *	Test using the tutorial template
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/11249-entrate-uscite-asd-rendiconto-cassa-tutorial.ac2");
	Test.assert(banDoc);

    userParam = {};
  	userParam.selectionStartDate = "2024-01-01";
  	userParam.selectionEndDate = "2024-12-31";
  	userParam.title = "RENDICONTO CASSA ANNO 2024";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.textbegin = 'Testo iniziale\nsu più\nrighe.';
	userParam.column = 'Gr1';

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportNormale(banDoc, paramReport, "");
	Test.logger.addReport("Test 2: 'rendiconto cassa'", report);


	/**
	 *	Test using the tutorial template, print Gr1 column
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/11249-entrate-uscite-asd-rendiconto-cassa-tutorial.ac2");
	Test.assert(banDoc);

    userParam = {};
  	userParam.selectionStartDate = "2024-01-01";
  	userParam.selectionEndDate = "2024-12-31";
  	userParam.title = "RENDICONTO CASSA ANNO 2024";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.textbegin = 'Testo iniziale\nsu più\nrighe.';
	userParam.column = 'Gr1';
	userParam.printcolumn = true;

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportNormale(banDoc, paramReport, "");
	Test.logger.addReport("Test 3 'rendiconto cassa'", report);


	/**
	 *	Test with current and previous year amounts
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/asd_cassa_test.ac2");
	Test.assert(banDoc);

    userParam = {};
	userParam.selectionStartDate = "2024-01-01";
	userParam.selectionEndDate = "2024-12-31";
	userParam.title = "RENDICONTO CASSA ANNO 2024";
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
	Test.logger.addReport("Test 4 'rendiconto cassa'", report);


	/**
	 *	Test with only previous year amounts
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/asd_cassa_test.ac2");
	Test.assert(banDoc);

    userParam = {};
	userParam.selectionStartDate = "2024-01-01";
	userParam.selectionEndDate = "2024-12-31";
	userParam.title = "RENDICONTO CASSA ANNO 2024";
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
	Test.logger.addReport("Test 5 'rendiconto cassa'", report);


	/**
	 *	Test report di controllo
	 */
	banDoc = Banana.application.openDocument("file:script/../test/testcases/asd_cassa_test.ac2");
	Test.assert(banDoc);

	userParam = {};
	userParam.selectionStartDate = "2024-01-01";
	userParam.selectionEndDate = "2024-12-31";
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
	Test.logger.addReport("Test 6 report di controllo 'Rendiconto Cassa'", report);



	// /**
	//  *	Test with current and previous year amounts using Balance_YYYY custom columns
	//  */
    // banDoc = Banana.application.openDocument("file:script/../test/testcases/ets-test-cassa-colonne-saldi-specifiche.ac2");
	// Test.assert(banDoc);

    // userParam = {};
  	// userParam.selectionStartDate = "2024-01-01";
  	// userParam.selectionEndDate = "2024-12-31";
  	// userParam.title = "RENDICONTO CASSA (MOD. D) ANNO 2024";
	// userParam.logo = false;
	// userParam.logoname = 'Logo';
	// userParam.printheader = false;
	// userParam.printtitle = true;
	// userParam.title = '';
	// userParam.textbegin = '';
	// userParam.column = 'Gr1';
	// userParam.printcolumn = true;
	// userParam.balancecolumns = true;
	// userParam.currentbalancecolumn = 'Balance_2024';
	// userParam.previousbalancecolumn = 'Balance_2024';

    // paramReport = setParamReport(banDoc, userParam);
    // report = stampaReportNormale(banDoc, paramReport, "");
	// Test.logger.addReport("Test 'rendiconto cassa (MOD. D)' con colonne saldo specifiche", report);

}
