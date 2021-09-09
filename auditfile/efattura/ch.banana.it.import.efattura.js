// Copyright [2021] [Banana.ch SA - Lugano Switzerland]
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
// @pubdate = 2021-09-08
// @publisher = Banana.ch SA
// @description = Importa e-fatture (*.xml)...
// @task = import.file
// @doctype = *
// @docproperties =
// @inputdatasource = opendirdialog
// @inputfilefilter = *.xml
// @timeout = -1
// @includejs = ch.banana.it.import.efattura.rules.js

//Main function
function exec(inData) {

    if (!Banana.document || inData.length <= 0)
        return "@Cancel";

    Banana.application.clearMessages();
    var eFatturaImport = new EFatturaImport(Banana.document);
    if (!eFatturaImport.verifyBananaVersion())
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
    if (savedParam.length > 0) {
        eFatturaImport.setParam(JSON.parse(savedParam));
    }

    var jsonData = eFatturaImport.createJsonDocument(xmlData);
    if (eFatturaImport.param.applyRules)
        jsonData = eFatturaImport.applyRules(jsonData);

    var documentChange = { "format": "documentChange", "error": "" };
    documentChange["data"] = jsonData;

    //TO DEBUG SHOW THE INTERMEDIARY TEXT
    //Banana.Ui.showText(JSON.stringify(documentChange, null, 3));

    //si può ritornare l'oggetto json oppure la stringa
    //return JSON.stringify(documentChange, null, 3);
    return documentChange;
}

/*Update script's parameters*/
function settingsDialog() {

    var eFatturaImport = new EFatturaImport(Banana.document);
    if (!eFatturaImport.verifyBananaVersion())
        return false;

    if (typeof (Banana.Ui.openPropertyEditor) === 'undefined')
        return false;

    var savedParam = Banana.document.getScriptSettings("import_efattura");
    if (savedParam.length > 0) {
        eFatturaImport.setParam(JSON.parse(savedParam));
    }
    eFatturaImport.verifyParam();

    var dialogTitle = 'Settings';
    var convertedParam = eFatturaImport.convertParam(eFatturaImport.param);
    var pageAnchor = 'ch.banana.it.import.efattura';
    if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor))
        return false;
    for (var i = 0; i < convertedParam.data.length; i++) {
        // Read values to param (through the readValue function)
        convertedParam.data[i].readValue();
    }

    var paramToString = JSON.stringify(eFatturaImport.param);
    var value = Banana.document.setScriptSettings("import_efattura", paramToString);
    return true;
}

/*Function called from converter*/
function setup() {
}

function EFatturaImport(banDocument) {
    this.banDocument = banDocument;
    if (this.banDocument === undefined)
        this.banDocument = Banana.document;

    this.ID_ERR_LICENSE_NOTVALID = "ID_ERR_LICENSE_NOTVALID";
    this.ID_ERR_VERSION_NOTSUPPORTED = "ID_ERR_VERSION_NOTSUPPORTED";

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

EFatturaImport.prototype.applyRules = function (jsonData) {
    var importRules = new ImportRules(this.banDocument);
    let documentName = this.param.filenameRules;
    if (importRules.loadDocument(documentName))
        return importRules.apply(jsonData);
    return jsonData;
}

EFatturaImport.prototype.convertParam = function (param) {

    var convertedParam = {};
    convertedParam.version = '1.0';
    /*array dei parametri dello script*/
    convertedParam.data = [];

    var currentParam = {};
    currentParam.name = 'applyRules';
    currentParam.title = 'Applica regole';
    currentParam.type = 'bool';
    currentParam.value = param.applyRules ? param.applyRules : '';
    currentParam.readValue = function () {
        param.applyRules = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'filenameRules';
    currentParam.title = 'Documento con le regole';
    currentParam.type = 'string';
    currentParam.value = param.filenameRules ? param.filenameRules : '';
    currentParam.readValue = function () {
        param.filenameRules = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'checkDuplicated';
    currentParam.title = 'Controlla fatture già importate';
    currentParam.type = 'bool';
    currentParam.value = param.checkDuplicated ? param.checkDuplicated : '';
    currentParam.readValue = function () {
        param.checkDuplicated = this.value;
    }
    convertedParam.data.push(currentParam);

    return convertedParam;
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
        this.createJsonDocument_AddTransactions(jsonDoc, xmlRoot, srcFileName, accountId);

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
        accountNode = invoiceNode.firstChildElement('CedentePrestatore');
    else
        accountNode = invoiceNode.firstChildElement('CessionarioCommittente');

    if (!accountNode
        || !accountNode.firstChildElement('Sede')
        || !accountNode.firstChildElement('DatiAnagrafici')
        || !accountNode.firstChildElement('DatiAnagrafici').firstChildElement('Anagrafica'))
        return "";

    //cerca il cliente/fornitore in this.accounts
    //se non lo trova ne aggiunge uno nuovo
    let operationName = "";
    var accountId = this.getAccountId(accountNode);
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
    var datiGeneraliDocNode = xmlRoot.firstChildElement('FatturaElettronicaBody').firstChildElement('DatiGenerali').firstChildElement('DatiGeneraliDocumento');
    if (datiGeneraliDocNode) {
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
        return;
    let isCustomer = this.accounts[accountId].isCustomer;
    var invoiceNode = xmlRoot.firstChildElement('FatturaElettronicaBody');
    var i = 0;
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
        if (this.param.checkDuplicated) {
            var key = noFattura + "_" + dataFattura;
            if (this.docInvoices.indexOf(key) >= 0) {
                Banana.console.info("fattura già importata " + noFattura + " " + dataFattura);
                break;
            }
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
                    if (isCustomer)
                        row.fields["AccountCredit"] = "[CTRPCLIENTE]";
                    else
                        row.fields["AccountDebit"] = "[CTRPFORNITORE]";
                }
                else {
                    if (isCustomer)
                        row.fields["AccountDebit"] = "[CTRPLIENTE]";
                    else
                        row.fields["AccountCredit"] = "[CTRPFORNITORE]";
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
                    row.fields["Account"] = "[CTRACCOUNT]";
                    row.fields["Expenses"] = taxableAmount;
                }
                else {
                    row.fields["Account"] = "[CTRACCOUNT]";
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
            i++;
        }
        invoiceNode = invoiceNode.nextSiblingElement('FatturaElettronicaBody');
    }
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

    var dataUnitVatCodes = {};
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
    dataUnitFileInfo.nid = 1003;

    jsonDoc.creator = {};
    var d = new Date();
    var datestring = d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2);
    var timestring = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    jsonDoc.creator.executionDate = Banana.Converter.toInternalDateFormat(datestring, "yyyymmdd");
    jsonDoc.creator.executionTime = Banana.Converter.toInternalTimeFormat(timestring, "hh:mm");
    jsonDoc.creator.name = Banana.script.getParamValue('id');
    jsonDoc.creator.version = "1.0";

    return jsonDoc;
}

/*cerca in this.accounts se esiste il cliente in base alla partita iva o codice fiscale)*/
EFatturaImport.prototype.getAccountId = function (xmlNode) {
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
        if (parseInt(accountId) > accountIdNew && this.accounts[accountId].isCustomer) {
            accountIdNew = parseInt(accountId);
            gr = this.accounts[accountId].Gr;
            sequence = this.accounts[accountId].sequence;
        }
        else if (parseInt(accountId) > accountIdNew && !this.accounts[accountId].isCustomer) {
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

EFatturaImport.prototype.getErrorMessage = function (errorId) {
    //Document language
    var lang = 'en';
    if (this.banDocument)
        lang = this.banDocument.locale;
    if (lang.length > 2)
        lang = lang.substr(0, 2);
    var rtnMsg = '';
    if (errorId == this.ID_ERR_LICENSE_NOTVALID) {
        if (lang == 'it')
            rtnMsg = "Questa estensione richiede Banana Contabilità+ Advanced";
        else
            rtnMsg = "This extension requires Banana Accounting+ Advanced";
    }
    else if (errorId == this.ID_ERR_VERSION_NOTSUPPORTED) {
        if (lang == 'it')
            rtnMsg = "Lo script non funziona con la vostra attuale versione di Banana Contabilità.\nVersione minimina richiesta: %1.\nPer aggiornare o per maggiori informazioni cliccare su Aiuto";
        else
            rtnMsg = "This script does not run with your current version of Banana Accounting.\nMinimum version required: %1.\nTo update or for more information click on Help";
    }
    return rtnMsg + " [" + errorId + "] ";
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

EFatturaImport.prototype.initParam = function () {
    this.param = {};
    this.param.version = "1.0";
    this.param.applyRules = true;
    this.param.filenameRules = 'rules.json';
    // controlla se i numeri fattura sono già stati importati
    this.param.checkDuplicated = true;
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

    let fiscalNumberAccounting = this.accountingInfo.fiscalNumber;
    if (!fiscalNumberAccounting)
        return false;

    var accountNode = invoiceNode.firstChildElement('CedentePrestatore');
    if (!accountNode || !accountNode.firstChildElement('DatiAnagrafici'))
        return false;

    if (accountNode.firstChildElement('DatiAnagrafici').firstChildElement('CodiceFiscale')) {
        let fiscalNumber = accountNode.firstChildElement('DatiAnagrafici').firstChildElement('CodiceFiscale').text;
        if (fiscalNumberAccounting === fiscalNumber)
            return true;
    }
    return false;
}

EFatturaImport.prototype.load = function () {
    this.loadAccountingInfo();
    this.loadAccounts();
    this.loadExistingInvoices();
    /*Banana.console.log("---------------- accounts ---------------- ");
    Banana.console.log(JSON.stringify(this.accounts));*/

}

EFatturaImport.prototype.loadAccountingInfo = function () {
    this.accountingInfo = {};
    this.accountingInfo.isDoubleEntry = false;
    this.accountingInfo.isIncomeExpenses = false;
    this.accountingInfo.isCashBook = false;
    this.accountingInfo.multiCurrency = false;
    this.accountingInfo.withVat = false;
    this.accountingInfo.vatAccount = "";
    this.accountingInfo.customersGroup = "";
    this.accountingInfo.suppliersGroup = "";
    this.accountingInfo.vatNumber = "";
    this.accountingInfo.fiscalNumber = "";

    if (this.banDocument) {
        var fileGroup = this.banDocument.info("Base", "FileTypeGroup");
        var fileNumber = this.banDocument.info("Base", "FileTypeNumber");
        var fileVersion = this.banDocument.info("Base", "FileTypeVersion");

        if (fileGroup == "100")
            this.accountingInfo.isDoubleEntry = true;
        else if (fileGroup == "110")
            this.accountingInfo.isIncomeExpenses = true;
        else if (fileGroup == "130")
            this.accountingInfo.isCashBook = true;

        if (fileNumber == "110") {
            this.accountingInfo.withVat = true;
        }
        if (fileNumber == "120") {
            this.accountingInfo.multiCurrency = true;
        }
        if (fileNumber == "130") {
            this.accountingInfo.multiCurrency = true;
            this.accountingInfo.withVat = true;
        }

        if (this.banDocument.info("AccountingDataBase", "VatAccount"))
            this.accountingInfo.vatAccount = this.banDocument.info("AccountingDataBase", "VatAccount");

        if (this.banDocument.info("AccountingDataBase", "CustomersGroup"))
            this.accountingInfo.customersGroup = this.banDocument.info("AccountingDataBase", "CustomersGroup");
        if (this.banDocument.info("AccountingDataBase", "SuppliersGroup"))
            this.accountingInfo.suppliersGroup = this.banDocument.info("AccountingDataBase", "SuppliersGroup");

        if (this.banDocument.info("AccountingDataBase", "VatNumber"))
            this.accountingInfo.vatNumber = this.banDocument.info("AccountingDataBase", "VatNumber");
        if (this.banDocument.info("AccountingDataBase", "FiscalNumber"))
            this.accountingInfo.fiscalNumber = this.banDocument.info("AccountingDataBase", "FiscalNumber");

    }
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

/*EFatturaImport.prototype.loadVatCodes = function () {
    //imposta dei codici IVA predefiniti
    //se non esistono li aggiunge nella tabella codici IVA
    let default_vatrates = '0%=AUTO_0;4%=AUTO_4;5%=AUTO_5;10%=AUTO_10;22%=AUTO_22;';
    default_vatrates = default_vatrates.split(";");

    this.vatRates = {};
    for (var i in default_vatrates) {
        var string = default_vatrates[i];
        if (string.length <= 0 || string.indexOf("=") <= 0)
            continue;
        var splittedString = string.split("=");
        if (splittedString.length == 2) {
            var vatrate = splittedString[0].replace("%", "").trim();
            vatrate = vatrate.replace(",", ".");
            if (vatrate.length > 0 && vatrate.substring(0, 1).toLowerCase() !== "n") {
                //vatrate = Banana.Converter.toLocaleNumberFormat(vatrate);
                vatrate = Banana.SDecimal.round(vatrate, { 'decimals': 2 });
            }
            if (vatrate.length > 0) {
                var vatcode = splittedString[1];
                this.vatRates[vatrate] = vatcode;
            }
        }
    }

    //aggiunge le aliquota allo 0% con codice natura impostato nella colonna Gr1
    var tableVatCodes = this.banDocument.table('VatCodes');
    if (!tableVatCodes)
        return;
    for (i = 0; i < tableVatCodes.rowCount; i++) {
        var tRow = tableVatCodes.row(i);
        var vatcode = tRow.value('VatCode');
        var vatrate = tRow.value('VatRate');
        var isdue = tRow.value('IsDue');
        var gr1 = tRow.value('Gr1');
        if (vatcode.length <= 0 || gr1.length <= 0)
            continue;
        if (gr1.substring(0, 1).toLowerCase() !== "n")
            continue;
        if (Banana.SDecimal.isZero(vatrate) && Banana.SDecimal.isZero(isdue)) {
            if (!this.vatRates.hasOwnProperty(gr1.toLowerCase())) {
                this.vatRates[gr1.toLowerCase()] = vatcode;
            }
        }
    }

    var jsonDoc = this.createJsonDocument_Init();
    var changedJsonDoc = false;
    if (this.accountingInfo.vatAccount.length <= 0) {
        var tableAccounts = this.banDocument.table('Accounts');
        if (!tableAccounts)
            return;
        var sequence = tableAccounts.rowCount;
        var i = 0;
        var accountId = "VatAccount";
        this.accountingInfo.vatAccount = accountId;
        var row = {};
        row.fields = {};
        row.fields["Account"] = this.accountingInfo.vatAccount;
        row.fields["Description"] = this.accountingInfo.vatAccount;
        row.fields["BClass"] = "2";
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = sequence;
        var rowLists = jsonDoc.document.dataUnits["0"].data.rowLists[0];
        var index = parseInt(rowLists.rows.length);
        rowLists.rows[index.toString()] = row;
        if (!changedJsonDoc)
            changedJsonDoc = true;
    }

    var jsonDoc2 = this.createJsonDocument_Init();
    var changedJsonDoc2 = false;
    for (var key in this.vatRates) {
        var vatCode = this.vatRates[key];
        if (vatCode.substring(0, 1).toLowerCase() === "n")
            continue;
        var rowVatCode = tableVatCodes.findRowByValue('VatCode', vatCode);
        if (!rowVatCode) {
            var row = {};
            row.fields = {};
            row.fields["VatCode"] = vatCode;
            row.fields["VatRate"] = key;
            row.fields["AmountType"] = "1"; //amount without vat/sales tax
            row.fields["VatAccount"] = this.accountingInfo.vatAccount;
            row.fields["Description"] = vatCode + " " + key;
            row.operation = {};
            row.operation.name = "add";
            var rowLists = jsonDoc2.document.dataUnits["2"].data.rowLists[0];
            var index = parseInt(rowLists.rows.length);
            rowLists.rows[index.toString()] = row;
            if (!changedJsonDoc2)
                changedJsonDoc2 = true;
        }
    }
    if (changedJsonDoc2)
        this.jsonDocArray.unshift(jsonDoc2);

    if (changedJsonDoc)
        this.jsonDocArray.unshift(jsonDoc);
}*/

EFatturaImport.prototype.setParam = function (param) {
    if (param && typeof (param) === 'object') {
        this.param = param;
    } else if (param && typeof (param) === 'string') {
        this.param = JSON.parse(param);
    }
    this.verifyParam();
}

EFatturaImport.prototype.verifyBananaVersion = function () {
    if (!this.banDocument)
        return false;

    //Banana+ is required
    var requiredVersion = "10.0.10";
    if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) < 0) {
        var msg = this.getErrorMessage(this.ID_ERR_VERSION_NOTSUPPORTED);
        msg = msg.replace("%1", requiredVersion);
        this.banDocument.addMessage(msg, this.ID_ERR_VERSION_NOTSUPPORTED);
        return false;
    }

    if (!Banana.application.license || Banana.application.license.licenseType !== "advanced") {
        var msg = this.getErrorMessage(this.ID_ERR_LICENSE_NOTVALID);
        this.banDocument.addMessage(msg, this.ID_ERR_LICENSE_NOTVALID);
        return false;
    }

    return true;
}

EFatturaImport.prototype.verifyParam = function () {
    if (!this.param)
        this.param = {};

    if (!this.param.version || this.param.version != "1.0") {
        this.initParam();
        return;
    }

    if (!this.param.applyRules)
        this.param.applyRules = false;

    if (!this.param.filenameRules)
        this.param.filenameRules = '';

    if (!this.param.checkDuplicated)
        this.param.checkDuplicated = false;

}

