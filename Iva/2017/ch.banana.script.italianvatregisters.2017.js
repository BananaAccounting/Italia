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
// @id = ch.banana.script.italianvatregisters.2017.js
// @description = Registri IVA 
// @doctype = *;110
// @encoding = utf-8
// @includejs = ch.banana.script.italianvatreport.2017.errors.js
// @includejs = ch.banana.script.italianvatreport.2017.xml.js
// @inputdatasource = none
// @pubdate = 2017-06-13
// @publisher = Banana.ch SA
// @task = app.command
// @timeout = -1

/*
 * Update script's parameters
*/
function settingsDialog() {

  var param = initParam();
  var savedParam = Banana.document.scriptReadSettings();
  if (savedParam.length > 0) {
    param = JSON.parse(savedParam);
  }
  param = verifyParam(param);
  
  var accountingData = {};
  accountingData = readAccountingData(accountingData);
  if (accountingData.accountingYear.length<=0) {
    return false;
  }
  
  /*var dialog = Banana.Ui.createUi("ch.banana.script.italianvatregisters.2017.dialog.ui");
  dialog.periodoGroupBox.title += ' ' + accountingData.accountingYear;

  //dialog functions
  dialog.checkdata = function () {
    dialog.accept();
  }
  dialog.enableButtons = function () {
  }
  dialog.showHelp = function () {
    Banana.Ui.showHelp("ch.banana.script.italianvatregisters.2017.js");
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
  Banana.document.scriptSaveSettings(paramToString);
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
    param = JSON.parse(Banana.document.scriptReadSettings());
  }
  
  param = readAccountingData(param);
  param = loadData(param);

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
  for (var index=0; index<param.journals.length; index++) {
    printRegister(report, stylesheet, param.journals[index], "VENDITE");
    printRegister(report, stylesheet, param.journals[index], "ACQUISTI");
    printRegister(report, stylesheet, param.journals[index], "CORRISPETTIVI");
    if (index+1<param.journals.length)
      report.addPageBreak();
  }
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

function loadData(param)
{
  var journal = Banana.document.journalCustomersSuppliers(
    Banana.document.ORIGINTYPE_CURRENT, Banana.document.ACCOUNTTYPE_NORMAL);

  if (!journal)
    return false;

  //Load customers/suppliers accounts
  param.customers = {};
  param.suppliers = {};
  for (var i = 0; i < journal.rows.length; i++) {
    //Only rows with JInvoiceRowCustomerSupplier=1 (customer) or JInvoiceRowCustomerSupplier=2 (supplier)
    var description = journal.row(i).value("Description");
    var isCustomerSupplier = journal.row(i).value("JInvoiceRowCustomerSupplier").toString();
    if (isCustomerSupplier != '1' && isCustomerSupplier != '2')
      continue;

    var accountId = journal.row(i).value("JAccount").toString();
    if (accountId && accountId.length>0) {
      if (isCustomerSupplier == '1' && !param.customers[accountId]) {
        var accountObj = getAccount(accountId);
        param.customers[accountId] = accountObj;
      }
      else if (isCustomerSupplier == '2' && !param.suppliers[accountId]) {
        var accountObj = getAccount(accountId);
        param.suppliers[accountId] = accountObj;
      }
    }
  }

  //Load journal
  //Whole periods
  param.journals = [];
  var startDate = Banana.document.startPeriod();
  var endDate = Banana.document.endPeriod();
  param = loadDataPeriod(param, journal, startDate, endDate);
  
  //Other periods
  
  return param;

}

function loadDataPeriod(param, journal, _startDate, _endDate) 
{
  if (!journal)
    return;

  var data = {};
  var periodStart = Banana.Converter.toDate(_startDate);
  var periodEnd = Banana.Converter.toDate(_endDate);
  var tableVatCodes = Banana.document.table('VatCodes');
  var tColumnNames = journal.columnNames;

   //Load journal, keep only vat operation
  var filteredRows = journal.findRows(loadDataPeriod_filterTransactions);
  if (!filteredRows)
    return false;

  //debugger;
  //Load data from journal
  for (var i = 0; i < filteredRows.length; i++) {
    //Checks period
    var validPeriod = false;
    var value = filteredRows[i].value("JDate");
    var currentDate = Banana.Converter.stringToDate(value, "YYYY-MM-DD");
    if (currentDate >= periodStart && currentDate <= periodEnd)
      validPeriod = true;
    if (!validPeriod)
      continue;

    var jsonLine = {};
    for (var j = 0; j < tColumnNames.length; j++) {
      var columnName = tColumnNames[j];
      value = filteredRows[i].value(columnName);
      if (value)
        jsonLine[columnName] = xml_escapeString(value);
      else
        jsonLine[columnName] = '';
    }

    var jsonLine = {};
    for (var j = 0; j < tColumnNames.length; j++) {
      var columnName = tColumnNames[j];
      value = filteredRows[i].value(columnName);
      if (value)
        jsonLine[columnName] = xml_escapeString(value);
      else
        jsonLine[columnName] = '';
    }

    //Additional data
    //AD_InvoiceRowCustomerSupplier
    //jsonLine["AD_InvoiceRowCustomerSupplier"] = '';
    //var invoiceAccountId = filteredRows[i].value("JInvoiceAccountId").toString();
    //if (invoiceAccountId.length && param.customers[invoiceAccountId])
    //  jsonLine["AD_InvoiceRowCustomerSupplier"] = '1';
    //else if (invoiceAccountId.length && param.suppliers[invoiceAccountId])
    //  jsonLine["AD_InvoiceRowCustomerSupplier"] = '2';
    //AD_AccountCustomer -> JInvoiceAccountId
    //AD_AccountCustomerDes -> oggetto customers[invoiceAccountId]
    //AD_AccountCustomerType -> AD_InvoiceRowCustomerSupplier
    //AD_FiscalNumber
    //jsonLine["AD_FiscalNumber"] = '';

    //AD_AmountLordo
    value = Banana.SDecimal.add(filteredRows[i].value("JVatTaxable"), filteredRows[i].value("VatAmount"));
    value = Banana.SDecimal.abs(value);
    jsonLine["AD_AmountLordo"] = value;

    //AD_AmountImponibile
    //jsonLine["AD_AmountImponibile"] = '';
    //AD_AmountNonImponibile
    //jsonLine["AD_AmountNonImponibile"] = '';
    //AD_AmountEsente
    //jsonLine["AD_AmountEsente"] = '';
    //AD_AmountNonEsposto
    //jsonLine["AD_AmountNonEsposto"] = '';
    //AD_NVAPAmountLordo
    //jsonLine["AD_AmountNonEsposto"] = '';
    //AD_NVAPAmountImponibile
    //jsonLine["AD_NVAPAmountImponibile"] = '';
    //AD_NVAPAmountNonImponibile
    //jsonLine["AD_NVAPAmountNonImponibile"] = '';
    //AD_NVAPAmountEsente
    //jsonLine["AD_NVAPAmountEsente"] = '';
    //AD_NVAPAmountNonEsposto
    //jsonLine["AD_NVAPAmountNonEsposto"] = '';
    //AD_CustomerHeader
    //jsonLine["AD_CustomerHeader"] = '';
    //AD_NotaDiVariazione
    //jsonLine["AD_NotaDiVariazione"] = '';

    //AD_GrIva
    //AD_Gr1Iva
    jsonLine["AD_GrIva"] = '';
    jsonLine["AD_Gr1Iva"] = '';
    var vatCode = filteredRows[i].value("JVatCodeWithoutSign");
    if (vatCode.length && tableVatCodes) {
      var rowVatCodes = tableVatCodes.findRowByValue('VatCode', vatCode);
      if (rowVatCodes) {
        jsonLine["AD_GrIva"] = rowVatCodes.value("Gr");
        jsonLine["AD_Gr1Iva"] = rowVatCodes.value("Gr1");
      }
    }

    //AD_Registro
    var registro = '';
    if (jsonLine["AD_GrIva"].startsWith("V"))
      registro = "VENDITE";
    else if (jsonLine["AD_GrIva"].startsWith("C"))
      registro = "CORRISPETTIVI";
    else if (jsonLine["AD_GrIva"].startsWith("A"))
      registro = "ACQUISTI";
    else if (jsonLine["AD_GrIva"].startsWith("L"))
      registro = "LIQUIDAZIONI";
    else
      registro = "Registro non trovato: " + jsonLine["AD_GrIva"];
    jsonLine["AD_Registro"] = registro;

    //AD_ProgRegistro
    //jsonLine["AD_ProgRegistro"] = '';
    //AD_PercIvaAssoluto
    //jsonLine["AD_PercIvaAssoluto"] = '';
    //AD_CRContraAccount
    //jsonLine["AD_CRContraAccount"] = '';
    //AD_CRContraAccountDes
    //jsonLine["AD_CRContraAccountDes"] = '';
    //AD_CRAmount
    //jsonLine["AD_CRAmount"] = '';
    //AD_CorrFattureNormali
    //jsonLine["AD_CorrFattureNormali"] = '';
    //AD_CorrFattureFiscali
    //jsonLine["AD_CorrFattureFiscali"] = '';
    //AD_CorrFattureScontrini
    //jsonLine["AD_CorrFattureScontrini"] = '';
    //AD_CorrFattureDifferite
    //jsonLine["AD_CorrFattureDifferite"] = '';
    //AD_CorrFattureCorrispettiviNormali
    //jsonLine["AD_CorrFattureCorrispettiviNormali"] = '';
    //AD_CorrFattureCorrispettiviScontrini
    //jsonLine["AD_CorrFattureCorrispettiviScontrini"] = '';
    //AD_CorrFattureRicevuteFiscali
    //jsonLine["AD_CorrFattureRicevuteFiscali"] = '';
    //AD_CorrFattureTotaleGiornaliero
    //jsonLine["AD_CorrFattureTotaleGiornaliero"] = '';

    //Aggiunge la riga nei parametri
    if (!data.rows)
      data.rows = [];
    data.rows.push(jsonLine);
  }
  
  data.startDate = _startDate;
  data.endDate = _endDate;
  param.journals.push(data);
  return param;

  //debug
  /*var line = [];
  var transactions = [];
  for (var i = 0; i < param.journal.rows.length; i++) {
    var jsonObj = param.journal.rows[i];
    for (var key in jsonObj) {
      line.push(xml_unescapeString(jsonObj[key]));
    }
    transactions.push(line);
    line = [];
  }
  line = [];
  var header = [];
  if (param.journal.rows.length>0) {
    var jsonObj = param.journal.rows[0];
    for (var key in jsonObj) {
      line.push(key);
    }
    header.push(line);
  }
  Banana.Ui.showText(tableToCsv(header.concat(transactions)));*/
}

function loadDataPeriod_filterTransactions(row, index, table) {
  //only normal transaction with vat
  //OperationType_None = 0, OperationType_Opening = 1, OperationType_CarryForward = 2,
  //OperationType_Transaction = 3, OperationType_Closure = 4, OperationType_Total = 6
  var operationType = row.value("JOperationType");
  if (operationType && operationType != Banana.document.OPERATIONTYPE_TRANSACTION)
    return false;

  var isVatOperation = row.value("JVatIsVatOperation");
  if (!isVatOperation)
    return false;
    
  return true;
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

  var accountingOpeningDate = param.fileInfo["OpeningDate"];
  var accountingClosureDate = param.fileInfo["ClosureDate"];

  var openingYear = 0;
  var closureYear = 0;
  if (accountingOpeningDate.length >= 10)
    openingYear = accountingOpeningDate.substring(0, 4);
  if (accountingClosureDate.length >= 10)
    closureYear = accountingClosureDate.substring(0, 4);

  param.accountingYear = '';
  if (openingYear > 0 && openingYear === closureYear)
    param.accountingYear = openingYear;

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
