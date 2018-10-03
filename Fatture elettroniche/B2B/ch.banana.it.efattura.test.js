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


// @id = ch.banana.it.efattura.test
// @api = 1.0
// @pubdate = 2018-10-03
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.it.efattura.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @timeout = -1
// @includejs = ch.banana.it.efattura.js


/*

  SUMMARY
  -------
  Javascript test
  1. Open the .ac2 file
  2. Execute the .js script
  3. Save the report



  virtual void addTestBegin(const QString& key, const QString& comment = QString());
  virtual void addTestEnd();

  virtual void addSection(const QString& key);
  virtual void addSubSection(const QString& key);
  virtual void addSubSubSection(const QString& key);

  virtual void addComment(const QString& comment);
  virtual void addInfo(const QString& key, const QString& value1, const QString& value2 = QString(), const QString& value3 = QString());
  virtual void addFatalError(const QString& error);
  virtual void addKeyValue(const QString& key, const QString& value, const QString& comment = QString());
  virtual void addReport(const QString& key, QJSValue report, const QString& comment = QString());
  virtual void addTable(const QString& key, QJSValue table, QStringList colXmlNames = QStringList(), const QString& comment = QString());

**/

// Register test case to be executed
Test.registerTestCase(new EFattura());

// Here we define the class, the name of the class is not important
function EFattura() {

}

// This method will be called at the beginning of the test case
EFattura.prototype.initTestCase = function() {
   this.testLogger = Test.logger;
   this.progressBar = Banana.application.progressBar;

   this.fileNameList = [];
   //this.fileNameList.push("file:script/../test/testcases/2016 cibu.ac2");
   this.fileNameList.push("file:script/alpha srl 2018.ac2");
}

// This method will be called at the end of the test case
EFattura.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
EFattura.prototype.init = function() {

}

// This method will be called after every test method is executed
EFattura.prototype.cleanup = function() {

}

EFattura.prototype.test1 = function() {
   this.testLogger = Test.logger.newGroupLogger("test1");
   this.testLogger.addKeyValue("EFattura", "test1");
   this.testLogger.addComment("Test ch.banana.it.efattura PARAM1");
   this.printReports(1);
   this.testLogger.close();
   this.testLogger = Test.logger;
}

EFattura.prototype.getParam1 = function() {
   //Param1
   //Set params (normally are taken from settings)
   var param = {};
   /*output 0=pdf, 1=xml*/
   param.output = 0;
   /*selection 0=fattura singola, 1=fatture cliente*/
   param.selection = 0;
   /*invoice number*/
   param.selection_invoice = '';
   /*customer number*/
   param.selection_customer = '';
   
   param.xml = {};
   param.xml.progressive = '999';
   param.xml.open_file = false;

   param.pdf = {};
   param.pdf.print_header = true;
   param.pdf.print_logo = true;
   param.pdf.font_family = '';
   param.pdf.color_1 = '#337ab7';
   param.pdf.color_2 = '#ffffff';
  
   return param;
}

EFattura.prototype.printReports = function(idParam) {
   var parentLogger = this.testLogger;
   this.progressBar.start(this.fileNameList.length);
   for (var i = 0; i < this.fileNameList.length; i++) {
      var fileName = this.fileNameList[i];
      this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileName));
      var banDocument = Banana.application.openDocument(fileName);
      if (banDocument) {
         var param = {};
         if (parseInt(idParam) === 1)
            param = this.getParam1();
         //imposta anno nei parametri
         var nAnno = banDocument.info("AccountingDataBase", "ClosureDate");
         if (nAnno.length >= 10)
            param.annoSelezionato = nAnno.substring(0, 4);
         this.testLogger.addInfo("ANNO", param.annoSelezionato);
         this.testLogger.addInfo("PARAM", param.title);
         this.testLogger.addInfo("FILENAME",  fileName.toUpperCase());
         console.log(idParam + "PARAM: " + JSON.stringify(param));
         this.printReport(fileName, banDocument, param);
      } else {
         this.testLogger.addFatalError("File not found: " + fileName);
      }
      console.log(idParam + " " + fileName + " " + banDocument);
      this.testLogger.close();
      this.testLogger = parentLogger;
      if (!this.progressBar.step())
         break;
   }
   this.progressBar.finish();
}

//Function that creates the report for the test
EFattura.prototype.printReport = function(fileName, banDocument, param) {

   //stampa anteprima di controllo
   var efattura = new EFattura(banDocument);
   //efattura.setParam(param);
   //efattura.loadData();
   var paramString = JSON.stringify(param);

   //param
   this.testLogger.addComment('************************************************************************');
   this.testLogger.addJson("Param", paramString)

   //report
   var report = Banana.Report.newReport();
   var stylesheet = Banana.Report.newStyleSheet();
   efattura.createReport(report, stylesheet, jsonInvoice, param);
   this.testLogger.addComment('************************************************************************');
   this.testLogger.addReport("Report", report);

   //stampa file xml
   var output = efattura.createXmlInstance();
   this.testLogger.addComment('************************************************************************');
   this.testLogger.addXml("Xml output", output);

}
