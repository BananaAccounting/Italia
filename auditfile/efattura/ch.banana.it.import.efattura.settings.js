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
// @pubdate = 2026-10-11
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

Settings.prototype.convertParam = function (param) {

    var convertedParam = {};
    convertedParam.version = '1.0';
    /*array dei parametri dello script*/
    convertedParam.data = [];

    var currentParam = {};
    currentParam.name = 'codice_iva_22';
    currentParam.title = 'Codice IVA aliquota 22%';
    currentParam.type = 'string';
    currentParam.value = param.codice_iva_22 ? param.codice_iva_22 : '';
    currentParam.readValue = function () {
        param.codice_iva_22 = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'codice_iva_10';
    currentParam.title = 'Codice IVA aliquota 10%';
    currentParam.type = 'string';
    currentParam.value = param.codice_iva_10 ? param.codice_iva_10 : '';
    currentParam.readValue = function () {
        param.codice_iva_10 = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'codice_iva_04';
    currentParam.title = 'Codice IVA aliquota 4%';
    currentParam.type = 'string';
    currentParam.value = param.codice_iva_04 ? param.codice_iva_04 : '';
    currentParam.readValue = function () {
        param.codice_iva_04 = this.value;
    }
    convertedParam.data.push(currentParam);

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
    param.version = "1.0";
    param.codice_iva_22 = '';
    param.codice_iva_10 = '';
    param.codice_iva_04 = '';
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

Settings.prototype.showDialog = function () {
    if (!this.verifyBananaVersion())
        return false;

    if (typeof (Banana.Ui.openPropertyEditor) === 'undefined')
        return false;

    var param = this.initParam();
    var savedParam = Banana.document.getScriptSettings("import_efattura");
    if (savedParam.length > 0) {
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
    if (!param || !param.version || param.version != "1.0") {
        return this.initParam();
    }

    if (!param.codice_iva_22)
        param.codice_iva_22 = '';

    if (!param.codice_iva_10)
        param.codice_iva_10 = '';

    if (!param.codice_iva_04)
        param.codice_iva_04 = '';

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