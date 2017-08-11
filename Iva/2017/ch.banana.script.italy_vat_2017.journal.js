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

// @includejs = ch.banana.script.italy_vat.daticontribuente.js

/*
 * ------------------------------------ REPORT IVA ITALIA 2017 ------------------------------------
 *
 * Metodi che riprendono i dati dal file contabile ac2 (giornale, dati base, tabella conti)
 *
 * ------------------------------------------------------------------------------------------------
*/

/*
 * Crea i periodi in base alle impostazioni del dialogo: periodo selezionato e tipo versamento(mensile o trimestrale)
 * Ritorna un array dei periodi
 *
 * @param
 */
function createPeriods(param) {
  var periods = [];

  if (!param)
    return param;

  // --------------------------------------------------------------------------------
  //MESE param.periodoSelezionato == 'm'
  // --------------------------------------------------------------------------------
  if (param.periodoSelezionato == 'm') {
    var currentPeriod = {};
    var month = parseInt(param.periodoValoreMese) + 1;
    if (month === 11 || month === 4 || month === 6 || month === 9) {
      currentPeriod.startDate = param.accountingYear.toString() + zeroPad(month, 2) + "01";
      currentPeriod.endDate = param.accountingYear.toString() + zeroPad(month, 2) + "30";
    }
    //month with 28 or 29 days
    else if (month === 2) {
      var day = 28;
      if (param.accountingYear % 4 == 0 && (param.accountingYear % 100 != 0 || param.accountingYear % 400 == 0))
        day = 29;
      currentPeriod.startDate = param.accountingYear.toString() + "0201";
      currentPeriod.endDate = param.accountingYear.toString()+ "02" + day.toString() ;
    }
    //months with 31 days
    else {
      currentPeriod.startDate = param.accountingYear.toString() + zeroPad(month, 2) + "01";
      currentPeriod.endDate = param.accountingYear.toString() + zeroPad(month, 2) + "31";
    }

    //se il tipo di versamento è trimestrale avvisa che è stato selezionato un mese
    if (param.datiContribuente.liqTipoVersamento == 1) {
      var msg = getErrorMessage(ID_ERR_TIPOVERSAMENTO);
      Banana.document.addMessage( msg, ID_ERR_TIPOVERSAMENTO);
      currentPeriod.startDate = '';
      currentPeriod.endDate = '';
    }
    if (currentPeriod.startDate.length>0 && currentPeriod.endDate.length>0) {
      periods.push(currentPeriod);
    }
  }
  // --------------------------------------------------------------------------------
  //TRIMESTRE param.periodoSelezionato == 'q'
  // --------------------------------------------------------------------------------
  else if (param.periodoSelezionato == 'q') {
    //liqTipoVersamento == 0 Tipo versamento mensile quindi crea più periodi per il trimestre selezionato
    if (param.datiContribuente.liqTipoVersamento == 0) {
      if (param.periodoValoreTrimestre === "0") {
        var currentPeriod = {};
        currentPeriod.startDate = param.accountingYear.toString() + "0101";
        currentPeriod.endDate = param.accountingYear.toString() + "0131";
        periods.push(currentPeriod);

        var day = 28;
        if (param.accountingYear % 4 == 0 && (param.accountingYear % 100 != 0 || param.accountingYear % 400 == 0))
          day = 29;
        var currentPeriod = {};
        currentPeriod.startDate = param.accountingYear.toString() + "0201";
        currentPeriod.endDate = param.accountingYear.toString() + "02" + day.toString();
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.accountingYear.toString() + "0301";
        currentPeriod.endDate = param.accountingYear.toString() + "0331";
        periods.push(currentPeriod);
      }
      else if (param.periodoValoreTrimestre === "1") {
        var currentPeriod = {};
        currentPeriod.startDate = param.accountingYear.toString() + "0401";
        currentPeriod.endDate = param.accountingYear.toString() + "0430";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.accountingYear.toString() + "0501";
        currentPeriod.endDate = param.accountingYear.toString() + "0531";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.accountingYear.toString() + "0601";
        currentPeriod.endDate = param.accountingYear.toString() + "0630";
        periods.push(currentPeriod);
      }
      else if (param.periodoValoreTrimestre === "2") {
        var currentPeriod = {};
        currentPeriod.startDate = param.accountingYear.toString() + "0701";
        currentPeriod.endDate = param.accountingYear.toString() + "0731";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.accountingYear.toString() + "0801";
        currentPeriod.endDate = param.accountingYear.toString() + "0831";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.accountingYear.toString() + "0901";
        currentPeriod.endDate = param.accountingYear.toString() + "0930";
        periods.push(currentPeriod);
      }
      else if (param.periodoValoreTrimestre === "3") {
        var currentPeriod = {};
        currentPeriod.startDate = param.accountingYear.toString() + "1001";
        currentPeriod.endDate = param.accountingYear.toString() + "1031";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.accountingYear.toString() + "1101";
        currentPeriod.endDate = param.accountingYear.toString() + "1130";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.accountingYear.toString() + "1201";
        currentPeriod.endDate = param.accountingYear.toString() + "1231";
        periods.push(currentPeriod);
      }
    }
    //Tipo versamento trimestrale o non definito
    else {
      var currentPeriod = {};
      if (param.periodoValoreTrimestre === "0") {
        currentPeriod.startDate = param.accountingYear.toString() + "0101";
        currentPeriod.endDate = param.accountingYear.toString() + "0331";
      }
      else if (param.periodoValoreTrimestre === "1") {
        currentPeriod.startDate = param.accountingYear.toString() + "0401";
        currentPeriod.endDate = param.accountingYear.toString() + "0630";
      }
      else if (param.periodoValoreTrimestre === "2") {
        currentPeriod.startDate = param.accountingYear.toString() + "0701";
        currentPeriod.endDate = param.accountingYear.toString() + "0930";
      }
      else if (param.periodoValoreTrimestre === "3") {
        currentPeriod.startDate = param.accountingYear.toString() + "1001";
        currentPeriod.endDate = param.accountingYear.toString() + "1231";
      }
      periods.push(currentPeriod);
    }
  }
  // --------------------------------------------------------------------------------
  //SEMESTRE param.periodoSelezionato == 's'
  // --------------------------------------------------------------------------------
  else if (param.periodoSelezionato == 's') {
    //liqTipoVersamento == 0 Tipo versamento mensile quindi crea più periodi per il semestre selezionato 
    if (param.datiContribuente.liqTipoVersamento == 0) {
      if (param.periodoValoreSemestre === "0") {
        var currentPeriod = {};
        currentPeriod.startDate = param.accountingYear.toString() + "0101";
        currentPeriod.endDate = param.accountingYear.toString() + "0131";
        periods.push(currentPeriod);

        var day = 28;
        if (param.accountingYear % 4 == 0 && (param.accountingYear % 100 != 0 || param.accountingYear % 400 == 0))
          day = 29;
        var currentPeriod = {};
        currentPeriod.startDate = param.accountingYear.toString() + "0201";
        currentPeriod.endDate = param.accountingYear.toString() + "02" + day.toString();
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.accountingYear.toString() + "0301";
        currentPeriod.endDate = param.accountingYear.toString() + "0331";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.accountingYear.toString() + "0401";
        currentPeriod.endDate = param.accountingYear.toString() + "0430";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.accountingYear.toString() + "0501";
        currentPeriod.endDate = param.accountingYear.toString() + "0531";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.accountingYear.toString() + "0601";
        currentPeriod.endDate = param.accountingYear.toString() + "0630";
        periods.push(currentPeriod);
      }
      else if (param.periodoValoreSemestre === "1") {
        var currentPeriod = {};
        currentPeriod.startDate = param.accountingYear.toString() + "0701";
        currentPeriod.endDate = param.accountingYear.toString() + "0731";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.accountingYear.toString() + "0801";
        currentPeriod.endDate = param.accountingYear.toString() + "0831";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.accountingYear.toString() + "0901";
        currentPeriod.endDate = param.accountingYear.toString() + "0930";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.accountingYear.toString() + "1001";
        currentPeriod.endDate = param.accountingYear.toString() + "1031";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.accountingYear.toString() + "1101";
        currentPeriod.endDate = param.accountingYear.toString() + "1130";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.accountingYear.toString() + "1201";
        currentPeriod.endDate = param.accountingYear.toString() + "1231";
        periods.push(currentPeriod);
      }
    }
    //Tipo versamento trimestrale o non definito
    else {
      var currentPeriod = {};
      if (param.periodoValoreSemestre === "0") {
        currentPeriod.startDate = param.accountingYear.toString() + "0101";
        currentPeriod.endDate = param.accountingYear.toString() + "0630";
      }
      else if (param.periodoValoreSemestre === "1") {
        currentPeriod.startDate = param.accountingYear.toString() + "0701";
        currentPeriod.endDate = param.accountingYear.toString() + "1231";
      }
      periods.push(currentPeriod);
    }
  }
  // --------------------------------------------------------------------------------
  //TUTTO L'ANNO param.periodoSelezionato == 'a'
  // --------------------------------------------------------------------------------
  else if (param.periodoSelezionato == 'a') {
  }
  
  return periods;
}

/*
 * Ritorna un oggetto json con i dati del cliente o fornitore ripresi dalla tabella conti(indirizzo, saldo, ...)
 *
 * @accountId	numero conto cliente/fornitore
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
 * Riprende l'elenco delle registrazioni iva che appartengono al gruppo clienti/fornitori
 * Ritorna il parametro iniziale con l'aggiunta del giornale e dell'elenco registrazioni iva 
 *
 * @param	parametro con data inizio/fine periodo
 */
function loadJournal(param)
{
  if (!Banana.document || !param || typeof (Banana.document.journalCustomersSuppliers) === 'undefined')
    return false;

  var journal = Banana.document.journalCustomersSuppliers(
    Banana.document.ORIGINTYPE_CURRENT, Banana.document.ACCOUNTTYPE_NORMAL);
  var filteredRows = journal.findRows(loadJournal_filter);

  if (!journal || !filteredRows)
    return false;

  var tableVatCodes = Banana.document.table('VatCodes');
  var periodStart = Banana.Converter.toDate(param.startDate);
  var periodEnd = Banana.Converter.toDate(param.endDate);
  param.customers = {};
  param.suppliers = {};
  param.journal = {};
  param.journal.rows = [];

  //Variabili per numerazione registro
  var progRegistri = {};
  var previousIndexGroup = 0;
  
  //Salva i nomi delle colonne del giornale
  var tColumnNames = journal.columnNames;
  param.journal = loadJournal_setColumns(param.journal, tColumnNames);

  //Carica l'elenco clienti/fornitori
  for (var i = 0; i < filteredRows.length; i++) {
    //Controllo periodo
    var validPeriod = false;
    var value = filteredRows[i].value("JDate");
    var currentDate = Banana.Converter.stringToDate(value, "YYYY-MM-DD");
    if (currentDate >= periodStart && currentDate <= periodEnd)
      validPeriod = true;
    if (!validPeriod)
      continue;

    //Solamente righe con JInvoiceRowCustomerSupplier=1 (cliente) or JInvoiceRowCustomerSupplier=2 (fornitore)
    var isCustomer=false;
    var isSupplier=false;
    if (filteredRows[i].value("JInvoiceRowCustomerSupplier")==1)
      isCustomer=true;
    else if (filteredRows[i].value("JInvoiceRowCustomerSupplier")==2)
      isSupplier=true;
    if (!isCustomer && !isSupplier)
      continue;

    var accountId = filteredRows[i].value("JAccount");
    if (accountId && accountId.length>0) {
      var accountObj = getAccount(accountId);
      if (accountObj) {
        if (isCustomer) {
          param.customers[accountId] = accountObj;
        }
        else {
          param.suppliers[accountId] = accountObj;
        }
      }
    }
  }
  
  //Carica le registrazioni IVA
  for (var i = 0; i < filteredRows.length; i++) {
    //Solo operazioni IVA
    var isVatOperation = filteredRows[i].value("JVatIsVatOperation");
    if (!isVatOperation)
      continue;

    //Controllo periodo
    var validPeriod = false;
    var value = filteredRows[i].value("JDate");
    var currentDate = Banana.Converter.stringToDate(value, "YYYY-MM-DD");
    if (currentDate >= periodStart && currentDate <= periodEnd)
      validPeriod = true;
    if (!validPeriod)
      continue;

    //La registrazione IVA deve contenere un conto cliente/fornitore
    /*TODO: vedere se si può semplificare controllando meno campi*/
    var isCustomer=false;
    var isSupplier=false;
    var accountId = filteredRows[i].value("JAccount");
    var contraAccountId = filteredRows[i].value("JContraAccount");
    var vatTwinAccountId = filteredRows[i].value("VatTwinAccount");
    var accountDebitId = filteredRows[i].value("AccountDebit");
    var accountCreditId = filteredRows[i].value("AccountCredit");

    if (accountId in param.customers) {
      isCustomer = true;
    }
    else if (contraAccountId in param.customers) {
      isCustomer = true;
      accountId = contraAccountId;
    }
    else if (vatTwinAccountId in param.customers) {
      isCustomer = true;
      accountId = vatTwinAccountId;
    }
    else if (accountDebitId in param.customers) {
      isCustomer = true;
      accountId = accountDebitId;
    }
    else if (accountCreditId in param.customers) {
      isCustomer = true;
      accountId = accountCreditId;
    }
    else if (accountId in param.suppliers) {
      isSupplier = true;
    }
    else if (contraAccountId in param.suppliers) {
      isSupplier = true;
      accountId = contraAccountId;
    }
    else if (vatTwinAccountId in param.suppliers) {
      isSupplier = true;
      accountId = vatTwinAccountId;
    }
    else if (accountDebitId in param.suppliers) {
      isSupplier = true;
      accountId = accountDebitId;
    }
    else if (accountCreditId in param.suppliers) {
      isSupplier = true;
      accountId = accountCreditId;
    }

    //Crea un oggetto json dove vengono salvate tutte le informazioni della riga
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

    //Dati supplementari
    jsonLine["IT_ClienteConto"] = '';
    jsonLine["IT_ClienteDescrizione"] = '';
    jsonLine["IT_ClienteIntestazione"] = '';
    jsonLine["IT_ClienteTipologia"] = '';
    jsonLine["IT_ClientePartitaIva"] = '';
    jsonLine["IT_ClienteCodiceFiscale"] = '';

    if (isCustomer)
      jsonLine["IT_ClienteTipologia"] = 'C';
    else if (isSupplier)
      jsonLine["IT_ClienteTipologia"] = 'F';

    if (isCustomer || isSupplier) {
      jsonLine["IT_ClienteConto"] = accountId;
      var accountObj = getAccount(accountId);
      if (accountObj) {
         jsonLine["IT_ClienteDescrizione"] = accountObj["Description"];
         jsonLine["IT_ClientePartitaIva"] = accountObj["VatNumber"];
         jsonLine["IT_ClienteCodiceFiscale"] = accountObj["FiscalNumber"];
         var intestazione = accountId + " " + accountObj["Description"];
         if (accountObj["VatNumber"].length>0) {
           intestazione += " " + accountObj["VatNumber"];
         }
         jsonLine["IT_ClienteIntestazione"] = intestazione;
      }
    }

    //IT_Imponibile
    //Tolto il segno perché nel file xml non esiste imponibile negativo? (controllare)
    jsonLine["IT_Imponibile"] = '';
    value = filteredRows[i].value("JVatTaxable");
    if (Banana.SDecimal.isZero(value))
      value = '0.00';
    else
      value = Banana.SDecimal.abs(value);
    jsonLine["IT_Imponibile"] = value;

    //IT_Imposta
    jsonLine["IT_Imposta"] = '';
    value = filteredRows[i].value("VatPosted");
    if (Banana.SDecimal.isZero(value))
      value = '0.00';
    else
      value = Banana.SDecimal.abs(value);
    jsonLine["IT_Imposta"] = value;

    //IT_Lordo
    jsonLine["IT_Lordo"] = '';
    value = Banana.SDecimal.add(filteredRows[i].value("JVatTaxable"), filteredRows[i].value("VatAmount"));
    if (Banana.SDecimal.isZero(value))
      value = '0.00';
    else
      value = Banana.SDecimal.abs(value);
    jsonLine["IT_Lordo"] = value;

    //IT_Detraibile
    //IT_Deducibile
    jsonLine["IT_Detraibile"] = '';
    jsonLine["IT_Deducibile"] = '';
    value = filteredRows[i].value("VatPercentNonDeductible");
    if (!Banana.SDecimal.isZero(value)) {
      if (!Banana.SDecimal.isZero(value)) {
        var detraibile = Banana.SDecimal.subtract('100', value);
        jsonLine["IT_Detraibile"] = detraibile;
      }
    }

    //IT_Aliquota
    //IT_Gr_IVA
    //IT_Gr1_IVA
    //IT_Registro
    jsonLine["IT_Aliquota"] = '';
    jsonLine["IT_Gr_IVA"] = '';
    jsonLine["IT_Gr1_IVA"] = '';
    jsonLine["IT_Registro"] = '';
    var vatCode = filteredRows[i].value("JVatCodeWithoutSign");
    if (vatCode.length && tableVatCodes) {
      var rowVatCodes = tableVatCodes.findRowByValue('VatCode', vatCode);
      if (rowVatCodes) {
        var percAssoluta = rowVatCodes.value("VatRate");
        if (Banana.SDecimal.isZero(percAssoluta))
          percAssoluta = '0.00';
        jsonLine["IT_Aliquota"] = percAssoluta;
        var gr = rowVatCodes.value("Gr");
        jsonLine["IT_Gr_IVA"] = gr;
        jsonLine["IT_Registro"] = gr;
        if (gr.indexOf('-')>0 || gr.length==1) {
          var gr0 = gr.substr(0,1);
          if (gr0 == "A")
            jsonLine["IT_Registro"] = "Acquisti";
          else if (gr0 == "V")
            jsonLine["IT_Registro"] = "Vendite";
          else if (gr0 == "C")
            jsonLine["IT_Registro"] = "Corrispettivi";
          else if (gr0 == "L")
            jsonLine["IT_Registro"] = "Liquidazioni";
        }

        var gr1 = rowVatCodes.value("Gr1");
        jsonLine["IT_Gr1_IVA"] = gr1;
      }
    }

    //IT_ProgRegistro
    var registro = jsonLine["IT_Registro"];
    var noProgressivo = 1;
    if (progRegistri[registro])
      noProgressivo = parseInt(progRegistri[registro]);
    var indexGroup = filteredRows[i].value("JContraAccountGroup") ;
    if (indexGroup != previousIndexGroup) {
      noProgressivo += 1;
    }
    previousIndexGroup = indexGroup;
    progRegistri[registro] = noProgressivo;
    jsonLine["IT_ProgRegistro"] = noProgressivo.toString();

    //IT_DocInvoice
    jsonLine["IT_DocInvoice"] = '';
    var noDoc = xml_escapeString(filteredRows[i].value("DocInvoice"));
    if (noDoc.length<=0)
      noDoc =  xml_escapeString(filteredRows[i].value("Doc"));
    jsonLine["IT_DocInvoice"] = noDoc;

    //IT_TipoDoc
    //TD01 Fattura  
    //TD04 Nota di credito  
    //TD05 Nota di debito
    //TD07 Fattura semplificata
    //TD08 Nota di credito semplificata
    //TD10 Fattura di acquisto intracomunitario beni
    //TD11 Fattura di acquisto intracomunitario servizi
    jsonLine["IT_TipoDoc"] = '';
    var tipoDoc = filteredRows[i].value("JInvoiceDocType");
    if (tipoDoc.length<=0)
      tipoDoc =  filteredRows[i].value("DocType");

    if (jsonLine["JVatNegative"]  == '1') {
      if (isCustomer) {
        if (tipoDoc == '14' || tipoDoc == '12')
          jsonLine["IT_TipoDoc"] = 'TD05';
        else
          jsonLine["IT_TipoDoc"] = 'TD01';
      }
      else if (isSupplier) {
        jsonLine["IT_TipoDoc"] = 'TD04';
      }
    }
    else {
      if (isCustomer) {
        jsonLine["IT_TipoDoc"] = 'TD04';
      }
      else if (isSupplier) {
        if (tipoDoc == '24' || tipoDoc == '22')
          jsonLine["IT_TipoDoc"] = 'TD05';
        else
          jsonLine["IT_TipoDoc"] = 'TD01';
      }
    }

    if (vatCode.length && isSupplier && tableVatCodes) {
      var rowVatCodes = tableVatCodes.findRowByValue('VatCode', vatCode);
      if (rowVatCodes) {
        var vatGr = rowVatCodes.value("Gr");
        if (vatGr && vatGr.indexOf("EU-S")>=0) {
          jsonLine["IT_TipoDoc"] = 'TD11';
        }
        else if (vatGr && vatGr.indexOf("EU")>=0) {
          jsonLine["IT_TipoDoc"] = 'TD10';
        }
      }
    }

    //IT_Natura
    //N1 esclusa ex art. 15 (bollo, spese anticipate in nome e per conto della controparte, omaggi, interessi moratori, ecc.)
    //N2 non soggetta (Fuori campo IVA/Escluso IVA, codice da utilizzare per i contribuenti minimi e forfettari)
    //N3 non imponibile (esportazione, cessione di beni intra UE)
    //N4 esente (esente art. 10 D.P.R. 633/72) 
    //N5 regime del margine / IVA non esposta in fattura ex art. 74-ter
    //N6 inversione contabile (reverse charge)
    //N7 IVA assolta in altro stato UE, vendite a distanza o prestazioni di servizi di telecomunicazioni
    jsonLine["IT_Natura"] = '';
    if (Banana.document && tableVatCodes && (jsonLine["IT_Registro"]=='Acquisti' || jsonLine["IT_Registro"]=='Vendite')) {
      var rowVatCodes = tableVatCodes.findRowByValue('VatCode', vatCode);
      if (rowVatCodes) {
        var vatGr = rowVatCodes.value("Gr");
        if (vatGr.indexOf("-FC2")>=0) {
          jsonLine["IT_Natura"] = 'N1';
        }
        else if (vatGr.indexOf("-FC")>=0) {
          jsonLine["IT_Natura"] = 'N2';
        }
        else if (vatGr.startsWith("V-NI") || vatGr.startsWith("A-NI")) {
          jsonLine["IT_Natura"] = 'N3';
        }
        else if (vatGr.startsWith("V-ES") || vatGr.startsWith("A-ES")) {
          jsonLine["IT_Natura"] = 'N4';
        }
        else if (vatGr.startsWith("V-NE") || vatGr.startsWith("A-NE")) {
          jsonLine["IT_Natura"] = 'N5';
        }
        else if (vatGr.indexOf("-REV")>=0) {
          jsonLine["IT_Natura"] = 'N6';
        }
        else if (vatGr.indexOf("-EU")>=0) {
          jsonLine["IT_Natura"] = 'N7';
        }
      }

      //Controllo IT_Natura e aliquota
      var aliquota = jsonLine["IT_Aliquota"];
      var imposta = jsonLine["IT_Imposta"];
      var msg = '[' + jsonLine["JTableOrigin"] + ': Riga ' + (parseInt(jsonLine["JRowOrigin"])+1).toString() + '] ';

      //Fatture ricevute, natura “N6”: vanno anche obbligatoriamente valorizzati i campi Imposta e Aliquota
      if (jsonLine["IT_Natura"] == "N6") {
        if (isSupplier && (Banana.SDecimal.isZero(aliquota) || Banana.SDecimal.isZero(imposta))) {
          msg += getErrorMessage(ID_ERR_XML_ELEMENTO_NATURA_N6);
          Banana.document.addMessage( msg, ID_ERR_XML_ELEMENTO_NATURA_N6);
        }
      }
      //Se il campo Natura è valorizzato i campi Imposta e Aliquota devono essere vuoti
      else if (jsonLine["IT_Natura"].length>0 && !Banana.SDecimal.isZero(imposta) && !Banana.SDecimal.isZero(aliquota)) {
        msg += getErrorMessage(ID_ERR_XML_ELEMENTO_NATURA_PRESENTE);
        Banana.document.addMessage( msg, ID_ERR_XML_ELEMENTO_NATURA_PRESENTE);
      }
      //Se i campi Imposta e Aliquota sono vuoti, il campo Natura dev'essere valorizzato
      else if (jsonLine["IT_Natura"].length<=0 && Banana.SDecimal.isZero(imposta) && Banana.SDecimal.isZero(aliquota)) {
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

    //Write rows for debugging purposes
    /*var jsonString = filteredRows[i].toJSON();
    var jsonObj = JSON.parse(jsonString);
    param.journal.rows.push(jsonObj);*/
    param.journal.rows.push(jsonLine);

  }
  
  return param;
  
}

function loadJournal_filter(row, index, table) {
  //only normal transaction with vat
  //OperationType_None = 0, OperationType_Opening = 1, OperationType_CarryForward = 2,
  //OperationType_Transaction = 3, OperationType_Closure = 4, OperationType_Total = 6
  var operationType = row.value("JOperationType");
  if (operationType && operationType != Banana.document.OPERATIONTYPE_TRANSACTION)
    return false;

  return true;
}

function loadJournal_setColumns(param, journalColumns) {
  if (!param)
    return param;
  
  param.columns = {};
  for (var j = 0; j < journalColumns.length; j++) {
    var column = {};
    column.name = journalColumns[j];
    column.title = journalColumns[j];
    column.type = "amount";
    column.index = -1;
    if (column.name == "Date") {
      column.type = "date";
      column.index = 1;
    }
    else if (column.name == "Doc") {
      column.type = "description";
      column.index = 2;
    }
    else if (column.name == "DocProtocol") {
      column.title = "DocProt";
      column.type = "description";
      column.index = 3;
    }
    else if (column.name == "Description") {
      column.type = "description";
      column.index = 4;
    }
    else if (column.name == "VatCode") {
      column.index = 5;
    }
    else if (column.name == "VatRate") {
      column.index = 6;
    }
    else if (column.name == "VatRateEffective") {
      column.title = "VatRateEff";
      column.index = 7;
    }
    else if (column.name == "VatAmount") {
      column.index = 8;
    }
    else if (column.name == "VatTaxable") {
      column.title = "VatTax";
      column.index = 9;
    }
    else if (column.name == "JVatTaxable") {
      column.title = "JVatTax";
      column.index = 10;
    }
    else if (column.name == "VatPosted") {
      column.title = "VatPosted";
      column.index = 11;
    }
    else if (column.name == "VatPercentNonDeductible") {
      column.title = "VatPercNonDed";
      column.index = 12;
    }
    else if (column.name == "VatNonDeductible") {
      column.title = "VatNonDed";
      column.index = 13;
    }
    param.columns[j] = column;
  }

  //Additional columns
  var column = {};
  column.name = "IT_Natura";
  column.title = "IT_Natura";
  column.visible = true;
  column.type = "description";
  column.index = 1000;
  param.columns[j++] = column;
  var column = {};
  column.name = "IT_Imponibile";
  column.title = "IT_Imponibile";
  column.visible = true;
  column.type = "amount";
  column.index = 1001;
  param.columns[j++] = column;
  var column = {};
  column.name = "IT_Imposta";
  column.title = "IT_Imposta";
  column.visible = true;
  column.type = "amount";
  column.index = 1002;
  param.columns[j++] = column;
  var column = {};
  column.name = "IT_Lordo";
  column.title = "IT_Lordo";
  column.visible = true;
  column.type = "amount";
  column.index = 1003;
  param.columns[j++] = column;
  var column = {};
  column.name = "IT_Detraibile";
  column.title = "IT_Detraibile";
  column.visible = true;
  column.type = "amount";
  column.index = 1004;
  param.columns[j++] = column;
  var column = {};
  column.name = "IT_Deducibile";
  column.title = "IT_Deducibile";
  column.visible = true;
  column.type = "amount";
  column.index = 1005;
  param.columns[j++] = column;
  var column = {};
  column.name = "IT_Aliquota";
  column.title = "IT_Aliquota";
  column.visible = true;
  column.type = "amount";
  column.index = 1006;
  param.columns[j++] = column;
  var column = {};
  column.name = "IT_Gr_IVA";
  column.title = "IT_Gr_IVA";
  column.visible = true;
  column.type = "description";
  column.index = 1007;
  param.columns[j++] = column;
  var column = {};
  column.name = "IT_Gr1_IVA";
  column.title = "IT_Gr1_IVA";
  column.visible = true;
  column.type = "description";
  column.index = 1008;
  param.columns[j++] = column;
  var column = {};
  column.name = "IT_Registro";
  column.title = "IT_Registro";
  column.visible = true;
  column.type = "description";
  column.index = 1009;
  param.columns[j++] = column;
  var column = {};
  column.name = "IT_ProgRegistro";
  column.title = "IT_ProgRegistro";
  column.visible = true;
  column.type = "description";
  column.index = 1010;
  param.columns[j++] = column;
  var column = {};
  column.name = "IT_DocInvoice";
  column.title = "IT_DocInvoice";
  column.visible = true;
  column.type = "description";
  column.index = 1011;
  param.columns[j++] = column;
  var column = {};
  column.name = "IT_TipoDoc";
  column.title = "IT_TipoDoc";
  column.visible = true;
  column.type = "description";
  column.index = 1012;
  param.columns[j++] = column;
  var column = {};
  column.name = "IT_ClienteConto";
  column.title = "IT_ClienteConto";
  column.visible = true;
  column.type = "description";
  column.index = 1013;
  param.columns[j++] = column;
  var column = {};
  column.name = "IT_ClienteDescrizione";
  column.title = "IT_ClienteDescrizione";
  column.visible = true;
  column.type = "description";
  column.index = 1014;
  param.columns[j++] = column;
  var column = {};
  column.name = "IT_ClienteIntestazione";
  column.title = "IT_ClienteIntestazione";
  column.visible = true;
  column.type = "description";
  column.index = 1015;
  param.columns[j++] = column;
  var column = {};
  column.name = "IT_ClienteTipologia";
  column.title = "IT_ClienteTipologia";
  column.visible = true;
  column.type = "description";
  column.index = 1016;
  param.columns[j++] = column;
  var column = {};
  column.name = "IT_ClientePartitaIva";
  column.title = "IT_ClientePartitaIva";
  column.visible = true;
  column.type = "description";
  column.index = 1017;
  param.columns[j++] = column;
  var column = {};
  column.name = "IT_ClienteCodiceFiscale";
  column.title = "IT_ClienteCodiceFiscale";
  column.visible = true;
  column.type = "description";
  column.index = 1018;
  param.columns[j++] = column;
  return param;
}

/*
 * Riprende i dati base della contabilità leggendo la tabella FileInfo (Strumenti - Tabella Info)
 * Riprende anche i dati contribuente salvati dallo script id  @id = ch.banana.script.italy_vat.daticontribuente.js
 *
 * @param	parametro iniziale dove vengono salvati i dati letti
 */
function readAccountingData(param) {
  if (!param)
    return param;

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

  //Dati contribuente
  param.datiContribuente = {};
  var datiContribuenteParam = Banana.document.getScriptSettings("ch.banana.script.italy_vat.daticontribuente.js");
  //compatibilità con una prima versione
  if (datiContribuenteParam.length <= 0) {
    datiContribuenteParam = Banana.document.getScriptSettings("ch.banana.script.italy_vat_2017.daticontribuente.js");
  }
  if (datiContribuenteParam.length > 0) {
    param.datiContribuente = JSON.parse(datiContribuenteParam);
  }
  //Verifica parametri
  param.datiContribuente = verifyDatiContribuente(param.datiContribuente);
  
  return param;
}

/*
 * Funzione di debug per la stampa del giornale di controllo
 */
function _debug_printCustomersSuppliers(param, report, stylesheet) {
  if (!param)
    return param;

  //Column count
  var sortedColumns = [];
  for (var i in param.journal.columns) {
    if (param.journal.columns[i].index>=0)
      sortedColumns.push(param.journal.columns[i].index);
  }
  sortedColumns.sort(_debug_sortNumber);  

  //Title
  var table = report.addTable("tableJournalCustomersSuppliers");
  var headerRow = table.getHeader().addRow();
  headerRow.addCell("Customers/Suppliers", "title",  sortedColumns.length);
  
  //Period
  var periodo = "Periodo dal " + Banana.Converter.toLocaleDateFormat(param.startDate);
  periodo +=" al " + Banana.Converter.toLocaleDateFormat(param.endDate);
  headerRow = table.getHeader().addRow();
  headerRow.addCell(periodo, "period",  sortedColumns.length);
  
  //Header
  var headerRow = table.getHeader().addRow();
  for (var i in sortedColumns) {
    var index = sortedColumns[i];
    for (var j in param.journal.columns) {
      if (param.journal.columns[j].index == index) {
        var columnTitle = param.journal.columns[j].title;
        headerRow.addCell(columnTitle);
        break;
      }
    }
  }

  // Print data
  var row = table.addRow();
  row.addCell("------------------- customers -------------------", "", sortedColumns.length);
  for (var i in param.customers) {
    for (var j in param.customers[i].rows) {
      var rowJsonObj = param.customers[i].rows[j];
      var row = table.addRow();
      for (var k in sortedColumns) {
        var index = sortedColumns[k];
        for (var l in param.journal.columns) {
          if (param.journal.columns[l].index == index) {
            var columnName = param.journal.columns[l].name;
            var content = rowJsonObj[columnName];
            if (content.length>11 && param.journal.columns[l].type == "description")
              content = content.substring(0,10) + "...";
            row.addCell(content, param.journal.columns[l].type);
            break;
          }
        }
      }
    }
  }
  
  var row = table.addRow();
  row.addCell("------------------- suppliers -------------------", "", sortedColumns.length);
  for (var i in param.suppliers) {
    for (var j in param.suppliers[i].rows) {
      var rowJsonObj = param.suppliers[i].rows[j];
      var row = table.addRow();
      for (var k in sortedColumns) {
        var index = sortedColumns[k];
        for (var l in param.journal.columns) {
          if (param.journal.columns[l].index == index) {
            var columnName = param.journal.columns[l].name;
            var content = rowJsonObj[columnName];
            if (content.length>11 && param.journal.columns[l].type == "description")
              content = content.substring(0,10) + "...";
            row.addCell(content, param.journal.columns[l].type);
            break;
          }
        }
      }
    }
  }
  
  _debug_printJournal_addStyle(stylesheet);

}

/*
 * Funzione di debug per la stampa del giornale di controllo
 */
function _debug_printJournal(param, report, stylesheet) {
  if (!param)
    return param;

  //Column count
  var sortedColumns = [];
  for (var i in param.journal.columns) {
    if (param.journal.columns[i].index>=0)
      sortedColumns.push(param.journal.columns[i].index);
  }
  sortedColumns.sort(_debug_sortNumber);  

  //Title
  var table = report.addTable("tableJournal");
  var headerRow = table.getHeader().addRow();
  headerRow.addCell("Registrazioni IVA Italia", "title",  sortedColumns.length);
  
  //Period
  var periodo = "Periodo dal " + Banana.Converter.toLocaleDateFormat(param.startDate);
  periodo +=" al " + Banana.Converter.toLocaleDateFormat(param.endDate);
  headerRow = table.getHeader().addRow();
  headerRow.addCell(periodo, "period",  sortedColumns.length);
  
  //Header
  var headerRow = table.getHeader().addRow();
  for (var i in sortedColumns) {
    var index = sortedColumns[i];
    for (var j in param.journal.columns) {
      if (param.journal.columns[j].index == index) {
        var columnTitle = param.journal.columns[j].title;
        /*if (columnTitle.length>8)
          columnTitle = columnTitle.substring(0, 7) + ".";*/
        headerRow.addCell(columnTitle);
        break;
      }
    }
  }

  // Print data
  var row = table.addRow();
  for (var i=0; i < param.journal.rows.length;i++) {
    var jsonObj = param.journal.rows[i];
    var row = table.addRow();
    for (var j in sortedColumns) {
      var index = sortedColumns[j];
      for (var k in param.journal.columns) {
        if (param.journal.columns[k].index == index) {
          var content = jsonObj[param.journal.columns[k].name];
          row.addCell(content, param.journal.columns[k].type);
          break;
        }
      }
    }
  }
  
  _debug_printJournal_addStyle(stylesheet);

}

function _debug_printJournal_addStyle(stylesheet) {
  //style
  stylesheet.addStyle(".tableJournalCustomersSuppliers", "margin-top:1em;width:100%;");
  stylesheet.addStyle(".tableJournalCustomersSuppliers td", "border:1px solid #333333");
  stylesheet.addStyle(".tableJournal", "margin-top:1em;width:100%;");
  stylesheet.addStyle(".tableJournal td", "border:1px solid #333333");
  
  stylesheet.addStyle(".title", "background-color:#ffffff;border:1px solid #ffffff;font-size:10px;");
  stylesheet.addStyle(".period", "background-color:#ffffff;border:1px solid #ffffff;");
  stylesheet.addStyle(".amount", "text-align:right;");
}

function _debug_sortNumber(a,b) {
    return a - b;
}
