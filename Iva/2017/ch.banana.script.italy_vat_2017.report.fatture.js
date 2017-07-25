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
// @description = Comunicazione fatture emesse e ricevute 2017 (file xml)
// @doctype = *;110
// @encoding = utf-8
// @includejs = ch.banana.script.italy_vat_2017.report.fatture.createinstance.js
// @includejs = ch.banana.script.italy_vat_2017.errors.js
// @includejs = ch.banana.script.italy_vat_2017.journal.js
// @includejs = ch.banana.script.italy_vat_2017.xml.js
// @inputdatasource = none
// @pubdate = 2017-07-25
// @publisher = Banana.ch SA
// @task = app.command
// @timeout = -1

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
  dialog.periodoGroupBox.title += ' ' + accountingData.accountingYear;
  if (param.selezioneTrimestre) {
    dialog.periodoGroupBox.trimestreRadioButton.checked = true;
    dialog.periodoGroupBox.meseRadioButton.checked = false;
  }
  else {
    dialog.periodoGroupBox.trimestreRadioButton.checked = false;
    dialog.periodoGroupBox.meseRadioButton.checked = true;
  }
  dialog.periodoGroupBox.trimestreComboBox.currentIndex = param.valoreTrimestre;
  dialog.periodoGroupBox.meseComboBox.currentIndex = param.valoreMese;
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
    Banana.Ui.showHelp("ch.banana.script.italy_vat_2017.report.fatture.js");
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

  param.valoreTrimestre = dialog.periodoGroupBox.trimestreComboBox.currentIndex.toString();
  param.valoreMese = dialog.periodoGroupBox.meseComboBox.currentIndex.toString();
  if (dialog.periodoGroupBox.trimestreRadioButton.checked) {
    param.selezioneTrimestre = true;
    param.selezioneMese = false;
  }
  else {
    param.selezioneTrimestre = false;
    param.selezioneMese = true;
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
  param.data = {};  
  param = setPeriod(param);
  param.data = loadJournalCustomersSuppliers(param.data);
  param.schemaRefs = init_schemarefs();
  param.namespaces = init_namespaces();
  
  var output = createInstance(param);

  if (param.outputScript==0 && output != "@Cancel") {
    var report = Banana.Report.newReport("Dati delle fatture emesse e ricevute");
    var stylesheet = Banana.Report.newStyleSheet();
    printVatReport1(report, stylesheet, param);
    report.addPageBreak();
	printJournal(param.data, report, stylesheet);
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
  param.selezioneTrimestre = true;
  param.selezioneMese = false;
  param.valoreTrimestre = '';
  param.valoreMese = '';
  param.codicefiscaleDichiarante = '';
  param.codiceCarica = '';
  param.blocco = 'DTE';
  param.progressivoInvio = '';
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
      'prefix' : 'xmlns'
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

function printVatReport1(report, stylesheet, param) {

  // Styles
  stylesheet.addStyle("@page", "size:landscape;margin-top:1em;font-size: 8px; ");
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

  if (param.data.customers.length<=0 && param.data.suppliers.length<=0)
    return;

  //Page numbers
  var reportFooter = report.getFooter();
  reportFooter.addClass("center");
  //Note
  reportFooter.addParagraph("N1 escluse ex art. 15, N2 non soggette, N3 non imponibili, N4 esenti, N5 regime del margine/IVA non esposta in fattura, N6 inversione contabile (reverse charge), N7 IVA assolta in altro stato UE", "notes");
  reportFooter.addParagraph(Banana.Converter.toLocaleDateFormat(new Date()) + " Pagina ").addFieldPageNr();
  

  //Address
  report.addParagraph(xml_unescapeString(param.fileInfo["Address"]["Company"]) + " " + xml_unescapeString(param.fileInfo["Address"]["FamilyName"]) + " " + xml_unescapeString(param.fileInfo["Address"]["Name"]));
  report.addParagraph(xml_unescapeString(param.fileInfo["Address"]["City"]) + " (" + xml_unescapeString(param.fileInfo["Address"]["State"]) + ")");
  report.addParagraph("Partita IVA: " + param.fileInfo["Address"]["VatNumber"], "vatNumber");
  
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
    printVatReport1_rows(param.data.customers, table, param)
  }
  else if (param.blocco == 'DTR'){
    printVatReport1_rows(param.data.suppliers, table, param)
  }
}

function printVatReport1_rows(customers_suppliers, table, param) {
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
      row.addCell(jsonObj["DF_TipoDoc"], "row");
      row.addCell(Banana.Converter.toLocaleDateFormat(jsonObj["JInvoiceIssueDate"]), "row");
      row.addCell(jsonObj["DocInvoice"], "row");
      row.addCell(Banana.Converter.toLocaleDateFormat(jsonObj["JDate"]), "row");
      row.addCell(xml_unescapeString(jsonObj["JDescription"]), "row");
      row.addCell(jsonObj["JAccount"], "row amount");
      row.addCell(jsonObj["JContraAccount"], "row amount");
      row.addCell(jsonObj["JVatCodeWithoutSign"], "row amount");
      row.addCell(jsonObj["DF_Gr_IVA"], "row amount");
      row.addCell(Banana.Converter.toLocaleNumberFormat(jsonObj["DF_Imponibile"],2,false), "row amount");
      row.addCell(Banana.Converter.toLocaleNumberFormat(jsonObj["DF_Imposta"],2,false), "row amount");
      row.addCell(Banana.Converter.toLocaleNumberFormat(jsonObj["DF_Aliquota"],2,false), "row amount");
      row.addCell(jsonObj["DF_Natura"], "row amount");
      row.addCell(Banana.Converter.toLocaleNumberFormat(jsonObj["DF_Detraibile"],2,false), "row amount");
      row.addCell(jsonObj["DF_Deducibile"], "row amount");
    }
  }
}

function readAccountingData(param) {
  
  param.accountingYear = '';
  
  var accountingOpeningDate = Banana.document.info("AccountingDataBase", "OpeningDate");
  var accountingClosureDate = Banana.document.info("AccountingDataBase", "ClosureDate");

  var openingYear = 0;
  var closureYear = 0;
  if (accountingOpeningDate.length >= 10)
    openingYear = accountingOpeningDate.substring(0, 4);
  if (accountingClosureDate.length >= 10)
    closureYear = accountingClosureDate.substring(0, 4);
  if (openingYear > 0 && openingYear === closureYear)
    param.accountingYear = openingYear;

  //Table FileInfo
  param.fileInfo = {};
  param.fileInfo["BasicCurrency"] = "";
  param.fileInfo["OpeningDate"] = "";
  param.fileInfo["ClosureDate"] = "";
  param.fileInfo["CustomersGroup"] = "";
  param.fileInfo["SuppliersGroup"] = "";
  param.fileInfo["Address"] = {};
  param.fileInfo["Address"]["Company"] = "";
  param.fileInfo["Address"]["Courtesy"] = "";
  param.fileInfo["Address"]["Name"] = "";
  param.fileInfo["Address"]["FamilyName"] = "";
  param.fileInfo["Address"]["Address1"] = "";
  param.fileInfo["Address"]["Address2"] = "";
  param.fileInfo["Address"]["Zip"] = "";
  param.fileInfo["Address"]["City"] = "";
  param.fileInfo["Address"]["State"] = "";
  param.fileInfo["Address"]["Country"] = "";
  param.fileInfo["Address"]["Web"] = "";
  param.fileInfo["Address"]["Email"] = "";
  param.fileInfo["Address"]["Phone"] = "";
  param.fileInfo["Address"]["Mobile"] = "";
  param.fileInfo["Address"]["Fax"] = "";
  param.fileInfo["Address"]["FiscalNumber"] = "";
  param.fileInfo["Address"]["VatNumber"] = "";
  if (Banana.document.info) {
    param.fileInfo["BasicCurrency"] = Banana.document.info("AccountingDataBase", "BasicCurrency");
    param.fileInfo["OpeningDate"] = Banana.document.info("AccountingDataBase", "OpeningDate");
    param.fileInfo["ClosureDate"] = Banana.document.info("AccountingDataBase", "ClosureDate");
    param.fileInfo["CustomersGroup"] = Banana.document.info("AccountingDataBase", "CustomersGroup");
    param.fileInfo["SuppliersGroup"] = Banana.document.info("AccountingDataBase", "SuppliersGroup");
    param.fileInfo["Address"] = {};
    param.fileInfo["Address"]["Company"] = xml_escapeString(Banana.document.info("AccountingDataBase", "Company"));
    param.fileInfo["Address"]["Courtesy"] = xml_escapeString(Banana.document.info("AccountingDataBase", "Courtesy"));
    param.fileInfo["Address"]["Name"] = xml_escapeString(Banana.document.info("AccountingDataBase", "Name"));
    param.fileInfo["Address"]["FamilyName"] = xml_escapeString(Banana.document.info("AccountingDataBase", "FamilyName"));
    param.fileInfo["Address"]["Address1"] = xml_escapeString(Banana.document.info("AccountingDataBase", "Address1"));
    param.fileInfo["Address"]["Address2"] = xml_escapeString(Banana.document.info("AccountingDataBase", "Address2"));
    param.fileInfo["Address"]["Zip"] = xml_escapeString(Banana.document.info("AccountingDataBase", "Zip"));
    param.fileInfo["Address"]["City"] = xml_escapeString(Banana.document.info("AccountingDataBase", "City"));
    param.fileInfo["Address"]["State"] = xml_escapeString(Banana.document.info("AccountingDataBase", "State"));
    param.fileInfo["Address"]["Country"] = xml_escapeString(Banana.document.info("AccountingDataBase", "Country"));
    param.fileInfo["Address"]["Web"] = xml_escapeString(Banana.document.info("AccountingDataBase", "Web"));
    param.fileInfo["Address"]["Email"] = xml_escapeString(Banana.document.info("AccountingDataBase", "Email"));
    param.fileInfo["Address"]["Phone"] = xml_escapeString(Banana.document.info("AccountingDataBase", "Phone"));
    param.fileInfo["Address"]["Mobile"] = xml_escapeString(Banana.document.info("AccountingDataBase", "Mobile"));
    param.fileInfo["Address"]["Fax"] = xml_escapeString(Banana.document.info("AccountingDataBase", "Fax"));
    param.fileInfo["Address"]["FiscalNumber"] = xml_escapeString(Banana.document.info("AccountingDataBase", "FiscalNumber"));
    param.fileInfo["Address"]["VatNumber"] = xml_escapeString(Banana.document.info("AccountingDataBase", "VatNumber"));
  }
  return param;
}

function saveData(output, param) {
  var codiceFiscale = param.fileInfo["Address"]["FiscalNumber"];
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

function setPeriod(param) {
  if (param.selezioneTrimestre) {
    if (param.valoreTrimestre === "0") {
      param.data.startDate = param.accountingYear.toString() + "0101";
      param.data.endDate = param.accountingYear.toString() + "0331";
    }
    else if (param.valoreTrimestre === "1") {
      param.data.startDate = param.accountingYear.toString() + "0401";
      param.data.endDate = param.accountingYear.toString() + "0630";
    }
    else if (param.valoreTrimestre === "2") {
      param.data.startDate = param.accountingYear.toString() + "0701";
      param.data.endDate = param.accountingYear.toString() + "0930";
    }
    else {
      param.data.startDate = param.accountingYear.toString() + "1001";
      param.data.endDate = param.accountingYear.toString() + "1231";
    }
  }
  else if (param.selezioneMese) {
    var month = parseInt(param.valoreMese) + 1;
    //months with 30 days
    if (month === 11 || month === 4 || month === 6 || month === 9) {
      param.data.startDate = param.accountingYear.toString() + zeroPad(month, 2) + "01";
      param.data.endDate = param.accountingYear.toString() + zeroPad(month, 2) + "30";
    }
    //month with 28 or 29 days
    else if (month === 2) {
      var day = 28;
      if (param.accountingYear % 4 == 0 && (param.accountingYear % 100 != 0 || param.accountingYear % 400 == 0)) {
        day = 29;
      }
      param.data.startDate = param.accountingYear.toString() + "0201" ;
      param.data.endDate = param.accountingYear.toString() + "02" + day.toString();
    }
    //months with 31 days
    else {
      param.data.startDate = param.accountingYear.toString() + zeroPad(month, 2) + "01" ;
      param.data.endDate = param.accountingYear.toString() + zeroPad(month, 2) + "31" ;
    }
  }
  return param;
}

function tableToCsv(table) {
    var result = "";
    for (var i = 0; i < table.length; i++) {
        var values = table[i];
        for (var j = 0; values && j < values.length; j++) {
            if (j > 0)
                result += ";";
            var value = values[j];
            result += value;
        }
        result += "\r\n";
    }
    return result;
}

function verifyParam(param) {
  //compatibilità con versioni precedenti
  if (param.repStartDate)
    param = {};
  if (!param.selezioneTrimestre && !param.selezioneMese) {
    param.selezioneTrimestre  = true;
    param.selezioneMese  = false;
  }
  if (!param.valoreTrimestre)
    param.valoreTrimestre  = '';
  if (!param.valoreMese)
    param.valoreMese  = '';
  if(!param.codicefiscaleDichiarante)
    param.codicefiscaleDichiarante = '';
  if(!param.codiceCarica)
    param.codiceCarica = '';
  if (!param.blocco)
    param.blocco = 'DTE';
  if(!param.progressivoInvio)
    param.progressivoInvio = '';
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
