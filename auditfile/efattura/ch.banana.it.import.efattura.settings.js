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
// @pubdate = 2026-11-23
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
Settings.VERSION = "1.0";
/* valori del parametro dataRegistrazione */
Settings.DATA_IMPORTAZIONE = "Data di importazione";
Settings.DATA_DOCUMENTO = "Data del documento";


/*
 * Aggiunge un gruppo di parametri al dialogo.
 * I gruppi sono elementi non modificabili utilizzati
 * come contenitori per i parametri figli.
 */
Settings.prototype.addGroup = function (convertedParam, name, title, collapse) {
    var group = {};

    group.name = name;
    group.title = title;
    group.type = 'string';
    group.value = '';
    group.editable = false;
    group.collapse = collapse === true;

    // Il gruppo non corrisponde a un parametro da salvare.
    group.readValue = function () {};

    convertedParam.data.push(group);
    return group;
};


/*
 * Aggiunge un parametro all'elenco mostrato nel dialogo.
 *
 * parentObject: nome del gruppo di appartenenza
 * tooltip: descrizione visualizzata al passaggio del mouse
 */
Settings.prototype.addParam = function (
    convertedParam,
    param,
    name,
    title,
    type,
    defaultValue,
    items,
    parentObject,
    tooltip
) {
    var currentParam = {};

    currentParam.name = name;
    currentParam.title = title;
    currentParam.type = type;

    if (parentObject) {
        currentParam.parentObject = parentObject;
    }

    if (tooltip) {
        currentParam.tooltip = tooltip;
    }

    // Utilizza il valore salvato oppure quello predefinito.
    var value = param[name];

    if (value === undefined || value === null) {
        value = defaultValue === undefined ? '' : defaultValue;
    }

    if (type === 'bool') {
        currentParam.value = (
            value === true ||
            value === 'true' ||
            value === 1
        );
    }
    else {
        currentParam.value = value;
    }

    if (defaultValue !== undefined) {
        currentParam.defaultvalue = defaultValue;
    }

    if (items) {
        currentParam.items = items;
    }

    currentParam.readValue = function () {
        param[name] = this.value;
    };

    convertedParam.data.push(currentParam);
    return currentParam;
}


/*
 * Converte i parametri per il PropertyEditor.
 */
Settings.prototype.convertParam = function (param) {

    var convertedParam = {
        version: '1.0',
        data: []
    };

    //propone i gruppi clienti/fornitori impostati nel piano dei conti
    var accountingInfo = this.loadAccountingInfo();
    if (!param.gruppoClienti || !param.gruppoFornitori) {
        if (!param.gruppoClienti)
            param.gruppoClienti = accountingInfo.customersGroup || '';

        if (!param.gruppoFornitori)
            param.gruppoFornitori = accountingInfo.suppliersGroup || '';
    }

    // =====================================================
    // GENERALE
    // =====================================================

    this.addGroup(
        convertedParam,
        'generale',
        'Generale',
        false
    );

    this.addParam(
        convertedParam,
        param,
        'dataRegistrazione',
        'Data di registrazione',
        'combobox',
        Settings.DATA_IMPORTAZIONE,
        [
            Settings.DATA_IMPORTAZIONE,
            Settings.DATA_DOCUMENTO
        ],
        'generale',
        'Data utilizzata nella colonna Data delle registrazioni.\n'
        + 'Data di importazione: giorno in cui si importa il file XML.\n'
        + 'Data del documento: data della fattura o della '
        + 'rilevazione dei corrispettivi.'
    );


    // =====================================================
    // FATTURE ELETTRONICHE
    // =====================================================

    this.addGroup(
        convertedParam,
        'fatture',
        'Fatture elettroniche',
        false
    );

    this.addParam(
        convertedParam,
        param,
        'tabellaCodiciIvaFatture',
        'Associazione codici IVA e conti',
        'multilinestring',
        '',
        null,
        'fatture',
        'Associa le aliquote e le nature IVA delle fatture '
        + 'ai codici IVA di Banana e, facoltativamente, '
        + 'ai conti di contropartita.\n'
        + 'Formato: Chiave=CodiceIVA[,Conto]\n'
        + 'Esempi:\n'
        + 'A22.00=B22-AL\n'
        + 'A10.00=B10-AL\n'
        + 'V22.00=Z22,3000\n'
        + 'A0.00_N2.2=A-NE3,6000\n'
        + 'A = acquisti, V = vendite.'
    );

    this.addParam(
        convertedParam,
        param,
        'contoContropartitaAcquisti',
        'Conto acquisti',
        'string',
        '[CONTO_ACQUISTI]',
        null,
        'fatture',
        'Conto di costo utilizzato come contropartita '
        + 'per le fatture di acquisto.'
    );

    this.addParam(
        convertedParam,
        param,
        'contoContropartitaVendite',
        'Conto vendite',
        'string',
        '[CONTO_VENDITE]',
        null,
        'fatture',
        'Conto di ricavo utilizzato come contropartita '
        + 'per le fatture di vendita.'
    );

    this.addParam(
        convertedParam,
        param,
        'creaContiMancanti',
        'Crea clienti e fornitori mancanti',
        'bool',
        true,
        null,
        'fatture',
        'Crea automaticamente i conti clienti e fornitori '
        + 'che non sono ancora presenti nel piano dei conti.'
    );

    this.addParam(
        convertedParam,
        param,
        'gruppoClienti',
        'Gruppo clienti',
        'string',
        accountingInfo.customersGroup || '',
        null,
        'fatture',
        'Gruppo in cui inserire i nuovi conti clienti, '
        + 'se non specificato nei dati base.'
    );

    this.addParam(
        convertedParam,
        param,
        'gruppoFornitori',
        'Gruppo fornitori',
        'string',
        accountingInfo.suppliersGroup || '',
        null,
        'fatture',
        'Gruppo in cui inserire i nuovi conti fornitori, '
        + 'se non specificato nei dati base.'
    );

    this.addParam(
        convertedParam,
        param,
        'numerazioneClienti',
        'Numerazione iniziale clienti',
        'number',
        '10000',
        null,
        'fatture',
        'Numero iniziale utilizzato per la creazione '
        + 'automatica dei nuovi conti clienti.'
    );

    this.addParam(
        convertedParam,
        param,
        'numerazioneFornitori',
        'Numerazione iniziale fornitori',
        'number',
        '20000',
        null,
        'fatture',
        'Numero iniziale utilizzato per la creazione '
        + 'automatica dei nuovi conti fornitori.'
    );

    this.addParam(
        convertedParam,
        param,
        'contoRitenuta',
        'Conto ritenute d\'acconto',
        'string',
        '[CONTO_RITENUTE_ACCONTO]',
        null,
        'fatture',
        'Conto utilizzato per contabilizzare '
        + 'le ritenute d\'acconto presenti nelle fatture.'
    );

    this.addParam(
        convertedParam,
        param,
        'contoBollo',
        'Conto imposta di bollo',
        'string',
        '[CONTO_IMPOSTA_BOLLO]',
        null,
        'fatture',
        'Conto utilizzato per gli importi relativi '
        + 'all\'imposta di bollo indicata nelle fatture.'
    );

    this.addParam(
        convertedParam,
        param,
        'contoCassaPrevidenziale',
        'Conto cassa previdenziale',
        'string',
        '[CONTO_CASSA_PREVIDENZIALE]',
        null,
        'fatture',
        'Conto utilizzato per i contributi '
        + 'della cassa previdenziale presenti nelle fatture.'
    );

    this.addParam(
        convertedParam,
        param,
        'contoArrotondamento',
        'Conto differenze e arrotondamenti',
        'string',
        '[CONTO_ARROTONDAMENTO]',
        null,
        'fatture',
        'Conto utilizzato per contabilizzare eventuali '
        + 'differenze e arrotondamenti.'
    );


    // =====================================================
    // CORRISPETTIVI TELEMATICI
    // =====================================================

    this.addGroup(
        convertedParam,
        'corrispettivi',
        'Corrispettivi telematici',
        false
    );

    this.addParam(
        convertedParam,
        param,
        'tabellaCodiciIvaCorrispettivi',
        'Associazione codici IVA e conti',
        'multilinestring',
        '',
        null,
        'corrispettivi',
        'Associa le aliquote e le nature IVA dei corrispettivi '
        + 'ai codici IVA di Banana e, facoltativamente, '
        + 'ai conti di contropartita.\n'
        + 'Formato: Chiave=CodiceIVA[,Conto]\n'
        + 'Esempi:\n'
        + 'V22.00=C22\n'
        + 'V10.00=C10\n'
        + 'V4.00=C04,3000\n'
        + 'Le chiavi V sono utilizzate internamente '
        + 'anche per i corrispettivi.'
    );

    this.addParam(
        convertedParam,
        param,
        'contoContanti',
        'Conto contanti',
        'string',
        '[CONTO_CONTANTI]',
        null,
        'corrispettivi',
        'Conto utilizzato per gli incassi in contanti.'
    );

    this.addParam(
        convertedParam,
        param,
        'contoPagamentiElettronici',
        'Conto pagamenti elettronici',
        'string',
        '[CONTO_PAG_ELETTRONICI]',
        null,
        'corrispettivi',
        'Conto utilizzato per gli incassi tramite '
        + 'carte di pagamento e altri strumenti elettronici.'
    );

    this.addParam(
        convertedParam,
        param,
        'contoContropartita',
        'Conto ricavi',
        'string',
        '[CA]',
        null,
        'corrispettivi',
        'Conto di ricavo utilizzato come contropartita '
        + 'per la registrazione dei corrispettivi.'
    );

    this.addParam(
        convertedParam,
        param,
        'contoTicket',
        'Conto ticket e buoni pasto',
        'string',
        '[CONTO_TICKET]',
        null,
        'corrispettivi',
        'Conto utilizzato per i corrispettivi pagati '
        + 'con ticket e buoni fatturati a terzi.'
    );

    this.addParam(
        convertedParam,
        param,
        'contoSconti',
        'Conto sconti concessi',
        'string',
        '[CONTO_SCONTI]',
        null,
        'corrispettivi',
        'Conto utilizzato per contabilizzare '
        + 'gli sconti concessi.'
    );

    this.addParam(
        convertedParam,
        param,
        'contoNonRiscosso',
        'Conto corrispettivi non riscossi',
        'string',
        '[CONTO_NON_RISCOSSO]',
        null,
        'corrispettivi',
        'Conto utilizzato per i corrispettivi '
        + 'non ancora riscossi.'
    );

    this.addParam(
        convertedParam,
        param,
        'contoBeniInSospeso',
        'Conto acconti e beni in sospeso',
        'string',
        '[CONTO_ACCONTI]',
        null,
        'corrispettivi',
        'Conto utilizzato per gli acconti '
        + 'e i beni in sospeso.'
    );

    this.addParam(
        convertedParam,
        param,
        'contoOmaggi',
        'Conto omaggi',
        'string',
        '[CONTO_OMAGGI]',
        null,
        'corrispettivi',
        'Conto utilizzato per la contabilizzazione '
        + 'degli omaggi.'
    );

    this.addParam(
        convertedParam,
        param,
        'codiceIvaVentilazione',
        'Codice IVA per ventilazione',
        'string',
        '[CV]',
        null,
        'corrispettivi',
        'Codice IVA utilizzato per i corrispettivi '
        + 'soggetti a ventilazione IVA.'
    );

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
    param.tabellaCodiciIvaFatture = '';
    param.tabellaCodiciIvaCorrispettivi = '';

    /* generale */
    param.dataRegistrazione = Settings.DATA_IMPORTAZIONE;

    /* fatture elettroniche */
    param.contoContropartitaAcquisti = '[CONTO_ACQUISTI]';
    param.contoContropartitaVendite = '[CONTO_VENDITE]';
    param.creaContiMancanti = true;
    param.gruppoClienti = '';
    param.gruppoFornitori = '';
    param.numerazioneClienti = '10000';
    param.numerazioneFornitori = '20000';
    param.contoRitenuta = '[CONTO_RITENUTE_ACCONTO]';
    param.contoBollo = '[CONTO_IMPOSTA_BOLLO]';
    param.contoCassaPrevidenziale = '[CONTO_CASSA_PREVIDENZIALE]';
    param.contoArrotondamento = '[CONTO_ARROTONDAMENTO]';

    /* corrispettivi telematici */
    param.contoContanti = '[CONTO_CONTANTI]';
    param.contoPagamentiElettronici = '[CONTO_PAG_ELETTRONICI]';
    param.contoContropartita = '[CA]';
    param.contoTicket = '[CONTO_TICKET]';
    param.contoSconti = '[CONTO_SCONTI]';
    param.contoNonRiscosso = '[CONTO_NON_RISCOSSO]';
    param.contoBeniInSospeso = '[CONTO_ACCONTI]';
    param.contoOmaggi = '[CONTO_OMAGGI]';
    param.codiceIvaVentilazione = '[CV]';

    return param;
};

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
Settings.prototype.parseVatTable = function (param, tipoImportazione) {
    var table = {};
    var nomeParametro = tipoImportazione === 'corrispettivi' ?
        'tabellaCodiciIvaCorrispettivi' :
        'tabellaCodiciIvaFatture';
    if (!param || !param[nomeParametro])
        return table;
    var lines = String(param[nomeParametro]).split(/[\r\n]+/);
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

Settings.prototype.verifyParam = function (param) {
    if (!param || !param.version)
        return this.initParam();

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

/*
 * Determina se un importo XML è al netto o al lordo dell'IVA,
 * confrontando l'imposta dichiarata con quella calcolata
 * applicando l'aliquota o scorporandola dall'importo.
 *
 * Parametri:
 *   importo  - importo indicato nel file XML
 *   imposta  - importo IVA dichiarato nel file XML
 *   aliquota - aliquota IVA in percentuale
 *
 * Valori restituiti:
 *   "1"  - importo al netto dell'IVA (IVA esclusa)
 *   "0"  - importo al lordo dell'IVA (IVA inclusa)
 *   null - valori non validi, incoerenti o ambigui
 *
 * Il confronto ammette una tolleranza di un centesimo.
 * Con aliquota zero non è possibile distinguere netto e lordo.
 *
 */

Settings.prototype.getVatAmountType = function (
    importo, imposta, aliquota
) {
    var amount = Number(importo);
    var vat = Number(imposta);
    var rate = Number(String(aliquota).replace(",", "."));

    if (!isFinite(amount) || !isFinite(vat) ||
        !isFinite(rate) || rate <= 0) {
        return null;
    }

    // IVA calcolata sull'importo netto
    var ivaNetto = Math.round(amount * rate * 100 / 100) / 100;

    // IVA scorporata dall'importo lordo
    var ivaLordo = Math.round(
        amount * rate / (100 + rate) * 100
    ) / 100;

    var differenzaNetto = Math.abs(vat - ivaNetto);
    var differenzaLordo = Math.abs(vat - ivaLordo);

    // Tolleranza di un centesimo
    var nettoValido = differenzaNetto <= 0.01;
    var lordoValido = differenzaLordo <= 0.01;

    if (nettoValido && !lordoValido)
        return "1";

    if (lordoValido && !nettoValido)
        return "0";

    return null;
};
