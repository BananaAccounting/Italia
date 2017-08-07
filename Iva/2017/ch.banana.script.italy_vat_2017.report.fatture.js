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
// @id = ch.banana.script.italy_vat_2017.report.fatture.js
// @description = IVA Italia 2017: Comunicazione dati fatture (spesometro)...
// @doctype = *;110
// @encoding = utf-8
// @includejs = ch.banana.script.italy_vat_2017.report.fatture.createinstance.js
// @includejs = ch.banana.script.italy_vat_2017.errors.js
// @includejs = ch.banana.script.italy_vat_2017.journal.js
// @includejs = ch.banana.script.italy_vat_2017.xml.js
// @inputdatasource = none
// @pubdate = 2017-08-07
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
  
  var dialog = Banana.Ui.createUi("ch.banana.script.italy_vat_2017.report.fatture.dialog.ui");
  //Groupbox periodo
  if (param.periodoSelezionato == 0)
    dialog.periodoGroupBox.meseRadioButton.checked = true;
  else if (param.periodoSelezionato == 1)
    dialog.periodoGroupBox.trimestreRadioButton.checked = true;

  dialog.periodoGroupBox.title += ' ' + accountingData.accountingYear;
  dialog.periodoGroupBox.meseComboBox.currentIndex = param.periodovaloreMese;
  dialog.periodoGroupBox.trimestreComboBox.currentIndex = param.periodovaloreTrimestre;

  var progressivo = parseInt(param.progressivoInvio, 10);
  if (!progressivo)
    progressivo = 1;
  else if (param.outputScript==1)
    progressivo += 1;
  progressivo = zeroPad(progressivo, 5);
  dialog.datiFatturaHeaderGroupBox.progressivoInvioLineEdit.text = progressivo;
  dialog.datiFatturaHeaderGroupBox.cfDichiaranteLineEdit.text = param.codicefiscaleDichiarante;
  dialog.datiFatturaHeaderGroupBox.codiceCaricaComboBox.currentIndex = param.codiceCarica;
  var bloccoId = 0;
  if (param.blocco == "DTR")
    bloccoId = 1;
  dialog.bloccoGroupBox.bloccoComboBox.currentIndex = bloccoId;

  //Groupbox stampa
  if (param.outputScript==1)
    dialog.stampaGroupBox.stampaXmlRadioButton.checked = true;
  else  
    dialog.stampaGroupBox.stampaReportRadioButton.checked = true;

  //dialog functions
  dialog.checkdata = function () {
    dialog.accept();
  }
  dialog.enableButtons = function () {
    if (dialog.periodoGroupBox.trimestreRadioButton.checked) {
        dialog.periodoGroupBox.trimestreComboBox.enabled = true;
        dialog.periodoGroupBox.trimestreComboBox.update();
        dialog.periodoGroupBox.meseComboBox.enabled = false;
        dialog.periodoGroupBox.meseComboBox.update();
    }
    else if (dialog.periodoGroupBox.meseRadioButton.checked) {
        dialog.periodoGroupBox.trimestreComboBox.enabled = false;
        dialog.periodoGroupBox.trimestreComboBox.update();
        dialog.periodoGroupBox.meseComboBox.enabled = true;
        dialog.periodoGroupBox.meseComboBox.update();
    }
  }
  dialog.showHelp = function () {
    Banana.Ui.showHelp("ch.banana.script.italy_vat_2017");
  }
  dialog.buttonBox.accepted.connect(dialog, "checkdata");
  dialog.buttonBox.helpRequested.connect(dialog, "showHelp");
  dialog.periodoGroupBox.trimestreRadioButton.clicked.connect(dialog, "enableButtons");
  dialog.periodoGroupBox.meseRadioButton.clicked.connect(dialog, "enableButtons");
  
  Banana.application.progressBar.pause();
  dialog.enableButtons();
  var dlgResult = dialog.exec();
  Banana.application.progressBar.resume();

  if (dlgResult !== 1)
    return false;

  //Salvataggio dati
  //Groupbox periodo
  param.periodoValoreTrimestre = dialog.periodoGroupBox.trimestreComboBox.currentIndex.toString();
  param.periodoValoreMese = dialog.periodoGroupBox.meseComboBox.currentIndex.toString();
  if (dialog.periodoGroupBox.meseRadioButton.checked)
    param.periodoSelezionato = 0;
  else if (dialog.periodoGroupBox.trimestreRadioButton.checked)
    param.periodoSelezionato = 1;

  progressivo = dialog.datiFatturaHeaderGroupBox.progressivoInvioLineEdit.text;
  progressivo = parseInt(progressivo, 10);
  if (!progressivo)
    progressivo = 1;
  param.progressivoInvio = zeroPad(progressivo, 5);
  param.codicefiscaleDichiarante = dialog.datiFatturaHeaderGroupBox.cfDichiaranteLineEdit.text;
  param.codiceCarica = dialog.datiFatturaHeaderGroupBox.codiceCaricaComboBox.currentIndex.toString();
  var bloccoId = dialog.bloccoGroupBox.bloccoComboBox.currentIndex.toString();
  if (bloccoId == 1)
    param.blocco = "DTR";
  else
    param.blocco = "DTE";
  
  //Groupbox stampa
  if (dialog.stampaGroupBox.stampaXmlRadioButton.checked)
    param.outputScript = 1;
  else
    param.outputScript = 0;

  var paramToString = JSON.stringify(param);
  Banana.document.setScriptSettings(paramToString);
  return true;
}

function addHeader(report, param)
{
  // Page header
  var pageHeader = report.getHeader();
  
  var line1 = param.datiContribuente.societa;
  if (line1.length)
    line1 += " ";
  if (param.datiContribuente.cognome.length)
    line1 += param.datiContribuente.cognome;
  if (param.datiContribuente.nome.length)
    line1 += param.datiContribuente.nome;
  if (line1.length)
    pageHeader.addParagraph(line1);
  
  var line2 = '';
  if (param.datiContribuente.cap.length)
    line2 = param.datiContribuente.cap + " ";
  if (param.datiContribuente.comune.length)
    line2 += param.datiContribuente.comune + " ";
  if (param.datiContribuente.provincia.length)
    line2 += "(" +  param.datiContribuente.provincia + ")";
  if (line2.length)
    pageHeader.addParagraph(line2);
  
  var line3 = '';
  if (param.datiContribuente.partitaIva.length)
    line3 = "Partita IVA: " + param.datiContribuente.partitaIva;
  if (line3.length)
    pageHeader.addParagraph(line3, "vatNumber");
}

function addFooter(report, param)
{
  //Page footer
  var reportFooter = report.getFooter();
  reportFooter.addClass("center");
  reportFooter.addParagraph("N1 escluse ex art. 15, N2 non soggette, N3 non imponibili, N4 esenti, N5 regime del margine/IVA non esposta in fattura, N6 inversione contabile (reverse charge), N7 IVA assolta in altro stato UE", "notes");
  reportFooter.addParagraph(Banana.Converter.toLocaleDateFormat(new Date()) + " Pagina ").addFieldPageNr();

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
  if (typeof (Banana.IO) === 'undefined') {
    var msg = getErrorMessage(ID_ERR_VERSIONE);
    msg = msg.replace("%1", "Banana.IO" );
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
  param.schemaRefs = init_schemarefs();
  param.namespaces = init_namespaces();
  
  var output = createInstance(param);

  if (param.outputScript==0 && output != "@Cancel") {
    var report = Banana.Report.newReport("Dati delle fatture emesse e ricevute");
    var stylesheet = Banana.Report.newStyleSheet();
    setStyle(report, stylesheet);
    addHeader(report, param);
    addFooter(report, param);
    printVatReport(report, stylesheet, param);
    if (debug) {
      report.addPageBreak();
      _debug_printJournal(param.data, report, stylesheet);
    }
    Banana.Report.preview(report, stylesheet);
  }
  else if (param.outputScript==1 && output != "@Cancel") {
    //xml file
    saveData(output, param);
    return;
  }

  //return xml content
  return output;
}

function getCountryCode(jsonObject) {
  var countryCode = '';
  if (!jsonObject)
    return countryCode;
  if (jsonObject["CountryCode"])
    countryCode = jsonObject["CountryCode"];
  else if (jsonObject["Country"])
    countryCode = jsonObject["Country"];
  countryCode = countryCode.toLowerCase();
  if (countryCode == 'italy' || countryCode == 'italia') {
    countryCode = 'it';
  }
  if (countryCode == 'germany' || countryCode == 'germania') {
    countryCode = 'de';
  }
  if (countryCode == 'france' || countryCode == 'francia') {
    countryCode = 'fr';
  }
  contryCode = xml_escapeString(countryCode);
  return countryCode.toUpperCase();
}

function initParam()
{
  var param = {};
  param.codicefiscaleDichiarante = '';
  param.codiceCarica = '';
  param.blocco = 'DTE';
  param.progressivoInvio = '';

  param.periodoSelezionato = 0;
  param.periodoValoreMese = '';
  param.periodoValoreTrimestre = '';

  /*
  0 = create print preview report
  1 = create file xml 
  2 = return xml string */
  param.outputScript = 0;
  
  return param;
}

function init_namespaces()
{
  var ns = [
    {
      'namespace' : 'http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v2.0',
      'prefix' : 'xmlns:ns2'
    },
  ];
  return ns;
}
function init_schemarefs()
{
  var schemaRefs = [
  ];
  return schemaRefs;
};

function loadJournalData(param) {
  //per il momento c'è un unico periodo non controlla il tipo di versamento mensile o trimestrale
  param.data = {};  
  param.datiContribuente.liqTipoVersamento = -1;
  var periods = createPeriods(param);
  if (periods.length>0) {
    param.data.startDate = periods[0].startDate;
    param.data.endDate = periods[0].endDate;
    param.data = loadJournal(param.data);
  }

  return param;
}

function printVatReport(report, stylesheet, param) {

  if (param.data.customers.length<=0 && param.data.suppliers.length<=0)
    return;

  //Print table
  //Title
  var table = report.addTable("table1");
  var headerRow = table.getHeader().addRow();
  headerRow.addCell("Comunicazione dei dati delle fatture", "title", 15);
  //Period
  var periodo = "Periodo dal " + Banana.Converter.toLocaleDateFormat(param.data.startDate);
  periodo +=" al " + Banana.Converter.toLocaleDateFormat(param.data.endDate);
  periodo += " blocco " + param.blocco;
  headerRow = table.getHeader().addRow();
  headerRow.addCell(periodo, "period",  15);

  //Column names
  headerRow = table.getHeader().addRow();
  headerRow.addCell("Soggetto", "", 1);
  headerRow.addCell("Nome", "", 4);
  headerRow.addCell("ID paese", "", 2);
  headerRow.addCell("Partita IVA", "", 2);
  headerRow.addCell("Codice fiscale", "", 6);

  headerRow = table.getHeader().addRow();
  headerRow.addCell("Tipo doc.");
  headerRow.addCell("Data doc.");
  headerRow.addCell("N. doc.");
  headerRow.addCell("Data reg.");
  headerRow.addCell("Descrizione");
  headerRow.addCell("Conto", "center");
  headerRow.addCell("Ctrpart.", "center");
  headerRow.addCell("Cod.IVA", "center");
  headerRow.addCell("Gr.IVA", "center");
  var cell = headerRow.addCell("", "center");
  var paragraph = cell.addParagraph("Imponibile");
  paragraph.addLineBreak();
  paragraph.addText("Non imponib.");
  headerRow.addCell("Imposta", "center");
  headerRow.addCell("Aliquota", "center");
  headerRow.addCell("Natura", "center");
  headerRow.addCell("Detraibile", "center");
  headerRow.addCell("Deducibile", "center");

  // Print data
  if (param.blocco == 'DTE') {
    printVatReport_rows(param.data.customers, table, param)
  }
  else if (param.blocco == 'DTR'){
    printVatReport_rows(param.data.suppliers, table, param)
  }
}

function printVatReport_rows(customers_suppliers, table, param) {
  for (var i in customers_suppliers) {
	var rowType = "cliente";
	if (param.blocco == "DTR")
	  rowType = "creditore";
    var row = table.addRow();
    row.addCell(rowType, "rowName");
    row.addCell(xml_unescapeString(customers_suppliers[i]["Description"]),"rowName",4);
    row.addCell(getCountryCode(customers_suppliers[i]),"rowName",2);
    row.addCell(customers_suppliers[i]["VatNumber"],"rowName",2);
    row.addCell(customers_suppliers[i]["FiscalNumber"],"rowName",6);
    for (var j in customers_suppliers[i].rows) {
      var jsonObj = customers_suppliers[i].rows[j];
      var row = table.addRow();
      row.addCell(jsonObj["IT_TipoDoc"], "row");
      row.addCell(Banana.Converter.toLocaleDateFormat(jsonObj["JInvoiceIssueDate"]), "row");
      row.addCell(jsonObj["DocInvoice"], "row");
      row.addCell(Banana.Converter.toLocaleDateFormat(jsonObj["JDate"]), "row");
      row.addCell(xml_unescapeString(jsonObj["JDescription"]), "row");
      row.addCell(jsonObj["JAccount"], "row amount");
      row.addCell(jsonObj["JContraAccount"], "row amount");
      row.addCell(jsonObj["JVatCodeWithoutSign"], "row amount");
      row.addCell(jsonObj["IT_Gr_IVA"], "row amount");
      row.addCell(Banana.Converter.toLocaleNumberFormat(jsonObj["IT_Imponibile"],2,false), "row amount");
      row.addCell(Banana.Converter.toLocaleNumberFormat(jsonObj["IT_Imposta"],2,false), "row amount");
      row.addCell(Banana.Converter.toLocaleNumberFormat(jsonObj["IT_Aliquota"],2,false), "row amount");
      row.addCell(jsonObj["IT_Natura"], "row amount");
      row.addCell(Banana.Converter.toLocaleNumberFormat(jsonObj["IT_Detraibile"],2,false), "row amount");
      row.addCell(jsonObj["IT_Deducibile"], "row amount");
    }
  }
}

function saveData(output, param) {
  var codiceFiscale = param.datiContribuente.codiceFiscale;
  if (codiceFiscale.length<=0)
    codiceFiscale = "99999999999";
  var fileName = "IT" + codiceFiscale + "_DF_" + param.progressivoInvio + ".xml";
  fileName = Banana.IO.getSaveFileName("Save as", fileName, "XML file (*.xml);;All files (*)")
  if (fileName.length) {
    var file = Banana.IO.getLocalFile(fileName)
    file.write(output);
    if (file.errorString) {
      Banana.Ui.showInformation("Write error", file.errorString);
    }
    else {
      Banana.IO.openUrl(fileName);
    }
  }
}

function setStyle(report, stylesheet) {
  if (!stylesheet) {
    stylesheet = report.newStyleSheet();
  }
  
  stylesheet.addStyle("@page", "size:landscape;margin:2em;font-size: 8px; ");
  stylesheet.addStyle("phead", "font-weight: bold; margin-bottom: 1em");
  stylesheet.addStyle("thead", "font-weight: bold;background-color:#eeeeee;");
  stylesheet.addStyle("td", "padding:1px;vertical-align:top;");
  stylesheet.addStyle("td.title", "background-color:#ffffff;font-size:10px;");
  stylesheet.addStyle("td.period", "background-color:#ffffff;");
  stylesheet.addStyle(".amount", "text-align: right;border:1px solid black; ");
  stylesheet.addStyle(".center", "text-align: center;");
  stylesheet.addStyle(".notes", "padding: 2em;font-style:italic;");
  stylesheet.addStyle(".period", "padding-bottom: 1em;");
  stylesheet.addStyle(".right", "text-align: right;");
  stylesheet.addStyle(".row.amount", "border:1px solid black;");
  stylesheet.addStyle(".rowName", "font-weight: bold;padding-top:5px;border-top:1px solid black;");
  stylesheet.addStyle(".table1", "margin-top:1em;width:100%;");
  stylesheet.addStyle(".warning", "color: red;font-size:8px;");

}

function verifyParam(param) {
  if(!param.codicefiscaleDichiarante)
    param.codicefiscaleDichiarante = '';
  if(!param.codiceCarica)
    param.codiceCarica = '';
  if (!param.blocco)
    param.blocco = 'DTE';
  if(!param.progressivoInvio)
    param.progressivoInvio = '';

  if (!param.periodoSelezionato)
    param.periodoSelezionato = 0;
  if (!param.periodoValoreMese)
    param.periodoValoreMese = '';
  if (!param.periodoValoreTrimestre)
    param.periodoValoreTrimestre = '';

  if (!param.outputScript)
    param.outputScript = 0;
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
