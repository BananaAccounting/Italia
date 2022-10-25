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


// @id = ch.banana.it.extension.rendicontocassa.mod.d.test
// @api = 1.0
// @pubdate = 2022-10-19
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

    let banDoc;
    let userParam;
    let paramReport;
    let report;

	/**
	 *	Test with Gr column
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/ets_test_cassa_gr_gr1.ac2");
	Test.assert(banDoc);

    userParam = {};
  	userParam.selectionStartDate = "2022-01-01";
  	userParam.selectionEndDate = "2022-12-31";
  	userParam.title = "RENDICONTO CASSA (MOD. D) ANNO 2022";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.column = 'Gr';
	userParam.printcostifigurativi = true;

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportNormale(banDoc, paramReport, "");
	Test.logger.addReport("Test 'rendiconto cassa (MOD. D)'", report);


	/**
	 *	Test with Gr1 column
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/ets_test_cassa_gr_gr1.ac2");
	Test.assert(banDoc);

    userParam = {};
  	userParam.selectionStartDate = "2022-01-01";
  	userParam.selectionEndDate = "2022-12-31";
  	userParam.title = "RENDICONTO CASSA (MOD. D) ANNO 2022";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.column = 'Gr1';
	userParam.printcostifigurativi = true;

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportNormale(banDoc, paramReport, "");
	Test.logger.addReport("Test GR1 'rendiconto cassa (MOD. D)'", report);


	/**
	 *	Test using the tutorial template
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/11094-entrate-uscite-ets-rendiconto-cassa-tutorial.ac2");
	Test.assert(banDoc);

    userParam = {};
  	userParam.selectionStartDate = "2020-01-01";
  	userParam.selectionEndDate = "2020-12-31";
  	userParam.title = "RENDICONTO CASSA (MOD. D) ANNO 2020";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.column = 'Gr1';
	userParam.printcostifigurativi = true;

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportNormale(banDoc, paramReport, "");
	Test.logger.addReport("Test GR1 'rendiconto cassa (MOD. D)'", report);


	/**
	 *	Test using the tutorial template, print Gr1 column
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/11094-entrate-uscite-ets-rendiconto-cassa-tutorial.ac2");
	Test.assert(banDoc);

    userParam = {};
  	userParam.selectionStartDate = "2020-01-01";
  	userParam.selectionEndDate = "2020-12-31";
  	userParam.title = "RENDICONTO CASSA (MOD. D) ANNO 2020";
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
	Test.logger.addReport("Test 'rendiconto cassa (MOD. D)' con stampa colonna raggruppamento", report);


	/**
	 *	Test using the tutorial template, print Gr1 column, without table costi/ricavi figurativi
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/11094-entrate-uscite-ets-rendiconto-cassa-tutorial.ac2");
	Test.assert(banDoc);

    userParam = {};
  	userParam.selectionStartDate = "2020-01-01";
  	userParam.selectionEndDate = "2020-12-31";
  	userParam.title = "RENDICONTO CASSA (MOD. D) ANNO 2020";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.column = 'Gr1';
	userParam.printcolumn = true;
	userParam.printcostifigurativi = false;

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportNormale(banDoc, paramReport, "");
	Test.logger.addReport("Test 'rendiconto cassa (MOD. D)' con stampa colonna raggruppamento senza costi/ricavi figurativi", report);


	/**
	 *	Test with current and previous year amounts
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/entrate-uscite-corrente-e-precedente.ac2");
	Test.assert(banDoc);

    userParam = {};
	userParam.selectionStartDate = "2020-01-01";
	userParam.selectionEndDate = "2020-12-31";
	userParam.title = "RENDICONTO CASSA (MOD. D) ANNO 2020";
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
	Test.logger.addReport("Test 'rendiconto cassa (MOD. D)' con stampa colonna raggruppamento senza costi/ricavi figurativi", report);


	/**
	 *	Test with only previous year amounts
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/entrate-uscite-solo-precedente.ac2");
	Test.assert(banDoc);

    userParam = {};
	userParam.selectionStartDate = "2020-01-01";
	userParam.selectionEndDate = "2020-12-31";
	userParam.title = "RENDICONTO CASSA (MOD. D) ANNO 2020";
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
	Test.logger.addReport("Test 'rendiconto cassa (MOD. D)' con stampa colonna raggruppamento senza costi/ricavi figurativi", report);


	/**
	 *	Test with current and previous year amounts using Balance_YYYY custom columns
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/ets-test-cassa-colonne-saldi-specifiche.ac2");
	Test.assert(banDoc);

    userParam = {};
  	userParam.selectionStartDate = "2021-01-01";
  	userParam.selectionEndDate = "2021-12-31";
  	userParam.title = "RENDICONTO CASSA (MOD. D) ANNO 2021";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.column = 'Gr1';
	userParam.printcolumn = true;
	userParam.printcostifigurativi = true;
	userParam.balancecolumns = true;
	userParam.currentbalancecolumn = 'Balance_2021';
	userParam.previousbalancecolumn = 'Balance_2020';

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportNormale(banDoc, paramReport, "");
	Test.logger.addReport("Test 'rendiconto cassa (MOD. D)' con colonne saldo specifiche", report);


	/**
	 *	Test report di controllo
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
	Test.logger.addReport("Test report di controllo - Rendiconto Cassa", report);

}
