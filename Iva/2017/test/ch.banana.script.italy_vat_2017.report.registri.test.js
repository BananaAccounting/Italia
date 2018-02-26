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


// @id = ch.banana.script.italy_vat_2017.registri.test
// @api = 1.0
// @pubdate = 2018-02-23
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.script.italy_vat_2017.registri.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.script.italy_vat_2017.report.registri.js
// @timeout = -1


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
Test.registerTestCase(new RegistriIvaItalia2017());

// Here we define the class, the name of the class is not important
function RegistriIvaItalia2017() {

}

// This method will be called at the beginning of the test case
RegistriIvaItalia2017.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
RegistriIvaItalia2017.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
RegistriIvaItalia2017.prototype.init = function() {

}

// This method will be called after every test method is executed
RegistriIvaItalia2017.prototype.cleanup = function() {

}

RegistriIvaItalia2017.prototype.test1 = function() {
   
  Test.logger.addKeyValue("RegistriIvaItalia2017", "test1");
  Test.logger.addComment("Test ch.banana.script.italy_vat_2017.report.registri");

  var fileName = "file:script/../test/testcases/InventatoIVA2017.ac2";
  var banDocument = Banana.application.openDocument(fileName);
  if (!banDocument) {return;}

  Test.logger.addSection("REGISTRO IVA UNICO - PERIODO: ANNO - " + fileName);
  printRegistri(fileName, banDocument);

}

//Function that creates the report for the test
function printRegistri(fileName, banDocument) {

  //Set params (normally are taken from settings)
  var param = {};
  param.tipoRegistro = "4";
  param.visualizzaDataOra = true;
  param.numerazioneAutomatica = false;
  param.stampaDefinitiva = false;
  param.inizioNumerazionePagine = 1;
  param.testoRegistriComboBoxIndex = 0;
  param.stampaTestoRegistroAcquisti = false;
  param.stampaTestoRegistroVendite = false;
  param.stampaTestoRegistroCorrispettivi = false;
  param.stampaOrizzontale = false;
  param.testoRegistroAcquisti = "";
  param.testoRegistroVendite = "";
  param.testoRegistroCorrispettivi = "";
  param.annoSelezionato = "2017";
  param.periodoSelezionato = "y";
  param.periodoValoreMese = "";
  param.periodoValoreTrimestre = "1";
  param.periodoValoreSemestre = "0";
  param.colonnaProtocollo = "DocProtocol";
  param.print_header = true;
  param.print_paymentslip = true;
  
  var registri = new Registri(banDocument);
  registri.setParam(param);
  registri.loadData();
  
  var report = Banana.Report.newReport("Registri IVA");
  var stylesheet = Banana.Report.newStyleSheet();
  registri.printDocument(report, stylesheet);  
  
  Test.logger.addReport(fileName, report);
  
}
