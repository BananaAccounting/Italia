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


// @id = ch.banana.it.extension.reportraccoltafondi.test
// @api = 1.0
// @pubdate = 2021-03-01
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.it.extension.reportraccoltafondi.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.it.extension.reportraccoltafondi.js
// @timeout = -1



// Register test case to be executed
Test.registerTestCase(new ReportRaccoltaFondiTest());

// Here we define the class, the name of the class is not important
function ReportRaccoltaFondiTest() {

}

// This method will be called at the beginning of the test case
ReportRaccoltaFondiTest.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
ReportRaccoltaFondiTest.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ReportRaccoltaFondiTest.prototype.init = function() {

}

// This method will be called after every test method is executed
ReportRaccoltaFondiTest.prototype.cleanup = function() {

}

// Test contabilità semplice
ReportRaccoltaFondiTest.prototype.testContabilitaSemplice = function() {

	var banDoc = Banana.application.openDocument("file:script/../test/testcases/11094-entrate-uscite-ets-rendiconto-cassa-tutorial.ac2");
	Test.assert(banDoc);

	var segmentList = getSegmentsLvl2(banDoc);

	var userParam = {};
	for (var i = 0; i < segmentList.length; i++) {
		var segment = segmentList[i].account;
		var segDesc = segmentList[i].description;
		userParam[segment+'_descrizione'] = segDesc;
		userParam[segment+'_dataInizio'] = "01.01.2020";
		userParam[segment+'_dataFine'] = "31.12.2020";
		userParam[segment+'_responsabile'] = "Sig. Mario Rossi";
		userParam[segment+'_relazione'] = "Testo raccolta fondi\nsu più righe.\n";
	}

	var report = printReport(banDoc, userParam, segmentList, "");
	Test.logger.addReport("Test report raccolta fondi (contabilità semplice)", report);
}

// Test contabilità doppia
ReportRaccoltaFondiTest.prototype.testContabilitaDoppia = function() {

	var banDoc = Banana.application.openDocument("file:script/../test/testcases/ets_doppia_raccolta_fondi.ac2");
	Test.assert(banDoc);

	var segmentList = getSegmentsLvl2(banDoc);

	var userParam = {};
	for (var i = 0; i < segmentList.length; i++) {
		var segment = segmentList[i].account;
		var segDesc = segmentList[i].description;
		userParam[segment+'_descrizione'] = segDesc;
		userParam[segment+'_dataInizio'] = "01.01.2022";
		userParam[segment+'_dataFine'] = "31.12.2022";
		userParam[segment+'_responsabile'] = "Sig. Mario Rossi";
		userParam[segment+'_relazione'] = "Testo raccolta fondi\nsu più righe.\n";
	}

	var report = printReport(banDoc, userParam, segmentList, "");
	Test.logger.addReport("Test report raccolta fondi (contabilità doppia)", report);
}

