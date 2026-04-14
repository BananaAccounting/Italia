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
//


// @id = ch.banana.it.extension.rendicontocassaaggregato.mod.e.test
// @api = 1.0
// @pubdate = 2026-04-10
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.it.extension.rendicontocassaaggregato.mod.e.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.it.extension.rendicontocassaaggregato.mod.e.js
// @timeout = -1



// Register test case to be executed
Test.registerTestCase(new ReportModETest());

// Here we define the class, the name of the class is not important
function ReportModETest() {

}

// This method will be called at the beginning of the test case
ReportModETest.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
ReportModETest.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ReportModETest.prototype.init = function() {

}

// This method will be called after every test method is executed
ReportModETest.prototype.cleanup = function() {

}

ReportModETest.prototype.testBananaExtension = function() {

    let banDoc;
    let userParam;
    let paramReport;
    let report;

	/**
	 *	Test with Gr column
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/11358-entrate-uscite-ets-rendiconto-cassa-forma-aggregata-tutorial.ac2");
	Test.assert(banDoc);

    userParam = {};
  	userParam.selectionStartDate = "2026-01-01";
  	userParam.selectionEndDate = "2026-12-31";
  	userParam.title = "RENDICONTO CASSA AGGREGATO (MOD. E) ANNO 2026";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.column = 'Gr';
	userParam.printcostifigurativi = true;
	userParam.stamparendicontocassaaggregato = true;

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportNormale_Aggregato(banDoc, paramReport, "");
	Test.logger.addReport("Test 'rendiconto cassa (MOD. E)'", report);


	/**
	 *	Test with Gr1 column
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/11358-entrate-uscite-ets-rendiconto-cassa-forma-aggregata-tutorial.ac2");
	Test.assert(banDoc);

    userParam = {};
  	userParam.selectionStartDate = "2026-01-01";
  	userParam.selectionEndDate = "2026-12-31";
  	userParam.title = "RENDICONTO CASSA AGGREGATO (MOD. E) ANNO 2026";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.column = 'Gr1';
	userParam.printcostifigurativi = true;
	userParam.stamparendicontocassaaggregato = true;

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportNormale_Aggregato(banDoc, paramReport, "");
	Test.logger.addReport("Test GR1 'rendiconto cassa (MOD. E)'", report);


	/**
	 *	Test using the tutorial template
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/11358-entrate-uscite-ets-rendiconto-cassa-forma-aggregata-tutorial.ac2");
	Test.assert(banDoc);

    userParam = {};
  	userParam.selectionStartDate = "2026-01-01";
  	userParam.selectionEndDate = "2026-12-31";
  	userParam.title = "RENDICONTO CASSA AGGREGATO (MOD. E) ANNO 2026";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.column = 'Gr1';
	userParam.printcostifigurativi = true;
	userParam.stamparendicontocassaaggregato = true;

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportNormale_Aggregato(banDoc, paramReport, "");
	Test.logger.addReport("Test GR1 'rendiconto cassa (MOD. E)'", report);


	/**
	 *	Test using the tutorial template, print Gr1 column
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/11358-entrate-uscite-ets-rendiconto-cassa-forma-aggregata-tutorial.ac2");
	Test.assert(banDoc);

    userParam = {};
  	userParam.selectionStartDate = "2026-01-01";
  	userParam.selectionEndDate = "2026-12-31";
  	userParam.title = "RENDICONTO CASSA AGGREGATO (MOD. E) ANNO 2026";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.column = 'Gr1';
	userParam.printcolumn = true;
	userParam.printcostifigurativi = true;
	userParam.stamparendicontocassaaggregato = true;

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportNormale_Aggregato(banDoc, paramReport, "");
	Test.logger.addReport("Test 'rendiconto cassa (MOD. E)' con stampa colonna raggruppamento", report);


	/**
	 *	Test using the tutorial template, print Gr1 column, without table costi/ricavi figurativi
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/11358-entrate-uscite-ets-rendiconto-cassa-forma-aggregata-tutorial.ac2");
	Test.assert(banDoc);

    userParam = {};
  	userParam.selectionStartDate = "2026-01-01";
  	userParam.selectionEndDate = "2026-12-31";
  	userParam.title = "RENDICONTO CASSA AGGREGATO (MOD. E) ANNO 2026";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.column = 'Gr1';
	userParam.printcolumn = true;
	userParam.printcostifigurativi = false;
	userParam.stamparendicontocassaaggregato = true;

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportNormale_Aggregato(banDoc, paramReport, "");
	Test.logger.addReport("Test 'rendiconto cassa (MOD. E)' con stampa colonna raggruppamento senza costi/ricavi figurativi", report);


	/**
	 *	Test with current and previous year amounts
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/11358-entrate-uscite-ets-rendiconto-cassa-forma-aggregata-tutorial.ac2");
	Test.assert(banDoc);

    userParam = {};
	userParam.selectionStartDate = "2026-01-01";
	userParam.selectionEndDate = "2026-12-31";
	userParam.title = "RENDICONTO CASSA AGGREGATO (MOD. E) ANNO 2026";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.column = 'Gr1';
	userParam.printcolumn = true;
	userParam.printcostifigurativi = true;
	userParam.stamparendicontocassaaggregato = true;

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportNormale_Aggregato(banDoc, paramReport, "");
	Test.logger.addReport("Test 'rendiconto cassa (MOD. E)' con stampa colonna raggruppamento senza costi/ricavi figurativi", report);


	/**
	 *	Test with only previous year amounts
	 */
    banDoc = Banana.application.openDocument("file:script/../test/testcases/11358-entrate-uscite-ets-rendiconto-cassa-forma-aggregata-tutorial.ac2");
	Test.assert(banDoc);

    userParam = {};
	userParam.selectionStartDate = "2026-01-01";
	userParam.selectionEndDate = "2026-12-31";
	userParam.title = "RENDICONTO CASSA AGGREGATO (MOD. E) ANNO 2026";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.column = 'Gr1';
	userParam.printcolumn = true;
	userParam.printcostifigurativi = true;
	userParam.stamparendicontocassaaggregato = true;

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportNormale_Aggregato(banDoc, paramReport, "");
	Test.logger.addReport("Test 'rendiconto cassa (MOD. E)' con stampa colonna raggruppamento senza costi/ricavi figurativi", report);

}
