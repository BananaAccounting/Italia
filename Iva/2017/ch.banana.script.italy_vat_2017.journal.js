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

/*
 * Load data from journal 
 * This function is used from all reports
*/
function loadJournalCustomersSuppliers(data)
{
  if (!Banana.document || typeof (Banana.document.journalCustomersSuppliers) === 'undefined')
    return false;

  var journal = Banana.document.journalCustomersSuppliers(
    Banana.document.ORIGINTYPE_CURRENT, Banana.document.ACCOUNTTYPE_NORMAL);
  var filteredRows = journal.findRows(loadJournalCustomersSuppliers_filter);

  if (!journal || !filteredRows)
    return false;

  var tableVatCodes = Banana.document.table('VatCodes');
  var periodStart = Banana.Converter.toDate(data.startDate);
  var periodEnd = Banana.Converter.toDate(data.endDate);
  data.customers = {};
  data.suppliers = {};
  data.journal = {};
  data.journal.rows = [];

  //Load column names
  var tColumnNames = journal.columnNames;
  data.journal = setColumns(data.journal, tColumnNames);

  //Load customers/suppliers accounts
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
    var isCustomer = filteredRows[i].value("JInvoiceRowCustomerSupplier");
    if (isCustomer!='1' && isCustomer!='2')
      continue;

    var accountId = filteredRows[i].value("JAccount");
    if (accountId && accountId.length>0) {
      var accountObj = getAccount(accountId);
      if (accountObj) {
        if (isCustomer == '1') {
          data.customers[accountId] = accountObj;
        }
        else if (isCustomer == '2') {
          data.suppliers[accountId] = accountObj;
        }
      }
    }
  }
  
  //Load transactions
  for (var i = 0; i < filteredRows.length; i++) {
    //Only vat operations
    var isVatOperation = filteredRows[i].value("JVatIsVatOperation");
    if (!isVatOperation)
      continue;

    //Checks period
    var validPeriod = false;
    var value = filteredRows[i].value("JDate");
    var currentDate = Banana.Converter.stringToDate(value, "YYYY-MM-DD");
    if (currentDate >= periodStart && currentDate <= periodEnd)
      validPeriod = true;
    if (!validPeriod)
      continue;

    //Checks customer or supplier accounts
	/*TODO: vedere se si può semplificare controllando meno campi*/
    var isCustomer=false;
    var isSupplier=false;
    var accountId = filteredRows[i].value("JAccount");
    var contraAccountId = filteredRows[i].value("JContraAccount");
    var vatTwinAccountId = filteredRows[i].value("VatTwinAccount");
    var accountDebitId = filteredRows[i].value("AccountDebit");
    var accountCreditId = filteredRows[i].value("AccountCredit");

    if (accountId in data.customers) {
      isCustomer = true;
    }
    else if (contraAccountId in data.customers) {
      isCustomer = true;
      accountId = contraAccountId;
    }
    else if (vatTwinAccountId in data.customers) {
      isCustomer = true;
      accountId = vatTwinAccountId;
    }
    else if (accountDebitId in data.customers) {
      isCustomer = true;
      accountId = accountDebitId;
    }
    else if (accountCreditId in data.customers) {
      isCustomer = true;
      accountId = accountCreditId;
    }
    else if (accountId in data.suppliers) {
      isSupplier = true;
    }
    else if (contraAccountId in data.suppliers) {
      isSupplier = true;
      accountId = contraAccountId;
    }
    else if (vatTwinAccountId in data.suppliers) {
      isSupplier = true;
      accountId = vatTwinAccountId;
    }
    else if (accountDebitId in data.suppliers) {
      isSupplier = true;
      accountId = accountDebitId;
    }
    else if (accountCreditId in data.suppliers) {
      isSupplier = true;
      accountId = accountCreditId;
    }

    //Add data from journal
    var jsonLine = {};
    for (var j = 0; j < tColumnNames.length; j++) {
      var columnName = tColumnNames[j];
      value = filteredRows[i].value(columnName);
      if (value) {
        jsonLine[columnName] = xml_escapeString(value);
      }
      else {
        jsonLine[columnName] = '';
      }
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

    //DF_Gr_IVA
    jsonLine["DF_Gr_IVA"] = '';
    var vatCode = filteredRows[i].value("JVatCodeWithoutSign");
    if (vatCode.length && tableVatCodes) {
      var rowVatCodes = tableVatCodes.findRowByValue('VatCode', vatCode);
      if (rowVatCodes) {
        jsonLine["DF_Gr_IVA"] = rowVatCodes.value("Gr");
      }
    }

    //DF_Lordo
    jsonLine["DF_Lordo"] = '';
    value = Banana.SDecimal.add(filteredRows[i].value("JVatTaxable"), filteredRows[i].value("VatAmount"));
    if (Banana.SDecimal.isZero(value))
      value = '0.00';
    else
      value = Banana.SDecimal.abs(value);
    jsonLine["DF_Lordo"] = value;

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
    var aliquota = jsonLine["DF_Aliquota"];
    var imposta = jsonLine["DF_Imposta"];
    var msg = '[' + jsonLine["JTableOrigin"] + ': Riga ' + (parseInt(jsonLine["JRowOrigin"])+1).toString() + '] ';

    //Fatture ricevute, natura “N6”: vanno anche obbligatoriamente valorizzati i campi Imposta e Aliquota
    if (isCustomer=='2' && jsonLine["DF_Natura"] == "N6") {
      if (Banana.SDecimal.isZero(aliquota) || Banana.SDecimal.isZero(imposta)) {
        msg += getErrorMessage(ID_ERR_XML_ELEMENTO_NATURA_N6);
        Banana.document.addMessage( msg, ID_ERR_XML_ELEMENTO_NATURA_N6);
      }
    }
    //Se il campo Natura è valorizzato i campi Imposta e Aliquota devono essere vuoti
    else if (jsonLine["DF_Natura"].length>0 && !Banana.SDecimal.isZero(imposta) && !Banana.SDecimal.isZero(aliquota)) {
      msg += getErrorMessage(ID_ERR_XML_ELEMENTO_NATURA_PRESENTE);
      Banana.document.addMessage( msg, ID_ERR_XML_ELEMENTO_NATURA_PRESENTE);
    }
    //Se i campi Imposta e Aliquota sono vuoti, il campo Natura dev'essere valorizzato
    else if (jsonLine["DF_Natura"].length<=0 && Banana.SDecimal.isZero(imposta) && Banana.SDecimal.isZero(aliquota)) {
      msg += getErrorMessage(ID_ERR_XML_ELEMENTO_NATURA_NONPRESENTE);
      Banana.document.addMessage( msg, ID_ERR_XML_ELEMENTO_NATURA_NONPRESENTE);
    }

    //Aggiunge la riga nei parametri
    if (isCustomer) {
      if (!data.customers[accountId].rows)
        data.customers[accountId].rows = [];
      data.customers[accountId].rows.push(jsonLine);
    }
    else if (isSupplier) {
      if (!data.suppliers[accountId].rows)
        data.suppliers[accountId].rows = [];
      data.suppliers[accountId].rows.push(jsonLine);
    }

    //Write rows for debugging purposes
    /*var jsonString = filteredRows[i].toJSON();
    var jsonObj = JSON.parse(jsonString);
    data.journal.rows.push(jsonObj);*/
    data.journal.rows.push(jsonLine);

  }
  
  return data;
  
}

function loadJournalCustomersSuppliers_filter(row, index, table) {

  //only normal transaction with vat
  //OperationType_None = 0, OperationType_Opening = 1, OperationType_CarryForward = 2,
  //OperationType_Transaction = 3, OperationType_Closure = 4, OperationType_Total = 6
  var operationType = row.value("JOperationType");
  if (operationType && operationType != Banana.document.OPERATIONTYPE_TRANSACTION)
    return false;

  return true;
}

function printCustomersSuppliersJournal(data, report, stylesheet) {

  //Column count
  var sortedColumns = [];
  for (var i in data.journal.columns) {
    if (data.journal.columns[i].index>=0)
      sortedColumns.push(data.journal.columns[i].index);
  }
  sortedColumns.sort(sortNumber);  

  //Title
  var table = report.addTable("tableJournalCustomersSuppliers");
  var headerRow = table.getHeader().addRow();
  headerRow.addCell("Customers/Suppliers", "title",  sortedColumns.length);
  
  //Period
  var periodo = "Periodo dal " + Banana.Converter.toLocaleDateFormat(data.startDate);
  periodo +=" al " + Banana.Converter.toLocaleDateFormat(data.endDate);
  headerRow = table.getHeader().addRow();
  headerRow.addCell(periodo, "period",  sortedColumns.length);
  
  //Header
  var headerRow = table.getHeader().addRow();
  for (var i in sortedColumns) {
    var index = sortedColumns[i];
    for (var j in data.journal.columns) {
      if (data.journal.columns[j].index == index) {
        var columnTitle = data.journal.columns[j].title;
        /*if (columnTitle.length>8)
          columnTitle = columnTitle.substring(0, 7) + ".";*/
        headerRow.addCell(columnTitle);
        break;
      }
    }
  }

  // Print data
  var row = table.addRow();
  row.addCell("------------------- customers -------------------", "", sortedColumns.length);
  for (var i in data.customers) {
    for (var j in data.customers[i].rows) {
      var rowJsonObj = data.customers[i].rows[j];
      var row = table.addRow();
      for (var k in sortedColumns) {
        var index = sortedColumns[k];
        for (var l in data.journal.columns) {
          if (data.journal.columns[l].index == index) {
            var columnName = data.journal.columns[l].name;
            var content = rowJsonObj[columnName];
            if (content.length>11 && data.journal.columns[l].type == "description")
              content = content.substring(0,10) + "...";
            row.addCell(content, data.journal.columns[l].type);
            break;
          }
        }
      }
    }
  }
  
  var row = table.addRow();
  row.addCell("------------------- suppliers -------------------", "", sortedColumns.length);
  for (var i in data.suppliers) {
    for (var j in data.suppliers[i].rows) {
      var rowJsonObj = data.suppliers[i].rows[j];
      var row = table.addRow();
      for (var k in sortedColumns) {
        var index = sortedColumns[k];
        for (var l in data.journal.columns) {
          if (data.journal.columns[l].index == index) {
            var columnName = data.journal.columns[l].name;
            var content = rowJsonObj[columnName];
            if (content.length>11 && data.journal.columns[l].type == "description")
              content = content.substring(0,10) + "...";
            row.addCell(content, data.journal.columns[l].type);
            break;
          }
        }
      }
    }
  }
  
  printJournal_addStyle(data, report, stylesheet);

}

function printJournal(data, report, stylesheet) {

  //Column count
  var sortedColumns = [];
  for (var i in data.journal.columns) {
    if (data.journal.columns[i].index>=0)
      sortedColumns.push(data.journal.columns[i].index);
  }
  sortedColumns.sort(sortNumber);  

  //Title
  var table = report.addTable("tableJournal");
  var headerRow = table.getHeader().addRow();
  headerRow.addCell("Registrazioni IVA Italia", "title",  sortedColumns.length);
  
  //Period
  var periodo = "Periodo dal " + Banana.Converter.toLocaleDateFormat(data.startDate);
  periodo +=" al " + Banana.Converter.toLocaleDateFormat(data.endDate);
  headerRow = table.getHeader().addRow();
  headerRow.addCell(periodo, "period",  sortedColumns.length);
  
  //Header
  var headerRow = table.getHeader().addRow();
  for (var i in sortedColumns) {
    var index = sortedColumns[i];
    for (var j in data.journal.columns) {
      if (data.journal.columns[j].index == index) {
        var columnTitle = data.journal.columns[j].title;
        /*if (columnTitle.length>8)
          columnTitle = columnTitle.substring(0, 7) + ".";*/
        headerRow.addCell(columnTitle);
        break;
      }
    }
  }

  // Print data
  var row = table.addRow();
  for (var i=0; i < data.journal.rows.length;i++) {
    var jsonObj = data.journal.rows[i];
    var row = table.addRow();
    for (var j in sortedColumns) {
      var index = sortedColumns[j];
      for (var k in data.journal.columns) {
        if (data.journal.columns[k].index == index) {
          var content = jsonObj[data.journal.columns[k].name];
          row.addCell(content, data.journal.columns[k].type);
          break;
        }
      }
    }
  }
  
  printJournal_addStyle(data, report, stylesheet);

}

function printJournal_addStyle(data, report, stylesheet) {
  //style
  stylesheet.addStyle(".tableJournalCustomersSuppliers", "margin-top:1em;width:100%;");
  stylesheet.addStyle(".tableJournalCustomersSuppliers td", "border:1px solid #333333");
  stylesheet.addStyle(".tableJournal", "margin-top:1em;width:100%;");
  stylesheet.addStyle(".tableJournal td", "border:1px solid #333333");
  
  stylesheet.addStyle(".title", "background-color:#ffffff;border:1px solid #ffffff;font-size:10px;");
  stylesheet.addStyle(".period", "background-color:#ffffff;border:1px solid #ffffff;");
  stylesheet.addStyle(".amount", "text-align:right;");
}

function setColumns(journal, journalColumns) {
  //Journal columns
  journal.columns = {};
  for (var j = 0; j < journalColumns.length; j++) {
    var column = {};
    column.name = journalColumns[j];
    column.title = journalColumns[j];
    column.type = "amount";
    column.index = -1;
    if (column.name == "Date") {
      column.title = "Data";
      column.type = "date";
      column.index = 1;
    }
    if (column.name == "DateDocument") {
      column.title = "Data Doc";
      column.type = "date";
      column.index = 2;
    }
    if (column.name == "DateValue") {
      column.title = "Data valuta";
      column.type = "date";
      column.index = 3;
    }
    else if (column.name == "Doc") {
      column.type = "description";
      column.index = 4;
    }
    else if (column.name == "DocProtocol") {
      column.title = "Doc.Prot.";
      column.type = "description";
      column.index = 5;
    }
    else if (column.name == "Description") {
      column.title = "Descrizione";
      column.type = "description";
      column.index = 6;
    }
    else if (column.name == "VatCode") {
      column.title = "Cod.IVA";
      column.index = 7;
    }
    else if (column.name == "VatRate") {
      column.title = "%IVA";
      column.index = 8;
    }
    else if (column.name == "VatRateEffective") {
      column.title = "%Eff.";
      column.index = 9;
    }
    else if (column.name == "VatTaxable") {
      column.title = "Imponibile";
      column.index = 10;
    }
    else if (column.name == "VatAmount") {
      column.title = "Imp.IVA";
      column.index = 11;
    }
    else if (column.name == "VatAccount") {
      column.title = "Cto.IVA";
      column.index = 12;
    }
    else if (column.name == "VatAccountDes") {
      column.title = "Cto.IVA Des.";
      column.index = 13;
    }
    else if (column.name == "VatPercentNonDeductible") {
      column.title = "%Non.Ded.";
      column.index = 14;
    }
    else if (column.name == "VatNonDeductible") {
      column.title = "Non.Ded.";
      column.index = 15;
    }
    else if (column.name == "VatPosted") {
      column.title = "IVA Contab.";
      column.index = 16;
    }
    else if (column.name == "VatNumber") {
      column.title = "Partita IVA";
      column.index = 17;
    }
    else if (column.name == "JAccount") {
      column.title = "N.conto";
      column.index = 18;
    }
    else if (column.name == "JAccountDescription") {
      column.title = "Des.conto";
      column.type = "description";
      column.index = 19;
    }
    else if (column.name == "JContraAccount") {
      column.title = "Ctr.";
      column.index = 20;
    }
    else if (column.name == "JCContraAccountDes") {
      column.title = "Des.ctrpartita";
      column.type = "description";
      column.index = 21;
    }
    else if (column.name == "JAccountCurrency") {
      column.title = "Moneta conto";
      column.type = "description";
      column.index = 22;
    }
    else if (column.name == "JAmountAccountCurrency") {
      column.title = "Importo moneta";
      column.type = "description";
      column.index = 23;
    }
    else if (column.name == "JAmount") {
      column.title = "Importo";
      column.type = "description";
      column.index = 24;
    }
    else if (column.name == "JVatIsVatOperation") {
      column.title = "Operazione IVA";
      column.index = 25;
    }
    else if (column.name == "JVatCodeWithoutSign") {
      column.title = "Cod.IVA senza segno";
      column.index = 26;
    }
    else if (column.name == "JVatCodeDescription") {
      column.title = "Des.codice IVA";
      column.index = 27;
    }
    else if (column.name == "JVatCodeWithMinus") {
      column.title = "Cod.IVA con segno meno";
      column.index = 28;
    }
    else if (column.name == "JVatNegative") {
      column.title = "IVA negativa";
      column.index = 29;
    }
    else if (column.name == "JVatTaxable") {
      column.title = "IVA imponibile";
      column.index = 30;
    }
    else if (column.name == "JContraAccountGroup") {
      column.title = "Gruppo contropartita";
      column.index = 31;
    }
    else if (column.name == "VatTwinAccount") {
      column.title = "Conto gemello IVA";
      column.index = 32;
    }
    else if (column.name == "JInvoiceDocType") {
      column.title = "Tipo fattura";
      column.index = 33;
    }
    else if (column.name == "JInvoiceAccountId") {
      column.title = "Conto fattura";
      column.index = 34;
    }
    journal.columns[j] = column;
  }

  //Additional columns
  var column = {};
  column.name = "DF_Aliquota";
  column.title = "DF_Aliquota";
  column.visible = true;
  column.type = "amount";
  column.index = 1000;
  journal.columns[j++] = column;
  var column = {};
  column.name = "DF_Imponibile";
  column.title = "DF_Imponibile";
  column.visible = true;
  column.type = "amount";
  column.index = 1001;
  journal.columns[j++] = column;
  var column = {};
  column.name = "DF_Imposta";
  column.title = "DF_Imposta";
  column.visible = true;
  column.type = "amount";
  column.index = 1002;
  journal.columns[j++] = column;
  var column = {};
  column.name = "DF_Detraibile";
  column.title = "DF_Detraibile";
  column.visible = true;
  column.type = "amount";
  column.index = 1003;
  journal.columns[j++] = column;
  var column = {};
  column.name = "DF_Deducibile";
  column.title = "DF_Deducibile";
  column.visible = true;
  column.type = "amount";
  column.index = 1004;
  journal.columns[j++] = column;
  var column = {};
  column.name = "DF_Gr_IVA";
  column.title = "DF_Gr_IVA";
  column.visible = true;
  column.type = "description";
  column.index = 1005;
  journal.columns[j++] = column;
  var column = {};
  column.name = "DF_Lordo";
  column.title = "DF_Lordo";
  column.visible = true;
  column.type = "amount";
  column.index = 1006;
  journal.columns[j++] = column;
  var column = {};
  column.name = "DF_TipoDoc";
  column.title = "DF_TipoDoc";
  column.visible = true;
  column.type = "description";
  column.index = 1007;
  journal.columns[j++] = column;
  var column = {};
  column.name = "DF_Natura";
  column.title = "DF_Natura";
  column.visible = true;
  column.type = "description";
  column.index = 1008;
  journal.columns[j++] = column;
  return journal;
}

function sortNumber(a,b) {
    return a - b;
}
