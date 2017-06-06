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
// @includejs = ch.banana.script.invoicedata.2017.createinstance.js
// @includejs = ch.banana.script.italianvatreport.2017.xml.js
// @includejs = ch.banana.script.italianvatreport.2017.errors.js
// @inputdatasource = none
// @pubdate = 2017-06-06
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
  
  var accountingData = readAccountingData();
  if (accountingData.accountingYear.length<=0) {
    return false;
  }
  
  var dialog = Banana.Ui.createUi("ch.banana.script.invoicedata.2017.dialog.ui");
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
  else
    progressivo += 1;
  progressivo = zeroPad(progressivo, 5);
  dialog.datiFatturaHeaderGroupBox.progressivoInvioLineEdit.text = progressivo;
  dialog.datiFatturaHeaderGroupBox.cfDichiaranteLineEdit.text = param.codicefiscaleDichiarante;
  dialog.datiFatturaHeaderGroupBox.codiceCaricaComboBox.currentIndex = param.codiceCarica;
  var bloccoId = 0;
  if (param.blocco == "DTR")
    bloccoId = 1;
  dialog.bloccoComboBox.currentIndex = bloccoId;

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
    Banana.Ui.showHelp("ch.banana.script.invoicedata.2017.js");
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
    if (param.valoreTrimestre === "0") {
      param.repStartDate = accountingData.accountingYear.toString() + "0101";
      param.repEndDate = accountingData.accountingYear.toString() + "0331";
    }
    else if (param.valoreTrimestre === "1") {
      param.repStartDate = accountingData.accountingYear.toString() + "0401";
      param.repEndDate = accountingData.accountingYear.toString() + "0630";
    }
    else if (param.valoreTrimestre === "2") {
      param.repStartDate = accountingData.accountingYear.toString() + "0701";
      param.repEndDate = accountingData.accountingYear.toString() + "0930";
    }
    else {
      param.repStartDate = accountingData.accountingYear.toString() + "1001";
      param.repEndDate = accountingData.accountingYear.toString() + "1231";
    }
  }
  else {
    param.selezioneTrimestre = false;
    param.selezioneMese = true;
    var month = parseInt(param.valoreMese) + 1;
    //months with 30 days
    if (month === 11 || month === 4 || month === 6 || month === 9) {
      param.repStartDate = accountingData.accountingYear.toString() + zeroPad(month, 2) + "01";
      param.repEndDate = accountingData.accountingYear.toString() + zeroPad(month, 2) + "30";
    }
    //month with 28 or 29 days
    else if (month === 2) {
      var day = 28;
      if (accountingData.accountingYear % 4 == 0 && (accountingData.accountingYear % 100 != 0 || accountingData.accountingYear % 400 == 0)) {
        day = 29;
      }
      param.repStartDate = accountingData.accountingYear.toString() + "0201" ;
      param.repEndDate = accountingData.accountingYear.toString() + "02" + day.toString();
    }
    //months with 31 days
    else {
      param.repStartDate = accountingData.accountingYear.toString() + zeroPad(month, 2) + "01" ;
      param.repEndDate = accountingData.accountingYear.toString() + zeroPad(month, 2) + "31" ;
    }
  }
  progressivo = dialog.datiFatturaHeaderGroupBox.progressivoInvioLineEdit.text;
  progressivo = parseInt(progressivo, 10);
  if (!progressivo)
    progressivo = 1;
  param.progressivoInvio = zeroPad(progressivo, 5);
  param.codicefiscaleDichiarante = dialog.datiFatturaHeaderGroupBox.cfDichiaranteLineEdit.text;
  param.codiceCarica = dialog.datiFatturaHeaderGroupBox.codiceCaricaComboBox.currentIndex.toString();
  var bloccoId = dialog.bloccoComboBox.currentIndex.toString();
  if (bloccoId == 1)
    param.blocco = "DTR";
  else
    param.blocco = "DTE";
  
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
  if (typeof (Banana.IO) === 'undefined') {
    var msg = getErrorMessage(ID_ERR_VERSIONE);
    msg = msg.replace("%1", "Banana.IO" );
    Banana.document.addMessage( msg, ID_ERR_VERSIONE);
    return "@Cancel";
  }

  if (!settingsDialog())
    return "@Cancel";

  var param = JSON.parse(Banana.document.scriptReadSettings());
  
  param = loadData(param);

  var output = createInstance(param);

  if (output != "@Cancel") {
    var report = Banana.Report.newReport("Dati delle fatture emesse e ricevute");
    var stylesheet = Banana.Report.newStyleSheet();
    printVatReport1(report, stylesheet, param);
    Banana.Report.preview(report, stylesheet);
    saveData(output, param);
  }

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
  param.repStartDate = '';
  param.repEndDate = '';
  if (Banana.document) {
    param.repStartDate = Banana.document.startPeriod();
    param.repEndDate = Banana.document.endPeriod();
  }
  param.invioProgressivo = '';
  param.codicefiscaleDichiarante = '';
  param.codiceCarica = '';
  param.blocco = 'DTE';
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

function loadData(param)
{
  param.schemaRefs = init_schemarefs();
  param.namespaces = init_namespaces();

  var journal = Banana.document.journalCustomersSuppliers(
    Banana.document.ORIGINTYPE_CURRENT, Banana.document.ACCOUNTTYPE_NORMAL);
  var filteredRows = journal.findRows(loadData_filterTransactions);

  if (!journal || !filteredRows)
    return false;

  //Load customers/suppliers accounts
  var periodStart = Banana.Converter.toDate(param.repStartDate);
  var periodEnd = Banana.Converter.toDate(param.repEndDate);
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
      var accountObj = getAccount(accountId);
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
        jsonLine[columnName] = xml_escapeString(value);
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
  report.addParagraph(xml_unescapeString(param.fileInfo["Address"]["Company"]) + " " + xml_unescapeString(param.fileInfo["Address"]["FamilyName"]) + " " + xml_unescapeString(param.fileInfo["Address"]["Name"]));
  report.addParagraph(xml_unescapeString(param.fileInfo["Address"]["City"]) + " " + xml_unescapeString(param.fileInfo["Address"]["State"]));
  report.addParagraph("Partita IVA: " + param.fileInfo["Address"]["VatNumber"], "vatNumber");
  
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
    rowName.addCell(xml_unescapeString(param.customers[i]["Description"]),"rowName",4);
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
      row.addCell(xml_unescapeString(jsonObj["JDescription"]));
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
    rowName.addCell(xml_unescapeString(param.suppliers[i]["Description"]),"rowName",4);
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
      row.addCell(xml_unescapeString(jsonObj["JDescription"]));
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

function readAccountingData() {
  var param = {};
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
  if (!param.selezioneTrimestre && !param.selezioneMese) {
    param.selezioneTrimestre  = true;
    param.selezioneMese  = false;
  }
  if (!param.valoreTrimestre)
    param.valoreTrimestre  = '';
  if (!param.valoreMese)
    param.valoreMese  = '';
   if (!param.repStartDate)
     param.repStartDate = '';
   if (!param.repEndDate)
     param.repEndDate = '';
   if(!param.progressivoInvio)
     param.progressivoInvio = '';
   if(!param.codicefiscaleDichiarante)
     param.codicefiscaleDichiarante = '';
   if(!param.codiceCarica)
     param.codiceCarica = '';
   if (!param.blocco)
     param.blocco = 'DTE';
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
