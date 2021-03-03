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


// @id = ch.banana.it.extension.reportcinquepermille.test
// @api = 1.0
// @pubdate = 2021-02-28
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.it.extension.reportcinquepermille.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.it.extension.reportcinquepermille.js
// @timeout = -1



// Register test case to be executed
Test.registerTestCase(new Rendiconto5XMilleTest());

// Here we define the class, the name of the class is not important
function Rendiconto5XMilleTest() {

}

// This method will be called at the beginning of the test case
Rendiconto5XMilleTest.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
Rendiconto5XMilleTest.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
Rendiconto5XMilleTest.prototype.init = function() {

}

// This method will be called after every test method is executed
Rendiconto5XMilleTest.prototype.cleanup = function() {

}

// Test#1: contabilità semplice, anno corrente
Rendiconto5XMilleTest.prototype.testContabilitaSemplice_AnnoCorrente = function() {

	var banDoc = Banana.application.openDocument("file:script/../test/testcases/2022-contabilita-entrate-uscite.ac2");
	Test.assert(banDoc);

	var fileLastYear = Banana.application.openDocument("file:script/../test/testcases/2021-contabilita-entrate-uscite.ac2");
	Test.assert(fileLastYear);

	var userParam = {};
	userParam.scopoAttivita = "Sostenere e qualificare l'attività di volontariato";
	userParam.rappresentanteLegale = "Sig. Mario Rossi";
	userParam.cfRappresentanteLegale = "123456789";
	userParam.dataPercezione = "31.12.2022";
	userParam.colonnaRaggruppamento = "Gr1";
	userParam.fileAnnoPrecedente = false;
	userParam.segment5XM = ":5X2022";

	let reportGroups = loadReportGroups();
	
	let accountsMap = {};
	loadAccountsMap(banDoc, userParam, accountsMap);
	if (fileLastYear) {
		loadAccountsMap(fileLastYear, userParam, accountsMap);
	}

	var report = printReport(banDoc, fileLastYear, userParam, reportGroups, accountsMap);
	Test.logger.addReport("Test report 5 per mille - contabilità entrate/uscite - 5X2022 anno corrente", report);
}

// Test#2: contabilità semplice, anno precedente
Rendiconto5XMilleTest.prototype.testContabilitaSemplice_AnnoPrecedente = function() {

	var banDoc = Banana.application.openDocument("file:script/../test/testcases/2022-contabilita-entrate-uscite.ac2");
	Test.assert(banDoc);

	var fileLastYear = Banana.application.openDocument("file:script/../test/testcases/2021-contabilita-entrate-uscite.ac2");
	Test.assert(fileLastYear);

	var userParam = {};
	userParam.scopoAttivita = "Sostenere e qualificare l'attività di volontariato";
	userParam.rappresentanteLegale = "Sig. Mario Rossi";
	userParam.cfRappresentanteLegale = "123456789";
	userParam.dataPercezione = "31.12.2022";
	userParam.colonnaRaggruppamento = "Gr1";
	userParam.fileAnnoPrecedente = true;
	userParam.segment5XM = ":5X2021";

	let reportGroups = loadReportGroups();
	
	let accountsMap = {};
	loadAccountsMap(banDoc, userParam, accountsMap);
	if (fileLastYear) {
		loadAccountsMap(fileLastYear, userParam, accountsMap);
	}

	var report = printReport(banDoc, fileLastYear, userParam, reportGroups, accountsMap);
	Test.logger.addReport("Test report 5 per mille - contabilità entrate/uscite - 5X2021 anno precedente", report);
}

// Test#3: contabilità doppia, anno corrente
Rendiconto5XMilleTest.prototype.testContabilitaDoppia_AnnoCorrente = function() {

	var banDoc = Banana.application.openDocument("file:script/../test/testcases/2022-contabilita-doppia.ac2");
	Test.assert(banDoc);

	var fileLastYear = Banana.application.openDocument("file:script/../test/testcases/2021-contabilita-doppia.ac2");
	Test.assert(fileLastYear);

	var userParam = {};
	userParam.scopoAttivita = "Sostenere e qualificare l'attività di volontariato";
	userParam.rappresentanteLegale = "Sig. Mario Rossi";
	userParam.cfRappresentanteLegale = "123456789";
	userParam.dataPercezione = "31.12.2022";
	userParam.colonnaRaggruppamento = "Gr1";
	userParam.fileAnnoPrecedente = false;
	userParam.segment5XM = ":5X2022";

	let reportGroups = loadReportGroups();
	
	let accountsMap = {};
	loadAccountsMap(banDoc, userParam, accountsMap);
	if (fileLastYear) {
		loadAccountsMap(fileLastYear, userParam, accountsMap);
	}

	var report = printReport(banDoc, fileLastYear, userParam, reportGroups, accountsMap);
	Test.logger.addReport("Test report 5 per mille - contabilità doppia - 5X2022 anno corrente", report);
}

// Test#4: contabilità doppia, anno precedente
Rendiconto5XMilleTest.prototype.testContabilitaDoppia_AnnoPrecedente = function() {

	var banDoc = Banana.application.openDocument("file:script/../test/testcases/2022-contabilita-doppia.ac2");
	Test.assert(banDoc);

	var fileLastYear = Banana.application.openDocument("file:script/../test/testcases/2021-contabilita-doppia.ac2");
	Test.assert(fileLastYear);

	var userParam = {};
	userParam.scopoAttivita = "Sostenere e qualificare l'attività di volontariato";
	userParam.rappresentanteLegale = "Sig. Mario Rossi";
	userParam.cfRappresentanteLegale = "123456789";
	userParam.dataPercezione = "31.12.2022";
	userParam.colonnaRaggruppamento = "Gr1";
	userParam.fileAnnoPrecedente = true;
	userParam.segment5XM = ":5X2021";

	let reportGroups = loadReportGroups();
	
	let accountsMap = {};
	loadAccountsMap(banDoc, userParam, accountsMap);
	if (fileLastYear) {
		loadAccountsMap(fileLastYear, userParam, accountsMap);
	}

	var report = printReport(banDoc, fileLastYear, userParam, reportGroups, accountsMap);
	Test.logger.addReport("Test report 5 per mille - contabilità doppia - 5X2022 anno precedente", report);
}

