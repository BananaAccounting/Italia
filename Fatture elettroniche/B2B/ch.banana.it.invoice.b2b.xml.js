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
//
// @id = ch.banana.it.invoice.b2b.xml
// @api = 1.0
// @pubdate = 2018-08-24
// @publisher = Banana.ch SA
// @description = [DEV] Esporta fattura (PDF, XML)
// @description.it = [DEV] Esporta fattura (PDF, XML)
// @doctype = *
// @includejs = efattura.js
// @includejs = ch.banana.it.invoice.it05.js
// @task = app.command
// @inputdatasource = none
// @timeout = -1

//TODO: aggiungere partita iva nella stampa


var docTableStart = "110mm";


function exec(inData, options)
{
    if (!Banana.document)
    {
        return "@Cancel";
    }

    var param = {};
    if (inData.length > 0)
    {
        param = JSON.parse(inData);
    }
    else if (options && options.useLastSettings)
    {

        param = JSON.parse(Banana.document.getScriptSettings());
    }
    else
    {
        if (!settingsDialog())
            return "@Cancel";
        param = JSON.parse(Banana.document.getScriptSettings());
    }
    
    var jsonInvoice = {};
    if (param.selezione == 0 && param.selezioneNoFattura.length > 0)
        jsonInvoice = getInvoiceJson(param.selezioneNoFattura);

    if (param.output == 0)
    {
        var repDocObj = Banana.Report.newReport('');
        var repStyleObj = Banana.Report.newStyleSheet();
        repStyleObj.addStyle("@page").setAttribute("margin", "0");
        repDocObj = printInvoice(jsonInvoice, repDocObj, param, repStyleObj)
        setInvoiceStyle(repDocObj, repStyleObj, param)
        Banana.Report.preview(repDocObj, repStyleObj);
    }
    else
    {
        printXML(jsonInvoice);
    }
}

/*Update script's parameters*/
function settingsDialog()
{
    var savedParam = Banana.document.getScriptSettings();
    var param;
    if (savedParam.length > 0)
    {
        param = JSON.parse(savedParam)
    }
    else
    {
        param = initParam();
    }

    verifyParam(param);
    /*
    param.selezione
    0=fattura, 1=cliente
    param.stampa
    0=pdf, 1=xml
    */
    var dialog = Banana.Ui.createUi("ch.banana.it.invoice.b2b.xml.dialog.ui");
    var numeroFatturaRadioButton = dialog.tabWidget.findChild('numeroFatturaRadioButton');
    var clienteRadioButton = dialog.tabWidget.findChild('clienteRadioButton');
    var numeroFatturaLineEdit = dialog.tabWidget.findChild('numeroFatturaLineEdit');
    var clienteComboBox = dialog.tabWidget.findChild('clienteComboBox');
    var stampaPDFRadioButton = dialog.tabWidget.findChild('stampaPDFRadioButton');
    var stampaXmlRadioButton = dialog.tabWidget.findChild('stampaXmlRadioButton');

    var printHeaderCheckBox = dialog.tabWidget.findChild('printHeaderCheckBox');
    var printLogoCheckBox = dialog.tabWidget.findChild('printLogoCheckBox');
    var fontTypeLineEdit = dialog.tabWidget.findChild('fontTypeLineEdit');
    var bgColorLineEdit = dialog.tabWidget.findChild('bgColorLineEdit');
    var textColorLineEdit = dialog.tabWidget.findChild('textColorLineEdit');


    var numeroProgressivoLineEdit = dialog.tabWidget.findChild('numeroProgressivoLineEdit');


    //Lettura dati
    var elencoClienti = getCustomers();
    //clienteComboBox.currentText = param.selezioneNoCliente;
    clienteComboBox.addItems(elencoClienti);

    if (param.selezione == 1)
        clienteRadioButton.checked = true;
    else
        numeroFatturaRadioButton.checked = true;

    var selectedRow = parseInt(Banana.document.cursor.rowNr);
    var noFattura = '';
    if (Banana.document.table('Transactions') && Banana.document.table('Transactions').rowCount > selectedRow)
    {
        var noFattura = Banana.document.table('Transactions').value(selectedRow, "DocInvoice");
    }
    numeroFatturaLineEdit.text = noFattura;

    numeroProgressivoLineEdit.text = param.progressive || '0';

    if (param.output == 1)
        stampaXmlRadioButton.checked = true;
    else
        stampaPDFRadioButton.checked = true;

    printHeaderCheckBox.checked = param.print_header;
    printLogoCheckBox.checked = param.print_logo;
    fontTypeLineEdit.text = param.font_family;
    bgColorLineEdit.text = param.color_1;
    textColorLineEdit.text = param.color_2;

    dialog.checkdata = function ()
    {
        dialog.accept();
    }
    dialog.enableButtons = function ()
    {
        if (numeroFatturaRadioButton.checked)
        {
            numeroFatturaLineEdit.enabled = true;
            clienteComboBox.enabled = false;
        }
        else
        {
            numeroFatturaLineEdit.enabled = false;
            clienteComboBox.enabled = true;
        }
    }
    dialog.showHelp = function ()
    {
        Banana.Ui.showHelp("ch.banana.it.invoice.b2b.xml.dialog.ui");
    }
    dialog.buttonBox.accepted.connect(dialog, dialog.checkdata);
    dialog.buttonBox.helpRequested.connect(dialog, dialog.showHelp);
    numeroFatturaRadioButton.clicked.connect(dialog.enableButtons);
    clienteRadioButton.clicked.connect(dialog.enableButtons);

    //Visualizzazione dialogo
    Banana.application.progressBar.pause();
    dialog.enableButtons();
    var dlgResult = dialog.exec();
    Banana.application.progressBar.resume();
    if (dlgResult !== 1)
        return false;

    //Salvataggio dati

    param.selezioneNoFattura = numeroFatturaLineEdit.text;
    param.selezioneNoCliente = clienteComboBox.currentText;
    if (clienteRadioButton.checked)
        param.selezione = 1;
    else
        param.selezione = 0;
    if (stampaXmlRadioButton.checked)
        param.output = 1;
    else
        param.output = 0;

    param.print_header = printHeaderCheckBox.checked ;
    param.print_logo = printLogoCheckBox.checked;
    param.font_family = fontTypeLineEdit.text;
    param.color_1 = bgColorLineEdit.text ;
    param.color_2 = textColorLineEdit.text;
    
    param.progressive = parseInt(numeroProgressivoLineEdit.text);
    var paramToString = JSON.stringify(param);
    Banana.document.setScriptSettings(paramToString);
    return true;
}

getCustomers = function ()
{
    var customersList = [];
    var journal = Banana.document.invoicesCustomers();
    for (var i = 0; i < journal.rowCount; i++)
    {
        var tRow = journal.row(i);
        if (tRow.value('ObjectType') === 'InvoiceDocument')
        {
            var customerId = JSON.parse(tRow.value('CounterpartyId'));
            if (customersList.indexOf(customerId) < 0)
                customersList.push(customerId);
        }
    }
    var tableAccounts = Banana.document.table('Accounts');
    if (tableAccounts)
    {
        for (var i = 0; i < customersList.count; i++)
        {
            var row = tableAccounts.findRowByValue('Account', customersList[i]);
            if (row >= 0)
                customersList[i] = customersList[i] + ' ' + tableAccounts.value(row, "Description");
        }
    }
    return customersList;
}

getInvoiceJson = function (number)
{

    var journal = Banana.document.invoicesCustomers();
    var jsonInvoice = {};

    for (var i = 0; i < journal.rowCount; i++)
    {
        var tRow = journal.row(i);
        if (tRow.value('ObjectJSonData') && tRow.value('ObjectType') === 'InvoiceDocument')
        {
            var jsonData = {};
            jsonData = JSON.parse(tRow.value('ObjectJSonData'));
            if (jsonData.InvoiceDocument.document_info.number === number)
            {
                return jsonData.InvoiceDocument;
            }
        }
    }

    return jsonInvoice;
}

printXML = function (jsonInvoice)
{

    var eFattura = new EFattura(this.banDocument);
    eFattura.initDatiContribuente();
    if (!eFattura.datiContribuente)
        return;
    var xmlDocument = Banana.Xml.newDocument("root");
    eFattura.createInstance(xmlDocument, jsonInvoice);
    var output = Banana.Xml.save(xmlDocument);
    if (output != "@Cancel")
    {
        eFattura.saveData(output);
    }
}

verifyBananaVersion = function ()
{
    if (!Banana.document)
        return false;
    if (typeof (Banana.document.invoicesCustomers) === 'undefined')
    {
        var msg = this.getErrorMessage(this.ID_ERR_VERSION, 'it');
        msg = msg.replace("%1", 'Banana.document.invoicesCustomers');
        this.banDocument.addMessage(msg, this.ID_ERR_VERSION);
        return false;
    }
    else if (typeof (Banana.IO) === 'undefined')
    {
        var msg = this.getErrorMessage(this.ID_ERR_VERSION, 'it');
        msg = msg.replace("%1", 'Banana.IO');
        this.banDocument.addMessage(msg, this.ID_ERR_VERSION);
        return false;
    }
    else if (typeof (Banana.Xml.newDocument) === 'undefined')
    {
        var msg = this.getErrorMessage(this.ID_ERR_VERSION, 'it');
        msg = msg.replace("%1", 'Banana.Xml.newDocument');
        this.banDocument.addMessage(msg, this.ID_ERR_VERSION);
        return false;
    }
    //Check the version of Banana
    //var requiredVersion = "9.0.?";
    //if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) >= 0) { }
    return true;
}

