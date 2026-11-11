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
        row.fields["Expenses"] = amount;
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

CorrispettiviImport.prototype.createJsonDocument_AddTransactions = function (
    jsonDoc, datiRT, srcFileName, trasmissione, dataOraRilevazione
) {
    var numeroZ = this.getXmlText(datiRT, "NumeroZ") ||
        this.getXmlText(trasmissione, "Progressivo");
    var dataOraZ = this.getXmlText(datiRT, "DataOraZ") || dataOraRilevazione;
    var date = this.getDate(dataOraZ);
    var device = this.getXmlText(
        this.child(trasmissione, "Dispositivo"), "IdDispositivo");
    var riepiloghi = this.children(datiRT, "Riepilogo");

    // Nessuna registrazione per XML senza riepiloghi.
    if (!riepiloghi.length)
        return 0;

    if (!numeroZ || !date) {
        this.message("Progressivo o data mancanti: " + srcFileName);
        return 0;
    }

    // Evita documenti duplicati.
    var key = date + "|" + numeroZ + "|" + device;

    if (this.existingDocs[key] ||
        this.existingDocs[date + "|" + numeroZ + "|"] ||
        this.newDocs[key]) {
        this.message("Corrispettivo già registrato: " + srcFileName);
        return 0;
    }

    var contoContanti = this.param.contoContanti;
    var contoElettronici = this.param.contoPagamentiElettronici;
    var contoContropartita = this.param.contoContropartita || "[CA]";

    // Totali dei pagamenti.
    var totali = this.child(datiRT, "Totali");

    if (!totali) {
        this.message("Totali mancanti: " + srcFileName);
        return 0;
    }

    var contante = this.getAmount(totali, "PagatoContanti");
    var elettronico = this.getAmount(totali, "PagatoElettronico");

    contante = Banana.SDecimal.round(
        contante === null ? 0 : contante, { 'decimals': 2 });
    elettronico = Banana.SDecimal.round(
        elettronico === null ? 0 : elettronico, { 'decimals': 2 });

    if (Banana.SDecimal.compare(contante, "0") < 0 ||
        Banana.SDecimal.compare(elettronico, "0") < 0 ||
        (Banana.SDecimal.compare(contante, "0") > 0 && !contoContanti) ||
        (Banana.SDecimal.compare(elettronico, "0") > 0 && !contoElettronici)) {
        this.message("Pagamenti o conti non validi: " + srcFileName);
        return 0;
    }

    // Riepiloghi IVA.
    var valid = [];
    var totaleCorrispettivi = "0.00";

    for (var i = 0; i < riepiloghi.length; i++) {
        var riepilogo = riepiloghi[i];

        // Casistiche che richiedono una gestione separata.
        if ((this.getAmount(riepilogo, "NonRiscossoServizi") || 0) > 0 ||
            (this.getAmount(riepilogo, "NonRiscossoFatture") || 0) > 0 ||
            (this.getAmount(riepilogo, "NonRiscossoDCRaSSN") || 0) > 0 ||
            (this.getAmount(riepilogo, "BeniInSospeso") || 0) > 0 ||
            (this.getAmount(riepilogo, "Omaggi") || 0) > 0 ||
            this.child(riepilogo, "VentilazioneIVA")) {
            this.message("Corrispettivi particolari da verificare: " + srcFileName);
            return 0;
        }

        var ivaNode = this.child(riepilogo, "IVA");
        var aliquota = this.getXmlText(ivaNode, "AliquotaIVA");
        var natura = this.getXmlText(riepilogo, "Natura");
        var ammontare = this.getAmount(riepilogo, "Ammontare");

        if (ammontare === null || ammontare < 0) {
            this.message("Ammontare non valido: " + srcFileName);
            return 0;
        }

        ammontare = Banana.SDecimal.round(ammontare, { 'decimals': 2 });

        if (Banana.SDecimal.compare(ammontare, "0") === 0)
            continue;

        var vatCode = this.getVatCode(aliquota, natura);

        if (!vatCode) {
            this.message("Codice IVA mancante: " + srcFileName);
            return 0;
        }

        valid.push({
            amount: ammontare,
            rate: aliquota,
            nature: natura,
            vatCode: vatCode
        });

        totaleCorrispettivi = Banana.SDecimal.add(
            totaleCorrispettivi, ammontare
        );
    }

    if (!valid.length)
        return 0;

    // Verifica che pagamenti e corrispettivi coincidano.
    var totalePagamenti = Banana.SDecimal.add(contante, elettronico);

    if (Banana.SDecimal.compare(totaleCorrispettivi, totalePagamenti) !== 0) {
        this.message(
            "Totale corrispettivi diverso dai pagamenti: " +
            srcFileName + " - Corrispettivi: " +
            totaleCorrispettivi + " - Pagamenti: " + totalePagamenti
        );
        return 0;
    }

    var description = "Corrispettivi telematici Z-" + numeroZ +
        (device ? " RT-" + device : "");

    var count = 0;

    // 1. Prima le registrazioni patrimoniali.

    if (Banana.SDecimal.compare(contante, "0") > 0) {
        count += this.addTransaction(
            jsonDoc, srcFileName, date, numeroZ,
            description + " - Contanti",
            contoContanti, "",
            contante, ""
        );
    }

    if (Banana.SDecimal.compare(elettronico, "0") > 0) {
        count += this.addTransaction(
            jsonDoc, srcFileName, date, numeroZ,
            description + " - POS/carte",
            contoElettronici, "",
            elettronico, ""
        );
    }

    // 2. Dopo i corrispettivi per aliquota IVA.

    for (var j = 0; j < valid.length; j++) {
        var item = valid[j];
        var info = item.rate ? "Aliquota " + item.rate + "%" :
            "Natura " + item.nature;

        count += this.addTransaction(
            jsonDoc, srcFileName, date, numeroZ,
            description + " - " + info,
            "", contoContropartita,
            item.amount, item.vatCode
        );
    }

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
    if (Number(rate) === 22 && this.param.codiceIva22)
        return this.param.codiceIva22;
    if (Number(rate) === 10 && this.param.codiceIva10)
        return this.param.codiceIva10;
    if (Number(rate) === 4 && this.param.codiceIva04)
        return this.param.codiceIva04;
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