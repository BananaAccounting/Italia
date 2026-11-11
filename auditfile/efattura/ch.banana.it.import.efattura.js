// Copyright [2026] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.it.import.efattura
// @api = 1.0
// @pubdate = 2026-11-10
// @publisher = Banana.ch SA
// @description = Importa fatture elettroniche
// @task = import.file
// @doctype = *
// @docproperties =
// @inputdatasource = opendirdialog
// @inputfilefilter = *.xml
// @timeout = -1
// @includejs = ch.banana.it.import.efattura.settings.js

//Main function
function exec(inData) {

    if (!Banana.document || !inData || inData.length <= 0)
        return "@Cancel";

    Banana.application.clearMessages();
    
    var eFatturaImport = new EFatturaImport(Banana.document);
    var settings = new Settings(Banana.document);

    if (!settings.verifyBananaVersion())
        return "@Cancel";

    //inData contiene i dati delle fatture in formato XML
    var xmlData = {};
    try {
        xmlData = JSON.parse(inData);
    }
    catch (e) {
        xmlData[0] = inData;
    }

    if (!xmlData)
        return "@Cancel";

    var savedParam = Banana.document.getScriptSettings("import_efattura");
    if (savedParam && savedParam.length > 0) {
        eFatturaImport.setParam(JSON.parse(savedParam));
    }

    var jsonData = eFatturaImport.createJsonDocument(xmlData);

    var documentChange = { "format": "documentChange", "error": "" };
    documentChange["data"] = jsonData;

    //TO DEBUG SHOW THE INTERMEDIARY TEXT
    //Banana.Ui.showText(JSON.stringify(documentChange, null, 3));

    //si può ritornare l'oggetto json oppure la stringa
    //return JSON.stringify(documentChange, null, 3);
    return documentChange;
}

function settingsDialog() {
    var settings = new Settings(Banana.document);
    return settings.showDialog();
}

/*Function called from converter*/
function setup() {
}

function EFatturaImport(banDocument) {
    this.banDocument = banDocument;
    if (this.banDocument === undefined)
        this.banDocument = Banana.document;

    //array dei documenti json che contengono i dati per modificare il file contabile
    this.jsonDocArray = [];
    //elenco dei clienti/fornitori presenti nella tabella Conti
    this.accounts = {};
    //numerazione iniziale conti clienti
    this.customerIdCounter = 10000;
    //numerazione iniziale conti fornitori
    this.supplierIdCounter = 20000;
    // elenco numeri fatture già registrate per controllare i duplicati
    this.docInvoices = [];
    //parametri che l'utente può modificare tramite dialogo
    this.initParam();
}

/*Il metodo createJsonDocument() riprende i dati dal file xml della fattura elettronica
  e li trasforma in formato json per essere importati nella tabella Registrazioni
*/
EFatturaImport.prototype.createJsonDocument = function (inData) {
    this.load();
    for (var srcFileName in inData) {
        //seleziona singolo file xml
        var xmlFile = Banana.Xml.parse(inData[srcFileName]);
        if (!xmlFile)
            continue;
        var xmlRoot = xmlFile.firstChildElement();
        if (!xmlRoot)
            continue;

        var jsonDoc = this.createJsonDocument_Init();
        //aggiunge/aggiorna i clienti/fornitori nella tabella conti
        var accountId = this.createJsonDocument_AddAccount(jsonDoc, xmlRoot, srcFileName);
        if (accountId.length <= 0)
            continue;

        //aggiunge le fatture nel documento json
        var totTransactions = this.createJsonDocument_AddTransactions(jsonDoc, xmlRoot, srcFileName, accountId);
        if (totTransactions <= 0)
            continue;

        //Banana.console.debug(JSON.stringify(jsonDoc, null, 3));
        this.jsonDocArray.push(jsonDoc);
    }
    return this.jsonDocArray;
}


EFatturaImport.prototype.createJsonDocument_AddAccount = function (jsonDoc, xmlRoot, srcFileName) {

    var invoiceNode = xmlRoot.firstChildElement('FatturaElettronicaHeader');
    if (!invoiceNode)
        return "";
    let isCustomer = this.isCustomer(invoiceNode);

    var accountNode = null;
    if (isCustomer)
        accountNode = invoiceNode.firstChildElement('CessionarioCommittente');
    else
        accountNode = invoiceNode.firstChildElement('CedentePrestatore');

    if (!accountNode
        || !accountNode.firstChildElement('Sede')
        || !accountNode.firstChildElement('DatiAnagrafici')
        || !accountNode.firstChildElement('DatiAnagrafici').firstChildElement('Anagrafica'))
        return "";

    //cerca il cliente/fornitore in this.accounts
    //se non lo trova ne aggiunge uno nuovo
    let operationName = "";
    var accountId = this.getAccountId(accountNode, isCustomer);
    if (accountId.length <= 0) {
        accountId = this.getAccountIdNew(isCustomer);
        operationName = "add";
    }

    var nome = "", cognome = "", denominazione = "", indirizzo = "", numerocivico = "", cap = "", comune = "", provincia = "", nazione = "";
    var idPaese = "", partitaIva = "", codiceFiscale = "";
    if (accountNode.firstChildElement('DatiAnagrafici').firstChildElement('Anagrafica').firstChildElement('Nome'))
        nome = accountNode.firstChildElement('DatiAnagrafici').firstChildElement('Anagrafica').firstChildElement('Nome').text.trim();
    if (accountNode.firstChildElement('DatiAnagrafici').firstChildElement('Anagrafica').firstChildElement('Cognome'))
        cognome = accountNode.firstChildElement('DatiAnagrafici').firstChildElement('Anagrafica').firstChildElement('Cognome').text.trim();
    if (accountNode.firstChildElement('DatiAnagrafici').firstChildElement('Anagrafica').firstChildElement('Denominazione'))
        denominazione = accountNode.firstChildElement('DatiAnagrafici').firstChildElement('Anagrafica').firstChildElement('Denominazione').text.trim();
    if (accountNode.firstChildElement('Sede').firstChildElement('Indirizzo'))
        indirizzo = accountNode.firstChildElement('Sede').firstChildElement('Indirizzo').text.trim();
    if (accountNode.firstChildElement('Sede').firstChildElement('NumeroCivico'))
        numerocivico = accountNode.firstChildElement('Sede').firstChildElement('NumeroCivico').text.trim();
    if (accountNode.firstChildElement('Sede').firstChildElement('CAP'))
        cap = accountNode.firstChildElement('Sede').firstChildElement('CAP').text.trim();
    if (accountNode.firstChildElement('Sede').firstChildElement('Comune'))
        comune = accountNode.firstChildElement('Sede').firstChildElement('Comune').text.trim();
    if (accountNode.firstChildElement('Sede').firstChildElement('Provincia'))
        provincia = accountNode.firstChildElement('Sede').firstChildElement('Provincia').text.trim();
    if (accountNode.firstChildElement('Sede').firstChildElement('Nazione'))
        nazione = accountNode.firstChildElement('Sede').firstChildElement('Nazione').text.trim();
    if (accountNode.firstChildElement('DatiAnagrafici').firstChildElement('IdFiscaleIVA') &&
        accountNode.firstChildElement('DatiAnagrafici').firstChildElement('IdFiscaleIVA').firstChildElement('IdPaese'))
        idPaese = accountNode.firstChildElement('DatiAnagrafici').firstChildElement('IdFiscaleIVA').firstChildElement('IdPaese').text.trim();
    if (accountNode.firstChildElement('DatiAnagrafici').firstChildElement('IdFiscaleIVA') &&
        accountNode.firstChildElement('DatiAnagrafici').firstChildElement('IdFiscaleIVA').firstChildElement('IdCodice'))
        partitaIva = accountNode.firstChildElement('DatiAnagrafici').firstChildElement('IdFiscaleIVA').firstChildElement('IdCodice').text.trim();
    if (accountNode.firstChildElement('DatiAnagrafici').firstChildElement('CodiceFiscale'))
        codiceFiscale = accountNode.firstChildElement('DatiAnagrafici').firstChildElement('CodiceFiscale').text.trim();

    var divisa = "";
    if (xmlRoot.firstChildElement('FatturaElettronicaBody')
        && xmlRoot.firstChildElement('FatturaElettronicaBody').firstChildElement('DatiGenerali')
        && xmlRoot.firstChildElement('FatturaElettronicaBody').firstChildElement('DatiGenerali').firstChildElement('DatiGeneraliDocumento')) {
        var datiGeneraliDocNode = xmlRoot.firstChildElement('FatturaElettronicaBody').firstChildElement('DatiGenerali').firstChildElement('DatiGeneraliDocumento');
        divisa = datiGeneraliDocNode.firstChildElement('Divisa').text.trim();
    }

    var row = {};
    row.fields = {};
    if (nome.length > 0) {
        if (operationName == "add" || this.accounts[accountId].FirstName != nome) {
            row.fields["FirstName"] = nome;
            if (operationName.length <= 0)
                operationName = "modify";
        }
    }
    if (cognome.length > 0) {
        if (operationName == "add" || this.accounts[accountId].FamilyName != cognome) {
            row.fields["FamilyName"] = cognome;
            if (operationName.length <= 0)
                operationName = "modify";
        }
    }
    if (denominazione.length > 0) {
        if (operationName == "add" || this.accounts[accountId].OrganisationName != denominazione) {
            row.fields["OrganisationName"] = denominazione;
            if (operationName.length <= 0)
                operationName = "modify";
        }
    }
    if (indirizzo.length > 0 || numerocivico.length > 0) {
        if (indirizzo.length > 0 && numerocivico.length > 0)
            indirizzo = indirizzo + " " + numerocivico;
        else if (indirizzo.length <= 0 && numerocivico.length > 0)
            indirizzo = numerocivicico;
        if (operationName == "add" || this.accounts[accountId].Street != indirizzo) {
            row.fields["Street"] = indirizzo;
            if (operationName.length <= 0)
                operationName = "modify";
        }
    }
    if (cap.length > 0) {
        if (operationName == "add" || this.accounts[accountId].PostalCode != cap) {
            row.fields["PostalCode"] = cap;
            if (operationName.length <= 0)
                operationName = "modify";
        }
    }
    if (comune.length > 0) {
        if (operationName == "add" || this.accounts[accountId].Locality != comune) {
            row.fields["Locality"] = comune;
            if (operationName.length <= 0)
                operationName = "modify";
        }
    }
    if (provincia.length > 0) {
        if (operationName == "add" || this.accounts[accountId].Region != provincia) {
            row.fields["Region"] = provincia;
            if (operationName.length <= 0)
                operationName = "modify";
        }
    }
    if (idPaese.length > 0) {
        if (operationName == "add" || this.accounts[accountId].CountryCode != idPaese) {
            row.fields["CountryCode"] = idPaese;
            if (operationName.length <= 0)
                operationName = "modify";
        }
    }
    if (partitaIva.length > 0) {
        if (operationName == "add" || this.accounts[accountId].VatNumber != partitaIva) {
            row.fields["VatNumber"] = partitaIva;
            if (operationName.length <= 0)
                operationName = "modify";
        }
    }
    if (codiceFiscale.length > 0) {
        if (operationName == "add" || this.accounts[accountId].FiscalNumber != codiceFiscale) {
            row.fields["FiscalNumber"] = codiceFiscale;
            if (operationName.length <= 0)
                operationName = "modify";
        }
    }
    if (divisa.length > 0 && this.accountingInfo.multiCurrency) {
        if (operationName == "add" || this.accounts[accountId].Currency != divisa) {
            row.fields["Currency"] = divisa;
            if (operationName.length <= 0)
                operationName = "modify";
        }
    }

    if (operationName.length <= 0)
        return accountId;

    if (operationName == "add") {
        var description = "";
        if (cognome.length > 0 || nome.length > 0)
            description = cognome + " " + nome;
        else if (denominazione.length > 0)
            description = denominazione;
        else if (codiceFiscale.length > 0)
            description = codiceFiscale;
        else if (partitaIva.length > 0)
            description = partitaIva;
        this.accounts[accountId].Description = description;
        row.fields["Description"] = description;
        if (isCustomer)
            row.fields["BClass"] = "1";
        else
            row.fields["BClass"] = "2";
        row.fields["Gr"] = this.accounts[accountId].Gr;
    }

    var sequence = this.accounts[accountId].sequence;
    if (sequence)
        sequence = sequence.toString();
    else
        sequence = "";

    row.fields["Account"] = accountId;
    row.operation = {};
    row.operation.name = operationName;
    row.operation.sequence = sequence;
    row.operation.srcFileName = srcFileName;

    var rowLists = jsonDoc.document.dataUnits["0"].data.rowLists[0];
    var index = parseInt(rowLists.rows.length);
    rowLists.rows[index.toString()] = row;

    this.accounts[accountId].FirstName = nome;
    this.accounts[accountId].FamilyName = cognome;
    this.accounts[accountId].OrganisationName = denominazione;
    this.accounts[accountId].Street = indirizzo;
    this.accounts[accountId].PostalCode = cap;
    this.accounts[accountId].Locality = comune;
    this.accounts[accountId].Region = provincia;
    this.accounts[accountId].CountryCode = idPaese;
    this.accounts[accountId].VatNumber = partitaIva;
    this.accounts[accountId].FiscalNumber = codiceFiscale;

    return accountId;
}

//Aggiunge le righe della fattura
EFatturaImport.prototype.createJsonDocument_AddTransactions = function (jsonDoc, xmlRoot, srcFileName, accountId) {

    if (!this.accounts[accountId])
        return 0;
    let isCustomer = this.accounts[accountId].isCustomer;
    var invoiceNode = xmlRoot.firstChildElement('FatturaElettronicaBody');
    var totTransactions = 0;
    while (invoiceNode) {
        var datiGeneraliDocumento = invoiceNode.firstChildElement('DatiGenerali').firstChildElement('DatiGeneraliDocumento');
        if (!datiGeneraliDocumento) {
            break;
        }
        var dataFattura = datiGeneraliDocumento.firstChildElement('Data').text;
        dataFattura = dataFattura.replace(new RegExp('-', 'g'), '');
        //dataFattura = Banana.Converter.toInternalDateFormat(dataFattura, "yyyy-mm-dd");

        var description = '';
        var causaleNode = datiGeneraliDocumento.firstChildElement('Causale');
        while (causaleNode) {
            if (description.length > 0)
                description += ' ';
            description += causaleNode.text;
            causaleNode = causaleNode.nextSiblingElement('Causale');
        }
        if (description.length <= 0)
            description = "fatt. " + this.accounts[accountId].Description;

        var divisa = datiGeneraliDocumento.firstChildElement('Divisa').text;
        var noFattura = datiGeneraliDocumento.firstChildElement('Numero').text;

        // controlla se la fattura è già stata importata
        var key = noFattura + "_" + dataFattura;
        if (this.docInvoices.indexOf(key) >= 0) {
            Banana.console.info("fattura già importata " + noFattura + " " + dataFattura);
            break;
        }

        var d = new Date();
        var dataOggi = d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2);

        var row = {};
        row.operation = {};
        row.operation.name = "add";
        row.operation.srcFileName = srcFileName;
        row.fields = {};
        row.fields["Date"] = dataOggi;
        row.fields["DateDocument"] = dataFattura;
        row.fields["Doc"] = noFattura;
        row.fields["DocInvoice"] = noFattura;
        row.fields["Description"] = description;
        var totalAmount = '';
        if (datiGeneraliDocumento.firstChildElement('ImportoTotaleDocumento'))
            totalAmount = datiGeneraliDocumento.firstChildElement('ImportoTotaleDocumento').text.trim();
        var signTotalAmount = Banana.SDecimal.sign(totalAmount);
        if (this.accountingInfo.isDoubleEntry) {
            if (signTotalAmount >= 0) {
                if (isCustomer)
                    row.fields["AccountDebit"] = accountId;
                else
                    row.fields["AccountCredit"] = accountId;
            }
            else {
                totalAmount = Banana.SDecimal.invert(totalAmount);
                if (isCustomer)
                    row.fields["AccountCredit"] = accountId;
                else
                    row.fields["AccountDebit"] = accountId;
            }
            if (this.accountingInfo.multiCurrency) {
                row.fields["AmountCurrency"] = totalAmount;
                row.fields["ExchangeCurrency"] = divisa;
            }
            else {
                row.fields["Amount"] = totalAmount;
            }
        }
        else {
            if (signTotalAmount >= 0) {
                row.fields["Account"] = accountId;
                row.fields["Expenses"] = totalAmount;
            }
            else {
                row.fields["Account"] = accountId;
                row.fields["Income"] = Banana.SDecimal.invert(totalAmount);
            }
        }
        var rowLists = jsonDoc.document.dataUnits["1"].data.rowLists[0];
        var index = parseInt(rowLists.rows.length);
        rowLists.rows[index.toString()] = row;

        var datiRiepilogoNode = invoiceNode.firstChildElement('DatiBeniServizi').firstChildElement('DatiRiepilogo');
        while (datiRiepilogoNode) {
            var row = {};
            row.operation = {};
            row.operation.name = "add";
            row.operation.sequence = "";
            row.operation.srcFileName = srcFileName;
            row.fields = {};
            row.fields["Date"] = dataOggi;
            row.fields["DateDocument"] = dataFattura;
            row.fields["Doc"] = noFattura;
            row.fields["DocInvoice"] = noFattura;
            row.fields["Description"] = description;
            /*
       <DatiRiepilogo>
            <AliquotaIVA>0.00</AliquotaIVA>
            <Natura>N2</Natura>
            <ImponibileImporto>3190.04</ImponibileImporto>
            <Imposta>0.00</Imposta>
            <EsigibilitaIVA>I</EsigibilitaIVA>
       </DatiRiepilogo>
           */
            var taxableAmount = datiRiepilogoNode.firstChildElement('ImponibileImporto').text.trim();
            var signTaxableAmount = Banana.SDecimal.sign(taxableAmount);
            if (this.accountingInfo.isDoubleEntry) {
                if (signTaxableAmount >= 0) {
                    if (isCustomer) {
                        row.fields["AccountCredit"] = "[CA]";
                    }
                    else {
                        row.fields["AccountDebit"] = "[CA]";
                    }
                }
                else {
                    if (isCustomer) {
                        row.fields["AccountDebit"] = "[CA]";
                    }
                    else {
                        row.fields["AccountCredit"] = "[CA]";
                    }
                    taxableAmount = Banana.SDecimal.invert(taxableAmount);
                }
                if (this.accountingInfo.multiCurrency) {
                    row.fields["ExchangeCurrency"] = divisa;
                    row.fields["AmountCurrency"] = taxableAmount;
                }
                else {
                    row.fields["Amount"] = taxableAmount;
                }
            }
            else {
                if (signTaxableAmount >= 0) {
                    row.fields["Account"] = "[CA]";
                    row.fields["Expenses"] = taxableAmount;
                }
                else {
                    row.fields["Account"] = "[CA]";
                    row.fields["Income"] = Banana.SDecimal.invert(taxableAmount);
                }
            }

            var vatRate = "";
            var codiceNatura = "";
            if (datiRiepilogoNode.firstChildElement('AliquotaIVA'))
                vatRate = datiRiepilogoNode.firstChildElement('AliquotaIVA').text;
            if (datiRiepilogoNode.firstChildElement('Natura'))
                codiceNatura = datiRiepilogoNode.firstChildElement('Natura').text;
            var vatCode = this.getVatCode(accountId, vatRate, codiceNatura);
            if (signTaxableAmount < 0)
                vatCode = "-" + vatCode;
            row.fields["VatCode"] = vatCode;
            // row.fields["VatAmountType"] = "";

            var rowLists = jsonDoc.document.dataUnits["1"].data.rowLists[0];
            var index = parseInt(rowLists.rows.length);
            rowLists.rows[index.toString()] = row;

            datiRiepilogoNode = datiRiepilogoNode.nextSiblingElement('DatiRiepilogo');
            totTransactions++;
        }
        invoiceNode = invoiceNode.nextSiblingElement('FatturaElettronicaBody');
    }
    return totTransactions;
}

EFatturaImport.prototype.createJsonDocument_Init = function () {
    var jsonDoc = {};
    jsonDoc.document = {};
    jsonDoc.fileVersion = "1.0.0";

    var dataUnitAccounts = {};
    jsonDoc.document.dataUnits = [];
    jsonDoc.document.dataUnits["0"] = dataUnitAccounts;
    dataUnitAccounts.data = {};
    dataUnitAccounts.data.rowLists = [];
    dataUnitAccounts.data.rowLists[0] = {};
    dataUnitAccounts.data.rowLists[0].rows = [];
    dataUnitAccounts.id = "Accounts";
    dataUnitAccounts.nameXml = "Accounts";
    dataUnitAccounts.nid = 100;

    var dataUnitTransactions = {};
    jsonDoc.document.dataUnits["1"] = dataUnitTransactions;
    dataUnitTransactions.data = {};
    dataUnitTransactions.data.rowLists = [];
    dataUnitTransactions.data.rowLists[0] = {};
    dataUnitTransactions.data.rowLists[0].rows = [];
    dataUnitTransactions.id = "Transactions";
    dataUnitTransactions.nameXml = "Transactions";
    dataUnitTransactions.nid = 103;

    /*var dataUnitVatCodes = {};
    jsonDoc.document.dataUnits["2"] = dataUnitVatCodes;
    dataUnitVatCodes.data = {};
    dataUnitVatCodes.data.rowLists = [];
    dataUnitVatCodes.data.rowLists[0] = {};
    dataUnitVatCodes.data.rowLists[0].rows = [];
    dataUnitVatCodes.id = "VatCodes";
    dataUnitVatCodes.nameXml = "VatCodes";
    dataUnitVatCodes.nid = 110;

    var dataUnitFileInfo = {};
    jsonDoc.document.dataUnits["3"] = dataUnitFileInfo;
    dataUnitFileInfo.data = {};
    dataUnitFileInfo.data.rowLists = [];
    dataUnitFileInfo.data.rowLists[0] = {};
    dataUnitFileInfo.data.rowLists[0].rows = [];
    dataUnitFileInfo.id = "FileInfo";
    dataUnitFileInfo.nameXml = "FileInfo";
    dataUnitFileInfo.nid = 1003;*/

    jsonDoc.creator = {};
    var d = new Date();
    var datestring = d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2);
    var timestring = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    jsonDoc.creator.executionDate = Banana.Converter.toInternalDateFormat(datestring, "yyyymmdd");
    jsonDoc.creator.executionTime = Banana.Converter.toInternalTimeFormat(timestring);
    jsonDoc.creator.name = Banana.script.getParamValue('id');
    jsonDoc.creator.version = "1.0";

    return jsonDoc;
}

/*cerca in this.accounts se esiste il cliente in base alla partita iva o codice fiscale)*/
EFatturaImport.prototype.getAccountId = function (xmlNode, isCustomer) {
    if (!xmlNode || !xmlNode.firstChildElement('DatiAnagrafici'))
        return "";

    var codiceFiscale = "", partitaIva = "", nazione = "";
    if (xmlNode.firstChildElement('DatiAnagrafici').firstChildElement('CodiceFiscale'))
        codiceFiscale = xmlNode.firstChildElement('DatiAnagrafici').firstChildElement('CodiceFiscale').text;
    if (xmlNode.firstChildElement('DatiAnagrafici').firstChildElement('IdFiscaleIVA') &&
        xmlNode.firstChildElement('DatiAnagrafici').firstChildElement('IdFiscaleIVA').firstChildElement('IdCodice'))
        partitaIva = xmlNode.firstChildElement('DatiAnagrafici').firstChildElement('IdFiscaleIVA').firstChildElement('IdCodice').text;
    if (xmlNode.firstChildElement('DatiAnagrafici').firstChildElement('IdFiscaleIVA') &&
        xmlNode.firstChildElement('DatiAnagrafici').firstChildElement('IdFiscaleIVA').firstChildElement('IdPaese'))
        nazione = xmlNode.firstChildElement('DatiAnagrafici').firstChildElement('IdFiscaleIVA').firstChildElement('IdPaese').text;

    for (var accountId in this.accounts) {
        //Se la fattura è emessa, cerca soltanto tra i clienti.
        //Rispettivamente se la fattura è ricevuta, cerca soltanto tra i fornitori.
        if (this.accounts[accountId].isCustomer !== isCustomer) {
            continue;
        }
        if (partitaIva.length > 0 && this.accounts[accountId].VatNumber === partitaIva) {
            return accountId;
        }
        if (codiceFiscale.length > 0 && this.accounts[accountId].FiscalNumber === codiceFiscale) {
            return accountId;
        }
    }

    //se non trova con partita iva e codice fiscale cerca con nome, cognome e paese
    /*var nome = "", cognome = "", denominazione = "", comune = "";
    if (xmlNode.firstChildElement('DatiAnagrafici').firstChildElement('Anagrafica').firstChildElement('Nome'))
        nome = xmlNode.firstChildElement('DatiAnagrafici').firstChildElement('Anagrafica').firstChildElement('Nome').text.trim().toLowerCase();
    if (xmlNode.firstChildElement('DatiAnagrafici').firstChildElement('Anagrafica').firstChildElement('Cognome'))
        cognome = xmlNode.firstChildElement('DatiAnagrafici').firstChildElement('Anagrafica').firstChildElement('Cognome').text.trim().toLowerCase();
    if (xmlNode.firstChildElement('DatiAnagrafici').firstChildElement('Anagrafica').firstChildElement('Denominazione'))
        denominazione = xmlNode.firstChildElement('DatiAnagrafici').firstChildElement('Anagrafica').firstChildElement('Denominazione').text.trim().toLowerCase();
    if (xmlNode.firstChildElement('Sede').firstChildElement('Comune'))
        comune = xmlNode.firstChildElement('Sede').firstChildElement('Comune').text.trim().toLowerCase();

    for (var accountId in this.accounts) {
        if (nome == this.accounts[accountId].FirstName.trim().toLowerCase() && cognome == this.accounts[accountId].FamilyName.trim().toLowerCase() &&
            denominazione == this.accounts[accountId].OrganisationName.trim().toLowerCase() && comune == this.accounts[accountId].Locality.trim().toLowerCase())
            return accountId;
    }*/

    return "";
}

EFatturaImport.prototype.getAccountIdNew = function (isCustomer) {

    var accountIdNew = "";
    var gr = "";
    var sequence = "";
    for (var accountId in this.accounts) {
        //se parametro isCustomer=true bisogna cercare solo nei conti clienti this.accounts[accountId].isCustomer
        if (parseInt(accountId) > accountIdNew && isCustomer && this.accounts[accountId].isCustomer) {
            accountIdNew = parseInt(accountId);
            gr = this.accounts[accountId].Gr;
            sequence = this.accounts[accountId].sequence;
        }
        else if (parseInt(accountId) > accountIdNew && !isCustomer && !this.accounts[accountId].isCustomer) {
            accountIdNew = parseInt(accountId);
            gr = this.accounts[accountId].Gr;
            sequence = this.accounts[accountId].sequence;
        }
    }

    if (parseInt(accountIdNew) > 0) {
        accountIdNew = parseInt(accountIdNew) + 1;

    }
    if (accountIdNew.length <= 0 && isCustomer) {
        accountIdNew = this.customerIdCounter;
        this.customerIdCounter = parseInt(this.customerIdCounter) + 1;
    }
    else if (accountIdNew.length <= 0 && !isCustomer) {
        accountIdNew = this.supplierIdCounter;
        this.supplierIdCounter = parseInt(this.supplierIdCounter + 1);
    }

    if (gr.length <= 0) {
        if (this.accountingInfo.customersGroup > 0 && isCustomer) {
            gr = this.accountingInfo.customersGroup;
        }
        else if (this.accountingInfo.suppliersGroup > 0 && !isCustomer) {
            gr = this.accountingInfo.suppliersGroup;
        }
        else {
            //crea il gruppo clienti/fornitori se non esiste
            /*var tableAccounts = this.banDocument.table('Accounts');
            if (tableAccounts)
                sequence = tableAccounts.rowCount;
            gr = "FOR";
            let description = "Totale fornitori";
            if (isCustomer) {
                description = "Totale clienti";
                gr = "CLI";
            }
            var jsonDoc = this.createJsonDocument_Init();
            var row = {};
            row.fields = {};
            row.fields["Group"] = gr;
            row.fields["Description"] = description;
            row.operation = {};
            row.operation.name = "add";
            row.operation.sequence = sequence;
            var rowLists = jsonDoc.document.dataUnits["0"].data.rowLists[0];
            var index = parseInt(rowLists.rows.length);
            rowLists.rows[index.toString()] = row;
            this.jsonDocArray.unshift(jsonDoc);

            //imposta i gruppi nei dati base della contabilita
            var jsonDoc = this.createJsonDocument_Init();
            row = {};
            row.fields = {};
            row.fields["SectionXml"] = "AccountingDataBase";
            row.fields["IdXml"] = "SuppliersGroup";
            if (isCustomer)
                row.fields["IdXml"] = "CustomersGroup";
            row.fields["ValueXml"] = gr;
            row.operation = {};
            row.operation.name = "modify";
            var rowLists = jsonDoc.document.dataUnits["3"].data.rowLists[0];
            var index = parseInt(rowLists.rows.length);
            rowLists.rows[index.toString()] = row;
            this.jsonDocArray.unshift(jsonDoc);*/
        }
    }

    accountIdNew = accountIdNew.toString();
    this.accounts[accountIdNew] = {};
    this.accounts[accountIdNew].Gr = gr;
    this.accounts[accountIdNew].sequence = sequence + ".1";
    this.accounts[accountIdNew].isCustomer = isCustomer;
    this.accounts[accountIdNew].isSupplier = !isCustomer;
    return accountIdNew;
}

EFatturaImport.prototype.getVatCode = function (accountId, vatRate, codiceNatura) {

    //crea un codice IVA fittizio che può essere aggiornato tramite rules.json
    //il codice IVA è composto dall'aliquota e dal codice natura, ad esempio [A0_N2] per acquisti 0% codice natura N2
    //è incluso tra parentesi quadre, in modo che non dia errore nel caso non venga sostituito da rules.json
    let isCustomer = this.accounts[accountId].isCustomer;
    let vatCode = Banana.SDecimal.round(vatRate, { 'decimals': 2 });
    if (codiceNatura.length > 0) {
        vatCode += "_" + codiceNatura;
    }
    //V=IVA sulle vendite, A=IVA sugli acquisti
    if (isCustomer)
        vatCode = "[V" + vatCode + "]";
    else
        vatCode = "[A" + vatCode + "]";
    return vatCode;
}

EFatturaImport.prototype.initParam = function (param) {
    var settings = new Settings(Banana.document);
    this.param = settings.initParam();
}

/*
 * Ritorna true se si tratta di una fattura emessa (cliente)
 * (cod.fiscale del cedente/prestatore corrisponde al cod.fiscale dei dati base della contabilità)
 * Ritorna false se si tratta di una fattura ricevuta (fornitore)
 * (cod.fiscale del cessionario/committente corrisponde al cod.fiscale dei dati base della contabilità)
*/
EFatturaImport.prototype.isCustomer = function (invoiceNode) {
    if (!this.accountingInfo)
        return false;

    let vatNumberAccounting = this.accountingInfo.vatNumber;
    if (!vatNumberAccounting)
        return false;

    var accountNode = invoiceNode.firstChildElement('CedentePrestatore');
    if (!accountNode || !accountNode.firstChildElement('DatiAnagrafici'))
        return false;

    if (accountNode.firstChildElement('DatiAnagrafici').firstChildElement('IdFiscaleIVA').firstChildElement('IdCodice')) {
        let vatNumber = accountNode.firstChildElement('DatiAnagrafici').firstChildElement('IdFiscaleIVA').firstChildElement('IdCodice').text;
    if (vatNumberAccounting === vatNumber) {
            return true;
        }
    }
    return false;
}

EFatturaImport.prototype.load = function () {
    var settings = new Settings(this.banDocument);
    this.accountingInfo = settings.loadAccountingInfo();
    this.loadAccounts();
    this.loadExistingInvoices();
    /*Banana.console.log("---------------- accounts ---------------- ");
    Banana.console.log(JSON.stringify(this.accounts));*/
}

/*
 * Ritorna i conti clienti/fornitori con gli indirizzi
*/
EFatturaImport.prototype.loadAccounts = function () {
    if (!this.banDocument)
        return;

    var tableAccounts = this.banDocument.table('Accounts');
    if (!tableAccounts)
        return;

    this.accounts = {};
    for (i = 0; i < tableAccounts.rowCount; i++) {
        var tRow = tableAccounts.row(i);
        var accountId = tRow.value('Account');
        if (!accountId)
            continue;
        // var groupId = tRow.value('Group');
        var grId = tRow.value('Gr');
        var vatNumber = tRow.value('VatNumber');
        var fiscalNumber = tRow.value('FiscalNumber');
        //commentato perché il metodo accountIsSupplier() rallenta troppo lo script
        //inoltre l'elenco dei fornitori non è aggiornato perché il giornale non viene ricalcolato tra l'esecuzione di più scripts
        /*var grSupplier = this.banDocument.accountIsSupplier(accountId);
        if (grSupplier.length <= 0)
            continue;*/

        var addAsSupplier = false;
        var addAsCustomer = false;
        if (this.accountingInfo.suppliersGroup.length > 0 && grId == this.accountingInfo.suppliersGroup)
            addAsSupplier = true;
        if (this.accountingInfo.customersGroup.length > 0 && grId == this.accountingInfo.customersGroup)
            addAsCustomer = true;
        if (!addAsSupplier && !addAsCustomer)
            continue;

        var jsonString = tRow.toJSON();
        var jsonObj = JSON.parse(jsonString);
        jsonObj.sequence = i;
        jsonObj.isCustomer = addAsCustomer;
        jsonObj.isSupplier = addAsSupplier;
        this.accounts[accountId] = jsonObj;
    }
}

/*
 * Ritorna i numeri fattura salvati nella tabella registrazione, per evitare di importare in doppio le fatture
*/
EFatturaImport.prototype.loadExistingInvoices = function () {
    if (!this.banDocument)
        return;

    var tableTransactions = this.banDocument.table('Transactions');
    if (!tableTransactions)
        return;

    this.docInvoices = [];
    for (i = 0; i < tableTransactions.rowCount; i++) {
        var tRow = tableTransactions.row(i);
        var docInvoice = tRow.value('DocInvoice');
        var date = tRow.value('DateDocument');
        if (!docInvoice || !date)
            continue;
        date = date.replace(new RegExp('-', 'g'), '');
        var key = docInvoice + "_" + date;
        if (this.docInvoices.indexOf(key) <= 0)
            this.docInvoices.push(key);
    }
}

EFatturaImport.prototype.setParam = function (param) {
    var settings = new Settings(Banana.document);

    this.param = settings.initParam();
    if (param && typeof (param) === 'object') {
        this.param = param;
    } else if (param && typeof (param) === 'string') {
        this.param = JSON.parse(param);
    }
    this.param = settings.verifyParam(this.param);
}