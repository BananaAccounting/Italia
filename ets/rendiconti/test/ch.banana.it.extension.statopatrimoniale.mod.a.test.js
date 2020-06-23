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


// @id = ch.banana.it.extension.statopatrimoniale.mod.a.test
// @api = 1.0
// @pubdate = 2020-06-23
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

	var banDoc = Banana.application.openDocument("file:script/../test/testcases/11064-doppia-ets-rendiconto-gestionale.ac2");
	Test.assert(banDoc);

	var userParam = {};
  	userParam.selectionStartDate = "2022-01-01";
  	userParam.selectionEndDate = "2022-12-31";
  	userParam.title = "STATO PATRIMONIALE (MOD. A) ANNO 2022";

	// loadParam(banDoc);
	// loadForm(banDoc);
	// loadBalances(banDoc);
	// preProcess(banDoc);
	// calcTotals(["amount"]);
	// formatValues(["amount"]);

	var report = printRendicontoModA(banDoc, userParam);
	Test.logger.addReport("Test rendiconto 'Stato Patrimoniale (MOD. A)'", report);
}
