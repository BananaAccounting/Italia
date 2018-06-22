// Copyright [2018] [Banana.ch SA - Lugano Switzerland]
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


// @id = report_raccolta_fondi.test
// @api = 1.0
// @pubdate = 2018-06-22
// @publisher = Banana.ch SA
// @description = <TEST report_raccolta_fondi.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../report_raccolta_fondi.js
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

//Test contabilità semplice
ReportRaccoltaFondiTest.prototype.testBananaAppSemplice = function() {

	var banDoc = Banana.application.openDocument("file:script/../test/testcases/semplice_aps.ac2");
	Test.assert(banDoc);

	var report = printReport(banDoc);
	Test.logger.addReport("Test report raccolta fondi (contabilità semplice)", report);

}

//Test contabilità doppia
ReportRaccoltaFondiTest.prototype.testBananaAppDoppia = function() {

	var banDoc = Banana.application.openDocument("file:script/../test/testcases/doppia_aps.ac2");
	Test.assert(banDoc);

	var report = printReport(banDoc);
	Test.logger.addReport("Test report raccolta fondi (contabilità doppia)", report);

}



