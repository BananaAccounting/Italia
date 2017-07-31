// Copyright [2017] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.script.italy_vat_2017.report.registri.js
// @description = IVA Italia 2017: Registri IVA...
// @doctype = *;110
// @encoding = utf-8
// @includejs = ch.banana.script.italy_vat_2017.errors.js
// @includejs = ch.banana.script.italy_vat_2017.journal.js
// @includejs = ch.banana.script.italy_vat_2017.xml.js
// @inputdatasource = none
// @pubdate = 2017-07-31
// @publisher = Banana.ch SA
// @task = app.command
// @timeout = -1

var debug = true;

/*
 * Update script's parameters
*/
function settingsDialog() {

  var param = initParam();
  var savedParam = Banana.document.getScriptSettings();
  if (savedParam.length > 0) {
    param = JSON.parse(savedParam);
  }
  param = verifyParam(param);
  
  var accountingData = {};
  accountingData = readAccountingData(accountingData);
  if (accountingData.accountingYear.length<=0) {
    return false;
  }
  
  var dialog = Banana.Ui.createUi("ch.banana.script.italy_vat_2017.report.registri.dialog.ui");
  //Groupbox periodo
  var meseRadioButton = dialog.tabWidget.findChild('meseRadioButton');
  var trimestreRadioButton = dialog.tabWidget.findChild('trimestreRadioButton');
  var annoRadioButton = dialog.tabWidget.findChild('annoRadioButton');
  var trimestreComboBox = dialog.tabWidget.findChild('trimestreComboBox');
  var meseComboBox = dialog.tabWidget.findChild('meseComboBox');
  if (param.periodoSelezionato == 1 && trimestreRadioButton)
    trimestreRadioButton.checked = true;
  else if (param.periodoSelezionato == 2 && annoRadioButton)
    annoRadioButton.checked = true;
  else if (meseRadioButton)
    meseRadioButton.checked = true;
  if (meseComboBox)
    meseComboBox.currentIndex = param.periodoValoreMese;
  if (trimestreComboBox)
    trimestreComboBox.currentIndex = param.periodoValoreTrimestre;
  //Tipo registro
  var tipoRegistroComboBox = dialog.tabWidget.findChild('tipoRegistroComboBox');
  if (tipoRegistroComboBox)
    tipoRegistroComboBox.currentIndex = param.tipoRegistro;
  //Opzioni
  var visualizzaDataOraCheckBox = dialog.tabWidget.findChild('visualizzaDataOraCheckBox');
  if (visualizzaDataOraCheckBox)
    visualizzaDataOraCheckBox.checked = param.visualizzaDataOra;
  var numerazioneAutomaticaCheckBox = dialog.tabWidget.findChild('numerazioneAutomaticaCheckBox');
  if (numerazioneAutomaticaCheckBox)
    numerazioneAutomaticaCheckBox.checked = param.numerazioneAutomatica;
  var stampaDefinitivaCheckBox = dialog.tabWidget.findChild('stampaDefinitivaCheckBox');
  if (stampaDefinitivaCheckBox)
    stampaDefinitivaCheckBox.checked = param.stampaDefinitiva;
  var inizioNumerazionePagineSpinBox = dialog.tabWidget.findChild('inizioNumerazionePagineSpinBox');
  if (inizioNumerazionePagineSpinBox) {
    if (param.inizioNumerazionePagine.length>0)
      inizioNumerazionePagineSpinBox.value = parseInt(param.inizioNumerazionePagine);
    else  
      inizioNumerazionePagineSpinBox.value = 1;
  }
  //Testi
  var testoRegistriComboBox = dialog.tabWidget.findChild('testoRegistriComboBox');
  var testoGroupBox = dialog.tabWidget.findChild('testoGroupBox');
  var testoLineEdit = dialog.tabWidget.findChild('testoLineEdit');
  var tempStampaTestoRegistroAcquisti = param.stampaTestoRegistroAcquisti;
  var tempStampaTestoRegistroVendite = param.stampaTestoRegistroVendite;
  var tempStampaTestoRegistroCorrispettivi = param.stampaTestoRegistroCorrispettivi;
  var tempTestoRegistroAcquisti = param.testoRegistroAcquisti;
  var tempTestoRegistroVendite = param.testoRegistroVendite;
  var tempTestoRegistroCorrispettivi = param.testoRegistroCorrispettivi;
  var tempTestoRegistriCurrentIndex = param.testoRegistriComboBoxIndex;
  if (testoRegistriComboBox)
    testoRegistriComboBox.currentIndex = param.testoRegistriComboBoxIndex;
  if (testoGroupBox && param.testoRegistriComboBoxIndex == 0) {
    testoGroupBox.checked = tempStampaTestoRegistroAcquisti;
    testoLineEdit.setText(tempTestoRegistroAcquisti);
  }
  else if (testoGroupBox && param.testoRegistriComboBoxIndex == 1) {
    testoGroupBox.checked = tempStampaTestoRegistroVendite;
    testoLineEdit.setText(tempTestoRegistroVendite);
  }
  else if (testoGroupBox && param.testoRegistriComboBoxIndex == 2) {
    testoGroupBox.checked = tempStampaTestoRegistroCorrispettivi;
    testoLineEdit.setText(tempTestoRegistroCorrispettivi);
  }
  
  //dialog functions
  dialog.checkdata = function () {
    dialog.accept();
  }
  dialog.enableButtons = function () {
    if (meseRadioButton && meseRadioButton.checked) {
        meseComboBox.enabled = true;
        trimestreComboBox.enabled = false;
    }
    else if (trimestreRadioButton &&trimestreRadioButton.checked) {
        meseComboBox.enabled = false;
        trimestreComboBox.enabled = true;
    }
    else {
        meseComboBox.enabled = false;
        trimestreComboBox.enabled = false;
    }
    //Testi
    if (tempTestoRegistriCurrentIndex == '0') {
      tempStampaTestoRegistroAcquisti = testoGroupBox.checked;
      if (tempStampaTestoRegistroAcquisti)
        tempTestoRegistroAcquisti = testoLineEdit.plainText;
    }
    else if (tempTestoRegistriCurrentIndex == '1') {
      tempStampaTestoRegistroVendite = testoGroupBox.checked;
      if (tempStampaTestoRegistroVendite)
        tempTestoRegistroVendite = testoLineEdit.plainText;
    }
    else if (tempTestoRegistriCurrentIndex == '2') {
      tempStampaTestoRegistroCorrispettivi = testoGroupBox.checked;
      if (tempTestoRegistroCorrispettivi)
        tempTestoRegistroCorrispettivi = testoLineEdit.plainText;
    }
    tempTestoRegistriCurrentIndex = testoRegistriComboBox.currentIndex;
    testoGroupBox.checked = false;
    testoLineEdit.setText('');
    if (tempTestoRegistriCurrentIndex == '0') {
      testoGroupBox.checked = tempStampaTestoRegistroAcquisti;
      testoLineEdit.setText(tempTestoRegistroAcquisti);
    }
    else if (tempTestoRegistriCurrentIndex == '1') {
      testoGroupBox.checked = tempStampaTestoRegistroVendite;
      testoLineEdit.setText(tempTestoRegistroVendite);
    }
    else if (tempTestoRegistriCurrentIndex == '2') {
      testoGroupBox.checked = tempStampaTestoRegistroCorrispettivi;
      testoLineEdit.setText(tempTestoRegistroCorrispettivi);
    }
  }
  dialog.showHelp = function () {
    Banana.Ui.showHelp("ch.banana.script.italy_vat_2017");
  }
  dialog.buttonBox.accepted.connect(dialog, "checkdata");
  dialog.buttonBox.helpRequested.connect(dialog, "showHelp");
  testoRegistriComboBox['currentIndexChanged(QString)'].connect(dialog, "enableButtons");
  testoGroupBox.clicked.connect(dialog, "enableButtons");
  trimestreRadioButton.clicked.connect(dialog, "enableButtons");
  meseRadioButton.clicked.connect(dialog, "enableButtons");
  annoRadioButton.clicked.connect(dialog, "enableButtons");
  
  //Visualizzazione dialogo
  Banana.application.progressBar.pause();
  dialog.enableButtons();
  var dlgResult = dialog.exec();
  Banana.application.progressBar.resume();
  if (dlgResult !== 1)
    return false;

  //Salvataggio dati
  //Groupbox periodo
  if (trimestreRadioButton.checked)
    param.periodoSelezionato = 1;
  else if (annoRadioButton.checked)
    param.periodoSelezionato = 2;
  else
    param.periodoSelezionato = 0;
  if (meseComboBox)
    param.periodoValoreMese = meseComboBox.currentIndex.toString();
  if (trimestreComboBox)
    param.periodoValoreTrimestre = trimestreComboBox.currentIndex.toString();
  //Tipo registro
  if (tipoRegistroComboBox)
    param.tipoRegistro = tipoRegistroComboBox.currentIndex.toString();
  //Opzioni
  if (visualizzaDataOraCheckBox)
    param.visualizzaDataOra = visualizzaDataOraCheckBox.checked;
  if (numerazioneAutomaticaCheckBox)
    param.numerazioneAutomatica = numerazioneAutomaticaCheckBox.checked;
  if (stampaDefinitivaCheckBox)
    param.stampaDefinitiva = stampaDefinitivaCheckBox.checked;
  if (inizioNumerazionePagineSpinBox)
      param.inizioNumerazionePagine = inizioNumerazionePagineSpinBox.value.toString();
  //Testi
  param.testoRegistriComboBoxIndex = testoRegistriComboBox.currentIndex.toString();
  if (param.testoRegistriComboBoxIndex == 0) {
    param.stampaTestoRegistroAcquisti = testoGroupBox.checked;
    if (param.stampaTestoRegistroAcquisti)
      param.testoRegistroAcquisti = testoLineEdit.plainText;
    param.stampaTestoRegistroVendite = tempStampaTestoRegistroVendite;
    param.testoRegistroVendite = tempTestoRegistroVendite;
    param.stampaTestoRegistroCorrispettivi = tempStampaTestoRegistroCorrispettivi;
    param.testoRegistroCorrispettivi = tempTestoRegistroCorrispettivi;
  }
  else if (param.testoRegistriComboBoxIndex == 1) {
    param.stampaTestoRegistroVendite = testoGroupBox.checked;
    if (param.stampaTestoRegistroVendite)
      param.testoRegistroVendite = testoLineEdit.plainText;
    param.stampaTestoRegistroAcquisti = tempStampaTestoRegistroAcquisti;
    param.testoRegistroAcquisti = tempTestoRegistroAcquisti;
    param.stampaTestoRegistroCorrispettivi = tempStampaTestoRegistroCorrispettivi;
    param.testoRegistroCorrispettivi = tempTestoRegistroCorrispettivi;
  }
  else if (param.testoRegistriComboBoxIndex == 2) {
    param.stampaTestoRegistroCorrispettivi = testoGroupBox.checked;
    if (param.stampaTestoRegistroCorrispettivi)
      param.testoRegistroCorrispettivi = testoLineEdit.plainText;
    param.stampaTestoRegistroAcquisti = tempStampaTestoRegistroAcquisti;
    param.testoRegistroAcquisti = tempTestoRegistroAcquisti;
    param.stampaTestoRegistroVendite = tempStampaTestoRegistroVendite;
    param.testoRegistroVendite = tempTestoRegistroVendite;
  }
  
  var paramToString = JSON.stringify(param);
  Banana.document.setScriptSettings(paramToString);
  return true;
}

function exec(inData) {

  if (!Banana.document)
    return "@Cancel";

  // Check version
  if (typeof (Banana.document.journalCustomersSuppliers) === 'undefined') {
    var msg = getErrorMessage(ID_ERR_VERSIONE);
    msg = msg.replace("%1", "Banana.document.journalCustomersSuppliers" );
    Banana.document.addMessage( msg, ID_ERR_VERSIONE);
    return "@Cancel";
  }

  var param = {};
  if (inData.length>0) {
    param = JSON.parse(inData);
  }
  else {
    if (!settingsDialog())
      return "@Cancel";
    param = JSON.parse(Banana.document.getScriptSettings());
  }
  
  //add accounting data and journal
  param = readAccountingData(param);
  param = loadJournalData(param);
  
  var report = Banana.Report.newReport("Registri IVA");
  var stylesheet = Banana.Report.newStyleSheet();

  //Print report
  for (var i=0; i<param.periods.length; i++) {
    report.addPageBreak();
    _debug_printJournal(param.periods[i], report, stylesheet);
  }
  
  /*  stylesheet.addStyle("@page", "size:portrait;margin:2em;font-size: 8px; ");
  stylesheet.addStyle("phead", "font-weight: bold; margin-bottom: 1em");
  stylesheet.addStyle("thead", "font-weight: bold");
  stylesheet.addStyle("td", "padding-right: 1em;");
  stylesheet.addStyle(".bold", "font-weight:bold");
  stylesheet.addStyle(".period", "padding-bottom: 1em;");
  stylesheet.addStyle(".center", "text-align: center");
  stylesheet.addStyle(".right", "text-align: right");
  stylesheet.addStyle(".title", "font-weight:bold;text-decoration:underline;padding-bottom:1em;padding-top:1em;");
  stylesheet.addStyle(".warning", "color: red;");
  stylesheet.addStyle("table.table1", "width:100%;");
  // Page header
  var pageHeader = report.getHeader();
  var paragraph = pageHeader.addParagraph(xml_unescapeString(param.fileInfo["Address"]["Company"]) + " " + xml_unescapeString(param.fileInfo["Address"]["FamilyName"]) + " " + xml_unescapeString(param.fileInfo["Address"]["Name"]));
  paragraph.addText("P.I. " + param.fileInfo["Address"]["VatNumber"]);
  paragraph = pageHeader.addParagraph(xml_unescapeString(param.fileInfo["Address"]["Address1"]) + " " + xml_unescapeString(param.fileInfo["Address"]["Address2"]) );
  paragraph.addText(" - " + xml_unescapeString(param.fileInfo["Address"]["Zip"]) + " ");
  paragraph.addText(xml_unescapeString(param.fileInfo["Address"]["City"]) + " (" + xml_unescapeString(param.fileInfo["Address"]["State"]) + ")");
  //Page footer
  var pageFooter = report.getFooter();
  pageFooter.addClass("center");
  pageFooter.addParagraph(Banana.Converter.toLocaleDateFormat(new Date()) + " Pagina ").addFieldPageNr();
  //Data
  for (var index=0; index<param.journals.length; index++) {
    printRegister(report, stylesheet, param.journals[index], "VENDITE");
    printRegister(report, stylesheet, param.journals[index], "ACQUISTI");
    printRegister(report, stylesheet, param.journals[index], "CORRISPETTIVI");
    if (index+1<param.journals.length)
      report.addPageBreak();
  }*/

  Banana.Report.preview(report, stylesheet);
  return;

}

function initParam()
{
  var param = {};
  param.periodoSelezionato = 0;
  param.periodoValoreMese = '';
  param.periodoValoreTrimestre = '';
  param.tipoRegistro = 0;
  param.visualizzaDataOra = false;
  param.numerazioneAutomatica = false;
  param.stampaDefinitiva = false;
  param.inizioNumerazionePagine = 1;
  param.testoRegistriComboBoxIndex = 0;
  param.stampaTestoRegistroAcquisti = false;
  param.stampaTestoRegistroVendite = false;
  param.stampaTestoRegistroCorrispettivi = false;
  param.testoRegistroAcquisti = '';
  param.testoRegistroVendite = '';
  param.testoRegistroCorrispettivi = '';
  return param;
}

function loadJournalData(param) {
  param.periods = [];
  var periods = createPeriods(param);
  for (var i=0; i<periods.length; i++) {
    periods[i] = loadJournal(periods[i]);
    param.periods.push(periods[i]);
  }
  return param;
}

function printRegister(report, stylesheet, journal, register) {
  
  //Check total rows to print
  var counter = 0;
  for (var index in journal.rows) {
    if (typeof journal.rows[index] !== "object")
      continue;
    if (journal.rows[index].AD_Registro != register)
      continue;
    counter++;
  }
  if (counter<=0)
    return;
  
  //Period
  report.addParagraph("IVA " + register, "title center");
  report.addParagraph("Periodo dal: " + Banana.Converter.toLocaleDateFormat(journal.startDate) + " al " + Banana.Converter.toLocaleDateFormat(journal.endDate), "period center");

  //Total
  var vatRatesTotal = [];
  var vatCodesTotal = [];  
  
  //Print table
  var table = report.addTable("table1");
  var headerRow = table.getHeader().addRow();
  headerRow.addCell("Numero", "right");
  headerRow.addCell("Data Reg.", "right");
  headerRow.addCell("Data Doc.", "right");
  headerRow.addCell("Tipo");
  headerRow.addCell("Descrizione");
  headerRow.addCell("Totale Docum.", "right");
  headerRow.addCell("Imponibile", "right");
  headerRow.addCell("Cod.", "right");
  headerRow.addCell("%", "right");
  headerRow.addCell("Imposta", "right");

  //Print vat amounts
  for (var index in journal.rows) {
    if (typeof journal.rows[index] !== "object")
      continue;
    if (journal.rows[index].AD_Registro != register)
      continue;

    var customerObject = getAccount(journal.rows[index].JInvoiceAccountId);
    var vatRate = Banana.SDecimal.abs(journal.rows[index].VatRate);
    var vatTaxable = Banana.SDecimal.invert(journal.rows[index].JVatTaxable);
    var vatPosted = Banana.SDecimal.invert(journal.rows[index].VatPosted);
    var amountLordo = Banana.SDecimal.invert(journal.rows[index].AD_AmountLordo);

    var row = table.addRow();
    row.addCell("");
    row.addCell(Banana.Converter.toLocaleDateFormat(journal.rows[index].JDate));
    row.addCell(Banana.Converter.toLocaleDateFormat(journal.rows[index].DateDocument));
    row.addCell("");
    var cell = row.addCell();
    cell.addParagraph(journal.rows[index].JInvoiceAccountId + "/" + journal.rows[index].DocInvoice + " " + customerObject.Description);
    cell.addParagraph("C.F. " + customerObject.FiscalNumber);
    row.addCell(Banana.Converter.toLocaleNumberFormat(amountLordo), "right");
    row.addCell(Banana.Converter.toLocaleNumberFormat(vatTaxable), "right");
    row.addCell(journal.rows[index].JVatCodeWithoutSign, "right");
    row.addCell(Banana.Converter.toLocaleNumberFormat(vatRate), "right");
    row.addCell(Banana.Converter.toLocaleNumberFormat(vatPosted), "right");

    //Totals
    vatRate = vatRate.toString();
    if (vatRatesTotal[vatRate]) {
      vatTaxable = Banana.SDecimal.add(vatRatesTotal[vatRate].vatTaxable, vatTaxable);
      vatPosted = Banana.SDecimal.add(vatRatesTotal[vatRate].vatPosted, vatPosted);
    }
    else {
      vatRatesTotal[vatRate] = {};
    }
    vatRatesTotal[vatRate].vatTaxable = vatTaxable;
    vatRatesTotal[vatRate].vatPosted = vatPosted;
  }

  //Riepilogo  
  var row = table.addRow();
  row.addCell("", "", 4);
  row.addCell("#RIEPILOGO IVA PER ALIQUOTA", "bold");
  for (var vatRate in vatRatesTotal) {
    row = table.addRow();
    row.addCell("", "", 4);
    row.addCell("Aliquota al " + vatRate);
    row.addCell("");
    row.addCell(Banana.Converter.toLocaleNumberFormat(vatRatesTotal[vatRate].vatTaxable), "right");
    row.addCell("");
    row.addCell("");
    row.addCell(Banana.Converter.toLocaleNumberFormat(vatRatesTotal[vatRate].vatPosted), "right");
  }  
  
  report.addPageBreak();

}

function verifyParam(param) {
  if (!param.periodoSelezionato)
    param.periodoSelezionato = 0;
  if (!param.periodoValoreMese)
    param.periodoValoreMese = '';
  if (!param.periodoValoreTrimestre)
    param.periodoValoreTrimestre = '';
  if (!param.tipoRegistro)
    param.tipoRegistro = 0;
  if (!param.visualizzaDataOra)
    param.visualizzaDataOra = false;
  if (!param.numerazioneAutomatica)
    param.numerazioneAutomatica = false;
  if (!param.stampaDefinitiva)
    param.stampaDefinitiva = false;
  if (!param.inizioNumerazionePagine)
    param.inizioNumerazionePagine = 1;
  if (!param.testoRegistriComboBoxIndex)
    param.testoRegistriComboBoxIndex = 0;
  if (!param.stampaTestoRegistroAcquisti)
    param.stampaTestoRegistroAcquisti = false;
  if (!param.stampaTestoRegistroVendite)
    param.stampaTestoRegistroVendite = false;
  if (!param.stampaTestoRegistroCorrispettivi)
    param.stampaTestoRegistroCorrispettivi = false;
  if (!param.testoRegistroAcquisti)
    param.testoRegistroAcquisti = '';
  if (!param.testoRegistroVendite)
    param.testoRegistroVendite = '';
  if (!param.testoRegistroCorrispettivi)
   param.testoRegistroCorrispettivi = '';
  return param;
}

/**
* output integers with leading zeros
*/
function zeroPad(num, places) {
    if (num.toString().length > places)
        num = 0;
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}
