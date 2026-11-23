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
// @id = ch.banana.it.import.efattura.settings
// @api = 1.0
// @pubdate = 2026-11-20
// @publisher = Banana.ch SA
// @description = Impostazioni...
// @description.it = Impostazioni...
// @doctype = *
// @task = app.command
// @inputdatasource = none
// @timeout = -1

function exec(inData, options) {
    if (!Banana.document)
        return false;

    return settingsDialog();
}

/*
 * Metodo chiamato per aggiornare i parametri dell'estensione Importazione documenti fiscali italiani
*/
function settingsDialog() {
    var settings = new Settings(Banana.document);
    return settings.showDialog();
}

function Settings(banDocument) {
    this.banDocument = banDocument;
    if (this.banDocument === undefined)
        this.banDocument = Banana.document;

    this.ID_ERR_LICENSE_NOTVALID = "ID_ERR_LICENSE_NOTVALID";
    this.ID_ERR_VERSION_NOTSUPPORTED = "ID_ERR_VERSION_NOTSUPPORTED";
}

/* versione corrente dei parametri */
Settings.VERSION = "1.1";
/* valori del parametro dataRegistrazione */
Settings.DATA_IMPORTAZIONE = "Data di importazione";
Settings.DATA_DOCUMENTO = "Data del documento";

/*
 * Aggiunge un parametro all'elenco mostrato nel dialogo
*/
Settings.prototype.addParam = function (convertedParam, param, name, title, type, defaultValue, items) {
    var currentParam = {};
    currentParam.name = name;
    currentParam.title = title;
    currentParam.type = type;
    if (type === 'bool') {
        currentParam.value = param[name] ? true : false;
    }
    else {
        currentParam.value = (param[name] === undefined || param[name] === null) ?
            (defaultValue === undefined ? '' : defaultValue) : param[name];
    }
    if (defaultValue !== undefined)
        currentParam.defaultvalue = defaultValue;
    if (items)
        currentParam.items = items;
    currentParam.readValue = function () {
        param[name] = this.value;
    }
    convertedParam.data.push(currentParam);
    return currentParam;
}

Settings.prototype.convertParam = function (param) {

    var convertedParam = {};
    convertedParam.version = '1.0';
    /*array dei parametri dello script*/
    convertedParam.data = [];

    /* ---- codici IVA e contropartite, validi per entrambe le importazioni ---- */

    this.addParam(convertedParam, param, 'tabellaCodiciIva',
        'Codici IVA e contropartite (una riga per aliquota)', 'multilinestring', '');

    /* ---- fatture elettroniche ---- */

    this.addParam(convertedParam, param, 'contoContropartitaAcquisti',
        'Fatture: conto contropartita acquisti (costi)', 'string', '');

    this.addParam(convertedParam, param, 'contoContropartitaVendite',
        'Fatture: conto contropartita vendite (ricavi)', 'string', '');

    this.addParam(convertedParam, param, 'dataRegistrazione',
        'Fatture: data della registrazione', 'combobox', Settings.DATA_IMPORTAZIONE,
        Array(Settings.DATA_IMPORTAZIONE, Settings.DATA_DOCUMENTO));

    this.addParam(convertedParam, param, 'creaContiMancanti',
        'Fatture: creare i conti clienti/fornitori mancanti', 'bool', true);

    this.addParam(convertedParam, param, 'gruppoClienti',
        'Fatture: gruppo clienti (se non indicato nei dati base)', 'string', '');

    this.addParam(convertedParam, param, 'gruppoFornitori',
        'Fatture: gruppo fornitori (se non indicato nei dati base)', 'string', '');

    this.addParam(convertedParam, param, 'numerazioneClienti',
        'Fatture: numero iniziale dei conti clienti', 'number', '10000');

    this.addParam(convertedParam, param, 'numerazioneFornitori',
        'Fatture: numero iniziale dei conti fornitori', 'number', '20000');

    this.addParam(convertedParam, param, 'contoRitenuta',
        'Fatture: conto ritenuta d\'acconto', 'string', '');

    this.addParam(convertedParam, param, 'contoBollo',
        'Fatture: conto imposta di bollo', 'string', '');

    this.addParam(convertedParam, param, 'contoCassaPrevidenziale',
        'Fatture: conto cassa previdenziale', 'string', '');

    this.addParam(convertedParam, param, 'contoArrotondamento',
        'Fatture: conto arrotondamenti e differenze', 'string', '');

    /* ---- corrispettivi telematici ---- */

    this.addParam(convertedParam, param, 'contoContanti',
        'Corrispettivi: conto contanti', 'string', '');

    this.addParam(convertedParam, param, 'contoPagamentiElettronici',
        'Corrispettivi: conto pagamenti elettronici', 'string', '');

    this.addParam(convertedParam, param, 'contoContropartita',
        'Corrispettivi: conto contropartita (ricavi)', 'string', '[CA]');

    this.addParam(convertedParam, param, 'contoTicket',
        'Corrispettivi: conto ticket e buoni fatturati a terzi', 'string', '');

    this.addParam(convertedParam, param, 'contoSconti',
        'Corrispettivi: conto sconti concessi', 'string', '');

    this.addParam(convertedParam, param, 'contoNonRiscosso',
        'Corrispettivi: conto corrispettivi non riscossi', 'string', '');

    this.addParam(convertedParam, param, 'contoBeniInSospeso',
        'Corrispettivi: conto acconti e beni in sospeso', 'string', '');

    this.addParam(convertedParam, param, 'contoOmaggi',
        'Corrispettivi: conto omaggi', 'string', '');

    this.addParam(convertedParam, param, 'codiceIvaVentilazione',
        'Corrispettivi: codice IVA per la ventilazione', 'string', '');

    return convertedParam;
}

Settings.prototype.getErrorMessage = function (errorId) {
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

Settings.prototype.initParam = function () {
    var param = {};
    param.version = Settings.VERSION;

    /* codici IVA e contropartite per aliquota/natura */
    param.tabellaCodiciIva = '';

    /* fatture elettroniche */
    param.contoContropartitaAcquisti = '';
    param.contoContropartitaVendite = '';
    param.dataRegistrazione = Settings.DATA_IMPORTAZIONE;
    param.creaContiMancanti = true;
    param.gruppoClienti = '';
    param.gruppoFornitori = '';
    param.numerazioneClienti = '10000';
    param.numerazioneFornitori = '20000';
    param.contoRitenuta = '';
    param.contoBollo = '';
    param.contoCassaPrevidenziale = '';
    param.contoArrotondamento = '';

    /* corrispettivi telematici */
    param.contoContanti = '';
    param.contoPagamentiElettronici = '';
    param.contoContropartita = '[CA]';
    param.contoTicket = '';
    param.contoSconti = '';
    param.contoNonRiscosso = '';
    param.contoBeniInSospeso = '';
    param.contoOmaggi = '';
    param.codiceIvaVentilazione = '';

    /* parametri della versione 1.0, mantenuti per compatibilità:
       vengono travasati in tabellaCodiciIva dalla migrazione */
    param.codiceIva22 = '';
    param.codiceIva10 = '';
    param.codiceIva04 = '';

    return param;
}

Settings.prototype.loadAccountingInfo = function () {
    var accountingInfo = {};
    accountingInfo.isDoubleEntry = false;
    accountingInfo.isIncomeExpenses = false;
    accountingInfo.isCashBook = false;
    accountingInfo.multiCurrency = false;
    accountingInfo.withVat = false;
    accountingInfo.vatAccount = "";
    accountingInfo.customersGroup = "";
    accountingInfo.suppliersGroup = "";
    accountingInfo.vatNumber = "";
    accountingInfo.fiscalNumber = "";
    accountingInfo.baseCurrency = "";

    if (this.banDocument) {
        var fileGroup = this.banDocument.info("Base", "FileTypeGroup");
        var fileNumber = this.banDocument.info("Base", "FileTypeNumber");
        var fileVersion = this.banDocument.info("Base", "FileTypeVersion");

        if (fileGroup == "100")
            accountingInfo.isDoubleEntry = true;
        else if (fileGroup == "110")
            accountingInfo.isIncomeExpenses = true;
        else if (fileGroup == "130")
            accountingInfo.isCashBook = true;

        if (fileNumber == "110") {
            accountingInfo.withVat = true;
        }
        if (fileNumber == "120") {
            accountingInfo.multiCurrency = true;
        }
        if (fileNumber == "130") {
            accountingInfo.multiCurrency = true;
            accountingInfo.withVat = true;
        }

        if (this.banDocument.info("AccountingDataBase", "VatAccount"))
            accountingInfo.vatAccount = this.banDocument.info("AccountingDataBase", "VatAccount");

        if (this.banDocument.info("AccountingDataBase", "CustomersGroup"))
            accountingInfo.customersGroup = this.banDocument.info("AccountingDataBase", "CustomersGroup");
        if (this.banDocument.info("AccountingDataBase", "SuppliersGroup"))
            accountingInfo.suppliersGroup = this.banDocument.info("AccountingDataBase", "SuppliersGroup");

        if (this.banDocument.info("AccountingDataBase", "VatNumber"))
            accountingInfo.vatNumber = this.banDocument.info("AccountingDataBase", "VatNumber");
        if (this.banDocument.info("AccountingDataBase", "FiscalNumber"))
            accountingInfo.fiscalNumber = this.banDocument.info("AccountingDataBase", "FiscalNumber");

        if (this.banDocument.info("AccountingDataBase", "BasicCurrency"))
            accountingInfo.baseCurrency = this.banDocument.info("AccountingDataBase", "BasicCurrency");
    }
    return accountingInfo;
}

/*
 * Converte il testo di tabellaCodiciIva in un oggetto.
 * Ogni riga ha la forma CHIAVE=codiceIva[,contropartita], dove CHIAVE è il
 * segnaposto generato dalle estensioni senza le parentesi quadre:
 * la lettera A per gli acquisti o V per le vendite, l'aliquota con due decimali
 * e, se presente, il codice natura separato da _ . Per esempio:
 *   A22.00=M22
 *   V22.00=V22,3000
 *   A0.00_N6.1=M22-RC,6000
 * Le righe vuote e quelle che iniziano con # o // vengono ignorate.
*/
Settings.prototype.parseVatTable = function (param) {
    var table = {};
    if (!param || !param.tabellaCodiciIva)
        return table;
    var lines = String(param.tabellaCodiciIva).split(/[\r\n]+/);
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (line.length <= 0 || line.indexOf('#') === 0 || line.indexOf('//') === 0)
            continue;
        var pos = line.indexOf('=');
        if (pos <= 0)
            continue;
        var key = line.substring(0, pos).trim().toUpperCase();
        //la chiave può essere indicata anche tra parentesi quadre
        key = key.replace(/^\[/, '').replace(/\]$/, '');
        if (key.length <= 0)
            continue;
        var value = line.substring(pos + 1).trim();
        var parts = value.split(',');
        table[key] = {
            "vatCode": parts[0] ? parts[0].trim() : '',
            "account": parts.length > 1 && parts[1] ? parts[1].trim() : ''
        };
    }
    return table;
}

Settings.prototype.showDialog = function () {
    if (!this.verifyBananaVersion())
        return false;

    if (typeof (Banana.Ui.openPropertyEditor) === 'undefined')
        return false;

    var param = this.initParam();
    var savedParam = Banana.document.getScriptSettings("import_efattura");
    if (savedParam && savedParam.length > 0) {
        param = JSON.parse(savedParam);
        param = this.verifyParam(param);
    }

    var dialogTitle = 'Settings';
    var convertedParam = this.convertParam(param);
    var pageAnchor = 'ch.banana.it.import.efattura';
    if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor))
        return false;
    for (var i = 0; i < convertedParam.data.length; i++) {
        // Read values to param (through the readValue function)
        convertedParam.data[i].readValue();
    }

    var paramToString = JSON.stringify(param);
    var value = Banana.document.setScriptSettings("import_efattura", paramToString);
    return true;
}

/*
 * Porta i parametri della versione 1.0 alla versione corrente:
 * i tre codici IVA per aliquota diventano righe di tabellaCodiciIva.
 * Erano usati soltanto dai corrispettivi, che sono sempre vendite,
 * quindi vengono convertiti in chiavi con il prefisso V.
*/
Settings.prototype.migrateParam = function (param) {
    var lines = [];
    if (param.tabellaCodiciIva)
        lines.push(String(param.tabellaCodiciIva).trim());
    var legacy = [
        { "name": 'codiceIva22', "key": 'V22.00' },
        { "name": 'codiceIva10', "key": 'V10.00' },
        { "name": 'codiceIva04', "key": 'V4.00' }
    ];
    for (var i = 0; i < legacy.length; i++) {
        var code = param[legacy[i].name];
        if (code && String(code).trim().length > 0)
            lines.push(legacy[i].key + "=" + String(code).trim());
    }
    param.tabellaCodiciIva = lines.join("\n");
    param.version = Settings.VERSION;
    return param;
}

Settings.prototype.verifyParam = function (param) {
    if (!param || !param.version)
        return this.initParam();

    if (param.version === "1.0")
        param = this.migrateParam(param);

    if (param.version !== Settings.VERSION)
        return this.initParam();

    //completa i parametri mancanti con i valori predefiniti
    var defaults = this.initParam();
    for (var name in defaults) {
        if (name === 'version')
            continue;
        if (param[name] === undefined || param[name] === null)
            param[name] = defaults[name];
    }

    if (param.dataRegistrazione !== Settings.DATA_DOCUMENTO)
        param.dataRegistrazione = Settings.DATA_IMPORTAZIONE;

    param.creaContiMancanti = param.creaContiMancanti ? true : false;

    return param;
}

Settings.prototype.verifyBananaVersion = function () {
    if (!this.banDocument)
        return false;

    //Banana+ is required
    var requiredVersion = "10.2";
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
