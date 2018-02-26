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


// @id = ch.banana.script.italy_vat_2017.liquidazione.test
// @api = 1.0
// @pubdate = 2018-02-23
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.script.italy_vat_2017.liquidazione.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.script.italy_vat_2017.report.liquidazione.js
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
Test.registerTestCase(new LiquidazioneIvaItalia2017());

// Here we define the class, the name of the class is not important
function LiquidazioneIvaItalia2017() {

}

// This method will be called at the beginning of the test case
LiquidazioneIvaItalia2017.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
LiquidazioneIvaItalia2017.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
LiquidazioneIvaItalia2017.prototype.init = function() {

}

// This method will be called after every test method is executed
LiquidazioneIvaItalia2017.prototype.cleanup = function() {

}

LiquidazioneIvaItalia2017.prototype.test1 = function() {
  Test.logger.addKeyValue("LiquidazioneIvaItalia2017", "test1");
  Test.logger.addComment("Test ch.banana.script.italy_vat_2017.report.liquidazione");

  var fileName = "file:script/../test/testcases/InventatoIVA2017.ac2";
  var banDocument = Banana.application.openDocument(fileName);
  if (!banDocument) {return;}

  Test.logger.addSection("COMUNICAZIONE PERIODICA IVA - " + fileName.toUpperCase());
  printReport(fileName, banDocument);
}

//Function that creates the report for the test
function printReport(fileName, banDocument) {
  var param = {};
  param.comunicazioneProgressivo = "00001";
  param.comunicazioneCFDichiarante = "";
  param.comunicazioneCodiceCaricaDichiarante = "0";
  param.comunicazioneCFIntermediario = "";
  param.comunicazioneImpegno = "0";
  param.comunicazioneImpegnoData = "2017-09-21";
  param.comunicazioneFirmaDichiarazione = true;
  param.comunicazioneFirmaIntermediario = true;
  param.comunicazioneUltimoMese = "0";
  param.periodoSelezionato = "y";
  param.periodoValoreMese = "0";
  param.periodoValoreTrimestre = "3";
  param.outputScript = 0;
  param.annoSelezionato = "2017";
  param.periodoValoreSemestre = "";
  
  var paramString = fileName.toUpperCase() + " PARAM: " + JSON.stringify(param);
  var report = Banana.Report.newReport("Liquidazione periodica IVA");
  var stylesheet = Banana.Report.newStyleSheet();

  //stampa anteprima di controllo
  var liquidazionePeriodica = new LiquidazionePeriodica(banDocument);
  liquidazionePeriodica.setParam(param);
  liquidazionePeriodica.loadData();
  report.addParagraph(paramString);
  report.addParagraph(fileName.toUpperCase() + " OUTPUT: ANTEPRIMA DI CONTROLLO");
  liquidazionePeriodica.printDocument(report, stylesheet);

  //stampa file xml
  var output = liquidazionePeriodica.createInstance();
  output = formatXml(output);
  report.addParagraph(paramString);
  report.addParagraph(fileName.toUpperCase() + " OUTPUT: XML");
  report.addParagraph(output);

  Test.logger.addReport(fileName, report);
}
