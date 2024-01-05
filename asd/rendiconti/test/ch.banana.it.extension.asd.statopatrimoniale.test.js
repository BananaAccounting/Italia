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


// @id = ch.banana.it.extension.asd.statopatrimoniale.test
// @api = 1.0
// @pubdate = 2024-01-05
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.it.extension.asd.statopatrimoniale.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.it.extension.asd.statopatrimoniale.js
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

    let banDoc;
    let userParam;
    let paramReport;
    let report;

	/**
	 * Test 1 with all groups balances
	*/

    banDoc = Banana.application.openDocument("file:script/../test/testcases/asd_gestionale_patrimoniale_test.ac2");
	Test.assert(banDoc);

    userParam = {};
  	userParam.selectionStartDate = "2022-01-01";
  	userParam.selectionEndDate = "2022-12-31";
  	userParam.title = "STATO PATRIMONIALE ANNO 2022";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.textbegin = '';
	userParam.column = 'Gr1';
	userParam.printcolumn = false;
	userParam.printpreviousyear = true;
	userParam.compattastampa = false;

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportNormale(banDoc, paramReport, "");
	Test.logger.addReport("Test 1: rendiconto 'Stato Patrimoniale'", report);


	/**
	 * Test 2 without groups balances that can be excluded
	*/
    banDoc = Banana.application.openDocument("file:script/../test/testcases/asd_gestionale_patrimoniale_test.ac2");
	Test.assert(banDoc);

    userParam = {};
  	userParam.selectionStartDate = "2022-01-01";
  	userParam.selectionEndDate = "2022-12-31";
  	userParam.title = "STATO PATRIMONIALE ANNO 2022";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.textbegin = '';
	userParam.column = 'Gr1';
	userParam.printcolumn = false;
	userParam.printpreviousyear = true;
	userParam.compattastampa = true;

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportNormale(banDoc, paramReport, "");
	Test.logger.addReport("Test 2: rendiconto 'Stato Patrimoniale'", report);

	/**
	 * Test 3 using the tutorial template
	*/
    banDoc = Banana.application.openDocument("file:script/../test/testcases/asd_gestionale_patrimoniale_test.ac2");
	Test.assert(banDoc);

    userParam = {};
  	userParam.selectionStartDate = "2020-01-01";
  	userParam.selectionEndDate = "2020-12-31";
  	userParam.title = "STATO PATRIMONIALE ANNO 2020";
	userParam.logo = false;
	userParam.logoname = 'Logo';
	userParam.printheader = false;
	userParam.printtitle = true;
	userParam.title = '';
	userParam.textbegin = '';
	userParam.column = 'Gr1';
	userParam.printcolumn = false;
	userParam.printpreviousyear = true;
	userParam.compattastampa = false;

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportNormale(banDoc, paramReport, "");
	Test.logger.addReport("Test 3: rendiconto 'Stato Patrimoniale (MOD. A)', colonna Gr1", report);

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
	userParam.printpreviousyear = true;
	userParam.compattastampa = false;
	userParam.stampareportcontrollo = true;

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportControllo(banDoc, paramReport);
	
	Test.logger.addReport("Test 4: report di controllo - Stato Patrimoniale", report);


	/**
	 * Test 5: report di controllo con compattastampa
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
	userParam.printpreviousyear = true;
	userParam.compattastampa = true;
	userParam.stampareportcontrollo = true;

    paramReport = setParamReport(banDoc, userParam);
    report = stampaReportControllo(banDoc, paramReport);
	
	Test.logger.addReport("Test 5: report di controllo - Stato Patrimoniale", report);

}

