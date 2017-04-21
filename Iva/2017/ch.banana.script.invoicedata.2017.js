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
// @description = Dati delle fatture emesse e ricevute (file xml)
// @doctype = *;110
// @encoding = utf-8
// @exportfilename = IT99999999999_DF_00001
// @exportfiletype = xml
// @includejs = ch.banana.script.invoicedata.2017.createinstance.js
// @includejs = ch.banana.script.italianvatreport.2017.xml.js
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
  
  // Ask period
  var selPeriod = Banana.Ui.getPeriod("Periodo", Banana.document.startPeriod(), Banana.document.endPeriod(), param.repStartDate, param.repEndDate, true);
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

  var paramToString = JSON.stringify(param);
  var value = Banana.document.scriptSaveSettings(paramToString);
  
  param = loadData(param);

  var output = createInstance(param)

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

function initParam()
{
  var param = {};
  param.repStartDate = '';
  param.repEndDate = '';
  if (Banana.document) {
    param.repStartDate = Banana.document.startPeriod();
    param.repEndDate = Banana.document.endPeriod();
  }
  param.schemaRefs = init_schemarefs();
  param.namespaces = init_namespaces();
  return param;
}

function init_namespaces()
{
  var ns = [
    {
      'namespace' : 'http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2',
      'prefix' : 'xmlns:ns2',
    },
  ];
  return ns;
}
function init_schemarefs()
{
  var schemaRefs = [
    'http://ivaservizi.agenziaentrate.gov.it/docs/xsd/DatiFattura_v2.0.xsd',
  ];
  return schemaRefs;
};

function loadData(param)
{
  var journal = Banana.document.journal(
    Banana.document.ORIGINTYPE_CURRENT, Banana.document.ACCOUNTTYPE_NORMAL);
  var filteredRows = journal.findRows(loadData_filterTransactions);

  if (!journal || !filteredRows)
    return false;
  
  var periodStart = Banana.Converter.stringToDate(param.repStartDate);
  var periodEnd = Banana.Converter.stringToDate(param.repEndDate);
  var tColumnNames = journal.columnNames;
  param.journal = {};
  param.journal.rows = [];
  var jsonLine = {};
  var value = "";

  for (var i = 0; i < filteredRows.length; i++) {
    //Check period
    var validPeriod = false;
    value = filteredRows[i].value("JDate");
    var currentDate = Banana.Converter.stringToDate(value, "YYYY-MM-DD");
    if (currentDate >= periodStart && currentDate <= periodEnd)
      validPeriod = true;
    if (!validPeriod) {
      continue;
     }

    //add data
    for (var j = 0; j < tColumnNames.length; j++) {
      var columnName = tColumnNames[j];
      value = filteredRows[i].value(columnName);
      jsonLine[columnName] = value;
    }
    param.journal.rows.push(jsonLine);
    jsonLine = {};
    value = "";
  }
  
  //debug
  /*var line = [];
  var transactions = [];
  for (var i = 0; i < param.journal.rows.length; i++) {
    var jsonObj = param.journal.rows[i];
    for (var key in jsonObj) {
      line.push(jsonObj[key]);
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

  var docType = row.value("JInvoiceDocType");
  if (docType == "10" || docType == "20")
    return true;

  /*var isVatOperation = row.value("JVatIsVatOperation");
  if (isVatOperation)
    return true;*/
    
  return false;
}

function printVatReport1(report, stylesheet, param) {

  // Styles
  stylesheet.addStyle("@page", "size:landscape");
  stylesheet.addStyle("phead", "font-weight: bold; margin-bottom: 1em");
  stylesheet.addStyle("thead", "font-size: 8px; font-weight: bold");
  stylesheet.addStyle("td", "font-size: 8px; padding-right: 1em");
  stylesheet.addStyle(".amount", "text-align: right");
  stylesheet.addStyle(".period", "font-size: 10px; padding-top: 1em;padding-bottom: 1em;");
  stylesheet.addStyle(".vatNumber", "font-size: 10px");
  stylesheet.addStyle(".warning", "color: red;font-size:8px;");

  if (param.journal.rows.length<=0)
    return;

  //Print table
  var table = report.addTable("table1");

  // Print header
  var headerRow = table.getHeader().addRow();
  headerRow.addCell("JDate");
  headerRow.addCell("Type");
  headerRow.addCell("Inv");
  headerRow.addCell("JAcc");
  headerRow.addCell("JContrAcc");
  headerRow.addCell("JAmount");
  headerRow.addCell("CS");
  headerRow.addCell("VCode");
  headerRow.addCell("VAmTy");
  headerRow.addCell("VRate");
  headerRow.addCell("VRateEff");
  headerRow.addCell("VTax");
  headerRow.addCell("VAm");
  headerRow.addCell("VPercND");
  headerRow.addCell("VND");
  headerRow.addCell("VPosted");
  headerRow.addCell("VNumber");

  // Print data
  for (var i = 0; i < param.journal.rows.length; i++) {
    var row = table.addRow();
    var jsonObj = param.journal.rows[i];
    row.addCell(jsonObj["JDate"]);
    row.addCell(jsonObj["JInvoiceDocType"]);
    row.addCell(jsonObj["DocInvoice"]);
    row.addCell(jsonObj["JAccount"]);
    row.addCell(jsonObj["JContraAccount"]);
    row.addCell(jsonObj["JAmount"]);
    row.addCell(jsonObj["JInvoiceRowCustomerSupplier"]);
    row.addCell(jsonObj["VatCode"]);
    row.addCell(jsonObj["VatAmountType"]);
    row.addCell(jsonObj["VatRate"]);
    row.addCell(jsonObj["VatRateEffective"]);
    row.addCell(jsonObj["VatTaxable"]);
    row.addCell(jsonObj["VatAmount"]);
    row.addCell(jsonObj["VatPercentNonDeductible"]);
    row.addCell(jsonObj["VatNonDeductible"]);
    row.addCell(jsonObj["VatPosted"]);
    row.addCell(jsonObj["VatNumber"]);
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
   return param;
}