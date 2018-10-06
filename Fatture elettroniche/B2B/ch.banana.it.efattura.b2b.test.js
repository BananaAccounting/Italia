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


// @id = ch.banana.it.efattura.b2b.test
// @api = 1.0
// @pubdate = 2018-10-06
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.it.efattura.b2b.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @timeout = -1
// @includejs = ch.banana.it.efattura.b2b.js


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
Test.registerTestCase(new EFatturaTest());

// Here we define the class, the name of the class is not important
function EFatturaTest() {

}

// This method will be called at the beginning of the test case
EFatturaTest.prototype.initTestCase = function() {
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
EFatturaTest.prototype.init = function() {

}

// This method will be called after every test method is executed
EFatturaTest.prototype.cleanup = function() {

}

EFatturaTest.prototype.test1 = function() {
   this.testLogger = Test.logger.newGroupLogger("test1");
   this.testLogger.addKeyValue("EFatturaTest", "test1");
   this.testLogger.addComment("Test ch.banana.it.efattura PARAM1");
   this.printReports(1);
   this.testLogger.close();
   this.testLogger = Test.logger;
}

EFatturaTest.prototype.getParam1 = function() {
   //Param1
   //Set params (normally are taken from settings)
   var param = {};
   param.periodAll = true;
   param.output = 0; //0=report, 1=xml
   param.selection = 0; //0=singola fattura,1=fatture cliente
   param.selection_customer = ''; //no cliente
   param.selection_invoice = ''; //no fattura
   
   param.xml = {};
   param.xml.progressive = '1';
   param.xml.open_file = false;

   param.report = {};
   param.report.print_header = true;
   param.report.print_logo = true;
   param.report.font_family = '';
   param.report.color_1 = '#337ab7';
   param.report.color_2 = '#ffffff';

   return param;
}

EFatturaTest.prototype.printReports = function(idParam) {
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
         //var nAnno = banDocument.info("AccountingDataBase", "ClosureDate");
         //if (nAnno.length >= 10)
         //   param.annoSelezionato = nAnno.substring(0, 4);
         //this.testLogger.addInfo("ANNO", param.annoSelezionato);
         this.testLogger.addInfo("FILENAME",  fileName.toUpperCase());
         if (param.selection == 0)
            this.printSingleInvoice(fileName, banDocument, param);
         else if (param.selection == 1)
            this.printInvoices(fileName, banDocument, param);
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

EFatturaTest.prototype.printInvoices = function(fileName, banDocument, param) {

   var eFattura = new EFattura(banDocument);
   var customerNumberList = eFattura.getCustomerList();
   for (var i=0; i<customerNumberList.length;i++) {
      param.selection = 1;
      param.selection_customer = customerNumberList[i];
      eFattura.setParam(param);

      this.testLogger.addComment('************************************************************************');
      this.testLogger.addJson("Param", JSON.stringify(param))

      var jsonInvoiceList = eFattura.loadData();

      //report
      for (var j = 0; j < jsonInvoiceList.length; j++) {
         var jsonInvoice = jsonInvoiceList[j];
         var report = Banana.Report.newReport('');
         var stylesheet = Banana.Report.newStyleSheet();
         eFattura.createReport(jsonInvoice, report, stylesheet);
         this.testLogger.addComment('************************************************************************');
         this.testLogger.addReport("Report", report);
      }

      //xml
      var xmlDocument = Banana.Xml.newDocument("root");
      var nodeRoot = null;
      if (jsonInvoiceList.length>0)
         nodeRoot = eFattura.createXmlHeader(jsonInvoiceList[0], xmlDocument);
      for (var j = 0; j < jsonInvoiceList.length; j++) {
         eFattura.createXmlBody(jsonInvoiceList[j], nodeRoot);
      }
      this.testLogger.addComment('************************************************************************');
      this.testLogger.addXml("Xml document", Banana.Xml.save(xmlDocument, true));
   }
}

EFatturaTest.prototype.printSingleInvoice = function(fileName, banDocument, param) {
   var eFattura = new EFattura(banDocument);
   var invoiceNumberList = eFattura.getInvoiceList();
   for (var i=0; i<invoiceNumberList.length;i++) {
      param.selection = 0;
      param.selection_invoice = invoiceNumberList[i];
      eFattura.setParam(param);

      this.testLogger.addComment('************************************************************************');
      this.testLogger.addJson("Param", JSON.stringify(param))

      var jsonInvoiceList = eFattura.loadData();

      //report
      for (var j = 0; j < jsonInvoiceList.length; j++) {
         var jsonInvoice = jsonInvoiceList[j];
         var report = Banana.Report.newReport('');
         var stylesheet = Banana.Report.newStyleSheet();
         eFattura.createReport(jsonInvoice, report, stylesheet);
         this.testLogger.addComment('************************************************************************');
         this.testLogger.addReport("Report", report);
      }
      
      //xml
      var xmlDocument = Banana.Xml.newDocument("root");
      var nodeRoot = null;
      if (jsonInvoiceList.length>0)
         nodeRoot = eFattura.createXmlHeader(jsonInvoiceList[0], xmlDocument);
      for (var j = 0; j < jsonInvoiceList.length; j++) {
         eFattura.createXmlBody(jsonInvoiceList[j], nodeRoot);
      }
      this.testLogger.addComment('************************************************************************');
      this.testLogger.addXml("Xml document", Banana.Xml.save(xmlDocument, true));
      
   }
}

