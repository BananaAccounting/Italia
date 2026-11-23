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
// @pubdate = 2026-11-20
// @publisher = Banana.ch SA
// @description = Importa corrispettivi telematici
// @task = import.file
// @doctype = *
// @docproperties =
// @inputdatasource = opendirdialog
// @inputfilefilter = *.xml
// @timeout = -1
// @includejs = ch.banana.it.import.efattura.settings.js

/*
 * Tracciato di riferimento: Agenzia delle Entrate, allegato "Tipi Dati per i
 * corrispettivi" versione 7.1 (XMLcor, formato COR10). Struttura:
 *
 *   <DatiCorrispettivi simulazione="true|false">
 *     1   <Trasmissione>
 *     1.1   <Progressivo>            progressivo di trasmissione (univoco per dispositivo)
 *     1.2   <Formato>                [COR10]
 *     1.3   <Dispositivo>            solo vending machine / più punti cassa
 *     1.3.2   <IdDispositivo>
 *     2   <PeriodoInattivo>          periodo con corrispettivi a zero
 *     3   <DataOraRilevazione>       per RT: data e ora della chiusura giornaliera
 *     4   <DatiRT>                   (0..1)
 *     4.1   <Riepilogo>              (1..40) uno per aliquota / natura / ventilazione
 *     4.1.1   <IVA>
 *     4.1.1.1   <AliquotaIVA>
 *     4.1.1.2   <Imposta>            imposta sull'imponibile di 4.1.6
 *     4.1.2   <Natura>               alternativo a <IVA> e <VentilazioneIVA>
 *     4.1.3   <VentilazioneIVA>      alternativo a <IVA> e <Natura>
 *     4.1.4   <Ammontare>            = somma dei campi da 4.1.6 a 4.1.13
 *     4.1.6   <ImportoParziale>      imponibile da assoggettare a IVA
 *     4.1.7   <TotaleAmmontareResi>
 *     4.1.8   <TotaleAmmontareAnnulli>
 *     4.1.9   <BeniInSospeso>        incassati in acconto, non ancora ricavo
 *     4.1.10  <NonRiscossoServizi>
 *     4.1.11  <NonRiscossoFatture>
 *     4.1.12  <TotaleDaFattureRT>
 *     4.1.13  <NonRiscossoDCRaSSN>
 *     4.1.14  <NonRiscossoOmaggio>   compreso in 4.1.6, quindi tassato ma non incassato
 *     4.2   <Totali>
 *     4.2.1   <NumeroDocCommerciali>
 *     4.2.2   <PagatoContanti>
 *     4.2.3   <PagatoElettronico>
 *     4.2.4   <ScontoApagare>
 *     4.2.5.1 <PagatoTicket>
 *     5   <DatiDA>                   vending machine (non gestito)
 *
 * Come vengono costruite le registrazioni
 * ---------------------------------------
 * <ImportoParziale> e <Imposta> sono l'imponibile e l'IVA della parte incassata
 * e tassata; i resi, gli annulli e i corrispettivi non riscossi ne sono già
 * esclusi. I pagamenti di 4.2 sono invece al lordo.
 *
 *   dare   = PagatoContanti + PagatoElettronico + PagatoTicket + ScontoApagare
 *   avere  = somma degli imponibili, con il codice IVA che calcola l'imposta
 *
 * Le due somme devono coincidere. Se restano differenze, sono spiegate dai campi
 * dichiarati nel riepilogo (omaggi non riscossi, beni in sospeso, non riscosso)
 * e vengono registrate sul conto indicato nelle impostazioni; se il conto manca,
 * o se più casistiche sono presenti contemporaneamente, il documento non viene
 * importato e viene segnalato con un messaggio.
 *
 * Gli imponibili sono registrati con VatAmountType = "1" (IVA esclusa), come fa
 * l'importazione delle fatture elettroniche, così gli stessi codici IVA valgono
 * per le due estensioni. Con la ventilazione IVA l'importo è invece al lordo e
 * viene registrato con VatAmountType = "0".
 */

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

    if (!jsonData || jsonData.length <= 0) {
        Banana.document.addMessage(
            "Nessun corrispettivo importato: controllare i messaggi precedenti e le impostazioni dell'estensione.");
    }

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
    //codici IVA e contropartite per aliquota, dalle impostazioni
    this.vatTable = {};
    //prefisso usato nelle descrizioni, serve anche a riconoscere i doc già importati
    this.descriptionPrefix = "Corrispettivi telematici";
    this.initParam();
    this.settings = new Settings(this.banDocument);
}

/* Aggiunge una registrazione.
   account = conto in dare, counterpart = conto in avere.
   vatAmountType: "1" importo al netto dell'IVA, "0" al lordo. */
CorrispettiviImport.prototype.addTransaction = function (
    jsonDoc, srcFileName, date, doc, description, account, counterpart, amount, vatCode, vatAmountType
) {
    if (Banana.SDecimal.compare(amount, "0") === 0)
        return 0;
    amount = Banana.SDecimal.round(amount, { 'decimals': 2 });
    //gli importi negativi si registrano invertendo i conti
    if (Banana.SDecimal.compare(amount, "0") < 0) {
        var swap = account;
        account = counterpart;
        counterpart = swap;
        amount = Banana.SDecimal.invert(amount);
        if (vatCode)
            vatCode = "-" + vatCode;
    }
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
        row.fields["AccountDebit"] = account;
        row.fields["AccountCredit"] = counterpart;
        if (this.accountingInfo.multiCurrency) {
            row.fields["AmountCurrency"] = amount;
            row.fields["ExchangeCurrency"] = this.accountingInfo.baseCurrency;
        }
        else {
            row.fields["Amount"] = amount;
        }
    }
    else {
        //contabilità entrate/uscite: il conto patrimoniale va in Account,
        //la contropartita in Category. I corrispettivi sono sempre entrate.
        if (account)
            row.fields["Account"] = account;
        if (counterpart)
            row.fields["Category"] = counterpart;
        row.fields["Income"] = amount;
    }

    if (vatCode) {
        row.fields["VatCode"] = vatCode;
        row.fields["VatAmountType"] = vatAmountType ? vatAmountType : "1";
    }

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

/*Il metodo createJsonDocument() riprende i dati dal file xml dei corrispettivi
  e li trasforma in formato json per essere importati nella tabella Registrazioni
*/
CorrispettiviImport.prototype.createJsonDocument = function (inData) {
    this.load();
    if (!this.verifyFileType())
        return this.jsonDocArray;
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
        //le trasmissioni di prova non vanno contabilizzate
        if (this.getAttribute(xmlRoot, "simulazione").toLowerCase() === "true") {
            this.message("Trasmissione di simulazione, non importata: " + srcFileName);
            continue;
        }
        var datiRT = this.child(xmlRoot, "DatiRT");
        if (!datiRT) {
            if (this.child(xmlRoot, "PeriodoInattivo"))
                this.message("Periodo inattivo senza corrispettivi, niente da importare: " + srcFileName);
            else if (this.child(xmlRoot, "DatiDA"))
                this.message("Corrispettivi da distributore automatico non gestiti: " + srcFileName);
            else
                this.message("Struttura corrispettivi non riconosciuta: " + srcFileName);
            continue;
        }
        var trasmissione = this.child(xmlRoot, "Trasmissione");
        //campo 3: <DataOraRilevazione> è figlio diretto della radice
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
    //il tracciato prevede il progressivo di trasmissione (1.1) e la data di
    //rilevazione (3); NumeroZ/DataOraZ sono accettati per tolleranza
    var progressivo = this.getXmlText(trasmissione, "Progressivo") ||
        this.getXmlText(datiRT, "NumeroZ");
    var dataOra = dataOraRilevazione || this.getXmlText(datiRT, "DataOraZ");
    var date = this.getDate(dataOra);
    var device = this.getXmlText(
        this.child(trasmissione, "Dispositivo"), "IdDispositivo");
    var riepiloghi = this.children(datiRT, "Riepilogo");

    // Nessuna registrazione per XML senza riepiloghi.
    if (!riepiloghi.length)
        return 0;

    if (!progressivo || !date) {
        this.message("Progressivo o data mancanti: " + srcFileName);
        return 0;
    }

    // Evita documenti duplicati.
    var key = date + "|" + progressivo + "|" + device;

    if (this.existingDocs[key] ||
        this.existingDocs[date + "|" + progressivo + "|"] ||
        this.newDocs[key]) {
        this.message("Corrispettivo già registrato: " + srcFileName);
        return 0;
    }

    var contoContropartita = this.param.contoContropartita || "[CA]";

    // ---- incassi (4.2) ----
    var totali = this.child(datiRT, "Totali");

    if (!totali) {
        this.message("Totali mancanti: " + srcFileName);
        return 0;
    }

    var ticketNode = this.child(totali, "Ticket");
    var incassi = [
        { "tag": "PagatoContanti", "node": totali, "conto": this.param.contoContanti, "titolo": "Contanti", "parametro": "conto contanti" },
        { "tag": "PagatoElettronico", "node": totali, "conto": this.param.contoPagamentiElettronici, "titolo": "POS/carte", "parametro": "conto pagamenti elettronici" },
        { "tag": "PagatoTicket", "node": ticketNode, "conto": this.param.contoTicket, "titolo": "Ticket", "parametro": "conto ticket" },
        { "tag": "ScontoApagare", "node": totali, "conto": this.param.contoSconti, "titolo": "Sconto a pagare", "parametro": "conto sconti concessi" }
    ];

    var totaleIncassi = "0.00";
    for (var i = 0; i < incassi.length; i++) {
        var importo = incassi[i].node ?
            this.getAmountStr(incassi[i].node, incassi[i].tag, "0.00") : "0.00";
        if (importo === null) {
            this.message("Importo non valido in " + incassi[i].tag + ": " + srcFileName);
            return 0;
        }
        if (Banana.SDecimal.compare(importo, "0") < 0) {
            this.message("Importo negativo in " + incassi[i].tag + ": " + srcFileName);
            return 0;
        }
        if (Banana.SDecimal.compare(importo, "0") > 0 && !incassi[i].conto) {
            this.message("Nelle impostazioni manca il " + incassi[i].parametro +
                ", necessario per " + incassi[i].tag + ": " + srcFileName);
            return 0;
        }
        incassi[i].importo = importo;
        totaleIncassi = Banana.SDecimal.add(totaleIncassi, importo);
    }

    // ---- riepiloghi IVA (4.1) ----
    var valid = [];
    var totaleRicavi = "0.00";
    //casistiche dichiarate che possono spiegare una differenza
    var categorie = {
        "omaggi": { "importo": "0.00", "conto": this.param.contoOmaggi, "titolo": "Omaggi", "parametro": "conto omaggi", "tags": ["NonRiscossoOmaggio"] },
        "sospeso": { "importo": "0.00", "conto": this.param.contoBeniInSospeso, "titolo": "Beni in sospeso", "parametro": "conto acconti e beni in sospeso", "tags": ["BeniInSospeso"] },
        "nonriscosso": {
            "importo": "0.00", "conto": this.param.contoNonRiscosso, "titolo": "Corrispettivi non riscossi",
            "parametro": "conto corrispettivi non riscossi",
            "tags": ["NonRiscossoServizi", "NonRiscossoFatture", "NonRiscossoDCRaSSN", "TotaleDaFattureRT"]
        }
    };

    for (var r = 0; r < riepiloghi.length; r++) {
        var riepilogo = riepiloghi[r];

        for (var nome in categorie) {
            for (var t = 0; t < categorie[nome].tags.length; t++) {
                var valore = this.getAmountStr(riepilogo, categorie[nome].tags[t], "0.00");
                if (valore === null) {
                    this.message("Importo non valido in " + categorie[nome].tags[t] + ": " + srcFileName);
                    return 0;
                }
                categorie[nome].importo = Banana.SDecimal.add(categorie[nome].importo, valore);
            }
        }

        var voce = this.getRiepilogoAmounts(riepilogo, srcFileName);
        if (!voce)
            return 0;
        if (!voce.vatCode && this.accountingInfo.withVat) {
            this.message("Codice IVA mancante: " + srcFileName);
            return 0;
        }
        if (Banana.SDecimal.compare(voce.amount, "0") === 0)
            continue;

        voce.account = voce.account || contoContropartita;
        valid.push(voce);
        totaleRicavi = Banana.SDecimal.add(totaleRicavi, voce.gross);
    }

    if (!valid.length)
        return 0;

    // ---- differenza tra ricavi e incassi ----
    var differenza = Banana.SDecimal.subtract(totaleRicavi, totaleIncassi);
    var categoriaDifferenza = null;

    if (Banana.SDecimal.compare(differenza, "0") !== 0) {
        var presenti = [];
        for (var nome2 in categorie) {
            if (Banana.SDecimal.compare(categorie[nome2].importo, "0") !== 0)
                presenti.push(categorie[nome2]);
        }
        if (presenti.length === 1 && presenti[0].conto) {
            categoriaDifferenza = presenti[0];
        }
        else if (presenti.length === 1) {
            this.message("Nelle impostazioni manca il " + presenti[0].parametro +
                ", necessario per registrare " + presenti[0].titolo.toLowerCase() +
                " di " + presenti[0].importo + ": " + srcFileName);
            return 0;
        }
        else {
            /*this.message("Totale corrispettivi diverso dai pagamenti: " +
                srcFileName + " - Corrispettivi: " + totaleRicavi +
                " - Pagamenti: " + totaleIncassi +
                " - Differenza: " + differenza +
                (presenti.length > 1 ? " (più casistiche particolari presenti, da registrare a mano)" : ""));
            return 0;*/
        }
    }

    var description = this.descriptionPrefix + " n. " + progressivo +
        (device ? " RT-" + device : "");

    var count = 0;

    // 1. Prima le registrazioni patrimoniali.
    for (var k = 0; k < incassi.length; k++) {
        if (Banana.SDecimal.compare(incassi[k].importo, "0") <= 0)
            continue;
        count += this.addTransaction(
            jsonDoc, srcFileName, date, progressivo,
            description + " - " + incassi[k].titolo,
            incassi[k].conto, "",
            incassi[k].importo, "", ""
        );
    }

    // 2. La differenza spiegata dalle casistiche particolari.
    if (categoriaDifferenza) {
        count += this.addTransaction(
            jsonDoc, srcFileName, date, progressivo,
            description + " - " + categoriaDifferenza.titolo,
            categoriaDifferenza.conto, "",
            differenza, "", ""
        );
    }

    // 3. Dopo i corrispettivi per aliquota IVA.
    for (var j = 0; j < valid.length; j++) {
        var item = valid[j];
        count += this.addTransaction(
            jsonDoc, srcFileName, date, progressivo,
            description + " - " + item.info,
            "", item.account,
            item.amount, item.vatCode, item.vatAmountType
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
    if (value.indexOf(",") >= 0 && value.indexOf(".") >= 0) {
        //separatore decimale = l'ultimo dei due
        if (value.lastIndexOf(",") > value.lastIndexOf("."))
            value = value.replace(/\./g, "").replace(",", ".");
        else
            value = value.replace(/,/g, "");
    }
    else {
        value = value.replace(",", ".");
    }
    if (!/^-?\d+(\.\d+)?$/.test(value))
        return null;
    return Math.round(parseFloat(value) * 100) / 100;
};

/* Ritorna l'importo arrotondato come stringa, "" (o defaultValue) se il tag
   manca, null se il contenuto non è un numero valido. */
CorrispettiviImport.prototype.getAmountStr = function (node, name, defaultValue) {
    var child = this.child(node, name);
    if (!child)
        return defaultValue === undefined ? "" : defaultValue;
    var value = this.getAmount(node, name);
    if (value === null)
        return null;
    return Banana.SDecimal.round(value, { 'decimals': 2 });
};

CorrispettiviImport.prototype.getAttribute = function (node, name) {
    if (!node)
        return "";
    try {
        if (typeof node.attribute === 'function')
            return String(node.attribute(name) || "").trim();
    }
    catch (e) {
    }
    return "";
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

/*
 * Ritorna gli importi di un riepilogo: importo da registrare, importo lordo per
 * il controllo di quadratura, codice IVA, contropartita e tipo di importo.
 * Ritorna null se i dati non sono validi (il messaggio è già stato aggiunto).
*/

/*
 * Ritorna gli importi di un riepilogo: importo da registrare, importo lordo
 * per il controllo di quadratura, codice IVA, contropartita e tipo di importo.
 *
 * Per i corrispettivi ordinari determina se ImportoParziale è al netto
 * o al lordo dell'IVA, confrontando l'imposta dichiarata con quella calcolata.
 * Per la ventilazione IVA l'importo è sempre trattato al lordo.
 *
 * Ritorna null se i dati non sono validi o il tipo importo non è determinabile.
 */
CorrispettiviImport.prototype.getRiepilogoAmounts = function (riepilogo, srcFileName) {
    var ventilazione = this.child(riepilogo, "VentilazioneIVA");
    var ivaNode = this.child(riepilogo, "IVA");
    var aliquota = this.getXmlText(ivaNode, "AliquotaIVA");
    var natura = this.getXmlText(riepilogo, "Natura");

    if (ventilazione) {
        // Con la ventilazione l'importo è al lordo e non c'è un'aliquota IVA.
        var lordo = this.getAmountStr(riepilogo, "ImportoParziale");
        if (lordo === null) {
            this.message("Importo parziale non valido: " + srcFileName);
            return null;
        }
        if (lordo === "")
            lordo = this.getAmountStr(riepilogo, "Ammontare");

        if (lordo === null || lordo === "") {
            this.message("Ammontare non valido: " + srcFileName);
            return null;
        }

        var codiceVentilazione = this.param.codiceIvaVentilazione;
        if (this.accountingInfo.withVat && !codiceVentilazione) {
            this.message("Nelle impostazioni manca il codice IVA per la ventilazione: " + srcFileName);
            return null;
        }

        return {
            "amount": lordo,
            "gross": lordo,
            "vatCode": this.accountingInfo.withVat ? codiceVentilazione : "",
            "vatAmountType": this.accountingInfo.withVat ? "0" : "",
            "account": "",
            "info": "Ventilazione IVA"
        };
    }

    // ImportoParziale è l'importo da assoggettare a IVA.
    // Ammontare comprende anche le altre componenti del riepilogo.
    var imponibile = this.getAmountStr(riepilogo, "ImportoParziale");
    if (imponibile === null) {
        this.message("Importo parziale non valido: " + srcFileName);
        return null;
    }
    if (imponibile === "")
        imponibile = this.getAmountStr(riepilogo, "Ammontare");

    if (imponibile === null || imponibile === "") {
        this.message("Ammontare non valido: " + srcFileName);
        return null;
    }

    var imposta = this.getAmountStr(ivaNode, "Imposta", "0.00");
    if (imposta === null) {
        this.message("Imposta non valida: " + srcFileName);
        return null;
    }

    if (Banana.SDecimal.compare(imponibile, "0") < 0 ||
        Banana.SDecimal.compare(imposta, "0") < 0) {
        this.message("Importi negativi non gestiti: " + srcFileName);
        return null;
    }

    // Determina se l'importo è al netto ("1") o al lordo ("0") dell'IVA.
    // Per aliquote zero o operazioni senza aliquota non serve lo scorporo.
    var vatAmountType = "1";

    if (aliquota && Number(aliquota) > 0) {
        vatAmountType = this.settings.getVatAmountType(
            imponibile, imposta, aliquota
        );

        if (vatAmountType === null) {
            this.message(
                "Tipo importo IVA non determinabile: " + srcFileName +
                ", aliquota " + aliquota + "%" +
                ", importo " + imponibile +
                ", imposta " + imposta
            );
            return null;
        }
    }

    // Se l'importo è già lordo, non bisogna aggiungere nuovamente l'IVA.
    var lordo = vatAmountType === "0"
        ? imponibile
        : Banana.SDecimal.add(imponibile, imposta);

    var vatInfo = this.getVatCodeInfo(aliquota, natura);
    var info = aliquota ? "Aliquota " + aliquota + "%" :
        (natura ? "Natura " + natura : "Corrispettivi");

    // Senza gestione IVA si registra l'importo lordo e nessun codice IVA.
    if (!this.accountingInfo.withVat) {
        return {
            "amount": lordo,
            "gross": lordo,
            "vatCode": "",
            "vatAmountType": "",
            "account": vatInfo ? vatInfo.account : "",
            "info": info
        };
    }

    // Con gestione IVA si registra l'importo XML specificando se è
    // al netto o al lordo, indipendentemente dal tipo del codice IVA.
    return {
        "amount": imponibile,
        "gross": lordo,
        "vatCode": vatInfo ? vatInfo.vatCode : "",
        "vatAmountType": vatAmountType,
        "account": vatInfo ? vatInfo.account : "",
        "info": info
    };
};


/* Ritorna il solo codice IVA (segnaposto se non è nelle impostazioni) */
CorrispettiviImport.prototype.getVatCode = function (aliquota, natura) {
    var info = this.getVatCodeInfo(aliquota, natura);
    return info ? info.vatCode : "";
};

/*
 * Cerca il codice IVA e l'eventuale contropartita nella tabella delle
 * impostazioni; se non c'è ritorna il segnaposto, che può essere sostituito
 * tramite rules.json. I corrispettivi sono sempre vendite: prefisso V.
*/

CorrispettiviImport.prototype.getVatCodeInfo = function (aliquota, natura) {
    var rate = parseFloat(String(aliquota || "").replace(",", "."));

    if (isNaN(rate) && !natura)
        return null;

    rate = isNaN(rate) ? "0.00" : Banana.SDecimal.round(rate, { 'decimals': 2 });

    var key = "V" + rate + (natura ? "_" + natura : "");
    var entry = this.vatTable[key.toUpperCase()];

    if (entry && entry.vatCode)
        return { "vatCode": entry.vatCode, "account": entry.account };

    return {
        "vatCode": "[" + key + "]",
        "account": entry ? entry.account : ""
    };
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
    var settings = new Settings(this.banDocument);
    this.accountingInfo = settings.loadAccountingInfo();
    this.vatTable = settings.parseVatTable(this.param, 'corrispettivi');
    this.loadExistingDocs();
}

/* Come eFattura, carica il documento contabile per evitare doppi import. */
CorrispettiviImport.prototype.loadExistingDocs = function () {
    this.existingDocs = {};
    if (!this.banDocument)
        return;
    var tableTransactions = this.banDocument.table("Transactions");
    if (!tableTransactions)
        return;
    for (var i = 0; i < tableTransactions.rowCount; i++) {
        var row = tableTransactions.row(i);
        var description = String(row.value("Description") || "");
        if (description.indexOf(this.descriptionPrefix) !== 0)
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

/* Il file contabile deve essere in partita doppia o entrate/uscite */
CorrispettiviImport.prototype.verifyFileType = function () {
    if (this.accountingInfo.isDoubleEntry || this.accountingInfo.isIncomeExpenses)
        return true;
    this.message("Tipo di file contabile non supportato: l'importazione dei corrispettivi " +
        "richiede una contabilità in partita doppia o entrate/uscite.");
    return false;
};
