// Copyright [2018] [Banana.ch SA - Lugano Switzerland]
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
 * ------------------------------------ REPORT IVA ITALIA 2017 -----------------------------------
 *
 * Journal() classe che contiene le registrazioni con iva 
 * raggruppate per cliente/fornitore
 *
 * -----------------------------------------------------------------------------------------------
*/

function Journal(banDocument) {
  this.banDocument = banDocument;
  if (this.banDocument === undefined)
    this.banDocument = Banana.document;
  /*elenco completo registrazioni iva con dati supplementari per le stampe fiscali*/
  this.transactions = [];
  /* colonne del giornale*/
  this.columns = {};
  /*elenco clienti*/
  this.customers = {};
  /*elenco fornitori*/
  this.suppliers = {};
  /*flag per includere solamente cliente e fornitori, altri movimenti iva non vengono considerati*/
  this.excludeVatTransactions = false;
}
/*
*  Filtra i dati del giornale escludendo le registrazioni degli anni precedenti
*/
Journal.prototype.filter = function(row, index, table) {
  //OperationType_None = 0, OperationType_Opening = 1, OperationType_CarryForward = 2,
  //OperationType_Transaction = 3, OperationType_Closure = 4, OperationType_Total = 6
  /*var operationType = row.value("JOperationType");
  if (operationType && operationType != this.banDocument.OPERATIONTYPE_TRANSACTION)
    return false;
  var vatOperation = row.value("JVatIsVatOperation");
  if (!vatOperation)
    return false;*/
  var originFile = row.value("JOriginFile");
  if (originFile === "C") {
    return true;
  }
  return false;
}

/*
 * Ritorna l'elenco delle registrazioni e dei clienti/fornitori per il periodo indicato
 */
Journal.prototype.getPeriod = function(startDate, endDate) {
  var periodStart = Banana.Converter.toDate(startDate);
  var periodEnd = Banana.Converter.toDate(endDate);
  var data = {};
  data.startDate = startDate;
  data.endDate = endDate;
  data.customers = {};
  data.suppliers = {};
  data.transactions = [];
  data.totalInvoices = {};
  data.columns = this.columns;

  for (var i=0; i < this.transactions.length;i++) {
    var jsonLine = this.transactions[i];
    var content = jsonLine["JDate"];
    var currentDate = Banana.Converter.stringToDate(content, "YYYY-MM-DD");
    if (currentDate >= periodStart && currentDate <= periodEnd) {
      data.transactions.push(jsonLine);
      var accountId = jsonLine["IT_ClienteConto"];
      var accountType = jsonLine["IT_ClienteTipologia"];
      //var accountObj = new Utils(this.banDocument).getAccount(accountId);
      if (accountType == 'C' && this.customers[accountId]) {
        if (!data.customers[accountId]) {
          data.customers[accountId] = this.customers[accountId];
          data.customers[accountId].transactions = [];
        }
        data.customers[accountId].transactions.push(jsonLine);
      }
      else if (accountType == 'F' && this.suppliers[accountId]) {
        if (!data.suppliers[accountId]) {
          data.suppliers[accountId] = this.suppliers[accountId];
          data.suppliers[accountId].transactions = [];
        }
        data.suppliers[accountId].transactions.push(jsonLine);
      }
      if (jsonLine["IT_NoDoc"].length) {
	     var key = jsonLine["IT_Registro"] + '_' + accountId + '_' + jsonLine["IT_NoDoc"];
        data.totalInvoices[key] = Banana.SDecimal.add(data.totalInvoices[key], jsonLine["IT_Lordo"]);
      }
    }
  }
  return data;
}

/*
 * Legge il giornale journalCustomersSuppliers e riprende le registrazioni con iva in this.transactions
 * Suddivide le registrazioni per clienti e fornitori in this.customers e this.suppliers
 * Non viene filtrato un periodo, ma riprende tutte le registrazioni dell'anno corrente
 * registrazioni dell'anno corrente tramite this.filter()
 * ORIGINTYPE_CURRENT indica riga normale di registrazione (OriginType_Budget e OriginType_Projection sono escluse)
 * Come parametro di journalCustomersSuppliers, utilizzato ACCOUNTTYPE_NONE invece di ACCOUNTTYPE_NORMAL 
 * per riprendere anche i clienti/fornitori definiti come centri di costo (ACCOUNTTYPE_CC3)
 */
Journal.prototype.load = function() {
  this.transactions = [];
  this.customers = {};
  this.suppliers = {};
  if (!this.banDocument || typeof (this.banDocument.journalCustomersSuppliers) === 'undefined')
    return;
  var journal = this.banDocument.journalCustomersSuppliers(
    this.banDocument.ORIGINTYPE_CURRENT, this.banDocument.ACCOUNTTYPE_NONE);
  var filteredRows = journal.findRows(this.filter);
  var tableVatCodes = this.banDocument.table('VatCodes');

  if (!journal || !filteredRows || !tableVatCodes)
    return;

  //Conti corrispettivi
  var mapCorrispettivi = new Utils(this.banDocument).getMapContiCorrispettivi();
  
  //Map tipi documento perché una fattura può avere solo un tipo documento
  //key=no cliente+no fattura, value=tipo documento_aliquotaiva
  var mapTipiDocumento = {};
  
  //Variabili per numerazione registro
  var progRegistri = {};
  var previousDataReg = {};
  var previousIndexGroup = {};
  var previousNoDoc = {};

  //Salva i nomi delle colonne del giornale
  //this.setColumns(journal.columnNames);
  this.setColumns();

  //Riprende l'elenco clienti/fornitori in this.customers e this.suppliers
  //Solamente righe con JInvoiceRowCustomerSupplier=1 (cliente) or JInvoiceRowCustomerSupplier=2 (fornitore)
  var progressBar = Banana.application.progressBar;
  var t0 = new Date();

  if (typeof(progressBar.setText) !== 'undefined')
    progressBar.setText("Elenco clienti/fornitori");
  progressBar.start(filteredRows.length + 1);
  
  for (var i = 0; i < filteredRows.length; i++) {
    if (!progressBar.step())
      return;
    if (typeof(progressBar.setText) !== 'undefined')
      progressBar.setText(i.toString());
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
      //var accountObj = new Utils(this.banDocument).getAccount(accountId);
      //if (accountObj) {
        if (isCustomer) {
          //this.customers[accountId] = accountObj;
          this.customers[accountId] = {};
        }
        else {
          //this.suppliers[accountId] = accountObj;
          this.suppliers[accountId] = {};
        }
      //}
    }
  }
  progressBar.finish();
  //this.printElapsedTime("Elenco clienti/fornitori", t0);
  
  //Conti clienti/fornitori salvati in un map per velocizzare lo script
  this.loadAccounts();

  //Riprende le registrazioni IVA in this.transactions
  t0 = new Date();
  if (typeof(progressBar.setText) !== 'undefined')
    progressBar.setText("Registrazioni IVA");
  progressBar.start(filteredRows.length + 1);
  
  for (var i = 0; i < filteredRows.length; i++) {
    if (!progressBar.step())
      return;
    if (typeof(progressBar.setText) !== 'undefined')
      progressBar.setText(i.toString());
    //Solo operazioni IVA
    var isVatOperation = filteredRows[i].value("JVatIsVatOperation");
    if (!isVatOperation)
      continue;
    //La registrazione IVA deve contenere un conto cliente/fornitore
    var isCustomer=false;
    var isSupplier=false;
    var accountId = filteredRows[i].value("JAccount");
    var contraAccountId = filteredRows[i].value("JContraAccount");
    var vatTwinAccountId = filteredRows[i].value("VatTwinAccount");
    var accountDebitId = filteredRows[i].value("AccountDebit");
    var accountCreditId = filteredRows[i].value("AccountCredit");
    if (!accountDebitId && !accountCreditId) {
      //contabilità entrate-uscite
      accountDebitId = filteredRows[i].value("Account");
      accountCreditId = filteredRows[i].value("Category");
    }
    //clienti o fornitori definiti come centri di costo
    var accountCC1 = filteredRows[i].value("JCC1");
    if (accountCC1 && accountCC1.length)
      accountCC1 = "." + accountCC1;
    var accountCC2 = filteredRows[i].value("JCC2");
    if (accountCC2 && accountCC2.length)
      accountCC2 = "," + accountCC2;
    var accountCC3 = filteredRows[i].value("JCC3");
    if (accountCC3 && accountCC3.length)
      accountCC3 = ";" + accountCC3;

    if (accountId && accountId in this.customers) {
      isCustomer = true;
    }
    else if (contraAccountId && contraAccountId in this.customers) {
      isCustomer = true;
      accountId = contraAccountId;
    }
    else if (vatTwinAccountId && vatTwinAccountId in this.customers) {
      isCustomer = true;
      accountId = vatTwinAccountId;
    }
    else if (accountDebitId && accountDebitId in this.customers) {
      isCustomer = true;
      accountId = accountDebitId;
    }
    else if (accountCreditId && accountCreditId in this.customers) {
      isCustomer = true;
      accountId = accountCreditId;
    }
    else if (accountCC1 && accountCC1 in this.customers) {
      isCustomer = true;
      accountId = accountCC1;
    }
    else if (accountCC2 && accountCC2 in this.customers) {
      isCustomer = true;
      accountId = accountCC2;
    }
    else if (accountCC3 && accountCC3 in this.customers) {
      isCustomer = true;
      accountId = accountCC3;
    }
    else if (accountId && accountId in this.suppliers) {
      isSupplier = true;
    }
    else if (contraAccountId && contraAccountId in this.suppliers) {
      isSupplier = true;
      accountId = contraAccountId;
    }
    else if (vatTwinAccountId && vatTwinAccountId in this.suppliers) {
      isSupplier = true;
      accountId = vatTwinAccountId;
    }
    else if (accountDebitId && accountDebitId in this.suppliers) {
      isSupplier = true;
      accountId = accountDebitId;
    }
    else if (accountCreditId && accountCreditId in this.suppliers) {
      isSupplier = true;
      accountId = accountCreditId;
    }
    else if (accountCC1 && accountCC1 in this.suppliers) {
      isSupplier = true;
      accountId = accountCC1;
    }
    else if (accountCC2 && accountCC2 in this.suppliers) {
      isSupplier = true;
      accountId = accountCC2;
    }
    else if (accountCC3 && accountCC3 in this.suppliers) {
      isSupplier = true;
      accountId = accountCC3;
    }
    
    //continua solamente se è un cliente/fornitore oppure le registrazioni IVA sono da includere
    if (this.excludeVatTransactions && !isCustomer && !isSupplier)
      continue;
      
    //Crea un oggetto json dove vengono salvate tutte le informazioni della riga
    //e aggiunto in this.transactions
    var jsonLine = {};
    for (var j in this.columns) {
      var columnName = this.columns[j].name;
      var value = filteredRows[i].value(columnName);
      if (value) {
        jsonLine[columnName] = xml_escapeString(value);
      }
      else {
        jsonLine[columnName] = '';
      }
    }

    //Nell'oggetto jsonLine vengono salvati anche i dati supplementari calcolati
    jsonLine["IT_ClienteConto"] = accountId;
    jsonLine["IT_ClienteCodiceFiscale"] = '';
    jsonLine["IT_ClienteDescrizione"] = '';
    jsonLine["IT_ClienteIDPaese"] = '';
    jsonLine["IT_ClienteIntestazione"] = '';
    jsonLine["IT_ClientePartitaIva"] = '';
    jsonLine["IT_ClienteTipologia"] = '';
    if (isCustomer)
      jsonLine["IT_ClienteTipologia"] = 'C';
    else if (isSupplier)
      jsonLine["IT_ClienteTipologia"] = 'F';

    var accountObj = {};
    if (accountId.length>0 && isCustomer) {
      accountObj = this.customers[accountId];
    }
    else if (accountId.length>0 && isSupplier) {
      accountObj = this.suppliers[accountId];
    }
    if (accountObj["Description"]) {
      jsonLine["IT_ClienteDescrizione"] = accountObj["Description"];
      jsonLine["IT_ClientePartitaIva"] = accountObj["VatNumber"];
      jsonLine["IT_ClienteCodiceFiscale"] = accountObj["FiscalNumber"];
      //Temporaneamente i parametri per l'invio della fattura elettronica sono salvati nel campo Codice1
      jsonLine["IT_XmlFormatoTrasmissione"] = "";
      jsonLine["IT_XmlCodiceDestinatario"] = "";
      jsonLine["IT_XmlPECDestinatario"] = "";
      var xmlParam = accountObj["Code1"];
      if (xmlParam && xmlParam.length>0) {
         var xmlParams = xmlParam.split(":");
         if (xmlParams.length>0)
             jsonLine["IT_XmlFormatoTrasmissione"] = xmlParams[0];
         if (xmlParams.length>1)
             jsonLine["IT_XmlCodiceDestinatario"] = xmlParams[1];
         if (xmlParams.length>2)
             jsonLine["IT_XmlPECDestinatario"] = xmlParams[2];
      }
      var intestazione = accountId + " - " + accountObj["Description"];
      if (accountObj["VatNumber"].length>0) {
        intestazione = "P.I. " + accountObj["VatNumber"] + " - " + accountObj["Description"];
      }
      jsonLine["IT_ClienteIntestazione"] = intestazione;
      jsonLine["IT_ClienteIDPaese"] = new Utils(this.banDocument).getCountryCode(accountObj);
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
    if (vatCode.length) {
      var rowVatCodes = tableVatCodes.findRowByValue('VatCode', vatCode);
      if (rowVatCodes) {
        var percAssoluta = rowVatCodes.value("VatRate");
        if (Banana.SDecimal.isZero(percAssoluta))
          percAssoluta = '0.00';
        jsonLine["IT_Aliquota"] = percAssoluta;
        var gr = rowVatCodes.value("Gr");
        jsonLine["IT_Gr_IVA"] = gr;
        jsonLine["IT_Registro"] = gr;
        //split payment L-SP vengono inclusi nel registro vendite/acquisti
        if (gr.indexOf('-')>0 || gr.length==1) {
          var gr0 = gr.substr(0,1);
          if (gr0 == "A" || (gr0 == "L" && isSupplier))
            jsonLine["IT_Registro"] = "Acquisti";
          else if (gr0 == "V" || (gr0 == "L" && isCustomer))
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

    //IT_NoDoc
    jsonLine["IT_NoDoc"] = '';
    var noDoc = xml_escapeString(filteredRows[i].value("DocInvoice"));
    if (noDoc.length<=0)
      noDoc =  xml_escapeString(filteredRows[i].value("Doc"));
    jsonLine["IT_NoDoc"] = noDoc;

    //IT_ProgRegistro
    var registro = jsonLine["IT_Registro"];
    var noProgressivo = 0;
    if (progRegistri[registro])
      noProgressivo = parseInt(progRegistri[registro]);
    var noDoc = xml_escapeString(filteredRows[i].value("DocInvoice"));
    var dataReg = filteredRows[i].value("JDate");
    var indexGroup = filteredRows[i].value("JContraAccountGroup") ;
    //Banana.console.log(noDoc + " " + dataReg + " " + " " +previousNoDoc + " " +previousDataReg);
    //Mantiene lo stesso numero di registro se la data di registrazione e il no fattura è lo stesso
    var prevNoDoc ='';
    var prevDataReg = '';
    if (previousNoDoc[registro])
      prevNoDoc  = previousNoDoc[registro];
    if (previousDataReg[registro])
      prevDataReg  = previousDataReg[registro];
    if (noDoc == prevNoDoc && noDoc.length>0 && dataReg == prevDataReg && dataReg.length>0) {
    }
    else if (indexGroup != previousIndexGroup[registro]) {
      noProgressivo += 1;
    }
    previousIndexGroup[registro] = indexGroup;
    previousNoDoc[registro] = noDoc;
    previousDataReg[registro] = dataReg;
    progRegistri[registro] = noProgressivo;
    jsonLine["IT_ProgRegistro"] = noProgressivo.toString();

    //IT_DataDoc
    //Se è utilizzata la colonna DocInvoice viene ripresa la data di emissione fattura JInvoiceIssueDate
    //Altrimenti se si utilizza la colonna DateDocument viene ripresa questa oppure la data di registrazione Date
    jsonLine["IT_DataDoc"] = '';
    if (filteredRows[i].value("DocInvoice") && filteredRows[i].value("DocInvoice").length>0)
      jsonLine["IT_DataDoc"] = filteredRows[i].value("JInvoiceIssueDate");
    else if (filteredRows[i].value("DateDocument") && filteredRows[i].value("DateDocument").length>0)
      jsonLine["IT_DataDoc"] = filteredRows[i].value("DateDocument");
    else
      jsonLine["IT_DataDoc"] = filteredRows[i].value("Date");

    //IT_TipoDoc
    //TD01 Fattura  
    //TD04 Nota di credito  
    //TD05 Nota di debito
    //TD07 Fattura semplificata
    //TD08 Nota di credito semplificata
    //TD10 Fattura di acquisto intracomunitario beni (IdPaese != IT)
    //TD11 Fattura di acquisto intracomunitario servizi (IdPaese != IT)
    
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

    //TD10 TD11 per acquisti intracee,TD07 fattura semplificata,TD01 per tutte le altre
    if (vatCode.length && isSupplier) {
      var isMemberEU = false;
      if (jsonLine["IT_ClienteIDPaese"].length>0 && jsonLine["IT_ClienteIDPaese"]!="IT")
        isMemberEU = new Utils(this.banDocument).isMemberOfEuropeanUnion(jsonLine["IT_ClienteIDPaese"]);
      var rowVatCodes = tableVatCodes.findRowByValue('VatCode', vatCode);
      if (rowVatCodes && isMemberEU) {
        var vatGr = rowVatCodes.value("Gr");
        if (vatGr && vatGr.indexOf("EU-S")>=0) {
          jsonLine["IT_TipoDoc"] = 'TD11';
        }
        else if (vatGr && vatGr.indexOf("EU")>=0) {
          jsonLine["IT_TipoDoc"] = 'TD10';
        }
        else if (vatGr && vatGr.indexOf("REV-S")>=0) {
          jsonLine["IT_TipoDoc"] = 'TD11';
        }
        else if (vatGr && vatGr.indexOf("REV")>=0) {
          jsonLine["IT_TipoDoc"] = 'TD10';
        }
      }
    }
    
    //In caso di una fattura con più tipi di documento, ad esempio registrazioni di rettifica come uno sconto,
    //viene impostato  il primo tipo di documento, questo perché nel file xml viene raggruppato tutto sotto uno stesso documento
    var aliquotaCorrente = jsonLine["IT_Aliquota"];
    for (var key in mapTipiDocumento) {
      if (key == accountId+noDoc) {
        var value = mapTipiDocumento[accountId+noDoc];
        var values = value.split("_");
        if (values.length>0) {
          //values[0] tipo documento, values[1] prima aliquota trovata che servirà per lo split payment
          jsonLine["IT_TipoDoc"] = values[0];
          aliquotaCorrente = values[1];
        }
        break;
      }
    }
    noDoc = jsonLine["IT_NoDoc"];
    mapTipiDocumento[accountId+noDoc] = jsonLine["IT_TipoDoc"] + '_' + aliquotaCorrente;

    //Controllo IdPaese e TipoDocumento 
    var tipoDocumentoCorretto = true;
    if (isSupplier && jsonLine["IT_ClienteIDPaese"] == "IT") {
      if (jsonLine["IT_TipoDoc"] == 'TD10' || jsonLine["IT_TipoDoc"] == 'TD11') {
        tipoDocumentoCorretto = false;
      }
    }
    else if (isSupplier && jsonLine["IT_ClienteIDPaese"].length>0 && new Utils(this.banDocument).isMemberOfEuropeanUnion(jsonLine["IT_ClienteIDPaese"])){
      if (jsonLine["IT_TipoDoc"] != 'TD10' && jsonLine["IT_TipoDoc"] != 'TD11') {
        tipoDocumentoCorretto = false;
      }
    }
    if (!tipoDocumentoCorretto) {
      var msg = '[' + jsonLine["JTableOrigin"] + ': Riga ' + (parseInt(jsonLine["JRowOrigin"])+1).toString() + '] ';
      msg += getErrorMessage(ID_ERR_DATIFATTURE_TIPODOCUMENTO_NONAMMESSO);
      msg = msg.replace("%1", jsonLine["IT_TipoDoc"] );
      msg = msg.replace("%2", jsonLine["IT_ClienteIDPaese"] );
      this.banDocument.addMessage( msg, ID_ERR_DATIFATTURE_TIPODOCUMENTO_NONAMMESSO);
    }

    //IT_Natura
    //N1 esclusa ex art. 15 (bollo, spese anticipate in nome e per conto della controparte, omaggi, interessi moratori, ecc.)
    //N2 non soggetta (Fuori campo IVA/Escluso IVA, codice da utilizzare per i contribuenti minimi e forfettari)
    //N3 non imponibile (esportazione, cessione di beni intra UE)
    //N4 esente (esente art. 10 D.P.R. 633/72) 
    //N5 regime del margine / IVA non esposta in fattura ex art. 74-ter
    //N6 inversione contabile (reverse charge)
    //N7 IVA assolta in altro stato UE, vendite a distanza o prestazioni di servizi di telecomunicazioni
    //Il codice natura può essere sovrascritto dalla colonna VatExtraInfo oppure dalla colonna Gr1 della tabella codici iva
    //Se presente ESCL, la registrazione viene esclusa
    //Se presente NONE, il codice natura resta vuoto
    jsonLine["IT_Natura"] = '';
    var vatExtraInfo = filteredRows[i].value("VatExtraInfo");
    if (vatExtraInfo.startsWith("N") && vatExtraInfo.length==2) {
      var test = vatExtraInfo.substring(vatExtraInfo,1);
      jsonLine["IT_Natura"] = vatExtraInfo;
    }
    if (jsonLine["IT_Natura"].length<=0) {
      var rowVatCodes = tableVatCodes.findRowByValue('VatCode', vatCode);
      if (rowVatCodes) {
        var vatGr = rowVatCodes.value("Gr");
        var vatGr1 = rowVatCodes.value("Gr1");
        var vatRate = rowVatCodes.value("VatRate");
        vatGr1 = vatGr1.toUpperCase();
        var rowVatDescription = rowVatCodes.value("Description");
        if (!rowVatDescription)
          rowVatDescription = "";
        rowVatDescription = rowVatDescription.toLowerCase();
        rowVatDescription = rowVatDescription.replace(" ","");
        if (vatGr1.startsWith("N")) {
          jsonLine["IT_Natura"] = vatGr1;
        }
        else if (vatGr1 == "ESCL") {
          jsonLine["IT_Natura"] = vatGr1;
        }
        else if (vatGr1 == "NONE") {
          jsonLine["IT_Natura"] = '';
        }
        else if (rowVatDescription.indexOf("art.15")>0) {
          jsonLine["IT_Natura"] = 'N1';
        }
        else if (rowVatDescription.indexOf("art.74")>0) {
          jsonLine["IT_Natura"] = 'N5';
        }
        else if (rowVatDescription.indexOf("art.7")>0) {
          jsonLine["IT_Natura"] = 'N3';
        }
        else if (rowVatDescription.indexOf("art.3")>0) {
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
        else if (vatGr.indexOf("-REV")>=0 && Banana.SDecimal.isZero(vatRate)) {
          jsonLine["IT_Natura"] = 'N6';
        }
      }
    }

    //IT_Imponibile
    //È possibile il segno negativo per tipi di documento TD01
    jsonLine["IT_Imponibile"] = '';
    value = filteredRows[i].value("JVatTaxable");
    if (Banana.SDecimal.isZero(value))
      value = '0.00';
    else if (jsonLine["IT_Registro"] == "Vendite" || jsonLine["IT_Registro"] == "Corrispettivi")
      value = Banana.SDecimal.invert(value);
    //splitpayment: quando si utilizza il codice L-SP, l'imposta è da invertire
    else if (jsonLine["IT_Registro"] == "Liquidazioni" && isCustomer)
      value = Banana.SDecimal.invert(value);
    jsonLine["IT_Imponibile"] = value;

    //IT_ImportoIva
    jsonLine["IT_ImportoIva"] = '';
    value = filteredRows[i].value("VatAmount");
    if (Banana.SDecimal.isZero(value))
      value = '0.00';
    else if (jsonLine["IT_Registro"] == "Vendite" || jsonLine["IT_Registro"] == "Corrispettivi")
      value = Banana.SDecimal.invert(value);
    else if (jsonLine["IT_Registro"] == "Liquidazioni" && isCustomer)
      value = Banana.SDecimal.invert(value);
    jsonLine["IT_ImportoIva"] = value;

    //IT_IvaContabilizzata
    jsonLine["IT_IvaContabilizzata"] = '';
    value = filteredRows[i].value("VatPosted");
    if (Banana.SDecimal.isZero(value))
      value = '0.00';
    else if (jsonLine["IT_Registro"] == "Vendite" || jsonLine["IT_Registro"] == "Corrispettivi")
      value = Banana.SDecimal.invert(value);
    else if (jsonLine["IT_Registro"] == "Liquidazioni" && isCustomer)
      value = Banana.SDecimal.invert(value);
    jsonLine["IT_IvaContabilizzata"] = value;

    //IT_Lordo
    jsonLine["IT_Lordo"] = '';
    value = Banana.SDecimal.add(filteredRows[i].value("JVatTaxable"), filteredRows[i].value("VatAmount"));
    if (Banana.SDecimal.isZero(value))
      value = '0.00';
    else if (jsonLine["IT_Registro"] == "Vendite" || jsonLine["IT_Registro"] == "Corrispettivi")
      value = Banana.SDecimal.invert(value);
    else if (jsonLine["IT_Registro"] == "Liquidazioni" && isCustomer)
      value = Banana.SDecimal.invert(value);
    jsonLine["IT_Lordo"] = value;

/*
3. Dati relativi ai campi “detraibile” e “deducibile”

Uno dei dati che può essere fornito è quello relativo alla percentuale di
detraibilità o, in alternativa, alla deducibilità del costo riportato in fattura. Tale
dato, la cui indicazione è facoltativa, è riferito all’eventuale deducibilità o
detraibilità del costo ai fini delle imposte sui redditi in capo all’acquirente o
committente persona fisica che non opera nell’esercizio di impresa, arte o
professione (cfr., pagina 11 delle specifiche tecniche “Detraibile: contiene il
valore percentuale di detraibilità se gli importi si riferiscono a spese detraibili.
Deducibile: indica se gli importi si riferiscono a spese deducibili ai fini di
imposte diverse dall’Iva”). A titolo di esempio, qualora la fattura sia emessa da
una impresa edile nei confronti di un cliente privato in relazione a lavori di
ristrutturazione edilizia, il 50% del costo riportato nel documento potrebbe essere
portato in detrazione dei redditi del cliente: in tal caso, l’informazione – se
disponibile – potrebbe essere riportata nell’apposito campo della comunicazione.
Si precisa che la compilazione di uno dei due campi in oggetto esclude la
compilazione dell’altro. 

La % detraibile può essere diversa dalla % non imponibile di Banana
I due dati sono facoltativi, si prevede l'aggiunta di due colonne nella tabella registrazioni,
nelle quali l'utente può inserire la % manualmente

EsibilitaIva
(i valori ammessi sono “I” per esigibilità immediata, “D” per esigibilità differita e “S” per scissione dei pagamenti). 
*/
    //IT_Detraibile
    //IT_Deducibile
    //IT_EsigibilitaIva
    jsonLine["IT_Detraibile"] = '';
    jsonLine["IT_Deducibile"] = '';
    jsonLine["IT_EsigibilitaIva"] = 'I';
    if (jsonLine["IT_Gr_IVA"].endsWith('-ED'))
      jsonLine["IT_EsigibilitaIva"] = 'D';
    //Operazioni in Split Payment: verrà indicato l'imponibile e l’aliquota Iva, nel campo “Esigibilita’ Iva” il codice “S”.
    //Funziona su codici IVA/Gruppi che terminano con -SP
    else if (jsonLine["IT_Gr_IVA"].endsWith('-SP') || vatCode.endsWith('-SP')) {
      jsonLine["IT_EsigibilitaIva"] = 'S';
      //riprende inoltre l'aliquota iva perché il file xml dà errore se non è impostata l'aliquota
      for (var key in mapTipiDocumento) {
        if (key == accountId+noDoc) {
          var value = mapTipiDocumento[accountId+noDoc];
          var values = value.split("_");
          if (values.length>1) {
            //values[0] tipo documento, values[1] aliquota
            jsonLine["IT_Aliquota"] = values[1];
          }
          break;
        }
      }
    }
      
    //IT_ImponibileDetraibile
    //IT_ImponibileNonDetraibile
    jsonLine["IT_ImponibileDetraibile"] = '';
    jsonLine["IT_ImponibileNonDetraibile"] = '';
    value = filteredRows[i].value("VatPercentNonDeductible");
    if (!Banana.SDecimal.isZero(value)) {
      value = Banana.SDecimal.subtract('100', value);
      var rate = Banana.SDecimal.round(value, {'decimals':2});
      var taxable = filteredRows[i].value("VatTaxable");
      var amount = taxable * rate /100;
      amount = Banana.SDecimal.roundNearest(amount, '0.01');
      jsonLine["IT_ImponibileDetraibile"] = amount;
      amount = Banana.SDecimal.subtract(taxable, amount);
      jsonLine["IT_ImponibileNonDetraibile"] = amount;
    }
    else {
      var taxable = filteredRows[i].value("VatTaxable");
      jsonLine["IT_ImponibileDetraibile"] = taxable;
    }

    //Controllo IT_Natura e aliquota
    var aliquota = jsonLine["IT_Aliquota"];
    var imposta = jsonLine["IT_IvaContabilizzata"];
    var msg = '[' + jsonLine["JTableOrigin"] + ': Riga ' + (parseInt(jsonLine["JRowOrigin"])+1).toString() + '] ';

    /*Se il campo Natura è valorizzato i campi Imposta e Aliquota devono essere vuoti
      Eccezione: fatture ricevute con natura “N6” dove l'imposta e l'aliquota possono essere valorizzati
      I codici IVA esclusi non vengono controllati, anche i codici N6 non vengono controllati perché 
      secondo gli ultimi chiarimenti dell'Agenzia Entrate, per tutte le fatture, 
      sia EMESSE che RICEVUTE in reverse Charge, si deve indicare il codice N6. 
      l'unica differenza è che solo per quelle ricevute si deve valorizzare il campo Aliquota ed Imposta.
      Aggiunto controllo codici natura N6 estesi a due cifre, ad esempio N6.9
     */
     if (jsonLine["IT_Natura"] !== "ESCL" && !jsonLine["IT_Natura"].startsWith("N6")) {
      if (jsonLine["IT_Natura"].length>0) {
         if (!Banana.SDecimal.isZero(imposta) && !Banana.SDecimal.isZero(aliquota)) {
            msg += getErrorMessage(ID_ERR_XML_ELEMENTO_NATURA_PRESENTE) + jsonLine["IT_Natura"];
            this.banDocument.addMessage( msg, ID_ERR_XML_ELEMENTO_NATURA_PRESENTE);
         }
      }
      else {
        //Se il campo Natura non è valorizzato, lo devono essere i campi Imposta e Aliquota
        //Controlla solamente registro vendite/acquisti
        if (jsonLine["IT_Registro"]== "Acquisti" || jsonLine["IT_Registro"] == "Vendite") {
          if (Banana.SDecimal.isZero(imposta) && Banana.SDecimal.isZero(aliquota) ) {
            msg += getErrorMessage(ID_ERR_XML_ELEMENTO_NATURA_NONPRESENTE);
            this.banDocument.addMessage( msg, ID_ERR_XML_ELEMENTO_NATURA_NONPRESENTE);
          }
        }
      }
    }

    //Corrispettivi
    jsonLine["IT_CorrFattureNormali"] = '';
    jsonLine["IT_CorrFattureFiscali"] = '';
    jsonLine["IT_CorrFattureScontrini"] = '';
    jsonLine["IT_CorrFattureDifferite"] = '';
    jsonLine["IT_CorrispettiviNormali"] = '';
    jsonLine["IT_CorrispettiviScontrini"] = '';
    jsonLine["IT_CorrRicevuteFiscali"] = '';
    jsonLine["IT_CorrTotaleGiornaliero"] = '';
    var contoIvaAssociato = filteredRows[i].value("VatTwinAccount");
    //es. contenuto mapCorrispettivi    //{"4100":"IT_CorrFattureNormali","4101":"IT_CorrFattureFiscali","4102":"IT_CorrFattureScontrini","4103":"IT_CorrFattureDifferite","4104":"IT_CorrispettiviNormali","4105":"IT_CorrispettiviScontrini","4106":"IT_CorrRicevuteFiscali"}
    if (contoIvaAssociato.length && vatCode.length) {
      var colonnaCorrispettivi = '';
      if (mapCorrispettivi.hasOwnProperty(contoIvaAssociato))
        colonnaCorrispettivi = mapCorrispettivi[contoIvaAssociato];
      if (colonnaCorrispettivi.length) {
        var lordo = Banana.SDecimal.add(filteredRows[i].value("JVatTaxable"), filteredRows[i].value("VatAmount"));
        jsonLine[colonnaCorrispettivi] = lordo;
        jsonLine["IT_CorrTotaleGiornaliero"] = lordo;
      }
    }

    //IT_RegistrazioneValida
    //Serve per sapere se la riga IVA è stata inclusa nelle registrazioni clienti/fornitori
    //Quelle scartate verranno segnalate in una tabella di controllo
    jsonLine["IT_RegistrazioneValida"] = '';

    if (isCustomer) {
      if (!this.customers[accountId].transactions)
        this.customers[accountId].transactions = [];
      jsonLine["IT_RegistrazioneValida"] = '1';
      this.customers[accountId].transactions.push(jsonLine);
    }
    else if (isSupplier) {
      if (!this.suppliers[accountId].transactions)
        this.suppliers[accountId].transactions = [];
      jsonLine["IT_RegistrazioneValida"] = '1';
      this.suppliers[accountId].transactions.push(jsonLine);
    }
    //Write transactions for debugging purposes
    /*var jsonString = filteredRows[i].toJSON();
    var jsonObj = JSON.parse(jsonString);
    this.transactionsTest.push(jsonObj);*/
    this.transactions.push(jsonLine);
  }
  progressBar.finish();
  //this.printElapsedTime("Registrazioni iva", t0);
}

/*
 * Ritorna i conti clienti/fornitori con gli indirizzi
*/
Journal.prototype.loadAccounts = function() {
  if (!this.banDocument)
    return;

  var tableAccounts = this.banDocument.table('Accounts');
  if (!tableAccounts)
    return;

   for (var accountId in this.customers) {
      var tRow = tableAccounts.findRowByValue('Account', accountId);
      if (tRow) {
         var jsonString = tRow.toJSON();
         var jsonObj = JSON.parse(jsonString);
         for (var key in jsonObj) {
            if (jsonObj[key].length > 0)
               jsonObj[key] = xml_escapeString(jsonObj[key]);
         }
         this.customers[accountId] = jsonObj;
      }
   }
    
   for (var accountId in this.suppliers) {
      var tRow = tableAccounts.findRowByValue('Account', accountId);
      if (tRow) {
         var jsonString = tRow.toJSON();
         var jsonObj = JSON.parse(jsonString);
         for (var key in jsonObj) {
            if (jsonObj[key].length > 0)
               jsonObj[key] = xml_escapeString(jsonObj[key]);
         }
         this.suppliers[accountId] = jsonObj;
      }
   }

   /*for (i=0; i<tableAccounts.rowCount; i++) {
    var tRow = tableAccounts.row(i);
    var accountId = tRow.value('Account');
    
    if (!accountId)
      continue;
    
    if (!this.customers[accountId] && !this.suppliers[accountId])
      continue;

    var jsonString = tRow.toJSON();
    var jsonObj = JSON.parse(jsonString);
    for (var key in jsonObj) {
      if (jsonObj[key].length > 0)
        jsonObj[key] = xml_escapeString(jsonObj[key]);
    }
    
    if (this.customers[accountId]) {
      this.customers[accountId] = jsonObj;
    }
    else if (this.suppliers[accountId]) {
      this.suppliers[accountId] = jsonObj;
    }
  }*/
}

Journal.prototype.printElapsedTime = function(functionName, t0) {
  var t1 = new Date();
  var millis = t1.valueOf() - t0.valueOf();
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  if (minutes == 0 && seconds == 0) {
    var timeString = Banana.SDecimal.round(millis/1000, {'decimals':2});
    //Banana.console.log( functionName + " elapsed time " + timeString + " s");
  }
  else {
    var timeString = (seconds == 60 ? (minutes+1) + ":00" : minutes + ":" + (seconds < 10 ? "0" : "") + seconds);
    //Banana.console.log( functionName + " elapsed time " + timeString);
  }
}


Journal.prototype.setColumns = function() {
  this.columns = {};
  var j=0;

  //Journal columns
  var column = {};
  column.name = "JDate";
  column.title = "JDate";
  column.type = "date";
  column.index = 1;
  this.columns[j++] = column;
  var column = {};
  column.name = "Doc";
  column.title = "Doc";
  column.type = "description";
  column.index = 3;
  this.columns[j++] = column;
  var column = {};
  column.name = "DocInvoice";
  column.title = "DocInvoice";
  column.type = "description";
  column.index = 5;
  this.columns[j++] = column;
  var column = {};
  column.name = "DocProtocol";
  column.title = "DocProt";
  column.type = "description";
  column.index = 7;
  this.columns[j++] = column;
  var column = {};
  column.name = "JDescription";
  column.title = "JDescription";
  column.type = "description";
  column.index = 9;
  this.columns[j++] = column;
  var column = {};
  column.name = "VatCode";
  column.title = "VatCode";
  column.type = "description";
  column.index = 11;
  this.columns[j++] = column;
  var column = {};
  column.name = "VatRate";
  column.title = "VatRate";
  column.type = "amount";
  column.index = 13;
  this.columns[j++] = column;
  var column = {};
  column.name = "VatRateEffective";
  column.title = "VatRateEff";
  column.type = "amount";
  column.index = 15;
  this.columns[j++] = column;
  var column = {};
  column.name = "VatAmount";
  column.title = "VatAmount";
  column.type = "amount";
  column.index = 17;
  this.columns[j++] = column;
  var column = {};
  column.name = "VatTaxable";
  column.title = "VatTax";
  column.type = "amount";
  column.index = 19;
  this.columns[j++] = column;
  var column = {};
  column.name = "JVatTaxable";
  column.title = "JVatTax";
  column.type = "amount";
  column.index = 21;
  this.columns[j++] = column;
  var column = {};
  column.name = "VatPosted";
  column.title = "VatPosted";
  column.type = "amount";
  column.index = 23;
  this.columns[j++] = column;
  var column = {};
  column.name = "VatPercentNonDeductible";
  column.title = "VatPercNonDed";
  column.type = "amount";
  column.index = 25;
  this.columns[j++] = column;
  var column = {};
  column.name = "VatNonDeductible";
  column.title = "VatNonDed";
  column.type = "amount";
  column.index = 27;
  this.columns[j++] = column;
  var column = {};
  column.name = "JRowOrigin";
  column.title = "JRowOrigin";
  column.type = "description";
  column.index = 29;
  this.columns[j++] = column;
  var column = {};
  column.name = "JTableOrigin";
  column.title = "JTableOrigin";
  column.type = "description";
  column.index = 31;
  this.columns[j++] = column;
  var column = {};
  column.name = "Description";
  column.title = "Description";
  column.type = "description";
  column.index = -1;
  this.columns[j++] = column;
  var column = {};
  column.name = "JAccount";
  column.title = "JAccount";
  column.type = "description";
  column.index = -1;
  this.columns[j++] = column;
  var column = {};
  column.name = "JContraAccount";
  column.title = "JContraAccount";
  column.type = "description";
  column.index = -1;
  this.columns[j++] = column;
  var column = {};
  column.name = "JVatCodeWithoutSign";
  column.title = "JVatCodeWithoutSign";
  column.type = "description";
  column.index = -1;
  this.columns[j++] = column;
  var column = {};
  column.name = "JVatNegative";
  column.title = "JVatNegative";
  column.type = "amount";
  column.index = -1;
  this.columns[j++] = column;
  var column = {};
  column.name = "VatExtraInfo";
  column.title = "VatExtraInfo";
  column.type = "amount";
  column.index = -1;
  this.columns[j++] = column;
  var column = {};
  column.name = "VatTwinAccount";
  column.title = "VatTwinAccount";
  column.type = "amount";
  column.index = -1;
  this.columns[j++] = column;

  //Additional columns
  var column = {};
  column.name = "IT_Natura";
  column.title = "IT_Natura";
  column.type = "description";
  column.index = 1000;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_Lordo";
  column.title = "IT_Lordo";
  column.type = "amount";
  column.index = 1001;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_ImportoIva";
  column.title = "IT_ImportoIva";
  column.type = "amount";
  column.index = 1002;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_IvaContabilizzata";
  column.title = "IT_IvaContab";
  column.type = "amount";
  column.index = 1003;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_Imponibile";
  column.title = "IT_Imponibile";
  column.type = "amount";
  column.index = 1004;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_ImponibileDetraibile";
  column.title = "IT_ImponibDetr";
  column.type = "amount";
  column.index = 1005;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_ImponibileNonDetraibile";
  column.title = "IT_ImponibNonDetr";
  column.type = "amount";
  column.index = 1006;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_Detraibile";
  column.title = "IT_Detr";
  column.type = "amount";
  column.index = 1007;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_Deducibile";
  column.title = "IT_Deduc";
  column.type = "amount";
  column.index = 1008;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_EsigibilitaIva";
  column.title = "IT_EsigibIva";
  column.type = "amount";
  column.index = 1009;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_Aliquota";
  column.title = "IT_Aliquota";
  column.type = "amount";
  column.index = 1010;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_Gr_IVA";
  column.title = "IT_Gr_IVA";
  column.type = "description";
  column.index = 1011;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_Gr1_IVA";
  column.title = "IT_Gr1_IVA";
  column.type = "description";
  column.index = 1012;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_Registro";
  column.title = "IT_Registro";
  column.type = "description";
  column.index = 1013;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_ProgRegistro";
  column.title = "IT_ProgReg";
  column.type = "description";
  column.index = 1014;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_NoDoc";
  column.title = "IT_NoDoc";
  column.type = "description";
  column.index = 1015;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_DataDoc";
  column.title = "IT_DataDoc";
  column.type = "description";
  column.index = 1016;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_TipoDoc";
  column.title = "IT_TipoDoc";
  column.type = "description";
  column.index = 1017;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_ClienteConto";
  column.title = "IT_Conto";
  column.type = "description";
  column.index = 1018;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_ClienteDescrizione";
  column.title = "IT_Descrizione";
  column.type = "description";
  column.index = 1019;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_ClienteIntestazione";
  column.title = "IT_Intestazione";
  column.type = "description";
  column.index = 1020;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_ClienteTipologia";
  column.title = "IT_Tipologia";
  column.type = "description";
  column.index = 1021;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_ClientePartitaIva";
  column.title = "IT_PI";
  column.type = "description";
  column.index = 1022;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_ClienteCodiceFiscale";
  column.title = "IT_CF";
  column.type = "description";
  column.index = 1023;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_CorrFattureNormali";
  column.title = "IT_CorrFatNormali";
  column.index = 1024;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_CorrFattureFiscali";
  column.title = "IT_CorrFatFiscali";
  column.index = 1025;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_CorrFattureScontrini";
  column.title = "IT_CorrFatScontr";
  column.index = 1026;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_CorrFattureDifferite";
  column.title = "IT_CorrFatDifferite";
  column.index = 1027
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_CorrispettiviNormali";
  column.title = "IT_CorrNormali";
  column.index = 1028;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_CorrispettiviScontrini";
  column.title = "IT_CorrScontr";
  column.index = 1029;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_CorrRicevuteFiscali";
  column.title = "IT_CorrRicFiscali";
  column.index = 1030;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_CorrTotaleGiornaliero";
  column.title = "IT_CorrGiornal";
  column.index = 1031;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_RegistrazioneValida";
  column.title = "IT_RegValida";
  column.index = 1032;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_XmlFormatoTrasmissione";
  column.title = "IT_XmlFormatoTrasmissione";
  column.type = "description";
  column.index = 1033;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_XmlCodiceDestinatario";
  column.title = "IT_XmlCodiceDestinatario";
  column.type = "description";
  column.index = 1034;
  this.columns[j++] = column;
  var column = {};
  column.name = "IT_XmlPECDestinatario";
  column.title = "IT_XmlPECDestinatario";
  column.type = "description";
  column.index = 1035;
  this.columns[j++] = column;
  
}

Journal.prototype.sortNumber = function(a, b) {
    return a - b;
}

/*
 * Funzione di debug per la stampa del giornale di controllo
 */
Journal.prototype._debugPrintJournal = function(report, stylesheet) {

  //Column count
  var sortedColumns = [];
  for (var i in this.columns) {
    if (this.columns[i].index>=0)
      sortedColumns.push(this.columns[i].index);
  }
  sortedColumns.sort(this.sortNumber);  

  //Title
  var table = report.addTable("tableJournal");
  var headerRow = table.getHeader().addRow();
  headerRow.addCell("(DEBUG) - Registrazioni IVA Italia", "title",  sortedColumns.length);
  
  //Header
  var headerRow = table.getHeader().addRow();
  for (var i in sortedColumns) {
    var index = sortedColumns[i];
    for (var j in this.columns) {
      if (this.columns[j].index == index) {
        var columnTitle = this.columns[j].title;
        /*if (columnTitle.length>8)
          columnTitle = columnTitle.substring(0, 7) + ".";*/
        headerRow.addCell(columnTitle);
        break;
      }
    }
  }

  // Print data
  var row = table.addRow();
  for (var i=0; i < this.transactions.length;i++) {
    var jsonObj = this.transactions[i];
    var row = table.addRow();
    for (var j in sortedColumns) {
      var index = sortedColumns[j];
      for (var k in this.columns) {
        if (this.columns[k].index == index) {
          var content = jsonObj[this.columns[k].name];
          row.addCell(content, this.columns[k].type);
          break;
        }
      }
    }
  }
  
  //style
  stylesheet.addStyle(".tableJournal", "margin-top:1em;width:100%;");
  stylesheet.addStyle(".tableJournal td", "border:1px solid #333333");
  
}

/*
 * Funzione di debug per la stampa del giornale di controllo
 */
Journal.prototype._debugPrintCustomersSuppliers = function(report, stylesheet) {
  //Column count
  var sortedColumns = [];
  for (var i in this.columns) {
    if (this.columns[i].index>=0 && this.columns[i].name.startsWith("IT_"))
      sortedColumns.push(this.columns[i].index);
  }
  sortedColumns.sort(this.sortNumber);  

  //Title
  var table = report.addTable("tableJournalCustomersSuppliers");
  var headerRow = table.getHeader().addRow();
  headerRow.addCell("(DEBUG) Clienti/Fornitori", "title",  sortedColumns.length);
  
  //Period
  /*var periodo = "Periodo dal " + Banana.Converter.toLocaleDateFormat(param.startDate);
  periodo +=" al " + Banana.Converter.toLocaleDateFormat(param.endDate);
  headerRow = table.getHeader().addRow();
  headerRow.addCell(periodo, "period",  sortedColumns.length);*/
  
  //Header
  var headerRow = table.getHeader().addRow();
  for (var i in sortedColumns) {
    var index = sortedColumns[i];
    for (var j in this.columns) {
      if (this.columns[j].index == index) {
        var columnTitle = this.columns[j].title;
        headerRow.addCell(columnTitle);
        break;
      }
    }
  }

  // Print data
  var row = table.addRow();
  row.addCell("------------------- customers -------------------", "", sortedColumns.length);
  for (var i in this.customers) {
    for (var j in this.customers[i].transactions) {
      var rowJsonObj = this.customers[i].transactions[j];
      //Banana.console.log(JSON.stringify(rowJsonObj));
      var row = table.addRow();
      for (var k in sortedColumns) {
        var index = sortedColumns[k];
        for (var l in this.columns) {
          if (this.columns[l].index == index) {
            var columnName = this.columns[l].name;
            var content = rowJsonObj[columnName];
            if (content && content.length>11 && this.columns[l].type == "description")
              content = content.substring(0,10) + "...";
            row.addCell(content, this.columns[l].type);
            break;
          }
        }
      }
    }
  }
  
  var row = table.addRow();
  row.addCell("------------------- suppliers -------------------", "", sortedColumns.length);
  for (var i in this.suppliers) {
    for (var j in this.suppliers[i].transactions) {
      var rowJsonObj = this.suppliers[i].transactions[j];
      var row = table.addRow();
      for (var k in sortedColumns) {
        var index = sortedColumns[k];
        for (var l in this.columns) {
          if (this.columns[l].index == index) {
            var columnName = this.columns[l].name;
            var content = rowJsonObj[columnName];
            if (content && content.length>11 && this.columns[l].type == "description")
              content = content.substring(0,10) + "...";
            row.addCell(content, this.columns[l].type);
            break;
          }
        }
      }
    }
  }
  
  //style
  stylesheet.addStyle(".tableJournalCustomersSuppliers", "margin-top:1em;width:100%;");
  stylesheet.addStyle(".tableJournalCustomersSuppliers td", "border:1px solid #333333");

}

/* -----------------------------------------------------------------------------------------------
* Utils() classe che contiene metodi per facilitare la creazione di periodi, 
* la ripresa di conti e codici nazioni
* ------------------------------------------------------------------------------------------------
*/
function Utils(banDocument) {
  this.banDocument = banDocument;
  if (this.banDocument === undefined)
    this.banDocument = Banana.document;
}

/*
 * Crea i periodi in base alle impostazioni del dialogo: periodo selezionato e tipo versamento(mensile o trimestrale)
 * Ritorna un array dei periodi
 * @param contiene il periodo selezionato
 */
Utils.prototype.createPeriods = function(param) {
  var periods = [];

  if (!param)
    return param;

  if (!param.annoSelezionato || param.annoSelezionato.length<=0)
    param.annoSelezionato = param.openingYear;
  if (param.annoSelezionato.length<=0)
    return param;
  // --------------------------------------------------------------------------------
  //MESE param.periodoSelezionato == 'm'
  // --------------------------------------------------------------------------------
  if (param.periodoSelezionato == 'm') {
    var currentPeriod = {};
    var month = parseInt(param.periodoValoreMese) + 1;
    if (month === 11 || month === 4 || month === 6 || month === 9) {
      currentPeriod.startDate = param.annoSelezionato.toString() + new Utils(this.banDocument).zeroPad(month, 2) + "01";
      currentPeriod.endDate = param.annoSelezionato.toString() + new Utils(this.banDocument).zeroPad(month, 2) + "30";
    }
    //month with 28 or 29 days
    else if (month === 2) {
      var day = 28;
      if (param.annoSelezionato % 4 == 0 && (param.annoSelezionato % 100 != 0 || param.annoSelezionato % 400 == 0))
        day = 29;
      currentPeriod.startDate = param.annoSelezionato.toString() + "0201";
      currentPeriod.endDate = param.annoSelezionato.toString()+ "02" + day.toString() ;
    }
    //months with 31 days
    else {
      currentPeriod.startDate = param.annoSelezionato.toString() + new Utils(this.banDocument).zeroPad(month, 2) + "01";
      currentPeriod.endDate = param.annoSelezionato.toString() + new Utils(this.banDocument).zeroPad(month, 2) + "31";
    }

    //se il tipo di versamento è trimestrale avvisa che è stato selezionato un mese
    /*if (param.datiContribuente.liqTipoVersamento == 1) {
      var msg = getErrorMessage(ID_ERR_TIPOVERSAMENTO);
      this.banDocument.addMessage( msg, ID_ERR_TIPOVERSAMENTO);
      currentPeriod.startDate = '';
      currentPeriod.endDate = '';
    }*/
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
        currentPeriod.startDate = param.annoSelezionato.toString() + "0101";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0131";
        periods.push(currentPeriod);

        var day = 28;
        if (param.annoSelezionato % 4 == 0 && (param.annoSelezionato % 100 != 0 || param.annoSelezionato % 400 == 0))
          day = 29;
        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0201";
        currentPeriod.endDate = param.annoSelezionato.toString() + "02" + day.toString();
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0301";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0331";
        periods.push(currentPeriod);
      }
      else if (param.periodoValoreTrimestre === "1") {
        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0401";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0430";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0501";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0531";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0601";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0630";
        periods.push(currentPeriod);
      }
      else if (param.periodoValoreTrimestre === "2") {
        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0701";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0731";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0801";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0831";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0901";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0930";
        periods.push(currentPeriod);
      }
      //liquidazione iva ha anche periodo trimestre 5.IV trimestrali speciali  (periodoValoreTrimestre=4)
      else if (param.periodoValoreTrimestre === "3" || param.periodoValoreTrimestre === "4") {
        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "1001";
        currentPeriod.endDate = param.annoSelezionato.toString() + "1031";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "1101";
        currentPeriod.endDate = param.annoSelezionato.toString() + "1130";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "1201";
        currentPeriod.endDate = param.annoSelezionato.toString() + "1231";
        periods.push(currentPeriod);
      }
    }
    //Tipo versamento trimestrale o non definito
    else {
      var currentPeriod = {};
      if (param.periodoValoreTrimestre === "0") {
        currentPeriod.startDate = param.annoSelezionato.toString() + "0101";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0331";
      }
      else if (param.periodoValoreTrimestre === "1") {
        currentPeriod.startDate = param.annoSelezionato.toString() + "0401";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0630";
      }
      else if (param.periodoValoreTrimestre === "2") {
        currentPeriod.startDate = param.annoSelezionato.toString() + "0701";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0930";
      }
      //liquidazione iva ha anche periodo trimestre 5.IV trimestrali speciali  (periodoValoreTrimestre=4)
      else if (param.periodoValoreTrimestre === "3" || param.periodoValoreTrimestre === "4") {
        currentPeriod.startDate = param.annoSelezionato.toString() + "1001";
        currentPeriod.endDate = param.annoSelezionato.toString() + "1231";
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
        currentPeriod.startDate = param.annoSelezionato.toString() + "0101";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0131";
        periods.push(currentPeriod);

        var day = 28;
        if (param.annoSelezionato % 4 == 0 && (param.annoSelezionato % 100 != 0 || param.annoSelezionato % 400 == 0))
          day = 29;
        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0201";
        currentPeriod.endDate = param.annoSelezionato.toString() + "02" + day.toString();
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0301";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0331";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0401";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0430";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0501";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0531";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0601";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0630";
        periods.push(currentPeriod);
      }
      else if (param.periodoValoreSemestre === "1") {
        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0701";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0731";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0801";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0831";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0901";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0930";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "1001";
        currentPeriod.endDate = param.annoSelezionato.toString() + "1031";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "1101";
        currentPeriod.endDate = param.annoSelezionato.toString() + "1130";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "1201";
        currentPeriod.endDate = param.annoSelezionato.toString() + "1231";
        periods.push(currentPeriod);
      }
    }
    //Tipo versamento trimestrale
    else if (param.datiContribuente.liqTipoVersamento == 1) {
      if (param.periodoValoreSemestre === "0") {
        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0101";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0331";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0401";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0630";
        periods.push(currentPeriod);
      }
      else if (param.periodoValoreSemestre === "1") {
        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0701";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0930";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "1001";
        currentPeriod.endDate = param.annoSelezionato.toString() + "1231";
        periods.push(currentPeriod);
      }
    }
    //Tipo versamento non definito
    else {
      var currentPeriod = {};
      if (param.periodoValoreSemestre === "0") {
        currentPeriod.startDate = param.annoSelezionato.toString() + "0101";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0630";
        periods.push(currentPeriod);
      }
      else if (param.periodoValoreSemestre === "1") {
        currentPeriod.startDate = param.annoSelezionato.toString() + "0701";
        currentPeriod.endDate = param.annoSelezionato.toString() + "1231";
        periods.push(currentPeriod);
      }
    }
  }
  // --------------------------------------------------------------------------------
  //TUTTO L'ANNO param.periodoSelezionato == 'y'
  // --------------------------------------------------------------------------------
  else if (param.periodoSelezionato == 'y') {
    if (param.datiContribuente.liqTipoVersamento == 0) {
        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0101";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0131";
        periods.push(currentPeriod);

        var day = 28;
        if (param.annoSelezionato % 4 == 0 && (param.annoSelezionato % 100 != 0 || param.annoSelezionato % 400 == 0))
          day = 29;
        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0201";
        currentPeriod.endDate = param.annoSelezionato.toString() + "02" + day.toString();
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0301";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0331";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0401";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0430";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0501";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0531";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0601";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0630";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0701";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0731";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0801";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0831";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "0901";
        currentPeriod.endDate = param.annoSelezionato.toString() + "0930";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "1001";
        currentPeriod.endDate = param.annoSelezionato.toString() + "1031";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "1101";
        currentPeriod.endDate = param.annoSelezionato.toString() + "1130";
        periods.push(currentPeriod);

        var currentPeriod = {};
        currentPeriod.startDate = param.annoSelezionato.toString() + "1201";
        currentPeriod.endDate = param.annoSelezionato.toString() + "1231";
        periods.push(currentPeriod);
    }
    //Tipo versamento trimestrale
    else if (param.datiContribuente.liqTipoVersamento == 1){
      var currentPeriod = {};
      currentPeriod.startDate = param.annoSelezionato.toString() + "0101";
      currentPeriod.endDate = param.annoSelezionato.toString() + "0331";
      periods.push(currentPeriod);

      var currentPeriod = {};
      currentPeriod.startDate = param.annoSelezionato.toString() + "0401";
      currentPeriod.endDate = param.annoSelezionato.toString() + "0630";
      periods.push(currentPeriod);

      var currentPeriod = {};
      currentPeriod.startDate = param.annoSelezionato.toString() + "0701";
      currentPeriod.endDate = param.annoSelezionato.toString() + "0930";
      periods.push(currentPeriod);

      var currentPeriod = {};
      currentPeriod.startDate = param.annoSelezionato.toString() + "1001";
      currentPeriod.endDate = param.annoSelezionato.toString() + "1231";
      periods.push(currentPeriod);
     }
     //Tipo di versamento non definito
     else {
      var currentPeriod = {};
      currentPeriod.startDate = param.fileInfo["OpeningDate"];
      currentPeriod.endDate = param.fileInfo["ClosureDate"];
      periods.push(currentPeriod);
    }
  }
  return periods;
}

/*
 * Ritorna un oggetto json con i dati del cliente o fornitore ripresi dalla tabella conti(indirizzo, saldo, ...)
 * @accountId	conto id presente nella tabella conti
 */
Utils.prototype.getAccount = function(_accountId) {
  var jsonObj = {};
  if (!_accountId || _accountId.length <= 0)
    return jsonObj;
  if (!this.banDocument)
    return jsonObj;

  var tableAccounts = this.banDocument.table('Accounts');
  if (tableAccounts) {
    var row = tableAccounts.findRowByValue('Account', _accountId);
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
 * Ritorna la colonna del giornale associata al conto corrispettivi
 * I conti corrispettivi vengono assegnati nel dialogo Dati Contribuente
 */
Utils.prototype.getContoCorrispettivi = function(accountId) {
  if (!this.banDocument || accountId.length<=0)
    return '';
  var param = new DatiContribuente(this.banDocument).readParam();
  if (param) {
    if (param.contoFattureNormali && accountId == param.contoFattureNormali)
      return "IT_CorrFattureNormali";
    if (param.contoFattureFiscali && accountId == param.contoFattureFiscali)
      return "IT_CorrFattureFiscali";
    if (param.contoFattureScontrini && accountId == param.contoFattureScontrini)
      return "IT_CorrFattureScontrini";
    if (param.contoFattureDifferite && accountId == param.contoFattureDifferite)
      return "IT_CorrFattureDifferite";
    if (param.contoCorrispettiviNormali && accountId == param.contoCorrispettiviNormali)
      return "IT_CorrispettiviNormali";
    if (param.contoCorrispettiviScontrini && accountId == param.contoCorrispettiviScontrini)
      return "IT_CorrispettiviScontrini";
    if (param.contoRicevuteFiscali && accountId == param.contoRicevuteFiscali)
      return "IT_CorrRicevuteFiscali";
  }
  return '';
}

/*
 * Ritorna i conti associati ai corrispettivi in un map
*/
Utils.prototype.getMapContiCorrispettivi = function() {
  var mapCorrispettivi = {};
  if (!this.banDocument)
    return mapCorrispettivi;
  var param = new DatiContribuente(this.banDocument).readParam();
  if (param) {
    if (param.contoFattureNormali && param.contoFattureNormali.length>0)
      mapCorrispettivi[param.contoFattureNormali] = "IT_CorrFattureNormali";
    if (param.contoFattureFiscali && param.contoFattureFiscali.length>0)
      mapCorrispettivi[param.contoFattureFiscali] = "IT_CorrFattureFiscali";
    if (param.contoFattureScontrini && param.contoFattureScontrini.length>0)
      mapCorrispettivi[param.contoFattureScontrini] = "IT_CorrFattureScontrini";
    if (param.contoFattureDifferite && param.contoFattureDifferite.length>0)
      mapCorrispettivi[param.contoFattureDifferite] = "IT_CorrFattureDifferite";
    if (param.contoCorrispettiviNormali && param.contoCorrispettiviNormali.length>0)
      mapCorrispettivi[param.contoCorrispettiviNormali] = "IT_CorrispettiviNormali";
    if (param.contoCorrispettiviScontrini && param.contoCorrispettiviScontrini.length>0)
      mapCorrispettivi[param.contoCorrispettiviScontrini] = "IT_CorrispettiviScontrini";
    if (param.contoRicevuteFiscali && param.contoRicevuteFiscali.length>0)
      mapCorrispettivi[param.contoRicevuteFiscali] = "IT_CorrRicevuteFiscali";
  }
  return mapCorrispettivi;  
}

/*
 * Ritorna il codice paese lunghezza 2 caratteri
 */
Utils.prototype.getCountryCode = function(jsonObject) {
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
  if (countryCode == 'japan' || countryCode == 'jpn') {
    countryCode = 'jp';
  }
  return countryCode.toUpperCase();
}

/*
 * Ritorna il periodo come stringa da utilizzare nei titoli dei reports
 */
Utils.prototype.getPeriodText = function(period) {
  if (!period.startDate || !period.endDate)
    return "";
  var fromDate = Banana.Converter.toDate(period.startDate);
  var toDate = Banana.Converter.toDate(period.endDate);
  var firstDayOfPeriod = 1;
  var lastDayOfPeriod = new Date(toDate.getFullYear(),toDate.getMonth()+1,0).getDate().toString();
  
  //se le date non corrispondono al primo giorno del mese (fromDate) e all'ultimo giorno del mese (toDate) ritorna il periodo esatto
  if (fromDate.getDate() != firstDayOfPeriod || toDate.getDate() != lastDayOfPeriod)
    return "dal: " + Banana.Converter.toLocaleDateFormat(fromDate) + " al " + Banana.Converter.toLocaleDateFormat(toDate);

  if (fromDate.getMonth() === toDate.getMonth()) {
    var mese = fromDate.getMonth()+1;
    if (mese == 1)
      mese = "gennaio";
    else if (mese == 2)
      mese = "febbraio";
    else if (mese == 3)
      mese = "marzo";
    else if (mese == 4)
      mese = "aprile";
    else if (mese == 5)
      mese = "maggio";
    else if (mese == 6)
      mese = "giugno";
    else if (mese == 7)
      mese = "luglio";
    else if (mese == 8)
      mese = "agosto";
    else if (mese == 9)
      mese = "settembre";
    else if (mese == 10)
      mese = "ottobre";
    else if (mese == 11)
      mese = "novembre";
    else if (mese == 12)
      mese = "dicembre";
    mese +=  " " + fromDate.getFullYear();
    return mese;
  }

  if (fromDate.getFullYear() === toDate.getFullYear()) {
    var q = [1,2,3,4];
    var q1 = q[Math.floor(fromDate.getMonth() / 3)];  
    var q2 = q[Math.floor(toDate.getMonth() / 3)];  
    if (q1 === q2)
      return q1.toString() + ". trimestre " + fromDate.getFullYear();

    var s = [1,2];
    var s1 = q[Math.floor(fromDate.getMonth() / 6)];  
    var s2 = q[Math.floor(toDate.getMonth() / 6)];  
    if (s1 === s2)
      return s1.toString() + ". semestre " + fromDate.getFullYear();

    return fromDate.getFullYear().toString();
  }
  //Periodo che non inizia all'1.1, ad esempio 01.09.17/31.08.18
  return "dal: " + Banana.Converter.toLocaleDateFormat(fromDate) + " al " + Banana.Converter.toLocaleDateFormat(toDate);
}

Utils.prototype.isMemberOfEuropeanUnion = function(_country) {
  if (_country.length<=0)
    return false;
  var country = _country.toLowerCase();
  if (country== "at" || country=="austria")
    return true;
  if (country== "be" || country=="belgio" || country=="belgium")
    return true;
  if (country== "bg" || country=="bulgaria")
    return true;
  if (country== "cy" || country=="cipro" || country=="cyprus")
    return true;
  if (country== "cz" || country=="repubbica ceca" || country=="czech republic")
    return true;
  if (country== "de" || country=="germania" || country=="germany")
    return true;
  if (country== "dk" || country=="danimarca" || country=="denmark")
    return true;
  if (country== "ee" || country=="estonia")
    return true;
  if (country== "el" || country=="grecia" || country=="greece")
    return true;
  if (country== "es" || country=="spagna" || country=="spain")
    return true;
  if (country== "fi" || country=="finlandia" || country=="finland")
    return true;
  if (country== "fr" || country=="francia" || country=="france")
    return true;
  if (country== "hr" || country=="croazia" || country=="croatia")
    return true;
  if (country== "hu" || country=="ungheria" || country=="hungary")
    return true;
  if (country== "ie" || country=="irlanda" || country=="ireland")
    return true;
  if (country== "it" || country=="italia" || country=="italy")
    return true;
  if (country== "lt" || country=="lituania")
    return true;
  if (country== "lu" || country=="lussemburgo" || country=="luxembourg")
    return true;
  if (country== "lv" || country=="lettonia")
    return true;
  if (country== "mt" || country=="malta")
    return true;
  if (country== "nl" || country=="paesi bassi" || country=="olanda")
    return true;
  if (country== "pl" || country=="polonia" || country=="poland")
    return true;
  if (country== "pt" || country=="portogallo" || country=="portugal")
    return true;
  if (country== "ro" || country=="romania")
    return true;
  if (country== "se" || country=="svezia" || country=="sweden")
    return true;
  if (country== "si" || country=="slovenia")
    return true;
  if (country== "sk" || country=="slovacchia" || country=="slovakia")
    return true;
  if (country== "uk" || country=="regno unito" || country=="united kingdom")
    return true;
  return false;
}
 
/*
 * Riprende i dati base della contabilità leggendo la tabella FileInfo (Strumenti - Tabella Info)
 * @param	parametro iniziale dove vengono aggiunti i dati letti
 */
Utils.prototype.readAccountingData = function(param) {
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
  
  if (this.banDocument.info) {
    param.fileInfo["BasicCurrency"] = this.banDocument.info("AccountingDataBase", "BasicCurrency");
    param.fileInfo["OpeningDate"] = this.banDocument.info("AccountingDataBase", "OpeningDate");
    param.fileInfo["ClosureDate"] = this.banDocument.info("AccountingDataBase", "ClosureDate");
    if (this.banDocument.info("AccountingDataBase", "CustomersGroup"))
      param.fileInfo["CustomersGroup"] = this.banDocument.info("AccountingDataBase", "CustomersGroup");
    if (this.banDocument.info("AccountingDataBase", "SuppliersGroup"))
      param.fileInfo["SuppliersGroup"] = this.banDocument.info("AccountingDataBase", "SuppliersGroup");
    param.fileInfo["Address"]["Company"] = xml_escapeString(this.banDocument.info("AccountingDataBase", "Company"));
    param.fileInfo["Address"]["Courtesy"] = xml_escapeString(this.banDocument.info("AccountingDataBase", "Courtesy"));
    param.fileInfo["Address"]["Name"] = xml_escapeString(this.banDocument.info("AccountingDataBase", "Name"));
    param.fileInfo["Address"]["FamilyName"] = xml_escapeString(this.banDocument.info("AccountingDataBase", "FamilyName"));
    param.fileInfo["Address"]["Address1"] = xml_escapeString(this.banDocument.info("AccountingDataBase", "Address1"));
    param.fileInfo["Address"]["Address2"] = xml_escapeString(this.banDocument.info("AccountingDataBase", "Address2"));
    param.fileInfo["Address"]["Zip"] = xml_escapeString(this.banDocument.info("AccountingDataBase", "Zip"));
    param.fileInfo["Address"]["City"] = xml_escapeString(this.banDocument.info("AccountingDataBase", "City"));
    param.fileInfo["Address"]["State"] = xml_escapeString(this.banDocument.info("AccountingDataBase", "State"));
    param.fileInfo["Address"]["Country"] = xml_escapeString(this.banDocument.info("AccountingDataBase", "Country"));
    param.fileInfo["Address"]["Web"] = xml_escapeString(this.banDocument.info("AccountingDataBase", "Web"));
    param.fileInfo["Address"]["Email"] = xml_escapeString(this.banDocument.info("AccountingDataBase", "Email"));
    param.fileInfo["Address"]["Phone"] = xml_escapeString(this.banDocument.info("AccountingDataBase", "Phone"));
    param.fileInfo["Address"]["Mobile"] = xml_escapeString(this.banDocument.info("AccountingDataBase", "Mobile"));
	//fax rimosso dai dati base a partire dalla versione 9.1 (banana 10)
    param.fileInfo["Address"]["Fax"] = "";
    param.fileInfo["Address"]["FiscalNumber"] = xml_escapeString(this.banDocument.info("AccountingDataBase", "FiscalNumber"));
    param.fileInfo["Address"]["VatNumber"] = xml_escapeString(this.banDocument.info("AccountingDataBase", "VatNumber"));
  }

  param.accountingOpeningDate = '';
  param.accountingClosureDate = '';
  if (param.fileInfo["OpeningDate"])
    param.accountingOpeningDate = param.fileInfo["OpeningDate"];
  if (param.fileInfo["ClosureDate"])
    param.accountingClosureDate = param.fileInfo["ClosureDate"];

  param.openingYear = '';
  param.closureYear = '';
  if (param.accountingOpeningDate.length >= 10)
    param.openingYear = param.accountingOpeningDate.substring(0, 4);
  if (param.accountingClosureDate.length >= 10)
    param.closureYear = param.accountingClosureDate.substring(0, 4);

  return param;
}

/**
* output integers with leading zeros
*/
Utils.prototype.zeroPad = function(num, places) {
    if (num.toString().length > places)
        num = 0;
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}
