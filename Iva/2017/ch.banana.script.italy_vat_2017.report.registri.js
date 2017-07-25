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
// @description = Registri IVA 2017
// @doctype = *;110
// @encoding = utf-8
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
  
  /*var dialog = Banana.Ui.createUi("ch.banana.script.italy_vat_2017.report.registri.dialog.ui");
  dialog.periodoGroupBox.title += ' ' + accountingData.accountingYear;

  //dialog functions
  dialog.checkdata = function () {
    dialog.accept();
  }
  dialog.enableButtons = function () {
  }
  dialog.showHelp = function () {
    Banana.Ui.showHelp("ch.banana.script.italy_vat_2017.report.registri.js");
  }
  dialog.buttonBox.accepted.connect(dialog, "checkdata");
  dialog.buttonBox.helpRequested.connect(dialog, "showHelp");
  dialog.periodoGroupBox.trimestreRadioButton.clicked.connect(dialog, "enableButtons");
  
  Banana.application.progressBar.pause();
  dialog.enableButtons();
  var dlgResult = dialog.exec();
  Banana.application.progressBar.resume();

  if (dlgResult !== 1)
    return false;

  param.valoreTrimestre = dialog.periodoGroupBox.trimestreComboBox.currentIndex.toString();*/
  
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
  param.data = {};  
  param = setPeriod(param);
  param = loadJournalCustomersSuppliers(param);
  
  //Print report
  var report = Banana.Report.newReport("Registri IVA");
  var stylesheet = Banana.Report.newStyleSheet();
  stylesheet.addStyle("@page", "size:portrait;margin:2em;font-size: 8px; ");
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
  /*for (var index=0; index<param.journals.length; index++) {
    printRegister(report, stylesheet, param.journals[index], "VENDITE");
    printRegister(report, stylesheet, param.journals[index], "ACQUISTI");
    printRegister(report, stylesheet, param.journals[index], "CORRISPETTIVI");
    if (index+1<param.journals.length)
      report.addPageBreak();
  }*/
  Banana.Report.preview(report, stylesheet);
  return;

}

/*
 * Get customer or supplier data from table Accounts
 */
function getAccount(accountId) {
  var jsonObj = {};
  if (!accountId || accountId.length <= 0)
    return jsonObj;
  if (!Banana.document)
    return jsonObj;

  var tableAccounts = Banana.document.table('Accounts');
  if (tableAccounts) {
    var row = tableAccounts.findRowByValue('Account', accountId);
    if (row) {
      var jsonString = row.toJSON();
      jsonObj = JSON.parse(jsonString);
      for (var key in jsonObj) {
        if (jsonObj[key].length > 0)
          jsonObj[key] = xml_escapeString(jsonObj[key]);
      }
    }
  }
  return jsonObj;
}

function initParam()
{
  var param = {};
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

function setPeriod(param) {
  param.data.startDate = Banana.document.startPeriod();
  param.data.endDate = Banana.document.endPeriod();
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
