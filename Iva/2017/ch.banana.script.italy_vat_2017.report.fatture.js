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
// @description = IVA Italia 2017 / Comunicazione dati fatture (spesometro)...
// @doctype = *;110
// @encoding = utf-8
// @includejs = ch.banana.script.italy_vat_2017.report.fatture.createinstance.js
// @includejs = ch.banana.script.italy_vat_2017.errors.js
// @includejs = ch.banana.script.italy_vat_2017.journal.js
// @includejs = ch.banana.script.italy_vat_2017.xml.js
// @inputdatasource = none
// @pubdate = 2017-09-05
// @publisher = Banana.ch SA
// @task = app.command
// @timeout = -1

var debug = false;

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
  var index = 0;
  if (param.periodoSelezionato == 's')
    index = parseInt(param.periodoValoreSemestre);
  else if (param.periodoSelezionato == 'q')
    index = parseInt(param.periodoValoreTrimestre) + 3;
  else if (param.periodoSelezionato == 'm')
    index = parseInt(param.periodoValoreMese) + 8;

  dialog.periodoGroupBox.title += ' ' + accountingData.accountingYear;
  dialog.periodoGroupBox.periodoComboBox.currentIndex = index;

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
  }
  dialog.showHelp = function () {
    Banana.Ui.showHelp("ch.banana.script.italy_vat_2017");
  }
  dialog.buttonBox.accepted.connect(dialog, "checkdata");
  dialog.buttonBox.helpRequested.connect(dialog, "showHelp");
  
  Banana.application.progressBar.pause();
  dialog.enableButtons();
  var dlgResult = dialog.exec();
  Banana.application.progressBar.resume();

  if (dlgResult !== 1)
    return false;

  //Salvataggio dati
  //Groupbox periodo
  var index = parseInt(dialog.periodoGroupBox.periodoComboBox.currentIndex.toString());
  if (index < 0)
    index = 0;
  if (index <=1) {
    param.periodoSelezionato = 's';
    param.periodoValoreSemestre = index.toString();
  }
  else if (index > 2 && index < 7) {
    param.periodoSelezionato = 'q';
    param.periodoValoreTrimestre = (index-3).toString();
  }
  else if (index > 7) {
    param.periodoSelezionato = 'm';
    param.periodoValoreMese = (index-8).toString();
  }

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

function addPageHeader(report, stylesheet, param)
{
  // Page header
  var pageHeader = report.getHeader();
  
  //Tabella
  var table = pageHeader.addTable("header_table");
  table.addColumn("header_col_left");
  table.addColumn("header_col_center");
  table.addColumn("header_col_right");
  
  //cell_left
  var row = table.addRow();
  var cell_left = row.addCell("", "header_cell_left");

  var line1 = param.datiContribuente.societa;
  if (line1.length)
    line1 += " ";
  if (param.datiContribuente.cognome.length)
    line1 += param.datiContribuente.cognome;
  if (param.datiContribuente.nome.length)
    line1 += param.datiContribuente.nome;
  if (line1.length)
    cell_left.addParagraph(line1);
  
  var line2 = '';
  if (param.datiContribuente.indirizzo.length)
    line2 = param.datiContribuente.indirizzo + " ";
  if (param.datiContribuente.ncivico.length)
    line2 += " " + param.datiContribuente.ncivico;
  if (line2.length)
    cell_left.addParagraph(line2);

  var line3 = '';
  if (param.datiContribuente.cap.length)
    line3 = param.datiContribuente.cap + " ";
  if (param.datiContribuente.comune.length)
    line3 += param.datiContribuente.comune + " ";
  if (param.datiContribuente.provincia.length)
    line3 += "(" +  param.datiContribuente.provincia + ")";
  if (line3.length)
    cell_left.addParagraph(line3);
  
  var line4 = '';
  if (param.datiContribuente.partitaIva.length)
    line4 = "P.IVA: " + param.datiContribuente.partitaIva;
  if (line4.length)
    cell_left.addParagraph(line4, "vatNumber");
  
  //cell_center
  var cell_center = row.addCell("", "header_cell_center");
  var periodo = Banana.Converter.toLocaleDateFormat(param.data.startDate);
  periodo +=" - " + Banana.Converter.toLocaleDateFormat(param.data.endDate);
  periodo += " blocco " + param.blocco;
  cell_center.addParagraph("Comunicazione dati fatture", "title center");
  cell_center.addParagraph(periodo, "period center");

  //cell_right
  var cell_right = row.addCell("", "header_cell_right");
  cell_right.addParagraph(Banana.Converter.toLocaleDateFormat(new Date()), "right");
  cell_right.addParagraph(" Pagina ", "right").addFieldPageNr();
 
  //add style
  stylesheet.addStyle(".header_table", "margin-top:1em;width:100%;");
  stylesheet.addStyle(".header_col_left", "width:33%");
  stylesheet.addStyle(".header_col_center", "flexible-width:always");
  stylesheet.addStyle(".header_col_right", "width:33%");
  stylesheet.addStyle(".header_cell_left", "font-size:8px");
  stylesheet.addStyle(".header_cell_center", "font-size:8px");
  stylesheet.addStyle(".header_cell_right", "font-size:8px");
  stylesheet.addStyle(".center", "text-align: center;");
  stylesheet.addStyle(".period", "padding-bottom: 1em;");
  stylesheet.addStyle(".right", "text-align: right;");
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
  if (Banana.document.table('Accounts')) {
    var tColumnNames = Banana.document.table('Accounts').columnNames.join(";");
    if (tColumnNames.indexOf('Town')>0 || tColumnNames.indexOf('Company')>0) {
      //E necessario convertire il file con una tabella Conti/Indirizzi più recente
      var msg = getErrorMessage(ID_ERR_TABELLA_INDIRIZZI_NONCOMPATIBILE);
      Banana.document.addMessage( msg, ID_ERR_TABELLA_INDIRIZZI_NONCOMPATIBILE);
      return "@Cancel";
    }
    else if (tColumnNames.indexOf('OrganisationName')<=0) {
      var msg = getErrorMessage(ID_ERR_TABELLA_INDIRIZZI_MANCANTE);
      Banana.document.addMessage( msg, ID_ERR_TABELLA_INDIRIZZI_MANCANTE);
      return "@Cancel";
    }
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
  //Controlla se sono impostati i gruppi clienti/fornitori
  if (param.fileInfo["CustomersGroup"].length<=0 && param.fileInfo["SuppliersGroup"].length<=0) {
    var msg = getErrorMessage(ID_ERR_GRUPPI_CLIENTIFORNITORI_MANCANTI);
    Banana.document.addMessage( msg, ID_ERR_GRUPPI_CLIENTIFORNITORI_MANCANTI);
  }
  param = loadJournalData(param);
  param.schemaRefs = init_schemarefs();
  param.namespaces = init_namespaces();
  
  var output = createInstance(param);

  if (param.outputScript==0 && output != "@Cancel") {
    var report = Banana.Report.newReport("Dati delle fatture emesse e ricevute");
    var stylesheet = Banana.Report.newStyleSheet(); 
    addPageHeader(report, stylesheet, param);
    setStyle(report, stylesheet);
    printVatReport(report, stylesheet, param);
    if (debug) {
      report.addPageBreak();
      _debug_printJournal(param.data, report, stylesheet);
    }
    Banana.Report.preview(report, stylesheet);
  }
  else if (param.outputScript==1 && output != "@Cancel") {
    //xml file
    output = formatXml(output);
    saveData(output, param);
    return;
  }

  //return xml content
  return output;
}

function getCountryCode(jsonObject) {
  var countryCode = 'it';
  if (!jsonObject)
    return countryCode.toUpperCase();
  if (jsonObject["CountryCode"] && jsonObject["CountryCode"].length>0)
    countryCode = jsonObject["CountryCode"];
  else if (jsonObject["Country"] && jsonObject["Country"].length>0)
    countryCode = jsonObject["Country"];
  countryCode = countryCode.toLowerCase();
  if (countryCode == 'italy' || countryCode == 'italia') {
    countryCode = 'it';
  }
  if (countryCode == 'germany' || countryCode == 'germania' || countryCode == 'deutschland') {
    countryCode = 'de';
  }
  if (countryCode == 'france' || countryCode == 'francia') {
    countryCode = 'fr';
  }
  if (countryCode == 'switzerland' || countryCode == 'schweiz'|| countryCode == 'suisse'|| countryCode == 'svizzera') {
    countryCode = 'ch';
  }
  return countryCode.toUpperCase();
}

function initParam()
{
  var param = {};
  param.codicefiscaleDichiarante = '';
  param.codiceCarica = '';
  param.blocco = 'DTE';
  param.progressivoInvio = '';

  param.periodoSelezionato = 'm';
  param.periodoValoreMese = '';
  param.periodoValoreTrimestre = '';
  param.periodoValoreSemestre = '';

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
    //'http://banana.ch schema_v1.xsd',
    //'http://banana.ch schema_v2.xsd'
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

  //Per la comunicazione DTE (Dati fatture emesse tiene solamente le righe del registro Vendite e Corrispettivi
  //Per la comunicazine DTR (Dati fatture ricevute tiene solamente le righe del registro Acquisti
  //In questo modo vengono escluse le autofatture
  
  if (param.blocco == 'DTE') {
    var checkedCustomers = {};
    for (var i in param.data.customers) {
      var checkedRows = [];
      var accountObj = param.data.customers[i];
      for (var j in accountObj.rows) {
        if (accountObj.rows[j]["IT_Registro"]=="Acquisti")
          continue;
        else if (accountObj.rows[j]["VatExtraInfo"]=="ESCL")
          continue;
        checkedRows.push(accountObj.rows[j]);
      }
      if (checkedRows.length>0) {
        accountObj.rows = checkedRows;
        checkedCustomers[i] = accountObj;
      }
    }
    param.data.customers = checkedCustomers;
  }
  else if (param.blocco == 'DTR') {
    var checkedSuppliers = {};
    for (var i in param.data.suppliers) {
      var checkedRows = [];
      var accountObj = param.data.suppliers[i];
      for (var j in accountObj.rows) {
        if (accountObj.rows[j]["IT_Registro"]=="Vendite" || accountObj.rows[j]["IT_Registro"]=="Corrispettivi")
          continue;
        else if (accountObj.rows[j]["VatExtraInfo"]=="ESCL")
          continue;
        checkedRows.push(accountObj.rows[j]);
      }
      if (checkedRows.length>0) {
        accountObj.rows = checkedRows;
        checkedSuppliers[i] = accountObj;
      }
    }
    param.data.suppliers = checkedSuppliers;
  }

  return param;
}

function printVatReport(report, stylesheet, param) {

  if (param.data.customers.length<=0 && param.data.suppliers.length<=0)
    return;

  //Print table
  var table = report.addTable("vatreport_table");
  var headerRow = table.getHeader().addRow();

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
      row.addCell(jsonObj["IT_DocInvoice"], "row");
      row.addCell(Banana.Converter.toLocaleDateFormat(jsonObj["JDate"]), "row");
      row.addCell(xml_unescapeString(jsonObj["JDescription"]), "row");
      row.addCell(jsonObj["JAccount"], "row amount");
      row.addCell(jsonObj["JContraAccount"], "row amount");
      row.addCell(jsonObj["JVatCodeWithoutSign"], "row amount");
      row.addCell(jsonObj["IT_Gr_IVA"], "row amount");
      var value = jsonObj["IT_Imponibile"];
      if (!Banana.SDecimal.isZero(value))
        value = Banana.SDecimal.abs(value);
      row.addCell(Banana.Converter.toLocaleNumberFormat(value,2,false), "row amount");
      value = jsonObj["IT_IvaContabilizzata"];
      if (!Banana.SDecimal.isZero(value))
        value = Banana.SDecimal.abs(value);
      row.addCell(Banana.Converter.toLocaleNumberFormat(value,2,false), "row amount");
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

  stylesheet.addStyle(".amount", "text-align: right;border:1px solid black; ");
  stylesheet.addStyle(".center", "text-align: center;");
  stylesheet.addStyle(".notes", "padding: 2em;font-style:italic;");
  stylesheet.addStyle(".right", "text-align: right;");
  stylesheet.addStyle(".row.amount", "border:1px solid black;");
  stylesheet.addStyle(".rowName", "font-weight: bold;padding-top:5px;border-top:1px solid black;");
  stylesheet.addStyle(".warning", "color: red;font-size:8px;");

  /*vatrepor_table*/
  stylesheet.addStyle(".vatreport_table", "margin-top:1em;width:100%;");

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
    param.periodoSelezionato = 'm';
  if (!param.periodoValoreMese)
    param.periodoValoreMese = '';
  if (!param.periodoValoreTrimestre)
    param.periodoValoreTrimestre = '';
  if (!param.periodoValoreSemestre)
    param.periodoValoreSemestre = '';

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
