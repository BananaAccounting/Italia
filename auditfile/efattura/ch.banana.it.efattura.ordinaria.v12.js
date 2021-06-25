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
// @id = ch.banana.it.auditfile.efattura.ordinaria.v12
// @api = 1.0
// @pubdate = 2021-06-22
// @publisher = Banana.ch SA
// @description = Importa e-fatture ordinarie v1.2 (*.xml)...
// @task = import.file
// @doctype = *
// @docproperties =
// @inputdatasource = opendirdialog
// @inputfilefilter = *.xml
// @timeout = -1

//Main function
function exec(inData) {

    if (!Banana.document || inData.length <= 0)
        return "@Cancel";

    var eFatturaImport = new EFatturaImport(Banana.document);
    if (!eFatturaImport.verifyBananaVersion())
        return "@Cancel";

    var jsonData = {};
    try {
        jsonData = JSON.parse(inData);
    }
    catch (e) {
        jsonData[0] = inData;
    }

    if (!jsonData)
        return "@Cancel";

    var savedParam = Banana.document.getScriptSettings("audit_efatturaordinaria_v12");
    if (savedParam.length > 0) {
        eFatturaImport.setParam(JSON.parse(savedParam));
    }
	eFatturaImport.loadData();
    eFatturaImport.createJsonDocument(jsonData);

	var documentChange = {"format":"documentChange", "error":""};
    documentChange["data"] = eFatturaImport.jsonDocArray;

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

    var savedParam = Banana.document.getScriptSettings("audit_efatturaordinaria_v12");
    if (savedParam.length > 0) {
        eFatturaImport.setParam(JSON.parse(savedParam));
    }

    var dialogTitle = 'Settings';
    var convertedParam = eFatturaImport.convertParam(eFatturaImport.param);
    var pageAnchor = 'dlgSettings';
    if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor))
        return false;
    for (var i = 0; i < convertedParam.data.length; i++) {
        // Read values to param (through the readValue function)
        convertedParam.data[i].readValue();
    }

    var paramToString = JSON.stringify(eFatturaImport.param);
    var value = Banana.document.setScriptSettings("audit_efatturaordinaria_v12", paramToString);
    return true;
}

/*Function called from converter*/
function setup() {
}

function EFatturaImport(banDocument) {
    this.banDocument = banDocument;
    if (this.banDocument === undefined)
        this.banDocument = Banana.document;
    this.initParam();

	//array dei patches
	this.jsonDocArray = [];
	
    this.ID_ERR_LICENSE_NOTVALID = "ID_ERR_LICENSE_NOTVALID";
    this.ID_ERR_VERSION_NOTSUPPORTED = "ID_ERR_VERSION_NOTSUPPORTED";
}

/*Il metodo createJsonDocument() riprende i dati dal file xml della fattura elettronica
  e li trasforma in formato json per essere importati nella tabella Registrazioni
*/

EFatturaImport.prototype.convertParam = function (param) {

    var convertedParam = {};
    convertedParam.version = '1.0';
    /*array dei parametri dello script*/
    convertedParam.data = [];

    var currentParam = {};
    currentParam.name = 'default_vatrates';
    currentParam.title = 'Default VAT Rates';
    currentParam.type = 'string';
    currentParam.tooltip = 'Format: VatRate=VatCode Example: 10%=AUTO_10;22%=AUTO_22;';
    currentParam.value = param['default_vatrates'] ? param['default_vatrates'] : '';
    currentParam.readValue = function () {
        param['default_vatrates'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'show_dialog_commit';
    currentParam.title = 'show commit dialog';
    currentParam.type = 'bool';
    currentParam.value = param.show_dialog_commit ? true : false;
    currentParam.readValue = function () {
        param.show_dialog_commit = this.value;
    }
    convertedParam.data.push(currentParam);

    return convertedParam;
}

EFatturaImport.prototype.createJsonDocument = function (inData) {

    var jsonDoc = this.createJsonDocument_Init();

    for (var srcFileName in inData) {
        //seleziona singolo file xml
        var xmlFile = Banana.Xml.parse(inData[srcFileName]);
        if (!xmlFile)
            continue;
        var xmlRoot = xmlFile.firstChildElement();
        if (!xmlRoot)
            continue;

        //aggiunge/aggiorna i clienti nella tabella conti
        var accountId = this.createJsonDocument_AddAccount(jsonDoc, xmlRoot, srcFileName);
        if (accountId.length <= 0)
            continue;

        //aggiunge le fatture nel documento json
        this.createJsonDocument_AddTransactions(jsonDoc, xmlRoot, srcFileName, accountId);

        //Banana.console.debug(JSON.stringify(jsonDoc, null, 3));
    }

	this.jsonDocArray.push(jsonDoc);

}


EFatturaImport.prototype.createJsonDocument_AddAccount = function (jsonDoc, xmlRoot, srcFileName) {

	if (!this.suppliers)
		return "";
    var invoiceNode = xmlRoot.firstChildElement('FatturaElettronicaHeader');
    if (!invoiceNode)
        return "";
    var supplierNode = invoiceNode.firstChildElement('CedentePrestatore');
    if (!supplierNode
       || !supplierNode.firstChildElement('Sede')
       || !supplierNode.firstChildElement('DatiAnagrafici')
       || !supplierNode.firstChildElement('DatiAnagrafici').firstChildElement('Anagrafica'))
        return "";

    /*cerca il cliente nella tabConti e ritorna il numero conto del cliente, se non lo trova lo aggiunge con il comando add*/
    var operationName = "";
    var accountId = this.getAccountId(supplierNode);
    if (accountId.length <= 0) {
        operationName = "add";
	}
	
    var nome = "", cognome = "", denominazione = "", indirizzo = "", numerocivico = "", cap = "", comune = "", provincia = "", nazione = "";
    var idPaese = "", partitaIva = "", codiceFiscale = "";
    if (supplierNode.firstChildElement('DatiAnagrafici').firstChildElement('Anagrafica').firstChildElement('Nome'))
        nome = supplierNode.firstChildElement('DatiAnagrafici').firstChildElement('Anagrafica').firstChildElement('Nome').text;
    if (supplierNode.firstChildElement('DatiAnagrafici').firstChildElement('Anagrafica').firstChildElement('Cognome'))
        cognome = supplierNode.firstChildElement('DatiAnagrafici').firstChildElement('Anagrafica').firstChildElement('Cognome').text;
    if (supplierNode.firstChildElement('DatiAnagrafici').firstChildElement('Anagrafica').firstChildElement('Denominazione'))
        denominazione = supplierNode.firstChildElement('DatiAnagrafici').firstChildElement('Anagrafica').firstChildElement('Denominazione').text;
    if (supplierNode.firstChildElement('Sede').firstChildElement('Indirizzo'))
        indirizzo = supplierNode.firstChildElement('Sede').firstChildElement('Indirizzo').text;
    if (supplierNode.firstChildElement('Sede').firstChildElement('NumeroCivico'))
        numerocivico = supplierNode.firstChildElement('Sede').firstChildElement('NumeroCivico').text;
    if (supplierNode.firstChildElement('Sede').firstChildElement('CAP'))
        cap = supplierNode.firstChildElement('Sede').firstChildElement('CAP').text;
    if (supplierNode.firstChildElement('Sede').firstChildElement('Comune'))
        comune = supplierNode.firstChildElement('Sede').firstChildElement('Comune').text;
    if (supplierNode.firstChildElement('Sede').firstChildElement('Provincia'))
        provincia = supplierNode.firstChildElement('Sede').firstChildElement('Provincia').text;
    if (supplierNode.firstChildElement('Sede').firstChildElement('Nazione'))
        nazione = supplierNode.firstChildElement('Sede').firstChildElement('Nazione').text;
    if (supplierNode.firstChildElement('DatiAnagrafici').firstChildElement('IdFiscaleIVA') &&
       supplierNode.firstChildElement('DatiAnagrafici').firstChildElement('IdFiscaleIVA').firstChildElement('IdPaese'))
        idPaese = supplierNode.firstChildElement('DatiAnagrafici').firstChildElement('IdFiscaleIVA').firstChildElement('IdPaese').text;
    if (supplierNode.firstChildElement('DatiAnagrafici').firstChildElement('IdFiscaleIVA') &&
       supplierNode.firstChildElement('DatiAnagrafici').firstChildElement('IdFiscaleIVA').firstChildElement('IdCodice'))
        partitaIva = supplierNode.firstChildElement('DatiAnagrafici').firstChildElement('IdFiscaleIVA').firstChildElement('IdCodice').text;
    if (supplierNode.firstChildElement('DatiAnagrafici').firstChildElement('CodiceFiscale'))
        codiceFiscale = supplierNode.firstChildElement('DatiAnagrafici').firstChildElement('CodiceFiscale').text;

    var divisa = "";
    var datiGeneraliDocNode = xmlRoot.firstChildElement('FatturaElettronicaBody').firstChildElement('DatiGenerali').firstChildElement('DatiGeneraliDocumento');
    if (datiGeneraliDocNode) {
        divisa = datiGeneraliDocNode.firstChildElement('Divisa').text;
    }
            
    var row = {};
    row.fields = {};
    if (nome.length > 0) {
        if (operationName == "add" || this.suppliers[accountId].FirstName != nome) {
            row.fields["FirstName"] = nome;
            if (operationName.length <= 0)
                operationName = "modify";
        }
    }
    if (cognome.length > 0) {
        if (operationName == "add" || this.suppliers[accountId].FamilyName != cognome) {
            row.fields["FamilyName"] = cognome;
            if (operationName.length <= 0)
                operationName = "modify";
        }
    }
    if (denominazione.length > 0) {
        if (operationName == "add" || this.suppliers[accountId].OrganisationName != denominazione) {
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
        if (operationName == "add" || this.suppliers[accountId].Street != indirizzo) {
            row.fields["Street"] = indirizzo;
            if (operationName.length <= 0)
                operationName = "modify";
        }
    }
    if (cap.length > 0) {
        if (operationName == "add" || this.suppliers[accountId].PostalCode != cap) {
            row.fields["PostalCode"] = cap;
            if (operationName.length <= 0)
                operationName = "modify";
        }
    }
    if (comune.length > 0) {
        if (operationName == "add" || this.suppliers[accountId].Locality != comune) {
            row.fields["Locality"] = comune;
            if (operationName.length <= 0)
                operationName = "modify";
        }
    }
    if (provincia.length > 0) {
        if (operationName == "add" || this.suppliers[accountId].Region != provincia) {
            row.fields["Region"] = provincia;
            if (operationName.length <= 0)
                operationName = "modify";
        }
    }
    if (idPaese.length > 0) {
        if (operationName == "add" || this.suppliers[accountId].CountryCode != idPaese) {
            row.fields["CountryCode"] = idPaese;
            if (operationName.length <= 0)
                operationName = "modify";
        }
    }
    if (partitaIva.length > 0) {
        if (operationName == "add" || this.suppliers[accountId].VatNumber != partitaIva) {
            row.fields["VatNumber"] = partitaIva;
            if (operationName.length <= 0)
                operationName = "modify";
        }
    }
    if (codiceFiscale.length > 0) {
        if (operationName == "add" || this.suppliers[accountId].FiscalNumber != codiceFiscale) {
            row.fields["FiscalNumber"] = codiceFiscale;
            if (operationName.length <= 0)
                operationName = "modify";
        }
    }
    if (divisa.length > 0) {
        if (operationName == "add" || this.suppliers[accountId].Currency != divisa) {
            row.fields["Currency"] = divisa;
            if (operationName.length <= 0)
                operationName = "modify";
        }
    }

    if (operationName.length <= 0)
        return accountId;

    if (operationName == "add") {
        accountId = this.getNewAccountId();
		if (accountId.length<=0)
			return accountId;
        var description = "";
        if (cognome.length > 0 || nome.length > 0)
            description = cognome + " " + nome;
        else if (denominazione.length > 0)
            description = denominazione;
        else if (codiceFiscale.length > 0)
            description = "Fornitore " + codiceFiscale;
        else if (partitaIva.length > 0)
            description = "Fornitore " + partitaIva;
        this.suppliers[accountId].Description = description;

        row.fields["Description"] = description;
        row.fields["BClass"] = "2";
        row.fields["Gr"] = this.suppliers[accountId].Gr;
    }

    var sequence = this.suppliers[accountId].sequence;

    row.fields["Account"] = accountId;
    row.operation = {};
    row.operation.name = operationName;
    row.operation.sequence = sequence;
    row.operation.srcFileName = srcFileName;

    var rowLists = jsonDoc.document.dataUnits["0"].data.rowLists[0];
    var index = parseInt(rowLists.rows.length);
    rowLists.rows[index.toString()] = row;

    this.suppliers[accountId].FirstName = nome;
    this.suppliers[accountId].FamilyName = cognome;
    this.suppliers[accountId].OrganisationName = denominazione;
    this.suppliers[accountId].Street = indirizzo;
    this.suppliers[accountId].PostalCode = cap;
    this.suppliers[accountId].Locality = comune;
    this.suppliers[accountId].Region = provincia;
    this.suppliers[accountId].CountryCode = idPaese;
    this.suppliers[accountId].VatNumber = partitaIva;
    this.suppliers[accountId].FiscalNumber = codiceFiscale;

    return accountId;
}

//Aggiunge le righe della fattura
EFatturaImport.prototype.createJsonDocument_AddTransactions = function (jsonDoc, xmlRoot, srcFileName, accountId) {

	if (!this.suppliers || !this.suppliers[accountId])
		return;
		
    var invoiceNode = xmlRoot.firstChildElement('FatturaElettronicaBody');
    var i = 0;
    while (invoiceNode) {
        var datiGeneraliDocumento = invoiceNode.firstChildElement('DatiGenerali').firstChildElement('DatiGeneraliDocumento');
		if (!datiGeneraliDocumento)
			continue;
        var dataFattura = datiGeneraliDocumento.firstChildElement('Data').text;
        dataFattura = dataFattura.replace(new RegExp('-', 'g'), '');
        //dataFattura = Banana.Converter.toInternalDateFormat(dataFattura, "yyyy-mm-dd");
		
		var description = '';
		var causaleNode = datiGeneraliDocumento.firstChildElement('Causale');
		while (causaleNode) {
			if (description.length>0)
				description += ' ';
			description += causaleNode.text;
			causaleNode = causaleNode.nextSiblingElement('Causale');
		}
		if (description.length<=0)
			description = "fatt. " + this.suppliers[accountId].Description;

        var divisa = datiGeneraliDocumento.firstChildElement('Divisa').text;

        var row = {};
        row.operation = {};
        row.operation.name = "add";
        row.operation.srcFileName = srcFileName;
        row.fields = {};
        row.fields["Date"] = dataFattura;
        row.fields["DocInvoice"] = datiGeneraliDocumento.firstChildElement('Numero').text;
        row.fields["Description"] = description;
		var totalAmount = '';
		if (datiGeneraliDocumento.firstChildElement('ImportoTotaleDocumento'))
			totalAmount = datiGeneraliDocumento.firstChildElement('ImportoTotaleDocumento').text.trim();
		var signTotalAmount = Banana.SDecimal.sign(totalAmount);
        if (this.accountingInfo.isDoubleEntry) {
            if (signTotalAmount >= 0) {
                row.fields["AccountCredit"] = accountId;
            }
            else {
                row.fields["AccountDebit"] = accountId;
                totalAmount = Banana.SDecimal.invert(totalAmount);
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
			if (signTotalAmount >=0) {
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
            row.fields["Date"] = dataFattura;
            row.fields["DocInvoice"] = datiGeneraliDocumento.firstChildElement('Numero').text;
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
                    row.fields["AccountDebit"] = "[CTRACCOUNT]";
                }
                else {
                    row.fields["AccountCredit"] = "[CTRACCOUNT]";
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

            var vatRate = Banana.SDecimal.round(datiRiepilogoNode.firstChildElement('AliquotaIVA').text, {'decimals':2});
			var codiceNatura = "";
			if (datiRiepilogoNode.firstChildElement('Natura'))
				codiceNatura = datiRiepilogoNode.firstChildElement('Natura').text;
			var vatCode = this.getVatCode(accountId, vatRate, codiceNatura);
            if (signTaxableAmount < 0)
                vatCode = "-"+vatCode;
            row.fields["VatCode"] = vatCode;
            row.fields["VatAmountType"] = "1";

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

/*cerca in this.suppliers se esiste il cliente in base al codice fiscale o partita iva)*/
EFatturaImport.prototype.getAccountId = function (xmlNode) {
    if (!xmlNode || !xmlNode.firstChildElement('DatiAnagrafici') || !this.suppliers)
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

    for (var accountId in this.suppliers) {
        if (partitaIva.length > 0 && this.suppliers[accountId].VatNumber == partitaIva) {
            return accountId;
		}
        if (codiceFiscale.length > 0 && this.suppliers[accountId].FiscalNumber == codiceFiscale) {
            return accountId;
		}
    }
	
	//se non trova con partita iva e codice fiscale cerca con nome, cognome e paese
	var nome = "", cognome = "", denominazione = "", comune = "";
    if (xmlNode.firstChildElement('DatiAnagrafici').firstChildElement('Anagrafica').firstChildElement('Nome'))
        nome = xmlNode.firstChildElement('DatiAnagrafici').firstChildElement('Anagrafica').firstChildElement('Nome').text.trim().toLowerCase();
    if (xmlNode.firstChildElement('DatiAnagrafici').firstChildElement('Anagrafica').firstChildElement('Cognome'))
        cognome = xmlNode.firstChildElement('DatiAnagrafici').firstChildElement('Anagrafica').firstChildElement('Cognome').text.trim().toLowerCase();
    if (xmlNode.firstChildElement('DatiAnagrafici').firstChildElement('Anagrafica').firstChildElement('Denominazione'))
        denominazione = xmlNode.firstChildElement('DatiAnagrafici').firstChildElement('Anagrafica').firstChildElement('Denominazione').text.trim().toLowerCase();
    if (xmlNode.firstChildElement('Sede').firstChildElement('Comune'))
        comune = xmlNode.firstChildElement('Sede').firstChildElement('Comune').text.trim().toLowerCase();

    for (var accountId in this.suppliers) {
        if (nome == this.suppliers[accountId].FirstName.trim().toLowerCase() && cognome == this.suppliers[accountId].FamilyName.trim().toLowerCase() &&
			denominazione == this.suppliers[accountId].OrganisationName.trim().toLowerCase() && comune == this.suppliers[accountId].Locality.trim().toLowerCase())
            return accountId;
    }
	
    return "";
}

EFatturaImport.prototype.getAccountingInfo = function () {
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

EFatturaImport.prototype.getNewAccountId = function () {
    
	if (!this.suppliers)
		return "";
		
	var defaultAccountId = 20000;
	var lastAccountId = 0;
	var gr = "";
	var sequence = "";
    for (var id in this.suppliers) {
		if (parseInt(id) > lastAccountId) {
			lastAccountId = parseInt(id);
			gr = this.suppliers[id].Gr;
			sequence = this.suppliers[id].sequence;
		}
    }
	
	var accountId = 0;
	if (lastAccountId == 0) {
		lastAccountId = defaultAccountId;
		while (this.accountIdList && this.accountIdList.hasOwnProperty(lastAccountId.toString())) {
			lastAccountId++;
		}
		accountId = lastAccountId;
	}
	else {
		accountId = lastAccountId + 1;
	}
	
	if (gr.length <= 0) {
		if (this.accountingInfo.suppliersGroup > 0) {
			gr = this.accountingInfo.suppliersGroup;
		}
		else {
			var tableAccounts = this.banDocument.table('Accounts');
			if (!tableAccounts)
				return "";
			sequence = tableAccounts.rowCount;
			var i = 0;
			gr = "FOR";
			while (this.groupIdList && this.groupIdList.hasOwnProperty(gr)) {
				i++;
				gr += i.toString();
			}
			var jsonDoc = this.createJsonDocument_Init();
			var row = {};
			row.fields = {};
			row.fields["Group"] = gr;
			row.fields["Description"] = "Fornitori";
			row.operation = {};
			row.operation.name = "add";
			row.operation.sequence = sequence;
            var rowLists = jsonDoc.document.dataUnits["0"].data.rowLists[0];
            var index = parseInt(rowLists.rows.length);
            rowLists.rows[index.toString()] = row;
			this.jsonDocArray.unshift(jsonDoc);
		}
	}
	
	if (sequence.length <= 0 && gr.length > 0) {
		if (this.groupIdList && this.groupIdList.hasOwnProperty(gr)) {
			sequence = this.groupIdList[gr]-1;
		}
	}
	
	accountId = accountId.toString();
    this.suppliers[accountId] = {};
	this.suppliers[accountId].Gr = gr;
	this.suppliers[accountId].sequence = sequence+".1";

	return accountId.toString();
}

EFatturaImport.prototype.getVatCode = function (accountId, vatRate, codiceNatura) {
	if (!this.vatRates)
		return "";
		
	//cerca il codice iva associato all'aliquota iva
	//Banana.console.debug(accountId + " " + vatRate + " " + codiceNatura);
	if (codiceNatura.length>0) {
		if (this.vatRates.hasOwnProperty(codiceNatura.toLowerCase()))
			//Banana.console.debug("found codicenatura " + codiceNatura + " returned " + this.vatRates[codiceNatura.toLowerCase()]);
			return this.vatRates[codiceNatura.toLowerCase()];
	}
	
	if (this.vatRates.hasOwnProperty(vatRate))
		return this.vatRates[vatRate];

	return "";
}

EFatturaImport.prototype.initParam = function () {
    this.param = {};
    this.param.default_vatrates = '0%=AUTO_0;4%=AUTO_4;5%=AUTO_5;10%=AUTO_10;22%=AUTO_22;';
    this.param.show_dialog_commit = true;
}

/*
 * Ritorna i conti clienti/fornitori con gli indirizzi
*/
EFatturaImport.prototype.loadAccounts = function () {
    this.suppliers = {};
	/*elenco dei conti associati al numero di riga, serve per l'ordinamento di nuovi conti*/
	this.accountIdList = {};
	/*elenco dei gruppi associati al numero di riga, serve per l'ordinamento di nuovi conti*/
	this.groupIdList = {};

    if (!this.banDocument)
        return;

    var tableAccounts = this.banDocument.table('Accounts');
    if (!tableAccounts)
        return;

    for (i = 0; i < tableAccounts.rowCount; i++) {
        var tRow = tableAccounts.row(i);
        var accountId = tRow.value('Account');
        var groupId = tRow.value('Group');
		var grId =  tRow.value('Gr');
		var vatNumber =  tRow.value('VatNumber');

        if (groupId) {
			this.groupIdList[groupId]=i;
			continue;
		}

        if (!accountId)
            continue;
			
		this.accountIdList[accountId]=i;
		
		//commentato perché chiamata ad accountIsSupplier rallenta troppo lo script
		//e l'elenco dei fornitori non è aggiornato perché il giornale non viene ricalcolato tra l'esecuzione di più scripts
		/*var grSupplier = this.banDocument.accountIsSupplier(accountId);
        if (grSupplier.length <= 0)
            continue;*/
			
		var addAsSupplier=false;
		if (vatNumber.length>0)
			addAsSupplier=true;
		if (this.accountingInfo.suppliersGroup.length > 0 && grId == this.accountingInfo.suppliersGroup)
			addAsSupplier=true;
		if (!addAsSupplier)
			continue;

        var jsonString = tRow.toJSON();
        var jsonObj = JSON.parse(jsonString);
        jsonObj.sequence = i;
        /*for (var key in jsonObj) {
           if (jsonObj[key].length > 0)
              jsonObj[key] = xml_escapeString(jsonObj[key]);
        }*/
        this.suppliers[accountId] = jsonObj;
    }
}

EFatturaImport.prototype.loadData = function () {
    //riprende l'elenco dei clienti/fornitori
    this.getAccountingInfo();
    this.loadAccounts();
	this.loadVatCodes();
    /*Banana.console.log("---------------- suppliers ---------------- ");
    Banana.console.log(JSON.stringify(this.suppliers));*/
	
}

EFatturaImport.prototype.loadVatCodes = function () {
	//riprende i codici iva dai parametri dello script
	//se non esistono nel file ac2 crea i codici nella tabella codici IVA
	var default_vatrates = this.param.default_vatrates.split(";");
	this.vatRates = {};
	for (var i in default_vatrates) {
		var string = default_vatrates[i];
		if (string.length<=0 || string.indexOf("=")<=0)
			continue;
		var splittedString = string.split("=");
		if (splittedString.length==2) {
			var vatrate = splittedString[0].replace("%","").trim();
			vatrate = vatrate.replace(",",".");
			if (vatrate.length>0 && vatrate.substring(0,1).toLowerCase()!=="n") {
				//vatrate = Banana.Converter.toLocaleNumberFormat(vatrate);
				vatrate = Banana.SDecimal.round(vatrate, {'decimals':2});
			}
			if (vatrate.length>0) {
				var vatcode = splittedString[1];
				this.vatRates[vatrate]=vatcode;
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
		var vatrate =  tRow.value('VatRate');
		var isdue =  tRow.value('IsDue');
        var gr1 = tRow.value('Gr1');
		if (vatcode.length<=0 || gr1.length<=0)
			continue;
		if (gr1.substring(0,1).toLowerCase() !== "n")
			continue;
        if (Banana.SDecimal.isZero(vatrate) && Banana.SDecimal.isZero(isdue)) {
			if (!this.vatRates.hasOwnProperty(gr1.toLowerCase())) {
				this.vatRates[gr1.toLowerCase()]=vatcode;
			}
        }
	}
	
	var jsonDoc = this.createJsonDocument_Init();
	var changedJsonDoc = false;
	if (this.accountingInfo.vatAccount.length<=0)
	{
		var tableAccounts = this.banDocument.table('Accounts');
		if (!tableAccounts)
			return;
		var sequence = tableAccounts.rowCount;
		var i = 0;
		var accountId = "VatAccount";
		while (this.accountIdList && this.accountIdList.hasOwnProperty(accountId)) {
			i++;
			accountId += i.toString();
		}
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
		if (vatCode.substring(0,1).toLowerCase() === "n")
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
	if (!changedJsonDoc2)
		return;

	this.jsonDocArray.unshift(jsonDoc2);

	if (changedJsonDoc)
		this.jsonDocArray.unshift(jsonDoc);

}

EFatturaImport.prototype.setParam = function (param) {
    if (param && typeof (param) === 'object') {
        this.param = param;
    } else if (param && typeof (param) === 'string') {
        this.param = JSON.parse(param)
    }
    this.verifyParam();
}

EFatturaImport.prototype.verifyBananaVersion = function () {
    if (!this.banDocument)
        return false;

    //Banana+ is required
    var requiredVersion = "10.0.9";
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

    if (!this.param.default_vatrates)
        this.param.default_vatrates = '';

	if (this.param.show_dialog_commit === undefined)
        this.param.show_dialog_commit = true;

}
