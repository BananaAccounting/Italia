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
// @api = 1.0
// @id = ch.banana.script.italy_vat.report.librogiornale.js
// @description = Libro giornale...
// @doctype = 100.110;110.110;130.110;100.130
// @encoding = utf-8
// @includejs = ch.banana.script.italy_vat_2017.journal.js
// @includejs = ch.banana.script.italy_vat_2017.xml.js
// @inputdatasource = none
// @pubdate = 2018-03-07
// @publisher = Banana.ch SA
// @task = app.command
// @timeout = -1

function exec() {
  if (!Banana.document)
    return "@Cancel";

  var param = {};
  if (inData.length>0) {
    param = JSON.parse(inData);
  }
  else {
    if (!settingsDialog())
      return "@Cancel";
    param = JSON.parse(Banana.document.getScriptSettings());
  }

  var libroGiornale = new LibroGiornale(Banana.document);
  libroGiornale.setParam(param);
  //libroGiornale.loadData();

  var report = Banana.Report.newReport("Libro giornale");
  var stylesheet = Banana.Report.newStyleSheet(); 
  //libroGiornale.printDocument(report, stylesheet);
  Banana.Report.preview(report, stylesheet);

}

function settingsDialog() {
  var libroGiornale = new LibroGiornale(Banana.document);
  var savedParam = Banana.document.getScriptSettings();
  if (savedParam.length > 0) {
    libroGiornale.setParam(JSON.parse(savedParam));
  }
  
  var accountingData = {};
  accountingData = new Utils(Banana.document).readAccountingData(accountingData);
  if (!libroGiornale.param.annoSelezionato || libroGiornale.param.annoSelezionato.length<=0)
    libroGiornale.param.annoSelezionato = accountingData.openingYear;
  
  var dialog = Banana.Ui.createUi("ch.banana.script.italy_vat.report.librogiornale.dialog.ui");
  
  //Lettura dati
  //periodo
  if (libroGiornale.param.periodoSelezionato == 'q')
    dialog.periodoGroupBox.trimestreRadioButton.checked = true;
  else if (libroGiornale.param.periodoSelezionato == 'm')
    dialog.periodoGroupBox.meseRadioButton.checked = true;
  else if (libroGiornale.param.periodoSelezionato == 'c')
    dialog.periodoGroupBox.dataRadioButton.checked = true;
  else
    dialog.periodoGroupBox.annoRadioButton.checked = true;
  dialog.periodoGroupBox.annoLabel.text = libroGiornale.param.annoSelezionato;
  dialog.periodoGroupBox.trimestreComboBox.currentIndex = libroGiornale.param.periodoValoreTrimestre;
  dialog.periodoGroupBox.meseComboBox.currentIndex = libroGiornale.param.periodoValoreMese;
  var fromDate = libroGiornale.param.dataDal;
  var toDate = libroGiornale.param.dataAl;
  if (!fromDate || !toDate) {
      fromDate = Banana.Converter.stringToDate(accountingData.accountingOpeningDate, "YYYY-MM-DD");
      toDate = Banana.Converter.stringToDate(accountingData.accountingClosureDate, "YYYY-MM-DD");
  }
  console.log(fromDate);
  console.log(toDate);
  fromDate = Banana.Converter.toInternalDateFormat(fromDate, "dd/mm/yyyy");
  toDate = Banana.Converter.toInternalDateFormat(toDate, "dd/mm/yyyy");
  console.log(fromDate);
  console.log(toDate);
  dialog.periodoGroupBox.dalDateEdit.setDate(fromDate);
  dialog.periodoGroupBox.alDateEdit.setDate(toDate);
  
  //opzioni
  var index = 0;
  if (libroGiornale.param.colonnaOrdinamento == 'DataDocumento')
    index = 1;
  else if (libroGiornale.param.colonnaOrdinamento == 'DataValuta')
    index = 2;
  dialog.opzioniGroupBox.ordinamentoComboBox.currentIndex = index;
  dialog.opzioniGroupBox.regsitrazioniAperturaCheckBox.checked = libroGiornale.param.aggiungiAperture;

  //Metodi del dialogo
  dialog.checkdata = function () {
    dialog.accept();
  }
  dialog.enableButtons = function () {
    if (dialog.periodoGroupBox.annoRadioButton.checked) {
        dialog.periodoGroupBox.trimestreComboBox.enabled = false;
        dialog.periodoGroupBox.trimestreComboBox.update();
        dialog.periodoGroupBox.meseComboBox.enabled = false;
        dialog.periodoGroupBox.meseComboBox.update();
        dialog.periodoGroupBox.dalDateEdit.enabled = false;
        dialog.periodoGroupBox.dalDateEdit.update();
        dialog.periodoGroupBox.alLabelText.enabled = false;
        dialog.periodoGroupBox.alLabelText.update();
        dialog.periodoGroupBox.alDateEdit.enabled = false;
        dialog.periodoGroupBox.alDateEdit.update();
    }
    else if (dialog.periodoGroupBox.trimestreRadioButton.checked) {
        dialog.periodoGroupBox.trimestreComboBox.enabled = true;
        dialog.periodoGroupBox.trimestreComboBox.update();
        dialog.periodoGroupBox.meseComboBox.enabled = false;
        dialog.periodoGroupBox.meseComboBox.update();
        dialog.periodoGroupBox.dalDateEdit.enabled = false;
        dialog.periodoGroupBox.dalDateEdit.update();
        dialog.periodoGroupBox.alLabelText.enabled = false;
        dialog.periodoGroupBox.alLabelText.update();
        dialog.periodoGroupBox.alDateEdit.enabled = false;
        dialog.periodoGroupBox.alDateEdit.update();
    }
    else if (dialog.periodoGroupBox.meseRadioButton.checked) {
        dialog.periodoGroupBox.trimestreComboBox.enabled = false;
        dialog.periodoGroupBox.trimestreComboBox.update();
        dialog.periodoGroupBox.meseComboBox.enabled = true;
        dialog.periodoGroupBox.meseComboBox.update();
        dialog.periodoGroupBox.dalDateEdit.enabled = false;
        dialog.periodoGroupBox.dalDateEdit.update();
        dialog.periodoGroupBox.alLabelText.enabled = false;
        dialog.periodoGroupBox.alLabelText.update();
        dialog.periodoGroupBox.alDateEdit.enabled = false;
        dialog.periodoGroupBox.alDateEdit.update();
    }
    else if (dialog.periodoGroupBox.dataRadioButton.checked) {
        dialog.periodoGroupBox.trimestreComboBox.enabled = false;
        dialog.periodoGroupBox.trimestreComboBox.update();
        dialog.periodoGroupBox.meseComboBox.enabled = false;
        dialog.periodoGroupBox.meseComboBox.update();
        dialog.periodoGroupBox.dalDateEdit.enabled = true;
        dialog.periodoGroupBox.dalDateEdit.update();
        dialog.periodoGroupBox.alLabelText.enabled = true;
        dialog.periodoGroupBox.alLabelText.update();
        dialog.periodoGroupBox.alDateEdit.enabled = true;
        dialog.periodoGroupBox.alDateEdit.update();
    }
  }
  dialog.showHelp = function () {
    Banana.Ui.showHelp("ch.banana.script.italy_vat_2017");
  }
  dialog.buttonBox.accepted.connect(dialog, dialog.checkdata);
  dialog.buttonBox.helpRequested.connect(dialog, dialog.showHelp);
  dialog.periodoGroupBox.annoRadioButton.clicked.connect(dialog.enableButtons);
  dialog.periodoGroupBox.trimestreRadioButton.clicked.connect(dialog.enableButtons);
  dialog.periodoGroupBox.meseRadioButton.clicked.connect(dialog.enableButtons);
  dialog.periodoGroupBox.dataRadioButton.clicked.connect(dialog.enableButtons);

  //Chiamata del dialogo
  Banana.application.progressBar.pause();
  dialog.enableButtons();
  var dlgResult = dialog.exec();
  Banana.application.progressBar.resume();
  if (dlgResult !== 1)
    return false;

  //Salvataggio dati
  //periodo
  if (dialog.periodoGroupBox.trimestreRadioButton.checked)
    libroGiornale.param.periodoSelezionato = 'q';
  else if (dialog.periodoGroupBox.meseRadioButton.checked)
    libroGiornale.param.periodoSelezionato = 'm';
  else if (dialog.periodoGroupBox.dataRadioButton.checked)
    libroGiornale.param.periodoSelezionato = 'c';
  else
    libroGiornale.param.periodoSelezionato = 'y';
  var index = parseInt(dialog.periodoGroupBox.trimestreComboBox.currentIndex.toString());
  libroGiornale.param.periodoValoreTrimestre = index;
  index = parseInt(dialog.periodoGroupBox.meseComboBox.currentIndex.toString());
  libroGiornale.param.periodoValoreMese = index;
  libroGiornale.param.dataDal = dialog.periodoGroupBox.dalDateEdit.text < 10 ? "0" + dialog.periodoGroupBox.dalDateEdit.text : dialog.periodoGroupBox.dalDateEdit.text;
  libroGiornale.param.dataAl = dialog.periodoGroupBox.alDateEdit.text < 10 ? "0" + dialog.periodoGroupBox.alDateEdit.text : dialog.periodoGroupBox.alDateEdit.text;
  
  //opzioni
  libroGiornale.param.aggiungiAperture = dialog.opzioniGroupBox.regsitrazioniAperturaCheckBox.checked;
  index = parseInt(dialog.opzioniGroupBox.ordinamentoComboBox.currentIndex.toString());
  if (index == 0)
    libroGiornale.param.colonnaOrdinamento = 'Data';
  else if (index == 1)
    libroGiornale.param.colonnaOrdinamento = 'DataDocumento';
  else if (index == 2)
    libroGiornale.param.colonnaOrdinamento = 'DataValuta';

  var paramToString = JSON.stringify(libroGiornale.param);
  Banana.document.setScriptSettings(paramToString);
  return true;
}

function LibroGiornale(banDocument) {
  this.banDocument = banDocument;
  if (this.banDocument === undefined)
    this.banDocument = Banana.document;
  this.initParam();
}


LibroGiornale.prototype.getParam = function() {
  return this.param;
}

LibroGiornale.prototype.initParam = function() {
  this.param = {};
  
  this.param.colonnaOrdinamento = '';
  this.param.aggiungiAperture = false;

  /*periodoSelezionato y=anno, q=trimestre, m=mese, c=personalizzato*/
  this.param.annoSelezionato = '';
  this.param.periodoSelezionato = 'y';
  this.param.periodoValoreMese = '0';
  this.param.periodoValoreTrimestre = '0';
  this.param.periodoValoreDataDal = '';
  this.param.periodoValoreDataAl = '';

}

LibroGiornale.prototype.setParam = function(param) {
  this.param = param;
  this.verifyParam();
}

LibroGiornale.prototype.verifyParam = function() {

  if (!this.param.colonnaOrdinamento)
    this.param.colonnaOrdinamento = '';
  if (!this.param.aggiungiAperture)
    this.param.aggiungiAperture = false;

  if (!this.param.annoSelezionato)
    this.param.annoSelezionato = '';
  if (!this.param.periodoSelezionato)
    this.param.periodoSelezionato = 'y';
  if (!this.param.periodoValoreMese)
    this.param.periodoValoreMese = '0';
  if (!this.param.periodoValoreTrimestre)
    this.param.periodoValoreTrimestre = '0';
  if (!this.param.periodoValoreDataDal)
    this.param.periodoValoreDataDal = '';
  if (!this.param.periodoValoreDataAl)
    this.param.periodoValoreDataAl = '';
}

