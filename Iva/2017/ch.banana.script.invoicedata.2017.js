// Copyright [2016] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.script.invoicedata.2017.js
// @description = Comunicazione fatture emesse e ricevute (file xml)
// @doctype = *;110
// @encoding = utf-8
// @exportfilename = IT99999999999_DF_00001
// @exportfiletype = xml
// @includejs = ch.banana.script.invoicedata.2017.createinstance.js
// @includejs = ch.banana.script.italianvatreport.2017.xml.js
// @includejs = ch.banana.script.italianvatreport.2017.errors.js
// @inputdatasource = none
// @pubdate = 2017-04-20
// @publisher = Banana.ch SA
// @task = export.file
// @timeout = -1

function exec(inData) {

  if (!Banana.document)
    return "@Cancel";

  var param = initParam();
  var savedParam = Banana.document.scriptReadSettings();
  if (savedParam.length > 0) {
    param = JSON.parse(savedParam);
  }
  param = verifyParam(param);
  
  // Check version
  if (typeof (Banana.document.customerSupplierJournal) === 'undefined') {
    var msg = getErrorMessage(ID_ERR_VERSIONE);
    Banana.document.addMessage( msg, ID_ERR_VERSIONE);
    return "@Cancel";
  }

  // Ask period
  var selPeriod = Banana.Ui.getPeriod("Comunicazione fatture emesse e ricevute", Banana.document.startPeriod(), Banana.document.endPeriod(), param.repStartDate, param.repEndDate, true);
  if (!selPeriod)
    return "@Cancel";

  if (selPeriod.selectionChecked) {
    param.repStartDate = selPeriod.selectionStartDate;
    param.repEndDate = selPeriod.selectionEndDate;
  }
  else {
    param.repStartDate = selPeriod.startDate;
    param.repEndDate = selPeriod.endDate;
  }
  var bloccoId = 0;
  if (param.blocco == 'DTR')
    bloccoId = 1;
  var blocco = Banana.Ui.getItem("Comunicazione fatture emesse e ricevute", "Seleziona blocco", ["DTE","DTR"], bloccoId, false);
  if (!blocco)
    return "@Cancel";
  param.blocco = blocco;
  
  var paramToString = JSON.stringify(param);
  var value = Banana.document.scriptSaveSettings(paramToString);
  
  param = loadData(param);

  var output = createInstance(param);

  if (output != "@Cancel") {
    var report = Banana.Report.newReport("Dati delle fatture emesse e ricevute");
    var stylesheet = Banana.Report.newStyleSheet();
    printVatReport1(report, stylesheet, param);
    Banana.Report.preview(report, stylesheet);
  }

  return output;

}

/*
 * Get customer or supplier data from table Accounts
 */
function getAccount(accountId) {
  if (!accountId || accountId.length <= 0)
    return '';
  if (!Banana.document)
    return '';
  var tableAccounts = Banana.document.table('Accounts');
  if (tableAccounts) {
    var row = tableAccounts.findRowByValue('Account', accountId);
    if (row) {
      return row.toJSON();
    }
  }
  return '';
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
  return countryCode.toUpperCase();
}

function initParam()
{
  var param = {};
  param.repStartDate = '';
  param.repEndDate = '';
  if (Banana.document) {
    param.repStartDate = Banana.document.startPeriod();
    param.repEndDate = Banana.document.endPeriod();
  }
  param.blocco = 'DTE';
  return param;
}

function init_namespaces()
{
  var ns = [
    {
      'namespace' : 'http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v2.0',
      'prefix' : 'xmlns:df'
    },
    {
      'namespace' : 'http://www.w3.org/2001/XMLSchema-instance',
      'prefix' : 'xmlns:xsi'
    },
  ];
  return ns;
}
function init_schemarefs()
{
  var schemaRefs = [
    'http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v2.0 DatiFattura_v2.0.xsd',
  ];
  return schemaRefs;
};

function loadData(param)
{
  param.schemaRefs = init_schemarefs();
  param.namespaces = init_namespaces();

  var journal = Banana.document.customerSupplierJournal(
    Banana.document.ORIGINTYPE_CURRENT, Banana.document.ACCOUNTTYPE_NORMAL);
  var filteredRows = journal.findRows(loadData_filterTransactions);

  if (!journal || !filteredRows)
    return false;

  //Load customers/suppliers accounts
  var periodStart = Banana.Converter.stringToDate(param.repStartDate);
  var periodEnd = Banana.Converter.stringToDate(param.repEndDate);
  param.customers = {};
  param.suppliers = {};

  for (var i = 0; i < filteredRows.length; i++) {
    //Check period
    var validPeriod = false;
    var value = filteredRows[i].value("JDate");
    var currentDate = Banana.Converter.stringToDate(value, "YYYY-MM-DD");
    if (currentDate >= periodStart && currentDate <= periodEnd)
      validPeriod = true;
    if (!validPeriod)
      continue;

    //Only rows with JInvoiceRowCustomerSupplier=1 (customer) or JInvoiceRowCustomerSupplier=2 (supplier)
    var keepRow=false;
    var isCustomer = filteredRows[i].value("JInvoiceRowCustomerSupplier");
    if (param.blocco == 'DTE' && isCustomer=='1')
      keepRow=true;
    if (param.blocco == 'DTR' && isCustomer=='2')
      keepRow=true;
    if (!keepRow)
      continue;

    var accountId = filteredRows[i].value("JAccount");
    if (accountId && accountId.length>0) {
      var accountObj = JSON.parse(getAccount(accountId));
      if (accountObj) {
        if (isCustomer == '1') {
          param.customers[accountId] = accountObj;
        }
        else if (isCustomer == '2') {
          param.suppliers[accountId] = accountObj;
        }
      }
    }
  }

  //Load rows
  var tableVatCodes = Banana.document.table('VatCodes');
  var tColumnNames = journal.columnNames;
  
  for (var i = 0; i < filteredRows.length; i++) {
    //Checks period
    var validPeriod = false;
    var value = filteredRows[i].value("JDate");
    var currentDate = Banana.Converter.stringToDate(value, "YYYY-MM-DD");
    if (currentDate >= periodStart && currentDate <= periodEnd)
      validPeriod = true;
    if (!validPeriod)
      continue;

    //Checks vatCode
    var vatCode = filteredRows[i].value("JVatCodeWithoutSign");
    if (vatCode.length<=0)
      continue;

   //Checks if customer/supplier row
   var isCustomer = filteredRows[i].value("JInvoiceRowCustomerSupplier");
   if (isCustomer)
     continue;

   //Checks customer or supplier accounts
   var isCustomer=false;
   var isSupplier=false;
   var accountId = filteredRows[i].value("JAccount");
   var contraAccountId = filteredRows[i].value("JContraAccount");
   if (accountId in param.customers) {
     isCustomer = true;
   }
   if (contraAccountId in param.customers) {
     isCustomer = true;
     accountId = contraAccountId;
   }
   if (accountId in param.suppliers) {
     isSupplier = true;
   }
   if (contraAccountId in param.suppliers) {
     isSupplier = true;
     accountId = contraAccountId;
   }
   if (!isCustomer && !isSupplier)
     continue;

    //Add data from journal
    var jsonLine = {};
    for (var j = 0; j < tColumnNames.length; j++) {
      var columnName = tColumnNames[j];
      value = filteredRows[i].value(columnName);
      if (value)
        jsonLine[columnName] = value;
      else
        jsonLine[columnName] = '';
    }

    //Additional data

    //DF_Aliquota
    jsonLine["DF_Aliquota"] = '';
    value = filteredRows[i].value("VatRate");
    if (Banana.SDecimal.isZero(value))
      value = '0.00';
    else
      value = Banana.SDecimal.abs(value);
    jsonLine["DF_Aliquota"] = value;

    //DF_Imponibile
    jsonLine["DF_Imponibile"] = '';
    value = filteredRows[i].value("JVatTaxable");
    if (Banana.SDecimal.isZero(value))
      value = '0.00';
    else
      value = Banana.SDecimal.abs(value);
    jsonLine["DF_Imponibile"] = value;

    //DF_Imposta
    jsonLine["DF_Imposta"] = '';
    value = filteredRows[i].value("VatPosted");
    if (Banana.SDecimal.isZero(value))
      value = '0.00';
    else
      value = Banana.SDecimal.abs(value);
    jsonLine["DF_Imposta"] = value;

    //DF_Detraibile
    //DF_Deducibile
    jsonLine["DF_Detraibile"] = '';
    jsonLine["DF_Deducibile"] = '';
    value = filteredRows[i].value("VatPercentNonDeductible");
    if (!Banana.SDecimal.isZero(value)) {
      if (!Banana.SDecimal.isZero(value)) {
        var detraibile = Banana.SDecimal.subtract('100', value);
        jsonLine["DF_Detraibile"] = detraibile;
      }
    }

    //DF_Gruppo_IVA
    jsonLine["DF_Gr_IVA"] = '';
    if (vatCode.length && tableVatCodes) {
      var rowVatCodes = tableVatCodes.findRowByValue('VatCode', vatCode);
      if (rowVatCodes) {
        jsonLine["DF_Gr_IVA"] = rowVatCodes.value("Gr");
      }
    }

    //DF_Lordo
    /*jsonLine["DF_Lordo"] = '';
    value = Banana.SDecimal.add(filteredRows[i].value("JVatTaxable"), filteredRows[i].value("VatAmount"));
    if (Banana.SDecimal.isZero(value))
      value = '0.00';
    else
      value = Banana.SDecimal.abs(value);
    jsonLine["DF_Lordo"] = value;*/

    //DF_TipoDoc
    //TD01 Fattura  
    //TD04 Nota di credito  
    //TD05 Nota di debito
    //TD07 Fattura semplificata
    //TD08 Nota di credito semplificata
    //TD10 Fattura di acquisto intracomunitario beni
    //TD11 Fattura di acquisto intracomunitario servizi
    jsonLine["DF_TipoDoc"] = '';
    var tipoDoc = filteredRows[i].value("JInvoiceDocType");
    if (tipoDoc.length<=0)
      tipoDoc =  filteredRows[i].value("DocType");

    if (jsonLine["JVatNegative"]  == '1') {
      if (isCustomer) {
        if (tipoDoc == '14' || tipoDoc == '12')
          jsonLine["DF_TipoDoc"] = 'TD05';
        else
          jsonLine["DF_TipoDoc"] = 'TD01';
      }
      else if (isSupplier) {
        jsonLine["DF_TipoDoc"] = 'TD04';
      }
    }
    else {
      if (isCustomer) {
        jsonLine["DF_TipoDoc"] = 'TD04';
      }
      else if (isSupplier) {
        if (tipoDoc == '24' || tipoDoc == '22')
          jsonLine["DF_TipoDoc"] = 'TD05';
        else
          jsonLine["DF_TipoDoc"] = 'TD01';
      }
    }

    if (vatCode.length && isSupplier && tableVatCodes) {
      var rowVatCodes = tableVatCodes.findRowByValue('VatCode', vatCode);
      if (rowVatCodes) {
        var vatGr = rowVatCodes.value("Gr");
        if (vatGr && vatGr.indexOf("EU-S")>=0) {
          jsonLine["DF_TipoDoc"] = 'TD11';
        }
        else if (vatGr && vatGr.indexOf("EU")>=0) {
          jsonLine["DF_TipoDoc"] = 'TD10';
        }
      }
    }

    //DF_Natura
    //N1 escluse ex art. 15
    //N2 non soggette
    //N3 non imponibili
    //N4 esenti
    //N5 regime del margine / IVA non esposta in fattura
    //N6 inversione contabile (reverse charge)
    //N7 IVA assolta in altro stato UE 
    jsonLine["DF_Natura"] = '';
    if (Banana.document && vatCode.length) {
      if (tableVatCodes) {
        var rowVatCodes = tableVatCodes.findRowByValue('VatCode', vatCode);
        if (rowVatCodes) {
          var vatGr = rowVatCodes.value("Gr");
          if (vatGr.indexOf("-FC")>=0) {
            jsonLine["DF_Natura"] = 'N1';
          }
          else if (vatGr.startsWith("V-NI") || vatGr.startsWith("A-NI")) {
            jsonLine["DF_Natura"] = 'N3';
          }
          else if (vatGr.startsWith("V-ES") || vatGr.startsWith("A-ES")) {
            jsonLine["DF_Natura"] = 'N4';
          }
          else if (vatGr.startsWith("V-NE") || vatGr.startsWith("A-NE")) {
            jsonLine["DF_Natura"] = 'N5';
          }
          else if (vatGr.indexOf("-EU")>=0) {
            jsonLine["DF_Natura"] = 'N6';
          }
          else if (vatGr.indexOf("-REV")>=0) {
            jsonLine["DF_Natura"] = 'N7';
          }
        }
      }
    }

    //Controllo DF_Natura e aliquota
    //Se il campo Natura è valorizzato il campo Imposta dev'essere vuoto
    //Eccezione: codifica “N6” vanno anche obbligatoriamente valorizzati i campi Imposta e Aliquota per le fatture ricevute
    if (param.blocco != "DTR" && jsonLine["DF_Natura"] != "N6") {
      var aliquota = jsonLine["DF_Aliquota"];
      var imposta = jsonLine["DF_Imposta"];
      var msg = '[' + jsonLine["JTableOrigin"] + ': Riga ' + (parseInt(jsonLine["JRowOrigin"])+1).toString() + '] ';
      if ((!Banana.SDecimal.isZero(aliquota) || !Banana.SDecimal.isZero(imposta)) && jsonLine["DF_Natura"].length>0) {
        msg += getErrorMessage(ID_ERR_XML_ELEMENTO_NATURA_PRESENTE);
        Banana.document.addMessage( msg, ID_ERR_XML_ELEMENTO_NATURA_PRESENTE);
      }
      else if ((Banana.SDecimal.isZero(aliquota) || Banana.SDecimal.isZero(imposta))  && jsonLine["DF_Natura"].length<=0) {
        msg += getErrorMessage(ID_ERR_XML_ELEMENTO_NATURA_NONPRESENTE);
        Banana.document.addMessage( msg, ID_ERR_XML_ELEMENTO_NATURA_NONPRESENTE);
      }
    }

    //Aggiunge la riga nei parametri
    if (isCustomer) {
      if (!param.customers[accountId].rows)
        param.customers[accountId].rows = [];
      param.customers[accountId].rows.push(jsonLine);
    }
    else if (isSupplier) {
      if (!param.suppliers[accountId].rows)
        param.suppliers[accountId].rows = [];
      param.suppliers[accountId].rows.push(jsonLine);
    }
  }
  
  //Table FileInfo
  param.fileInfo = {};
  param.fileInfo["BasicCurrency"] = Banana.document.info("AccountingDataBase", "BasicCurrency");
  param.fileInfo["OpeningDate"] = Banana.document.info("AccountingDataBase", "OpeningDate");
  param.fileInfo["ClosureDate"] = Banana.document.info("AccountingDataBase", "ClosureDate");
  param.fileInfo["CustomersGroup"] = Banana.document.info("AccountingDataBase", "CustomersGroup");
  param.fileInfo["SuppliersGroup"] = Banana.document.info("AccountingDataBase", "SuppliersGroup");
  param.fileInfo["Address"] = {};
  param.fileInfo["Address"]["Company"] = Banana.document.info("AccountingDataBase", "Company");
  param.fileInfo["Address"]["Courtesy"] = Banana.document.info("AccountingDataBase", "Courtesy");
  param.fileInfo["Address"]["Name"] = Banana.document.info("AccountingDataBase", "Name");
  param.fileInfo["Address"]["FamilyName"] = Banana.document.info("AccountingDataBase", "FamilyName");
  param.fileInfo["Address"]["Address1"] = Banana.document.info("AccountingDataBase", "Address1");
  param.fileInfo["Address"]["Address2"] = Banana.document.info("AccountingDataBase", "Address2");
  param.fileInfo["Address"]["Zip"] = Banana.document.info("AccountingDataBase", "Zip");
  param.fileInfo["Address"]["City"] = Banana.document.info("AccountingDataBase", "City");
  param.fileInfo["Address"]["State"] = Banana.document.info("AccountingDataBase", "State");
  param.fileInfo["Address"]["Country"] = Banana.document.info("AccountingDataBase", "Country");
  param.fileInfo["Address"]["Web"] = Banana.document.info("AccountingDataBase", "Web");
  param.fileInfo["Address"]["Email"] = Banana.document.info("AccountingDataBase", "Email");
  param.fileInfo["Address"]["Phone"] = Banana.document.info("AccountingDataBase", "Phone");
  param.fileInfo["Address"]["Mobile"] = Banana.document.info("AccountingDataBase", "Mobile");
  param.fileInfo["Address"]["Fax"] = Banana.document.info("AccountingDataBase", "Fax");
  param.fileInfo["Address"]["FiscalNumber"] = Banana.document.info("AccountingDataBase", "FiscalNumber");
  param.fileInfo["Address"]["VatNumber"] = Banana.document.info("AccountingDataBase", "VatNumber");
  
  //debug
  /*var line = [];
  var transactions = [];
  for (var i = 0; i < filteredRows.length; i++) {
    var jsonObj = filteredRows[i];
    for (var key in jsonObj) {
      line.push(jsonObj[key]);
    }
    transactions.push(line);
    line = [];
  }
  line = [];
  var header = [];
  if (filteredRows.length>0) {
    var jsonObj = filteredRows[0];
    for (var key in jsonObj) {
      line.push(key);
    }
    header.push(line);
  }
  return tableToCsv(header.concat(transactions));*/
  
  return param;
  
}

function loadData_filterTransactions(row, index, table) {

  //only normal transaction with vat
  //OperationType_None = 0, OperationType_Opening = 1, OperationType_CarryForward = 2,
  //OperationType_Transaction = 3, OperationType_Closure = 4, OperationType_Total = 6
  var operationType = row.value("JOperationType");
  if (operationType && operationType != Banana.document.OPERATIONTYPE_TRANSACTION)
    return false;

  var isVatOperation = row.value("JVatIsVatOperation");
  if (isVatOperation)
    return false;
    
  return true;
}

function printVatReport1(report, stylesheet, param) {

  // Styles
  stylesheet.addStyle("@page", "size:landscape;margin-top:1em;font-size: 8px; ");
  stylesheet.addStyle("phead", "font-weight: bold; margin-bottom: 1em");
  stylesheet.addStyle("thead", "font-weight: bold;background-color:#eeeeee;");
  stylesheet.addStyle("td", "padding:1px;vertical-align:top;");
  stylesheet.addStyle("td.title", "background-color:#ffffff;font-size:10px;");
  stylesheet.addStyle("td.period", "background-color:#ffffff;");
  stylesheet.addStyle(".amount", "text-align: right; border: 1px solid black;");
  stylesheet.addStyle(".center", "text-align: center;");
  stylesheet.addStyle(".notes", "padding: 2em;font-style:italic;");
  stylesheet.addStyle(".period", "padding-bottom: 1em;");
  stylesheet.addStyle(".right", "text-align: right;");
  stylesheet.addStyle(".rowName", "font-weight: bold;padding-top:5px;border-top:1px solid black;");
  stylesheet.addStyle(".table1", "margin-top:1em;width:100%;");
  stylesheet.addStyle(".warning", "color: red;font-size:8px;");

  if (param.customers.length<=0 && param.suppliers.length<=0)
    return;

  //Page numbers
  var reportFooter = report.getFooter();
  reportFooter.addClass("center");
  //Note
  reportFooter.addParagraph("N1 escluse ex art. 15, N2 non soggette, N3 non imponibili, N4 esenti, N5 regime del margine/IVA non esposta in fattura, N6 inversione contabile (reverse charge), N7 IVA assolta in altro stato UE", "notes");
  reportFooter.addParagraph(Banana.Converter.toLocaleDateFormat(new Date()) + " Pagina ").addFieldPageNr();
  

  //Address
  if (param.fileInfo["Address"]["Company"].length)
    report.addParagraph(param.fileInfo["Address"]["Company"], "address");
  if (param.fileInfo["Address"]["Name"].length || param.fileInfo["Address"]["FamilyName"].length)
    report.addParagraph(param.fileInfo["Address"]["Name"] + ' ' + param.fileInfo["Address"]["FamilyName"], "address");
  if (param.fileInfo["Address"]["Address1"].length)
    report.addParagraph(param.fileInfo["Address"]["Address1"], "address");
  if (param.fileInfo["Address"]["Zip"].length || param.fileInfo["Address"]["City"].length)
    report.addParagraph(param.fileInfo["Address"]["Zip"] + ' ' + param.fileInfo["Address"]["City"], "address");
  if (param.fileInfo["Address"]["VatNumber"].length)
    report.addParagraph('P.I.:' + param.fileInfo["Address"]["VatNumber"], "address");
  if (param.fileInfo["Address"]["FiscalNumber"].length)
    report.addParagraph('C.F.:' + param.fileInfo["Address"]["FiscalNumber"], "address");


  
  //Print table
  //Title
  var table = report.addTable("table1");
  var headerRow = table.getHeader().addRow();
  headerRow.addCell("Comunicazione dei dati delle fatture", "title", 15);
  //Period
  var periodo = "Periodo dal " + Banana.Converter.toLocaleDateFormat(param.repStartDate);
  periodo +=" al " + Banana.Converter.toLocaleDateFormat(param.repEndDate);
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
  for (var i in param.customers) {
    var rowName = table.addRow();
    rowName.addCell("cliente", "rowName");
    rowName.addCell(param.customers[i]["Description"],"rowName",4);
    rowName.addCell(getCountryCode(param.customers[i]),"rowName",2);
    rowName.addCell(param.customers[i]["VatNumber"],"rowName",2);
    rowName.addCell(param.customers[i]["FiscalNumber"],"rowName",6);
    for (var j in param.customers[i].rows) {
      var jsonObj = param.customers[i].rows[j];
      var row = table.addRow();
      row.addCell(jsonObj["DF_TipoDoc"]);
      row.addCell(Banana.Converter.toLocaleDateFormat(jsonObj["JInvoiceIssueDate"]));
      row.addCell(jsonObj["DocInvoice"]);
      row.addCell(Banana.Converter.toLocaleDateFormat(jsonObj["JDate"]));
      row.addCell(jsonObj["JDescription"]);
      row.addCell(jsonObj["JAccount"], "amount");
      row.addCell(jsonObj["JContraAccount"], "amount");
      row.addCell(jsonObj["JVatCodeWithoutSign"], "amount");
      row.addCell(jsonObj["DF_Gr_IVA"], "amount");
      row.addCell(Banana.Converter.toLocaleNumberFormat(jsonObj["DF_Imponibile"],2,false), "amount");
      row.addCell(Banana.Converter.toLocaleNumberFormat(jsonObj["DF_Imposta"],2,false), "amount");
      row.addCell(Banana.Converter.toLocaleNumberFormat(jsonObj["DF_Aliquota"],2,false), "amount");
      row.addCell(jsonObj["DF_Natura"], "amount");
      row.addCell(Banana.Converter.toLocaleNumberFormat(jsonObj["DF_Detraibile"],2,false), "amount");
      row.addCell(jsonObj["DF_Deducibile"], "amount");
    }
  }
  for (var i in param.suppliers) {
    var rowName = table.addRow();
    rowName.addCell("fornitore", "rowName");
    rowName.addCell(param.suppliers[i]["Description"],"rowName",4);
    rowName.addCell(getCountryCode(param.suppliers[i]),"rowName",2);
    rowName.addCell(param.suppliers[i]["VatNumber"],"rowName",2);
    rowName.addCell(param.suppliers[i]["FiscalNumber"],"rowName",6);
    for (var j in param.suppliers[i].rows) {
      var jsonObj = param.suppliers[i].rows[j];
      var row = table.addRow();
      row.addCell(jsonObj["DF_TipoDoc"]);
      row.addCell(Banana.Converter.toLocaleDateFormat(jsonObj["JInvoiceIssueDate"]));
      row.addCell(jsonObj["DocInvoice"]);
      row.addCell(Banana.Converter.toLocaleDateFormat(jsonObj["JDate"]));
      row.addCell(jsonObj["JDescription"]);
      row.addCell(jsonObj["JAccount"], "amount");
      row.addCell(jsonObj["JContraAccount"], "amount");
      row.addCell(jsonObj["JVatCodeWithoutSign"], "amount");
      row.addCell(jsonObj["DF_Gr_IVA"], "amount");
      row.addCell(Banana.Converter.toLocaleNumberFormat(jsonObj["DF_Imponibile"],2,false), "amount");
      row.addCell(Banana.Converter.toLocaleNumberFormat(jsonObj["DF_Imposta"],2,false), "amount");
      row.addCell(Banana.Converter.toLocaleNumberFormat(jsonObj["DF_Aliquota"],2,false), "amount");
      row.addCell(jsonObj["DF_Natura"], "amount");
      row.addCell(Banana.Converter.toLocaleNumberFormat(jsonObj["DF_Detraibile"],2,false), "amount");
      row.addCell(jsonObj["DF_Deducibile"], "amount");
    }
  }

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
   if (!param.repStartDate)
     param.repStartDate = '';
   if (!param.repEndDate)
     param.repEndDate = '';
   if (!param.blocco)
     param.blocco = 'DTE';
   return param;
}