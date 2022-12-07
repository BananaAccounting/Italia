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


// @id = ch.banana.it.efattura.b2b.test
// @api = 1.0
// @pubdate = 2021-02-09
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.it.efattura.b2b.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @timeout = -1
// @includejs = ../ch.banana.it.efattura.b2b.js


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
   this.fileNameList.push("file:script/../test/testcases/alpha srl 2021.ac2");
   this.fileNameList.push("file:script/../test/testcases/InventatoIVA2020.ac2");
   this.fileNameList.push("file:script/../test/testcases/InventatoIVA2021.ac2");
   this.fileNameList.push("file:script/../test/testcases/IT01641790702_a9Gf1.ac2");
   this.fileNameList.push("file:script/../test/testcases/IT01641790702_a9Gf1_ie.ac2");
   this.fileNameList.push("file:script/../test/testcases/reverse charge.ac2");
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

/*EFatturaTest.prototype.test2 = function() {
   this.testLogger = Test.logger.newGroupLogger("test2");
   this.testLogger.addKeyValue("EFatturaTest", "test2");
   this.testLogger.addComment("Test ch.banana.it.efattura PARAM2");
   this.printReports(2);
   this.testLogger.close();
   this.testLogger = Test.logger;
}*/

EFatturaTest.prototype.getParam1 = function() {
   //Param1
   //Set params (normally are taken from settings)
   var param = {};
   param.period = false;
   param.periodStartDate = '';
   param.periodEndDate = '';
   param.selection = false;
   param.selection_customer = '';
   param.selection_invoice = '';
   
   param.contribuente = {};
   param.contribuente.tipoContribuente = 'persona fisica';
   param.contribuente.codiceFiscale = 'SLTSFN72M13B950Y';
   param.contribuente.partitaIva = '01433000500';
   param.contribuente.societa = '';
   param.contribuente.cognome = 'CLIENTE';
   param.contribuente.nome = 'INVENTATO';
   param.contribuente.indirizzo = 'Via delle Libertà';
   param.contribuente.ncivico = '84';
   param.contribuente.cap = '56023';
   param.contribuente.comune = 'ZAMBRA DI CASCINA PI';
   param.contribuente.provincia = 'PI';
   param.contribuente.nazione = 'IT';
   param.contribuente.tipoRegimeFiscale = 'RF01';

   param.xml = {};
   param.xml.progressive = '1';
   param.xml.open_file = false;
   param.xml.xslt_filename = 'fatturaPA_v1.2.1.xsl';
   param.xml.xsd_filename = 'Schema_del_file_xml_FatturaPA_versione_1.2.1.xsd';

   return param;
}

EFatturaTest.prototype.getParam2 = function() {
   //Param1
   //Set params (normally are taken from settings)
   var param = {};
   param.period = false;
   param.periodStartDate = '';
   param.periodEndDate = '';
   param.selection = false;
   param.selection_customer = '';
   param.selection_invoice = '';

   param.contribuente = {};
   param.contribuente.tipoContribuente = 'persona giuridica';
   param.contribuente.codiceFiscale = 'SLTSFN72M13B950Y';
   param.contribuente.partitaIva = '01433000500';
   param.contribuente.societa = 'CLIENTE INVENTATO';
   param.contribuente.cognome = '';
   param.contribuente.nome = '';
   param.contribuente.indirizzo = 'Via delle Libertà';
   param.contribuente.ncivico = '84';
   param.contribuente.cap = '56023';
   param.contribuente.comune = 'ZAMBRA DI CASCINA PI';
   param.contribuente.provincia = 'PI';
   param.contribuente.nazione = 'IT';
   param.contribuente.tipoRegimeFiscale = 'RF01';
   
   param.xml = {};
   param.xml.progressive = '1';
   param.xml.open_file = false;
   param.xml.xslt_filename = '';
   param.xml.xsd_filename = 'testcases/Schema_del_file_xml_FatturaPA_versione_1.2.1.xsd';

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
         //imposta anno nei parametri
         //var nAnno = banDocument.info("AccountingDataBase", "ClosureDate");
         //if (nAnno.length >= 10)
         //   param.annoSelezionato = nAnno.substring(0, 4);
         //this.testLogger.addInfo("ANNO", param.annoSelezionato);
         this.outputXml(fileName, banDocument, param);
      } else {
         this.testLogger.addFatalError("File not found: " + fileName);
      }
      this.testLogger.close();
      this.testLogger = parentLogger;
      if (!this.progressBar.step())
         break;
   }
   this.progressBar.finish();
}

EFatturaTest.prototype.outputXml = function(fileName, banDocument, param) {

   var eFattura = new EFattura(banDocument);
   
   eFattura.setParam(param);

   this.testLogger.addComment('************************************************************************');
   this.testLogger.addInfo("TITLE", "OUTPUT XML");
   this.testLogger.addInfo("FILENAME",  fileName.toUpperCase());
   // this.testLogger.addJson("Param", JSON.stringify(param))

   var jsonCustomerList = eFattura.loadData();

   for (var i in jsonCustomerList) {
      var jsonInvoices = jsonCustomerList[i];

      //xml
      var xmlDocument = Banana.Xml.newDocument("root");
      var output = eFattura.createXml(jsonInvoices, xmlDocument, false);
      if (param.xml.xsd_filename) {
         this.xml_validate_test(output, param.xml.xsd_filename, "SCHEMA VALIDATION FOR" + fileName.toUpperCase());
      }
      this.testLogger.addComment('************************************************************************');
      this.testLogger.addXml("Xml document", output);
   }
}

EFatturaTest.prototype.xml_validate_test = function (xml, schemaFileName, key) {
   // Validate against schema (schema is passed as a file path relative to the script)
   if (!Banana.Xml.validate(Banana.Xml.parse(xml), schemaFileName)) {
      this.testLogger.addComment('************************************************************************');
      this.testLogger.addComment(key);
      this.testLogger.addComment('************************************************************************');
      this.testLogger.addText("Validation result => Xml document is not valid against " + schemaFileName + Banana.Xml.errorString);
   }
}


