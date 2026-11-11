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
// @id = ch.banana.it.import.corrispettivi
// @api = 1.0
// @pubdate = 2026-11-11
// @publisher = Banana.ch SA
// @description = Importa corrispettivi telematici
// @task = import.file
// @doctype = *
// @docproperties =
// @inputdatasource = opendirdialog
// @inputfilefilter = *.xml
// @timeout = -1
// @includejs = ch.banana.it.import.efattura.settings.js

// Main function
function exec(inData) {

    if (!Banana.document || !inData || inData.length <= 0)
        return "@Cancel";

    Banana.application.clearMessages();

    var corrispettiviImport = new CorrispettiviImport(Banana.document);
    var settings = new Settings(Banana.document);

    if (!settings.verifyBananaVersion())
        return "@Cancel";

    //inData contiene i dati dei corrispettivi in formato XML
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
        corrispettiviImport.setParam(JSON.parse(savedParam));
    }

    var jsonData = corrispettiviImport.createJsonDocument(xmlData);

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

function CorrispettiviImport(banDocument) {
    this.banDocument = banDocument;
    if (this.banDocument === undefined)
        this.banDocument = Banana.document;

    this.jsonDocArray = [];
    this.existingDocs = {};
    this.newDocs = {};
    this.initParam();
}

/* Aggiunge registrazioni come createJsonDocument_AddTransactions di eFattura */
CorrispettiviImport.prototype.addTransaction = function (
    jsonDoc, srcFileName, date, doc, description, accountDebit, accountCredit, amount, vatCode
) {
    if (!(amount > 0))
        return 0;
    amount = Banana.SDecimal.round(amount, { 'decimals': 2 });
    var row = {};
    row.operation = {};
    row.operation.name = "add";
    row.operation.sequence = "";
    row.operation.srcFileName = srcFileName;
    row.fields = {};
    row.fields["Date"] = date;
    row.fields["DateDocument"] = date;
    row.fields["Doc"] = String(doc);
    row.fields["Description"] = description;

    if (this.accountingInfo.isDoubleEntry) {
        row.fields["AccountDebit"] = accountDebit;
        row.fields["AccountCredit"] = accountCredit;
        if (this.accountingInfo.multiCurrency) {
            row.fields["AmountCurrency"] = amount;
            row.fields["ExchangeCurrency"] = this.accountingInfo.baseCurrency;
        }
        else {
            row.fields["Amount"] = amount;
        }
    }
    else {
        row.fields["Account"] = accountDebit;
        row.fields["Expenses"] = totalAmount;
    }

    if (vatCode)
        row.fields["VatCode"] = vatCode;

    var rowLists = jsonDoc.document.dataUnits[0].data.rowLists[0];
    rowLists.rows.push(row);
    return 1;
};

CorrispettiviImport.prototype.child = function (node, name) {
    if (!node)
        return null;
    // firstChildElement gestisce il caso normale, il ciclo gestisce eventuali prefissi XML.
    var found = node.firstChildElement(name);
    if (found)
        return found;
    var child = node.firstChildElement();
    while (child) {
        if (this.nodeName(child) === name)
            return child;
        child = child.nextSiblingElement();
    }
    return null;
};

CorrispettiviImport.prototype.children = function (node, name) {
    var children = [];
    if (!node)
        return children;
    var child = node.firstChildElement();
    while (child) {
        if (this.nodeName(child) === name)
            children.push(child);
        child = child.nextSiblingElement();
    }
    return children;
};

/*Il metodo createJsonDocument() riprende i dati dal file xml della fattura elettronica
  e li trasforma in formato json per essere importati nella tabella Registrazioni
*/
CorrispettiviImport.prototype.createJsonDocument = function (inData) {
    this.load();
    for (var srcFileName in inData) {
        if (!Object.prototype.hasOwnProperty.call(inData, srcFileName))
            continue;
        var xmlFile;
        try {
            xmlFile = Banana.Xml.parse(inData[srcFileName]);
        }
        catch (e) {
            this.message("XML non valido: " + srcFileName);
            continue;
        }
        if (!xmlFile)
            continue;
        var xmlRoot = xmlFile.firstChildElement();
        if (!xmlRoot)
            continue;
        var datiRT = this.child(xmlRoot, "DatiRT");
        if (!datiRT) {
            this.message("Struttura corrispettivi non riconosciuta: " + srcFileName);
            continue;
        }
        var trasmissione = this.child(xmlRoot, "Trasmissione");
        var dataOraRilevazione = this.getXmlText(xmlRoot, "DataOraRilevazione");
        var jsonDoc = this.createJsonDocument_Init();
        var count = 0;
        while (datiRT) {
            count += this.createJsonDocument_AddTransactions(
                jsonDoc, datiRT, srcFileName, trasmissione, dataOraRilevazione);
            datiRT = datiRT.nextSiblingElement("DatiRT");
        }
        if (count > 0)
            this.jsonDocArray.push(jsonDoc);
    }
    return this.jsonDocArray;
};

/* Importa un singolo DatiRT usando il tracciato COR10 reale. */
CorrispettiviImport.prototype.createJsonDocument_AddTransactions = function (
    jsonDoc, datiRT, srcFileName, trasmissione, dataOraRilevazione
) {
    var numeroZ = this.getXmlText(datiRT, "NumeroZ") || this.getXmlText(trasmissione, "Progressivo");
    var dataOraZ = this.getXmlText(datiRT, "DataOraZ") || dataOraRilevazione;
    var date = this.getDate(dataOraZ);
    var device = this.getXmlText(this.child(trasmissione, "Dispositivo"), "IdDispositivo");
    var riepiloghi = this.children(datiRT, "Riepilogo").concat(this.children(datiRT, "DatiRiepilogo"));

    // Un XML di inattività è un documento valido, ma non produce registrazioni.
    if (!riepiloghi.length)
        return 0;
    if (!numeroZ || !date) {
        this.message("Progressivo o data di rilevazione mancanti: " + srcFileName);
        return 0;
    }
    var key = date + "|" + numeroZ + "|" + device;
    if (this.existingDocs[key] || this.existingDocs[date + "|" + numeroZ + "|"] || this.newDocs[key]) {
        this.message("Corrispettivo già registrato, ignorato: " + srcFileName);
        return 0;
    }

    var valid = [];
    var totalCents = 0;
    for (var i = 0; i < riepiloghi.length; i++) {
        var riepilogo = riepiloghi[i];
        var ivaNode = this.child(riepilogo, "IVA") || this.child(riepilogo, "Iva");
        var aliquota = this.getXmlText(ivaNode, "AliquotaIVA") ||
            this.getXmlText(ivaNode, "Aliquota") ||
            this.getXmlText(riepilogo, "AliquotaIVA");
        var natura = this.getXmlText(ivaNode, "Natura") || this.getXmlText(riepilogo, "Natura");
        var ammontare = this.getAmount(riepilogo, "Ammontare");
        if (ammontare === null)
            ammontare = this.getAmount(riepilogo, "ImportoParziale");
        if (ammontare === null || ammontare < 0) {
            this.message("Importo del riepilogo non valido: " + srcFileName);
            return 0; // evita importazioni parziali
        }
        if (ammontare === 0)
            continue;
        valid.push({
            "amount": ammontare, "rate": aliquota, "nature": natura,
            "vatCode": this.getVatCode(aliquota, natura)
        });
        totalCents += Math.round(ammontare * 100);
    }
    if (!valid.length)
        return 0;

    var totali = this.child(datiRT, "Totali");
    var pagamento = this.child(totali, "Pagamento");
    var elettronico = this.getAmount(totali, "PagatoElettronico");
    if (elettronico === null)
        elettronico = this.getAmount(pagamento, "PagamentoElettronico");
    var contante = this.getAmount(totali, "PagatoContante");
    if (contante === null)
        contante = this.getAmount(totali, "PagatoContanti");
    if (contante === null)
        contante = this.getAmount(pagamento, "Contante");

    var description = "Corrispettivi telematici Z-" + numeroZ + (device ? " RT-" + device : "");
    var count = 0;
    for (var j = 0; j < valid.length; j++) {
        var item = valid[j];
        var info = item.rate ? "Aliquota " + item.rate + "%" :
            (item.nature ? "Natura " + item.nature : "IVA non indicata");
        // Ammontare del COR10: totale lordo, da abbinare al codice IVA vendite.
        count += this.addTransaction(jsonDoc, srcFileName, date, numeroZ,
            description + " - " + info,
            this.param.conto_transitorio, this.param.conto_ricavi,
            item.amount, item.vatCode);
    }
    if (elettronico !== null && elettronico > 0)
        count += this.addTransaction(jsonDoc, srcFileName, date, numeroZ,
            description + " - POS/carte",
            this.param.conto_pos, this.param.conto_transitorio, elettronico, "");
    if (contante !== null && contante > 0)
        count += this.addTransaction(jsonDoc, srcFileName, date, numeroZ,
            description + " - Contanti",
            this.param.conto_cassa, this.param.conto_transitorio, contante, "");

    var total = totalCents / 100;
    total = Banana.SDecimal.round(total, { 'decimals': 2 });
    if (elettronico !== null && contante !== null && elettronico + contante > total + 0.02)
        this.message("Attenzione: pagamenti superiori ai corrispettivi in " + srcFileName);
    this.newDocs[key] = true;
    return count;
};

/* Stessa struttura createJsonDocument_Init di eFattura: unità Transactions */
CorrispettiviImport.prototype.createJsonDocument_Init = function () {
    var jsonDoc = {};
    jsonDoc.document = {};
    jsonDoc.fileVersion = "1.0.0";
    jsonDoc.document.dataUnits = [];

    var dataUnitTransactions = {};
    jsonDoc.document.dataUnits[0] = dataUnitTransactions;
    dataUnitTransactions.data = {};
    dataUnitTransactions.data.rowLists = [];
    dataUnitTransactions.data.rowLists[0] = {};
    dataUnitTransactions.data.rowLists[0].rows = [];
    dataUnitTransactions.id = "Transactions";
    dataUnitTransactions.nameXml = "Transactions";
    dataUnitTransactions.nid = 103;

    jsonDoc.creator = {};
    var d = new Date();
    var datestring = d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2);
    var timestring = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    jsonDoc.creator.executionDate = Banana.Converter.toInternalDateFormat(datestring, "yyyymmdd");
    jsonDoc.creator.executionTime = Banana.Converter.toInternalTimeFormat(timestring);
    jsonDoc.creator.name = "ch.banana.it.import.corrispettivi";
    jsonDoc.creator.version = "1.0";
    return jsonDoc;
};

CorrispettiviImport.prototype.getAmount = function (node, name) {
    var value = this.getXmlText(node, name).replace(/\s/g, "");
    if (!value)
        return null;
    if (value.indexOf(",") >= 0 && value.indexOf(".") >= 0)
        value = value.replace(/\./g, "").replace(",", ".");
    else
        value = value.replace(",", ".");
    if (!/^-?\d+(\.\d+)?$/.test(value))
        return null;
    return Math.round(parseFloat(value) * 100) / 100;
};

CorrispettiviImport.prototype.getDate = function (str) {
    var match = /^(\d{4})-(\d{2})-(\d{2})/.exec(str || "");
    if (!match)
        return "";
    var date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    if (date.getUTCFullYear() !== Number(match[1]) ||
        date.getUTCMonth() !== Number(match[2]) - 1 ||
        date.getUTCDate() !== Number(match[3]))
        return "";
    return match[1] + match[2] + match[3];
};

/* Usa codici reali impostati dall'utente; altrimenti i segnaposto di eFattura. */
CorrispettiviImport.prototype.getVatCode = function (aliquota, natura) {
    var rate = parseFloat(String(aliquota || "").replace(",", "."));
    rate = Banana.SDecimal.round(rate, { 'decimals': 2 });
    if (Number(rate) === 22 && this.param.codice_iva_22)
        return this.param.codice_iva_22;
    if (Number(rate) === 10 && this.param.codice_iva_10)
        return this.param.codice_iva_10;
    if (Number(rate) === 4 && this.param.codice_iva_04)
        return this.param.codice_iva_04;
    if (isNaN(rate))
        return "";
    return "[V" + rate + (natura ? "_" + natura : "") + "]";
};

CorrispettiviImport.prototype.getXmlText = function (node, name) {
    var child = this.child(node, name);
    if (!child)
        return "";
    return String(child.text || "").trim();
};

CorrispettiviImport.prototype.initParam = function (param) {
    var settings = new Settings(Banana.document);
    this.param = settings.initParam();
}

CorrispettiviImport.prototype.load = function () {
    var settings = new Settings(Banana.document);
    this.accountingInfo = settings.loadAccountingInfo();
    this.loadExistingDocs();
    /*Banana.console.log("---------------- accounts ---------------- ");
    Banana.console.log(JSON.stringify(this.accounts));*/

}

/* Come eFattura, carica il documento contabile per evitare doppi import. */
CorrispettiviImport.prototype.loadExistingDocs = function () {
    this.existingDocs = {};
    var tableTransactions = this.banDocument.table("Transactions");
    if (!tableTransactions)
        return;
    for (var i = 0; i < tableTransactions.rowCount; i++) {
        var row = tableTransactions.row(i);
        var description = String(row.value("Description") || "");
        if (description.indexOf("Corrispettivi telematici Z-") !== 0)
            continue;
        var doc = String(row.value("Doc") || "");
        var date = String(row.value("DateDocument") || row.value("Date") || "").replace(/-/g, "");
        var match = / RT-([^ ]+)/.exec(description);
        if (doc && date)
            this.existingDocs[date + "|" + doc + "|" + (match ? match[1] : "")] = true;
    }
};

CorrispettiviImport.prototype.message = function (msg) {
    if (this.banDocument && this.banDocument.addMessage)
        this.banDocument.addMessage(msg);
};

CorrispettiviImport.prototype.nodeName = function (node) {
    if (!node)
        return "";
    return String(node.nodeName || node.tagName || "").split(":").pop();
};

CorrispettiviImport.prototype.setParam = function (param) {
    var settings = new Settings(Banana.document);

    this.param = settings.initParam();
    if (param && typeof (param) === 'object') {
        this.param = param;
    } else if (param && typeof (param) === 'string') {
        this.param = JSON.parse(param);
    }
    this.param = settings.verifyParam(this.param);
}