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


// @id = ch.banana.it.efattura.b2b.old.test
// @api = 1.0
// @pubdate = 2019-04-25
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.it.efattura.b2b.old.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @timeout = -1
// @includejs = ../ch.banana.it.efattura.b2b.sbaa/ch.banana.it.efattura.b2b.js


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
   this.fileNameList.push("file:script/../test/testcases/alpha srl 2018.ac2");
   this.fileNameList.push("file:script/../test/testcases/InventatoIVA2018.ac2");
   this.fileNameList.push("file:script/../test/testcases/InventatoIVA2019.ac2");
   this.fileNameList.push("file:script/../test/testcases/IT01641790702_a9Gf1.ac2");
   this.fileNameList.push("file:script/../test/testcases/IT01641790702_a9Gf1_ie.ac2");
   this.fileNameList.push("file:script/../test/testcases/test fatture importo 0.ac2");
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

EFatturaTest.prototype.test2 = function() {
   this.testLogger = Test.logger.newGroupLogger("test2");
   this.testLogger.addKeyValue("EFatturaTest", "test2");
   this.testLogger.addComment("Test ch.banana.it.efattura PARAM2");
   this.printReports(2);
   this.testLogger.close();
   this.testLogger = Test.logger;
}

/*EFatturaTest.prototype.test3 = function() {
   this.testLogger = Test.logger.newGroupLogger("test3");
   this.testLogger.addKeyValue("EFatturaTest", "test3");
   this.testLogger.addComment("Test ch.banana.it.efattura PARAM3");
   this.printReports(3);
   this.testLogger.close();
   this.testLogger = Test.logger;
}*/

EFatturaTest.prototype.getParam1 = function() {
   //Param1
   //Set params (normally are taken from settings)
   var param = {};
   param.periodAll = true;
   param.output = 0; //0=report, 1=xml
   param.selection = 0; //0=singola fattura,1=fatture singolo cliente,2=tutto
   param.selection_customer = ''; //no cliente
   param.selection_invoice = ''; //no fattura
   
   param.xml = {};
   param.xml.progressive = '1';
   param.xml.open_file = false;

   param.report = {};
   param.report.print_header = true;
   param.report.print_logo = true;
   param.report.print_quantity = true;
   param.report.font_family = '';
   param.report.color_1 = '#337ab7';
   param.report.color_2 = '#ffffff';

   return param;
}

EFatturaTest.prototype.getParam2 = function() {
   //Param1
   //Set params (normally are taken from settings)
   var param = {};
   param.periodAll = true;
   param.output = 0; //0=report, 1=xml
   param.selection = 1; //0=singola fattura,1=fatture singolo cliente,2=tutto
   param.selection_customer = ''; //no cliente
   param.selection_invoice = ''; //no fattura
   
   param.xml = {};
   param.xml.progressive = '1';
   param.xml.open_file = false;

   param.report = {};
   param.report.print_header = true;
   param.report.print_logo = true;
   param.report.print_quantity = true;
   param.report.font_family = '';
   param.report.color_1 = '#337ab7';
   param.report.color_2 = '#ffffff';
   
   return param;
}

EFatturaTest.prototype.getParam3 = function() {
   //Param1
   //Set params (normally are taken from settings)
   var param = {};
   param.periodAll = true;
   param.output = 0; //0=report, 1=xml
   param.selection = 2; //0=singola fattura,1=fatture singolo cliente,2=tutto
   param.selection_customer = ''; //no cliente
   param.selection_invoice = ''; //no fattura
   
   param.xml = {};
   param.xml.progressive = '1';
   param.xml.open_file = false;

   param.report = {};
   param.report.print_header = true;
   param.report.print_logo = true;
   param.report.print_quantity = true;
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
         else if (parseInt(idParam) === 2)
            param = this.getParam2();
         else if (parseInt(idParam) === 3)
            param = this.getParam3();
         //imposta anno nei parametri
         //var nAnno = banDocument.info("AccountingDataBase", "ClosureDate");
         //if (nAnno.length >= 10)
         //   param.annoSelezionato = nAnno.substring(0, 4);
         //this.testLogger.addInfo("ANNO", param.annoSelezionato);
         if (parseInt(param.selection) === 0)
            this.printSingleInvoice(fileName, banDocument, param);
         else if (parseInt(param.selection) === 1)
            this.printSingleCustomer(fileName, banDocument, param);
         else if (parseInt(param.selection) === 2)
            this.printAll(fileName, banDocument, param);
      } else {
         this.testLogger.addFatalError("File not found: " + fileName);
      }
      //Banana.console.log(idParam + " " + fileName + " " + banDocument);
      this.testLogger.close();
      this.testLogger = parentLogger;
      if (!this.progressBar.step())
         break;
   }
   this.progressBar.finish();
}

EFatturaTest.prototype.printAll = function(fileName, banDocument, param) {

   var eFattura = new EFattura(banDocument);
   
   eFattura.setParam(param);

   this.testLogger.addInfo("TITLE", "STAMPA DI TUTTO ");
   this.testLogger.addInfo("FILENAME",  fileName.toUpperCase());
   this.testLogger.addComment('************************************************************************');
   this.testLogger.addJson("Param", JSON.stringify(param))

   var jsonCustomerList = eFattura.loadData();

   for (var i in jsonCustomerList) {
      var jsonInvoices = jsonCustomerList[i];

      //xml
      var xmlDocument = Banana.Xml.newDocument("root");
      var output = eFattura.createXml(jsonInvoices, xmlDocument, false);
      //this.xml_validate_test(output, '../Schema_del_file_xml_FatturaPA_versione_1.2.xsd',  "STAMPA DI TUTTO " + fileName.toUpperCase());
      this.testLogger.addComment('************************************************************************');
      this.testLogger.addXml("Xml document", output);

      //report
      for (var j = 0; j < jsonInvoices.length; j++) {
         var report = Banana.Report.newReport('');
         var stylesheet = Banana.Report.newStyleSheet();
         eFattura.createReport(jsonInvoices[j], report, stylesheet);
         this.testLogger.addComment('************************************************************************');
         this.testLogger.addReport("Report", report);
      }
   }
}

EFatturaTest.prototype.printSingleCustomer = function(fileName, banDocument, param) {

   var eFattura = new EFattura(banDocument);
   var customerNumberList = eFattura.getCustomerList();
   
   for (var i=0; i<customerNumberList.length;i++) {
      param.selection = 1;
      param.selection_customer = eFattura.getCustomerId(customerNumberList[i]);
      eFattura.setParam(param);

      this.testLogger.addInfo("TITLE", "STAMPA DI PIÙ FATTURE PER CLIENTE ");
      this.testLogger.addInfo("FILENAME",  fileName.toUpperCase());
      this.testLogger.addInfo("PARAM",  "FATTURE CLIENTE " + param.selection_customer);
      this.testLogger.addComment('************************************************************************');
      this.testLogger.addJson("Param", JSON.stringify(param))

      var jsonCustomerList = eFattura.loadData();

      for (var j in jsonCustomerList) {
         var jsonInvoices = jsonCustomerList[j];

         //xml
         var xmlDocument = Banana.Xml.newDocument("root");
         var output = eFattura.createXml(jsonInvoices, xmlDocument, false);
         //this.xml_validate_test(output, '../Schema_del_file_xml_FatturaPA_versione_1.2.xsd',  "STAMPA DI PIÙ FATTURE " + param.selection_customer + " " + fileName.toUpperCase());
         this.testLogger.addComment('************************************************************************');
         this.testLogger.addXml("Xml document", output);
         
         //report
         for (var k = 0; k < jsonInvoices.length; k++) {
            var report = Banana.Report.newReport('');
            var stylesheet = Banana.Report.newStyleSheet();
            eFattura.createReport(jsonInvoices[k], report, stylesheet);
            this.testLogger.addComment('************************************************************************');
            this.testLogger.addReport("Report", report);
         }
      }
   }
}

EFatturaTest.prototype.printSingleInvoice = function(fileName, banDocument, param) {

   var eFattura = new EFattura(banDocument);
   eFattura.loadData();
   var invoiceList = [];
   if (eFattura.journalInvoices) {
      for (var i = 0; i < eFattura.journalInvoices.rowCount; i++) {
         var tRow = eFattura.journalInvoices.row(i);
         if (tRow.value('ObjectType') === 'InvoiceDocument' && tRow.value('Invoice').length > 0) {
            var invoiceId = tRow.value('Invoice').toString();
            if (invoiceList.indexOf(invoiceId) < 0)
               invoiceList.push(invoiceId);
         }
      }
   }
   
   for (var i=0; i<invoiceList.length;i++) {
      param.selection = 0;
      param.selection_invoice = invoiceList[i];
      eFattura.setParam(param);
      eFattura.clearErrorList();
      
      this.testLogger.addInfo("TITLE", "STAMPA DI UNA SINGOLA FATTURA");
      this.testLogger.addInfo("FILENAME",  fileName.toUpperCase());
      this.testLogger.addInfo("PARAM",  "FATTURA NO " + param.selection_invoice);
      this.testLogger.addComment('************************************************************************');
      this.testLogger.addJson("Param", JSON.stringify(param))

      var jsonCustomerList = eFattura.loadData();

      for (var j in jsonCustomerList) {
         var jsonInvoices = jsonCustomerList[j];

         //xml
         var xmlDocument = Banana.Xml.newDocument("root");
         var output = eFattura.createXml(jsonInvoices, xmlDocument, false);
         //this.xml_validate_test(output, '../Schema_del_file_xml_FatturaPA_versione_1.2.xsd', "STAMPA SINGOLA FATTURA " + param.selection_invoice + " " + fileName.toUpperCase());
         this.testLogger.addComment('************************************************************************');
         this.testLogger.addXml("Xml document", output);

         //report
         for (var k = 0; k < jsonInvoices.length; k++) {
            var report = Banana.Report.newReport('');
            var stylesheet = Banana.Report.newStyleSheet();
            eFattura.createReport(jsonInvoices[k], report, stylesheet);
            this.testLogger.addComment('************************************************************************');
            this.testLogger.addReport("Report", report);
         }
      }
      
      //errors
      for (var j = 0; j < eFattura.errorList.length; j++) {
         Test.logger.addText(fileName.toUpperCase() + " - " + eFattura.errorList[j]);
      }
   }
}

EFatturaTest.prototype.xml_validate_test = function (xml, schemaFileName, key) {
   // Validate against schema (schema is passed as a file path relative to the script)
   Banana.console.debug("---------- STARTING VALIDATING XML FILE--------- " + key);
   if (!Banana.Xml.validate(Banana.Xml.parse(xml), schemaFileName)) {
      Test.logger.addText("Validation result => Xml document is not valid against " + schemaFileName + " (" + key + "): " + Banana.Xml.errorString);
      Banana.console.debug("Validation result => Xml document is not valid against " + schemaFileName + " (" + key + "): " + Banana.Xml.errorString);
   }
   Banana.console.debug("---------- FINISHED VALIDATING XML FILE--------- " + key);
}


