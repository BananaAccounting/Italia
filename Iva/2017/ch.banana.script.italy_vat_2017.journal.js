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
 * Update script's parameters
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

  //Load customers/suppliers accounts
  var periodStart = Banana.Converter.toDate(data.startDate);
  var periodEnd = Banana.Converter.toDate(data.endDate);
  data.customers = {};
  data.suppliers = {};
  data.journal = journal;

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
    if (isCustomer=='1' || isCustomer=='2')
      keepRow=true;

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
  
  //Load column names
  var tColumnNames = journal.columnNames;
  data = setColumns(data, tColumnNames);

  //Load transactions
  var tableVatCodes = Banana.document.table('VatCodes');
  
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
   if (accountId in data.customers) {
     isCustomer = true;
   }
   if (contraAccountId in data.customers) {
     isCustomer = true;
     accountId = contraAccountId;
   }
   if (accountId in data.suppliers) {
     isSupplier = true;
   }
   if (contraAccountId in data.suppliers) {
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
      if (value) {
        jsonLine[columnName] = xml_escapeString(value);
  	    //data.columns[j].visible = true;
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

  var isVatOperation = row.value("JVatIsVatOperation");
  if (isVatOperation)
    return false;
    
  return true;
}

function printCustomersSuppliersJournal(data, report, stylesheet) {

  //Column count
  var count = 0;
  for (var index in data.columns) {
    if (data.columns[index].visible)
      count++;
  }

  //Title
  var table = report.addTable("tableJournalCustomersSuppliers");
  var headerRow = table.getHeader().addRow();
  headerRow.addCell("Customers/Suppliers", "title",  count);
  
  //Period
  var periodo = "Periodo dal " + Banana.Converter.toLocaleDateFormat(data.startDate);
  periodo +=" al " + Banana.Converter.toLocaleDateFormat(data.endDate);
  headerRow = table.getHeader().addRow();
  headerRow.addCell(periodo, "period",  count);
  
  //Header
  var headerRow = table.getHeader().addRow();
  for (var index in data.columns) {
    if (data.columns[index].visible) {
	  var columnName = data.columns[index].name;
	  if (columnName.length>8)
	    columnName = columnName.substring(0, 7) + ".";
      headerRow.addCell(columnName);
	}
  }

  // Print data
  var row = table.addRow();
  row.addCell("------------------- customers -------------------", "", count);
  for (var i in data.customers) {
    for (var j in data.customers[i].rows) {
      var row = table.addRow();
      var index = 0;
      var jsonObj = data.customers[i].rows[j];
      for (var key in jsonObj) {
        if (data.columns[index] && data.columns[index].visible) {
		  var content = jsonObj[key];
		  if (content.length>11 && data.columns[index].type == "description")
		    content = content.substring(0,10) + "...";
          row.addCell(content, data.columns[index].type);
	    }
		index++;
      }
    }
  }
  var row = table.addRow();
  row.addCell("------------------- suppliers -------------------", "", count);
  for (var i in data.suppliers) {
    for (var j in data.suppliers[i].rows) {
      var row = table.addRow();
	  var index = 0;
      var jsonObj = data.suppliers[i].rows[j];
      for (var key in jsonObj) {
        if (data.columns[index] && data.columns[index].visible) {
		  var content = jsonObj[key];
		  if (content.length>11 && data.columns[index].type == "description")
		    content = content.substring(0,10) + "...";
          row.addCell(content, data.columns[index].type);
	    }
		index++;
      }
    }
  }
  
  printJournal_addStyle(data, report, stylesheet);

}

function printJournal(data, report, stylesheet) {

  //Column count
  var count = 0;
  for (var index in data.columns) {
    if (!data.columns[index].name.startsWith("DF_"))
      count++;
  }

  //Title
  var table = report.addTable("tableJournal");
  var headerRow = table.getHeader().addRow();
  headerRow.addCell("Journal", "title",  count);
  
  //Period
  var periodo = "Periodo dal " + Banana.Converter.toLocaleDateFormat(data.startDate);
  periodo +=" al " + Banana.Converter.toLocaleDateFormat(data.endDate);
  headerRow = table.getHeader().addRow();
  headerRow.addCell(periodo, "period",  count);
  
  //Header
  var headerRow = table.getHeader().addRow();
  for (var index in data.columns) {
    if (!data.columns[index].name.startsWith("DF_")) {
	  var columnName = data.columns[index].name;
	  if (columnName.length>8)
	    columnName = columnName.substring(0, 7) + ".";
      headerRow.addCell(columnName);
	}
  }

  // Print data
  var row = table.addRow();
  row.addCell("------------------- journal -------------------", "", count);
  for (var i=0; i < data.journal.rowCount;i++) {
    var tRow = data.journal.row(i);
	var index = 0;
    var row = table.addRow();
    for (var index in data.columns) {
      if (!data.columns[index].name.startsWith("DF_")) {
  	    var rowValue = tRow.value(data.columns[index].name);
        row.addCell(rowValue, data.columns[index].type);
	  }
	  index++;
   }
    /*var index = 0;
    var row = table.addRow();
    var jsonObj = data.journal[i];
    for (var key in jsonObj) {
      if (data.columns[index] && data.columns[index].visible) {
        var content = jsonObj[key];
		if (content.length>11 && data.columns[index].type == "description")
		  content = content.substring(0,10) + "...";
        row.addCell(content, data.columns[index].type);
	  }
	  index++;
    }*/
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

function setColumns(data, journalColumns) {
  //Load column names
  data.columns = {};
  for (var j = 0; j < journalColumns.length; j++) {
	var column = {};
	column.name = journalColumns[j];
	column.type = "amount";
    if (column.name == "Date") {
	  column.visible = true;
	  column.type = "date";
	}
    else if (column.name == "Doc") {
	  column.visible = true;
	  column.type = "description";
	}
    /*else if (column.name == "DocInvoice") {
	  column.visible = true;
	  column.type = "description";
	}
    else if (column.name == "DocProtocol")
	  column.visible = true;*/
    else if (column.name == "Description") {
	  column.visible = true;
	  column.type = "description";
	}
    /*else if (column.name == "AccountDebit")
	  column.visible = true;
    else if (column.name == "AccountDebitDes")
	  column.visible = true;
    else if (column.name == "AccountCredit")
	  column.visible = true;
    else if (column.name == "AccountCreditDes")
	  column.visible = true;
    else if (column.name == "Amount")
	  column.visible = true;*/
    else if (column.name == "VatCode")
	  column.visible = true;
    /*else if (column.name == "VatRate")
	  column.visible = true;
    else if (column.name == "VatRateEffective")
	  column.visible = true;
    else if (column.name == "VatTaxable")
	  column.visible = true;
    else if (column.name == "VatAmount")
	  column.visible = true;
    else if (column.name == "VatAccount")
	  column.visible = true;
    else if (column.name == "VatAccountDes")
	  column.visible = true;
    else if (column.name == "VatPosted")
	  column.visible = true;
    else if (column.name == "JDate")
	  column.visible = true;
    else if (column.name == "JDescription")
	  column.visible = true;
    else if (column.name == "JTableOrigin")
	  column.visible = true;*/
    else if (column.name == "JRowOrigin")
	  column.visible = true;
    else if (column.name == "JAccount")
	  column.visible = true;
    /*else if (column.name == "JAccountComplete")
	  column.visible = true;*/
    else if (column.name == "JAccountDescription") {
	  column.visible = true;
	  column.type = "description";
	}
    /*else if (column.name == "JAccountClass")
	  column.visible = true;
    else if (column.name == "JAccountSection")
	  column.visible = true;
    else if (column.name == "JAccountType")
	  column.visible = true;
    else if (column.name == "JOriginType")
	  column.visible = true;
    else if (column.name == "JOriginFile")
	  column.visible = true;
    else if (column.name == "JOperationType")
	  column.visible = true;
    else if (column.name == "JAccountGr")
	  column.visible = true;
    else if (column.name == "JAccountGrPath")
	  column.visible = true;
    else if (column.name == "JAmountAccountCurrency")
	  column.visible = true;
    else if (column.name == "JAmount")
	  column.visible = true;
    else if (column.name == "JTransactionCurrency")
	  column.visible = true;
    else if (column.name == "JAmountTransactionCurrency")
	  column.visible = true;
    else if (column.name == "JTransactionCurrencyConversionRate")
	  column.visible = true;
    else if (column.name == "JAmountSection")
	  column.visible = true;
    else if (column.name == "JVatCodeWithoutSign")
	  column.visible = true;
    else if (column.name == "JVatCodeDescription")
	  column.visible = true;
    else if (column.name == "JVatCodeWithMinus")
	  column.visible = true;
    else if (column.name == "JVatNegative")
	  column.visible = true;
    else if (column.name == "JVatTaxable")
	  column.visible = true;*/
    else if (column.name == "JContraAccount")
	  column.visible = true;
    else if (column.name == "JCContraAccountDes") {
	  column.visible = true;
	  column.type = "description";
	}
    /*else if (column.name == "JContraAccountType")
	  column.visible = true;
    else if (column.name == "JContraAccountGroup")
	  column.visible = true;
    else if (column.name == "JDebitAmountAccountCurrency")
	  column.visible = true;
    else if (column.name == "JCreditAmountAccountCurrency")
	  column.visible = true;
    else if (column.name == "JDebitAmount")
	  column.visible = true;
    else if (column.name == "JCreditAmount")
	  column.visible = true;
    else if (column.name == "JInvoiceDocType")
	  column.visible = true;
    else if (column.name == "JInvoiceAccountId")
	  column.visible = true;
    else if (column.name == "JInvoiceCurrency")
	  column.visible = true;
    else if (column.name == "JInvoiceDueDate")
	  column.visible = true;
    else if (column.name == "JInvoiceDaysPastDue")
	  column.visible = true;
    else if (column.name == "JInvoiceIssueDate")
	  column.visible = true;
    else if (column.name == "JInvoiceExpectedDate")
	  column.visible = true;
    else if (column.name == "JInvoiceDuePeriod")
	  column.visible = true;
    else if (column.name == "ProbableIndexGroup")
	  column.visible = false;
    else if (column.name == "VatTwinAccount")
	  column.visible = false;*/
	else
	  column.visible = false;
	data.columns[j] = column;
  }

  //Additional columns
  var column = {};
  column.name = "DF_Aliquota";
  column.visible = true;
  column.type = "amount";
  data.columns[j++] = column;
  var column = {};
  column.name = "DF_Imponibile";
  column.visible = true;
  column.type = "amount";
  data.columns[j++] = column;
  var column = {};
  column.name = "DF_Imposta";
  column.visible = true;
  column.type = "amount";
  data.columns[j++] = column;
  var column = {};
  column.name = "DF_Detraibile";
  column.visible = true;
  column.type = "amount";
  data.columns[j++] = column;
  var column = {};
  column.name = "DF_Deducibile";
  column.visible = true;
  column.type = "amount";
  data.columns[j++] = column;
  var column = {};
  column.name = "DF_Gr_IVA";
  column.visible = true;
  column.type = "description";
  data.columns[j++] = column;
  var column = {};
  column.name = "DF_Lordo";
  column.visible = true;
  column.type = "amount";
  data.columns[j++] = column;
  var column = {};
  column.name = "DF_TipoDoc";
  column.visible = true;
  column.type = "description";
  data.columns[j++] = column;
  var column = {};
  column.name = "DF_Natura";
  column.visible = true;
  column.type = "description";
  data.columns[j++] = column;
  return data;
}
