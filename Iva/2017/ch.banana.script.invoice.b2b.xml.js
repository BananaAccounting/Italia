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
// @id = ch.banana.script.invoice.b2b.xml.js
// @api = 1.0
// @pubdate = 2018-08-14
// @publisher = Banana.ch SA
// @description = Esporta fattura (PDF, XML)
// @description.it = Esporta fattura (PDF, XML)
// @doctype = *
// @includejs = 
// @task = app.command
// @inputdatasource = none
// @timeout = -1

var rowNumber = 0;
var pageNr = 1;
var repTableObj = "";
var max_items_per_page = 31;

function exec()
{
  settingsDialog();
}


/*Update script's parameters*/
function settingsDialog() {
  var param = initParam();
  var savedParam = Banana.document.getScriptSettings();
  if (savedParam.length > 0) {
    param = JSON.parse(savedParam);
  }
  param = verifyParam(param);

  var dialog = Banana.Ui.createUi("ch.banana.script.invoice.b2b.xml.dialog.ui");



  Banana.console.debug(JSON.stringify(param));
  // XML settings
  var numeroFattura = dialog.tabWidget.findChild('numeroFatturaLineEdit');
  if (numeroFattura)
    numeroFattura.text = "" + param.numeroFattura;
  var progressivoInvio = dialog.tabWidget.findChild('numeroProgressivoLineEdit');
  if (progressivoInvio)
    progressivoInvio.text = "" + param.incremental;

  // PDF settings
  var numeroFattura2 = dialog.tabWidget.findChild('numeroFattura2LineEdit');
  if (numeroFattura2)
    numeroFattura2.text = "" + param.numeroFattura;
  var printHeader = dialog.tabWidget.findChild('printHeaderCheckBox');
  if (printHeader)
    printHeader.checked = param.print_header;
  var printLogo = dialog.tabWidget.findChild('printLogoCheckBox');
  if (printLogo)
    printLogo.checked = param.print_logo;
  var imageHeight = dialog.tabWidget.findChild('imageHeightLineEdit');
  if (imageHeight)
    imageHeight.text = param.image_height;
  var fontType = dialog.tabWidget.findChild('fontTypeLineEdit');
  if (fontType)
    fontType.text = param.font_family;
  var bgColor = dialog.tabWidget.findChild('bgColorLineEdit');
  if (bgColor)
    bgColor.text = param.color_1;
  var textColor = dialog.tabWidget.findChild('textColorLineEdit');
    if (textColor)
  textColor.text = param.color_2;

  dialog.enableButtons = function ()
  {
    if (printLogo.checked)
    {
      imageHeight.enabled = true;
      imageHeight.update();
    }
    else if (!printLogo.checked)
    {
      imageHeight.enabled = false;
      imageHeight.update();
    }
  }

  dialog.showHelp = function () {
    Banana.Ui.showHelp("ch.banana.script.italy_vat.daticontribuente.dialog.ui");
  }

  isEmpty = function(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
  }

  getInvoiceJson = function(number)
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
            Banana.console.log(parseInt(numeroFattura2.text))
            Banana.console.log(jsonData.InvoiceDocument.document_info.number)
            if (parseInt(jsonData.InvoiceDocument.document_info.number) === number)
              jsonInvoice = jsonData.InvoiceDocument
        }
    }

    return jsonInvoice;
  }

  getParam = function()
  {
    var newParam = initParam();
    if (numeroFattura)
      newParam.numeroFattura = parseInt(numeroFattura.text);
    if (progressivoInvio)
      newParam.incremental = parseInt(progressivoInvio.text);
    if (printHeader)
      newParam.print_header = printHeader.checked;
    if (printLogo)
      newParam.print_logo = printLogo.checked;
    if (imageHeight)
      newParam.image_height = imageHeight.text;
    if (fontType)
      newParam.font_family = fontType.text;
    if (bgColor)
      newParam.color_1 = bgColor.text;
    if (textColor)
      newParam.color_2 = textColor.text;

    Banana.console.log(JSON.stringify(newParam))
    return newParam;
  }

  dialog.print_pdf = function()
  {

    jsonInvoice = getInvoiceJson(parseInt(numeroFattura2.text))
  
    if (isEmpty(jsonInvoice))
      return;

    dialog.accept();
    print_PDF(jsonInvoice, getParam());
  }

  dialog.print_xml = function()
  {

    jsonInvoice = getInvoiceJson(parseInt(numeroFattura.text))
  
    if (isEmpty(jsonInvoice))
      return;

    progressivoInvio.text = parseInt(progressivoInvio.text) + 1;

    dialog.accept();
    print_XML(jsonInvoice, getParam());
  }

  dialog.buttonBox.helpRequested.connect(dialog, dialog.showHelp);

  printLogo.clicked.connect(dialog.enableButtons)
  
  var printPDF = dialog.tabWidget.findChild('printPDFButtonBox');
  printPDF.clicked.connect(dialog.print_pdf)

  var printXML = dialog.tabWidget.findChild('printXMLButtonBox');
  printXML.clicked.connect(dialog.print_xml)


  Banana.application.progressBar.pause();
  dialog.enableButtons();
  var dlgResult = dialog.exec();
  Banana.application.progressBar.resume();
  if (dlgResult !== 1)
    return false;



  updateScriptSettings(getParam());
}

function updateScriptSettings(param)
{
  Banana.console.log("Inside updateScriptSettings")
  param = verifyParam(param);
  newparam = initParam();
  newparam.numeroFattura = param.numeroFattura;
  newparam.print_header = param.print_header;
  newparam.print_logo = param.print_logo;
  newparam.font_family = param.font_family;
  newparam.color_1 = param.color_1;
  newparam.color_2 = param.color_2;
  newparam.color_3 = param.color_3;
  newparam.color_4 = param.color_4
  newparam.color_5 = param.color_5;
  newparam.image_height = param.image_height;
  newparam.incremental = param.incremental;

  Banana.document.setScriptSettings(JSON.stringify(newparam));
}

function convertParam(param) {
  var lang = 'en';
  if (Banana.document.locale)
    lang = Banana.document.locale;
  if (lang.length > 2)
    lang = lang.substr(0, 2);
  var texts = setInvoiceTexts(lang);

  var convertedParam = {};
  convertedParam.version = '1.0';
  /*array dei parametri dello script*/
  convertedParam.data = [];

  var currentParam = {};
  currentParam.name = 'print_header';
  currentParam.title = texts.param_print_header;
  currentParam.type = 'bool';
  currentParam.value = param.print_header ? true : false;
  currentParam.readValue = function () {
    param.print_header = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'print_logo';
  currentParam.title = texts.param_print_logo;
  currentParam.type = 'bool';
  currentParam.value = param.print_logo ? true : false;
  currentParam.readValue = function () {
    param.print_logo = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'image_height';
  currentParam.parentObject = 'print_logo';
  currentParam.title = texts.param_image_height;
  currentParam.type = 'number';
  currentParam.value = param.image_height ? param.image_height : '20';
  currentParam.readValue = function () {
    param.image_height = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'font_family';
  currentParam.title = texts.param_font_family;
  currentParam.type = 'string';
  currentParam.value = param.font_family ? param.font_family : '';
  currentParam.readValue = function () {
    param.font_family = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'color_1';
  currentParam.title = texts.param_color_1;
  currentParam.type = 'string';
  currentParam.value = param.color_1 ? param.color_1 : '#337ab7';
  currentParam.readValue = function () {
    param.color_1 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'color_2';
  currentParam.title = texts.param_color_2;
  currentParam.type = 'string';
  currentParam.value = param.color_2 ? param.color_2 : '#ffffff';
  currentParam.readValue = function () {
    param.color_2 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'incremental';
  currentParam.title = 'valore_incrementale';
  currentParam.type = 'string';
  currentParam.value = (typeof param.incremental === 'undefined' ? 1 : param.incremental);
  currentParam.readValue = function () {
    param.incremental = this.value;
  }
  convertedParam.data.push(currentParam);

  return convertedParam;
}

function initParam() {
  var param = {};
  param.numeroFattura = 0;
  param.print_header = true;
  param.print_logo = true;
  param.font_family = '';
  param.color_1 = '#337ab7';
  param.color_2 = '#ffffff';
  param.image_height = '20';
  param.incremental = 1;
  return param;
}

function verifyParam(param) {
  if (!param.print_header)
    param.print_header = false;
  if (!param.print_logo)
    param.print_logo = false;
  if (!param.font_family)
    param.font_family = '';
  if (!param.color_1)
    param.color_1 = '#337ab7';
  if (!param.color_2)
    param.color_2 = '#ffffff';
  if (!param.color_3)
    param.color_3 = '';
  if (!param.color_4)
    param.color_4 = '';
  if (!param.color_5)
    param.color_5 = '';
  if (!param.image_height)
    param.image_height = '20';
  if (typeof param.incremental === 'undefined')
    param.incremental = 1;

  return param;
}

// function printDocument(jsonInvoice, repDocObj, repStyleObj)
// {
//   Banana.console.debug("in printDocument")
//   var param = initParam();
//   var savedParam = Banana.document.getScriptSettings();
//   if (savedParam.length > 0) {
//     param = JSON.parse(savedParam);
//     param = verifyParam(param);
//   }

//   repDocObj = printInvoice(jsonInvoice, repDocObj, param, repStyleObj);
//   setInvoiceStyle(repDocObj, repStyleObj, param);

//   var fatturaElettronica = new FatturaElettronica(Banana.document);
//   // Check version
//   if (typeof (Banana.IO) === 'undefined') {
//     var msg = fatturaElettronica.getErrorMessage(fatturaElettronica.ID_ERR_VERSION);
//     msg = msg.replace("%1", "Banana.IO");
//     Banana.document.addMessage(msg, fatturaElettronica.ID_ERR_VERSION);
//     return "@Cancel";
//   }
//   if (typeof (Banana.Xml.newDocument) === 'undefined') {
//     var msg = fatturaElettronica.getErrorMessage(fatturaElettronica.ID_ERR_VERSION);
//     msg = msg.replace("%1", "Banana.Xml.newDocument");
//     Banana.document.addMessage(msg, fatturaElettronica.ID_ERR_VERSION);
//     return "@Cancel";
//   }
//   if (Banana.document.table('Accounts')) {
//     var tColumnNames = Banana.document.table('Accounts').columnNames.join(";");
//     if (tColumnNames.indexOf('Town') > 0 || tColumnNames.indexOf('Company') > 0) {
//       //The address columns are not updated
//       var msg = fatturaElettronica.getErrorMessage(fatturaElettronica.ID_ERR_TABLE_ADDRESS_NOT_UPDATED);
//       Banana.document.addMessage(msg, fatturaElettronica.ID_ERR_TABLE_ADDRESS_NOT_UPDATED);
//       return "@Cancel";
//     }
//     else if (tColumnNames.indexOf('OrganisationName') <= 0) {
//       var msg = fatturaElettronica.getErrorMessage(fatturaElettronica.ID_ERR_TABLE_ADDRESS_MISSING);
//       Banana.document.addMessage(msg, fatturaElettronica.ID_ERR_TABLE_ADDRESS_MISSING);
//       return "@Cancel";
//     }
//   }
//   else {
//     var msg = fatturaElettronica.getErrorMessage(fatturaElettronica.ID_ERR_ACCOUNTING_TYPE_NOTVALID);
//     Banana.document.addMessage(msg, fatturaElettronica.ID_ERR_ACCOUNTING_TYPE_NOTVALID);
//     return "@Cancel";
//   }

//   //checkErrors(jsonInvoice);

//   fatturaElettronica.initDatiContribuente();
  
//   fatturaElettronica.setParam(param);
//   var xmlDocument = Banana.Xml.newDocument("root");
//   fatturaElettronica.createInstance(xmlDocument, jsonInvoice);
//   param.incremental++;
//   updateScriptSettings(param);
//   var output = Banana.Xml.save(xmlDocument);
//   if (output != "@Cancel") {
//     fatturaElettronica.saveData(output);
//     return;
//   }
// }

function print_XML(jsonInvoice, param)
{
  Banana.console.debug("Inside PrintXML")

  var fatturaElettronica = new FatturaElettronica(Banana.document);
  // Check version
  if (typeof (Banana.IO) === 'undefined') {
    var msg = fatturaElettronica.getErrorMessage(fatturaElettronica.ID_ERR_VERSION);
    msg = msg.replace("%1", "Banana.IO");
    Banana.document.addMessage(msg, fatturaElettronica.ID_ERR_VERSION);
    return "@Cancel";
  }
  if (typeof (Banana.Xml.newDocument) === 'undefined') {
    var msg = fatturaElettronica.getErrorMessage(fatturaElettronica.ID_ERR_VERSION);
    msg = msg.replace("%1", "Banana.Xml.newDocument");
    Banana.document.addMessage(msg, fatturaElettronica.ID_ERR_VERSION);
    return "@Cancel";
  }
  if (Banana.document.table('Accounts')) {
    var tColumnNames = Banana.document.table('Accounts').columnNames.join(";");
    if (tColumnNames.indexOf('Town') > 0 || tColumnNames.indexOf('Company') > 0) {
      //The address columns are not updated
      var msg = fatturaElettronica.getErrorMessage(fatturaElettronica.ID_ERR_TABLE_ADDRESS_NOT_UPDATED);
      Banana.document.addMessage(msg, fatturaElettronica.ID_ERR_TABLE_ADDRESS_NOT_UPDATED);
      return "@Cancel";
    }
    else if (tColumnNames.indexOf('OrganisationName') <= 0) {
      var msg = fatturaElettronica.getErrorMessage(fatturaElettronica.ID_ERR_TABLE_ADDRESS_MISSING);
      Banana.document.addMessage(msg, fatturaElettronica.ID_ERR_TABLE_ADDRESS_MISSING);
      return "@Cancel";
    }
  }
  else {
    var msg = fatturaElettronica.getErrorMessage(fatturaElettronica.ID_ERR_ACCOUNTING_TYPE_NOTVALID);
    Banana.document.addMessage(msg, fatturaElettronica.ID_ERR_ACCOUNTING_TYPE_NOTVALID);
    return "@Cancel";
  }

  fatturaElettronica.initDatiContribuente();
  
  fatturaElettronica.setParam(param);
  var xmlDocument = Banana.Xml.newDocument("root");
  fatturaElettronica.createInstance(xmlDocument, jsonInvoice);
  param.incremental++;
  updateScriptSettings(param);
  var output = Banana.Xml.save(xmlDocument);
  if (output != "@Cancel") {
    fatturaElettronica.saveData(output);
    return;
  }

}

function print_PDF(jsonInvoice, param)
{
  Banana.console.debug("Inside PrintPDF")

  // if (!repDocObj) {
  //   repDocObj = reportObj.newReport(getTitle(invoiceObj, texts) + " " + invoiceObj.document_info.number);
  // } else {
  //   var pageBreak = repDocObj.addPageBreak();
  //   pageBreak.addClass("pageReset");
  
  Banana.console.debug(param)

  // var repDocObj = Banana.Report.newReport(getTitle(jsonInvoice, texts) + " " + jsonInvoice.document_info.number);
  var repStyleObj = Banana.Report.newStyleSheet();
  repStyleObj.addStyle("@page").setAttribute("margin", "0");
  var repDocObj = printInvoice(jsonInvoice, null, repStyleObj, param);

  setInvoiceStyle(repDocObj, repStyleObj, param);

  Banana.Report.preview(repDocObj, repStyleObj);





}

function printInvoice(jsonInvoice, repDocObj, repStyleObj, param) {
  // jsonInvoice can be a json string or a js object
  var invoiceObj = null;
  if (typeof (jsonInvoice) === 'object') {
    invoiceObj = jsonInvoice;
  } else if (typeof (jsonInvoice) === 'string') {
    invoiceObj = JSON.parse(jsonInvoice)
  }

  Banana.console.debug("Inside printInvoice")

  Banana.console.debug(!repDocObj)

  // Invoice texts which need translation
  var langDoc = '';
  if (invoiceObj.customer_info.lang)
    langDoc = invoiceObj.customer_info.lang;
  if (langDoc.length <= 0)
    langDoc = invoiceObj.document_info.locale;
  var texts = setInvoiceTexts(langDoc);

  // Invoice document
  var reportObj = Banana.Report;

  if (!repDocObj) {
    repDocObj = reportObj.newReport(getTitle(invoiceObj, texts) + " " + invoiceObj.document_info.number);
  } else {
    var pageBreak = repDocObj.addPageBreak();
    pageBreak.addClass("pageReset");
  }

  Banana.console.debug(param)
  /***********
    1. HEADER
  ***********/
  var tab = repDocObj.addTable("header_table");
  var col1 = tab.addColumn("col1");
  var col2 = tab.addColumn("col2");
  var headerLogoSection = repDocObj.addSection("");

  if (param.print_logo) {
    //Check the version of Banana:
    //If 9.0.3 or greater we try to use the defined logo (not the one of the table documents).
    //If logo doesn't exists or Banana version is older than 9.0.3, we use the logo of the table Documents
    var requiredVersion = "9.0.3";
    if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) >= 0) {
      // If there is a defined logo it is used as default logo
      var logoFormat = Banana.Report.logoFormat("Logo");
      if (logoFormat) {
        var logoElement = logoFormat.createDocNode(headerLogoSection, repStyleObj, "logo");
        repDocObj.getHeader().addChild(logoElement);
      }
      // If there is not a defined logo, than it is used the logo of the Documents table
      else {
        repDocObj.addImage("documents:logo", "logoStyle");
      }
    }
    // If the version of Banana is older than 9.0.3 it is used the logo of the Documents table
    else {
      repDocObj.addImage("documents:logo", "logoStyle");
    }
  }

  if (param.print_header) {
    tableRow = tab.addRow();
    var cell1 = tableRow.addCell("", "");
    var cell2 = tableRow.addCell("", "amount");
    var supplierNameLines = getInvoiceSupplierName(invoiceObj.supplier_info).split('\n');
    for (var i = 0; i < supplierNameLines.length; i++) {
      cell2.addParagraph(supplierNameLines[i], "bold", 1);
    }
    var supplierLines = getInvoiceSupplier(invoiceObj.supplier_info).split('\n');
    for (var i = 0; i < supplierLines.length; i++) {
      cell2.addParagraph(supplierLines[i], "", 1);
    }
  }
  else {
    tableRow = tab.addRow();
    var cell1 = tableRow.addCell("", "");
    var cell2 = tableRow.addCell("", "");
    cell2.addParagraph(" ");
    cell2.addParagraph(" ");
    cell2.addParagraph(" ");
    cell2.addParagraph(" ");
  }



  /**********************
    2. INVOICE TEXTS INFO
  **********************/
  var infoTable = repDocObj.addTable("info_table");
  var col1 = infoTable.addColumn("infoCol1");
  var col2 = infoTable.addColumn("infoCol2");
  var col3 = infoTable.addColumn("infoCol3");

  tableRow = infoTable.addRow();
  tableRow.addCell(" ", "", 3);

  tableRow = infoTable.addRow();
  var cell1 = tableRow.addCell("", "", 1);
  var cell2 = tableRow.addCell("", "bold", 1);
  var cell3 = tableRow.addCell("", "", 1);

  var invoiceDate = Banana.Converter.toLocaleDateFormat(invoiceObj.document_info.date);
  cell1.addParagraph(getTitle(invoiceObj, texts) + ":", "");
  cell1.addParagraph(texts.date + ":", "");
  cell1.addParagraph(texts.customer + ":", "");
  cell1.addParagraph(texts.customer_vatnumber + ":", "");
  //Payment Terms
  var payment_terms_label = texts.payment_terms_label;
  var payment_terms = '';
  if (invoiceObj.billing_info.payment_term) {
    payment_terms = invoiceObj.billing_info.payment_term;
  }
  else if (invoiceObj.payment_info.due_date) {
    payment_terms_label = texts.payment_due_date_label
    payment_terms = Banana.Converter.toLocaleDateFormat(invoiceObj.payment_info.due_date);
  }
  cell1.addParagraph(payment_terms_label + ":", "");
  cell1.addParagraph(texts.page + ":", "");

  cell2.addParagraph(invoiceObj.document_info.number, "");
  cell2.addParagraph(invoiceDate, "");
  cell2.addParagraph(invoiceObj.customer_info.number, "");
  cell2.addParagraph(invoiceObj.customer_info.vat_number, "");
  cell2.addParagraph(payment_terms, "");
  cell2.addParagraph(pageNr, "");

  var addressLines = getInvoiceAddress(invoiceObj.customer_info).split('\n');
  for (var i = 0; i < addressLines.length; i++) {
    cell3.addParagraph(addressLines[i]);
  }

  //Text begin
  if (invoiceObj.document_info.text_begin) {
    repTableObj = repDocObj.addTable("doc_table1");
    repDocObj.addParagraph(invoiceObj.document_info.text_begin, "begin_text");
  }
  else {
    repTableObj = repDocObj.addTable("doc_table");
  }

  /***************
    3. TABLE ITEMS
  ***************/
  //repTableObj = repDocObj.addTable("doc_table");
  var repTableCol1 = repTableObj.addColumn("repTableCol1");
  var repTableCol2 = repTableObj.addColumn("repTableCol2");
  var repTableCol3 = repTableObj.addColumn("repTableCol3");
  var repTableCol4 = repTableObj.addColumn("repTableCol4");

  rowNumber = checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber);
  var dd = repTableObj.getHeader().addRow();
  dd.addCell(texts.description, "doc_table_header", 1);
  dd.addCell(texts.qty, "doc_table_header amount", 1);
  dd.addCell(texts.unit_price, "doc_table_header amount", 1);
  dd.addCell(texts.total + " " + invoiceObj.document_info.currency, "doc_table_header amount", 1);


  //ITEMS
  for (var i = 0; i < invoiceObj.items.length; i++) {
    var item = invoiceObj.items[i];

    var className = "item_cell";
    if (item.item_type && item.item_type.indexOf("total") === 0) {
      className = "subtotal_cell";
    }
    if (item.item_type && item.item_type.indexOf("note") === 0) {
      className = "note_cell";
    }

    rowNumber = checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber);
    tableRow = repTableObj.addRow();

    var descriptionCell = tableRow.addCell("", "padding-left padding-right thin-border-top " + className, 1);
    descriptionCell.addParagraph(item.description);
    descriptionCell.addParagraph(item.description2);
    if (className == "note_cell") {
      tableRow.addCell("", "padding-left padding-right thin-border-top " + className, 3);
    }
    else if (className == "subtotal_cell") {
      tableRow.addCell("", "amount padding-left padding-right thin-border-top " + className, 2);
      tableRow.addCell(toInvoiceAmountFormat(invoiceObj, item.total_amount_vat_exclusive), "amount padding-left padding-right thin-border-top " + className, 1);
    }
    else {
      tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.quantity), "amount padding-left padding-right thin-border-top " + className, 1);
      tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.unit_price.calculated_amount_vat_exclusive), "amount padding-left padding-right thin-border-top " + className, 1);
      tableRow.addCell(toInvoiceAmountFormat(invoiceObj, item.total_amount_vat_exclusive), "amount padding-left padding-right thin-border-top " + className, 1);
    }
  }

  rowNumber = checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber);
  tableRow = repTableObj.addRow();
  tableRow.addCell("", "border-bottom", 4);

  rowNumber = checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber);
  tableRow = repTableObj.addRow();
  tableRow.addCell("", "", 4);


  //TOTAL NET
  if (invoiceObj.billing_info.total_vat_rates.length > 0) {
    rowNumber = checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber);
    tableRow = repTableObj.addRow();
    tableRow.addCell(" ", "padding-left padding-right", 1)
    tableRow.addCell(texts.totalnet, "padding-left padding-right", 1);
    tableRow.addCell(" ", "padding-left padding-right", 1)
    tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_amount_vat_exclusive), "amount padding-left padding-right", 1);

    for (var i = 0; i < invoiceObj.billing_info.total_vat_rates.length; i++) {
      rowNumber = checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber);
      tableRow = repTableObj.addRow();
      tableRow.addCell("", "padding-left padding-right", 1);
      tableRow.addCell(texts.vat + " " + invoiceObj.billing_info.total_vat_rates[i].vat_rate + "%", "padding-left padding-right", 1);
      tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_vat_rates[i].total_amount_vat_exclusive), "amount padding-left padding-right", 1);
      tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_vat_rates[i].total_vat_amount), "amount padding-left padding-right", 1);
    }
  }


  //TOTAL ROUNDING DIFFERENCE
  if (invoiceObj.billing_info.total_rounding_difference.length) {
    rowNumber = checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber);
    tableRow = repTableObj.addRow();
    tableRow.addCell(" ", "padding-left padding-right", 1);
    tableRow.addCell(texts.rounding, "padding-left padding-right", 1);
    tableRow.addCell(" ", "padding-left padding-right", 1)
    tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_rounding_difference), "amount padding-left padding-right", 1);
  }

  rowNumber = checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber);
  tableRow = repTableObj.addRow();
  tableRow.addCell("", "", 4);


  //FINAL TOTAL
  rowNumber = checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber);
  tableRow = repTableObj.addRow();
  tableRow.addCell("", "", 1)
  tableRow.addCell(texts.total.toUpperCase() + " " + invoiceObj.document_info.currency, "total_cell", 1);
  tableRow.addCell(" ", "total_cell", 1);
  tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_to_pay), "total_cell amount", 1);

  rowNumber = checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber);
  tableRow = repTableObj.addRow();
  tableRow.addCell("", "", 4);


  //Notes
  for (var i = 0; i < invoiceObj.note.length; i++) {
    if (invoiceObj.note[i].description) {
      rowNumber = checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber);
      tableRow = repTableObj.addRow();
      tableRow.addCell(invoiceObj.note[i].description, "", 4);
    }
  }

  //Greetings
  if (invoiceObj.document_info.greetings) {
    rowNumber = checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber);
    tableRow = repTableObj.addRow();
    tableRow.addCell(invoiceObj.document_info.greetings, "", 4);
  }

  //Template params
  //Default text starts with "(" and ends with ")" (default), (Vorderfiniert)
  if (invoiceObj.template_parameters && invoiceObj.template_parameters.footer_texts) {
    var lang = '';
    if (invoiceObj.customer_info.lang)
      lang = invoiceObj.customer_info.lang;
    if (lang.length <= 0 && invoiceObj.document_info.locale)
      lang = invoiceObj.document_info.locale;
    var textDefault = [];
    var text = [];
    for (var i = 0; i < invoiceObj.template_parameters.footer_texts.length; i++) {
      var textLang = invoiceObj.template_parameters.footer_texts[i].lang;
      if (textLang.indexOf('(') === 0 && textLang.indexOf(')') === textLang.length - 1) {
        textDefault = invoiceObj.template_parameters.footer_texts[i].text;
      }
      else if (textLang == lang) {
        text = invoiceObj.template_parameters.footer_texts[i].text;
      }
    }
    if (text.join().length <= 0)
      text = textDefault;
    for (var i = 0; i < text.length; i++) {
      rowNumber = checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber);
      tableRow = repTableObj.addRow();
      tableRow.addCell(text[i], "", 4);
    }
  }

  return repDocObj;
}

function toInvoiceAmountFormat(invoice, value) {

  return Banana.Converter.toLocaleNumberFormat(value, invoice.document_info.decimals_amounts, true);
}

function getInvoiceAddress(invoiceAddress) {

  var address = "";

  if (invoiceAddress.courtesy) {
    address = invoiceAddress.courtesy + "\n";
  }

  if (invoiceAddress.first_name || invoiceAddress.last_name) {
    if (invoiceAddress.first_name) {
      address = address + invoiceAddress.first_name + " ";
    }
    if (invoiceAddress.last_name) {
      address = address + invoiceAddress.last_name;
    }
    address = address + "\n";
  }

  if (invoiceAddress.business_name) {
    address = address + invoiceAddress.business_name + "\n";
  }

  if (invoiceAddress.address1) {
    address = address + invoiceAddress.address1 + "\n";
  }

  if (invoiceAddress.address2) {
    address = address + invoiceAddress.address2 + "\n";
  }

  if (invoiceAddress.address3) {
    address = address + invoiceAddress.address3 + "\n";
  }

  if (invoiceAddress.postal_code) {
    address = address + invoiceAddress.postal_code + " ";
  }

  if (invoiceAddress.city) {
    address = address + invoiceAddress.city + "\n";
  }

  if (invoiceAddress.country) {
    address = address + invoiceAddress.country;
  }

  return address;
}

function getInvoiceSupplierName(invoiceSupplier) {

  var supplierName = "";

  if (invoiceSupplier.business_name) {
    supplierName = invoiceSupplier.business_name + "\n";
  }

  if (supplierName.length <= 0) {
    if (invoiceSupplier.first_name) {
      supplierName = invoiceSupplier.first_name + " ";
    }

    if (invoiceSupplier.last_name) {
      supplierName = supplierName + invoiceSupplier.last_name + "\n";
    }
  }
  return supplierName;
}

function getInvoiceSupplier(invoiceSupplier) {

  var supplierAddress = "";

  if (invoiceSupplier.address1) {
    supplierAddress = supplierAddress + invoiceSupplier.address1 + "\n";
  }

  if (invoiceSupplier.address2) {
    supplierAddress = supplierAddress + invoiceSupplier.address2 + "\n";
  }

  if (invoiceSupplier.postal_code) {
    supplierAddress = supplierAddress + invoiceSupplier.postal_code + " ";
  }

  if (invoiceSupplier.city) {
    supplierAddress = supplierAddress + invoiceSupplier.city + "\n";
  }

  if (invoiceSupplier.phone) {
    supplierAddress = supplierAddress + "Tel: " + invoiceSupplier.phone + "\n";
  }

  if (invoiceSupplier.fax) {
    supplierAddress = supplierAddress + "Fax: " + invoiceSupplier.fax + "\n";
  }

  if (invoiceSupplier.email) {
    supplierAddress = supplierAddress + invoiceSupplier.email + "\n";
  }

  if (invoiceSupplier.web) {
    supplierAddress = supplierAddress + invoiceSupplier.web + "\n";
  }

  if (invoiceSupplier.vat_number) {
    supplierAddress = supplierAddress + "P.IVA " + invoiceSupplier.vat_number;
  }

  return supplierAddress;
}

//The purpose of this function is return a complete address
function getAddressLines(jsonAddress, fullAddress) {

  var address = [];
  address.push(jsonAddress["business_name"]);

  var addressName = [jsonAddress["first_name"], jsonAddress["last_name"]];
  addressName = addressName.filter(function (n) { return n }); // remove empty items
  address.push(addressName.join(" "));

  address.push(jsonAddress["address1"]);
  if (fullAddress) {
    address.push(jsonAddress["address2"]);
    address.push(jsonAddress["address3"]);
  }

  var addressCity = [jsonAddress["postal_code"], jsonAddress["city"]].join(" ");
  if (jsonAddress["country_code"] && jsonAddress["country_code"] !== "CH")
    addressCity = [jsonAddress["country_code"], addressCity].join(" - ");
  address.push(addressCity);

  address = address.filter(function (n) { return n }); // remove empty items

  return address;
}

function getTitle(invoiceObj, texts) {
  var documentTitle = texts.invoice;
  if (invoiceObj.document_info.title) {
    documentTitle = invoiceObj.document_info.title;
  }
  return documentTitle;
}

function checkFileLength(invoiceObj, repDocObj, param, texts, rowNumber) {
  if (rowNumber >= max_items_per_page) {
    repDocObj.addPageBreak();
    pageNr++;

    printInvoiceDetails(invoiceObj, repDocObj, param, texts, rowNumber);
    printItemsHeader(invoiceObj, repDocObj, param, texts, rowNumber);

    return 0;
  }

  rowNumber++;
  return rowNumber;
}

function printInvoiceDetails(invoiceObj, repDocObj, param, texts, rowNumber) {
  //
  // INVOICE DETAILS
  //
  var infoTable = repDocObj.addTable("info_table_row0");
  var col1 = infoTable.addColumn("infoCol1");
  var col2 = infoTable.addColumn("infoCol2");
  var col3 = infoTable.addColumn("infoCol3");

  tableRow = infoTable.addRow();
  tableRow.addCell(" ", "", 3);

  tableRow = infoTable.addRow();
  var cell1 = tableRow.addCell("", "amount", 1);
  var cell2 = tableRow.addCell("", "amount bold", 1);
  var cell3 = tableRow.addCell("", "", 1);

  var invoiceDate = Banana.Converter.toLocaleDateFormat(invoiceObj.document_info.date);
  cell1.addParagraph(getTitle(invoiceObj, texts) + ":", "");
  cell1.addParagraph(texts.date + ":", "");
  cell1.addParagraph(texts.customer + ":", "");
  //Payment Terms
  var payment_terms_label = texts.payment_terms_label;
  var payment_terms = '';
  if (invoiceObj.billing_info.payment_term) {
    payment_terms = invoiceObj.billing_info.payment_term;
  }
  else if (invoiceObj.payment_info.due_date) {
    payment_terms_label = texts.payment_due_date_label
    payment_terms = Banana.Converter.toLocaleDateFormat(invoiceObj.payment_info.due_date);
  }
  cell1.addParagraph(payment_terms_label + ":", "");
  cell1.addParagraph(texts.page + ":", "");

  cell2.addParagraph(invoiceObj.document_info.number, "");
  cell2.addParagraph(invoiceDate, "");
  cell2.addParagraph(invoiceObj.customer_info.number, "");
  cell2.addParagraph(payment_terms, "");
  cell2.addParagraph(pageNr, "");
}

function printItemsHeader(invoiceObj, repDocObj, param, texts, rowNumber) 
{
  //
  // ITEMS TABLE
  //
  repTableObj = repDocObj.addTable("doc_table_row0");
  var repTableCol1 = repTableObj.addColumn("repTableCol1");
  var repTableCol2 = repTableObj.addColumn("repTableCol2");
  var repTableCol3 = repTableObj.addColumn("repTableCol3");
  var repTableCol4 = repTableObj.addColumn("repTableCol4");

  var dd = repTableObj.getHeader().addRow();
  dd.addCell(texts.description, "doc_table_header", 1);
  dd.addCell(texts.qty, "doc_table_header", 1);
  dd.addCell(texts.unit_price, "doc_table_header amount", 1);
  dd.addCell(texts.total + " " + invoiceObj.document_info.currency, "doc_table_header amount", 1);
}

//====================================================================//
// STYLES
//====================================================================//
function setInvoiceStyle(reportObj, repStyleObj, param) {

  if (!repStyleObj) {
    repStyleObj = reportObj.newStyleSheet();
  }


  //Set default values
  if (!param.color_1) {
    param.color_1 = "#337ab7";
  }

  if (!param.color_2) {
    param.color_2 = "#ffffff";
  }

  if (!param.color_3) {
    param.color_3 = "#000000";
  }

  if (!param.color_4) {
    param.color_4 = "#dddddd";
  }

  if (!param.image_height) {
    param.image_height = "30";
  }

  //====================================================================//
  // GENERAL
  //====================================================================//
  repStyleObj.addStyle(".pageReset", "counter-reset: page");
  repStyleObj.addStyle("body", "font-size: 11pt; font-family:Helvetica");
  repStyleObj.addStyle(".amount", "text-align:right");
  repStyleObj.addStyle(".bold", "font-weight: bold");
  repStyleObj.addStyle(".doc_table_header", "font-weight:bold; background-color:" + param.color_1 + "; color:" + param.color_2);
  repStyleObj.addStyle(".doc_table_header td", "padding:5px;");
  repStyleObj.addStyle(".total_cell", "font-weight:bold; background-color:" + param.color_1 + "; color: " + param.color_2 + "; padding:5px");
  repStyleObj.addStyle(".subtotal_cell", "font-weight:bold; background-color:" + param.color_4 + "; color: " + param.color_3 + "; padding:5px");
  repStyleObj.addStyle(".col1", "width:50%");
  repStyleObj.addStyle(".col2", "width:49%");
  repStyleObj.addStyle(".infoCol1", "width:15%");
  repStyleObj.addStyle(".infoCol2", "width:30%");
  repStyleObj.addStyle(".infoCol3", "width:54%");
  repStyleObj.addStyle(".border-bottom", "border-bottom:2px solid " + param.color_3);
  repStyleObj.addStyle(".thin-border-top", "border-top:thin solid " + param.color_1);
  repStyleObj.addStyle(".padding-right", "padding-right:5px");
  repStyleObj.addStyle(".padding-left", "padding-left:5px");

  repStyleObj.addStyle(".repTableCol1", "width:45%");
  repStyleObj.addStyle(".repTableCol2", "width:15%");
  repStyleObj.addStyle(".repTableCol3", "width:20%");
  repStyleObj.addStyle(".repTableCol4", "width:20%");

  /* 
    Text begin
  */
  var beginStyle = repStyleObj.addStyle(".begin_text");
  beginStyle.setAttribute("position", "absolute");
  beginStyle.setAttribute("top", "90mm");
  beginStyle.setAttribute("left", "20mm");
  beginStyle.setAttribute("right", "10mm");
  beginStyle.setAttribute("font-size", "10px");

  //====================================================================//
  // LOGO
  //====================================================================//
  var logoStyle = repStyleObj.addStyle(".logoStyle");
  logoStyle.setAttribute("position", "absolute");
  logoStyle.setAttribute("margin-top", "10mm");
  logoStyle.setAttribute("margin-left", "20mm");
  logoStyle.setAttribute("height", param.image_height + "mm");

  var logoStyle = repStyleObj.addStyle(".logo");
  logoStyle.setAttribute("position", "absolute");
  logoStyle.setAttribute("margin-top", "10mm");
  logoStyle.setAttribute("margin-left", "20mm");

  //====================================================================//
  // TABLES
  //====================================================================//
  var headerStyle = repStyleObj.addStyle(".header_table");
  headerStyle.setAttribute("position", "absolute");
  headerStyle.setAttribute("margin-top", "10mm"); //106
  headerStyle.setAttribute("margin-left", "22mm"); //20
  headerStyle.setAttribute("margin-right", "10mm");
  //repStyleObj.addStyle("table.header_table td", "border: thin solid black");
  headerStyle.setAttribute("width", "100%");


  var infoStyle = repStyleObj.addStyle(".info_table");
  infoStyle.setAttribute("position", "absolute");
  infoStyle.setAttribute("margin-top", "45mm");
  infoStyle.setAttribute("margin-left", "22mm");
  infoStyle.setAttribute("margin-right", "10mm");
  //repStyleObj.addStyle("table.info_table td", "border: thin solid black");

  var infoStyle = repStyleObj.addStyle(".info_table_row0");
  infoStyle.setAttribute("position", "absolute");
  infoStyle.setAttribute("margin-top", "10mm");
  infoStyle.setAttribute("margin-left", "22mm");
  infoStyle.setAttribute("margin-right", "10mm");
  //repStyleObj.addStyle("table.info_table td", "border: thin solid black");
  infoStyle.setAttribute("width", "100%");



  var itemsStyle = repStyleObj.addStyle(".doc_table");
  itemsStyle.setAttribute("margin-top", "110mm"); //106
  itemsStyle.setAttribute("margin-left", "23mm"); //20
  itemsStyle.setAttribute("margin-right", "10mm");
  //repStyleObj.addStyle("table.doc_table td", "border: thin solid black; padding: 3px;");
  itemsStyle.setAttribute("width", "100%");

  var itemsStyle = repStyleObj.addStyle(".doc_table1");
  itemsStyle.setAttribute("margin-top", "125mm"); //106
  itemsStyle.setAttribute("margin-left", "23mm"); //20
  itemsStyle.setAttribute("margin-right", "10mm");
  //repStyleObj.addStyle("table.doc_table1 td", "border: thin solid black; padding: 3px;");
  itemsStyle.setAttribute("width", "100%");

  var itemsStyle = repStyleObj.addStyle(".doc_table_row0");
  itemsStyle.setAttribute("margin-top", "50mm"); //106
  itemsStyle.setAttribute("margin-left", "23mm"); //20
  itemsStyle.setAttribute("margin-right", "10mm");
  //repStyleObj.addStyle("table.doc_table td", "border: thin solid black; padding: 3px;");
  itemsStyle.setAttribute("width", "100%");
}

function setInvoiceTexts(language) {
  var texts = {};
  if (language == 'it') {
    texts.customer = 'No cliente';
    texts.customer_vatnumber = 'P.IVA cliente';
    texts.date = 'Data';
    texts.description = 'Descrizione';
    texts.invoice = 'Fattura';
    texts.page = 'Pagina';
    texts.rounding = 'Arrotondamento';
    texts.total = 'Totale';
    texts.totalnet = 'Totale netto';
    texts.vat = 'IVA';
    texts.qty = 'Quantità';
    texts.unit_ref = 'Unità';
    texts.unit_price = 'Prezzo unità';
    texts.vat_number = 'Partita IVA: ';
    texts.bill_to = 'Indirizzo fatturazione';
    texts.shipping_to = 'Indirizzo spedizione';
    texts.from = 'DA:';
    texts.to = 'A:';
    texts.param_color_1 = 'Colore sfondo';
    texts.param_color_2 = 'Colore testo';
    texts.param_font_family = 'Tipo carattere';
    texts.param_image_height = 'Altezza immagine (mm)';
    texts.param_print_header = 'Includi intestazione pagina (1=si, 0=no)';
    texts.param_print_logo = 'Stampa logo (1=si, 0=no)';
    texts.param_personal_text_1 = 'Testo libero (riga 1)';
    texts.param_personal_text_2 = 'Testo libero (riga 2)';
    texts.payment_due_date_label = 'Scadenza';
    texts.payment_terms_label = 'Pagamento';
    //texts.param_max_items_per_page = 'Numero di linee su ogni fattura';
  }
  else if (language == 'de') {
    texts.customer = 'Kunde-Nr';
    texts.customer_vatnumber = 'Kunde-MwSt.Nr';
    texts.date = 'Datum';
    texts.description = 'Beschreibung';
    texts.invoice = 'Rechnung';
    texts.page = 'Seite';
    texts.rounding = 'Rundung';
    texts.total = 'Total';
    texts.totalnet = 'Netto-Betrag';
    texts.vat = 'MwSt.';
    texts.qty = 'Menge';
    texts.unit_ref = 'Einheit';
    texts.unit_price = 'Preiseinheit';
    texts.vat_number = 'Mehrwertsteuernummer: ';
    texts.bill_to = 'Rechnungsadresse';
    texts.shipping_to = 'Lieferadresse';
    texts.from = 'VON:';
    texts.to = 'ZU:';
    texts.param_color_1 = 'Hintergrundfarbe';
    texts.param_color_2 = 'Textfarbe';
    texts.param_image_height = 'Bildhöhe (mm)';
    texts.param_font_family = 'Tipo carattere';
    texts.param_print_header = 'Seitenüberschrift einschliessen (1=ja, 0=nein)';
    texts.param_print_logo = 'Logo ausdrucken (1=ja, 0=nein)';
    texts.param_personal_text_1 = 'Freier Text (Zeile 1)';
    texts.param_personal_text_2 = 'Freier Text (Zeile 2)';
    texts.payment_due_date_label = 'Fälligkeitsdatum';
    texts.payment_terms_label = 'Zahlungsbedingungen';
    //texts.param_max_items_per_page = 'Anzahl der Zeilen auf jeder Rechnung';
  }
  else if (language == 'fr') {
    texts.customer = 'No Client';
    texts.customer_vatnumber = 'No TVA Client';
    texts.date = 'Date';
    texts.description = 'Description';
    texts.invoice = 'Facture';
    texts.page = 'Page';
    texts.rounding = 'Arrondi';
    texts.total = 'Total';
    texts.totalnet = 'Total net';
    texts.vat = 'TVA';
    texts.qty = 'Quantité';
    texts.unit_ref = 'Unité';
    texts.unit_price = 'Prix unité';
    texts.vat_number = 'Numéro de TVA: ';
    texts.bill_to = 'Adresse de facturation';
    texts.shipping_to = 'Adresse de livraison';
    texts.from = 'DE:';
    texts.to = 'À:';
    texts.param_color_1 = 'Couleur de fond';
    texts.param_color_2 = 'Couleur du texte';
    texts.param_image_height = "Hauteur de l'image (mm)";
    texts.param_font_family = 'Police de caractère';
    texts.param_print_header = 'Inclure en-tête de page (1=oui, 0=non)';
    texts.param_print_logo = 'Imprimer logo (1=oui, 0=non)';
    texts.param_personal_text_1 = 'Texte libre (ligne 1)';
    texts.param_personal_text_2 = 'Texte libre (ligne 2)';
    texts.payment_due_date_label = 'Echéance';
    texts.payment_terms_label = 'Paiement';
    //texts.param_max_items_per_page = 'Nombre d’éléments sur chaque facture';
  }
  else {
    texts.customer = 'Customer No';
    texts.customer_vatnumber = 'Customer Vat Number';
    texts.date = 'Date';
    texts.description = 'Description';
    texts.invoice = 'Invoice';
    texts.page = 'Page';
    texts.rounding = 'Rounding';
    texts.total = 'Total';
    texts.totalnet = 'Total net';
    texts.vat = 'VAT';
    texts.qty = 'Quantity';
    texts.unit_ref = 'Unit';
    texts.unit_price = 'Unit price';
    texts.vat_number = 'VAT Number: ';
    texts.bill_to = 'Billing address';
    texts.shipping_to = 'Shipping address';
    texts.from = 'FROM:';
    texts.to = 'TO:';
    texts.param_color_1 = 'Background Color';
    texts.param_color_2 = 'Text Color';
    texts.param_image_height = 'Image height (mm)';
    texts.param_font_family = 'Font type';
    texts.param_print_header = 'Include page header (1=yes, 0=no)';
    texts.param_print_logo = 'Print logo (1=yes, 0=no)';
    texts.param_personal_text_1 = 'Personal text (row 1)';
    texts.param_personal_text_2 = 'Personal text (row 2)';
    texts.payment_due_date_label = 'Due date';
    texts.payment_terms_label = 'Payment';
    //texts.param_max_items_per_page = 'Number of items on each page';
  }
  return texts;
}

function FatturaElettronica(banDocument) {
  this.initParam();
  if (banDocument)
    this.banDocument = banDocument;
}

/*
* xml instance file
*/
FatturaElettronica.prototype.createInstance = function (xmlDocument, jsonInvoice) {

  this.invoiceObj = null;
  if (typeof (jsonInvoice) === 'object') {
    this.invoiceObj = jsonInvoice;
  } else if (typeof (jsonInvoice) === 'string') {
    this.invoiceObj = JSON.parse(jsonInvoice)
  }
  if (!xmlDocument)
    return;

  //<Document>

  var trasmissionFormat = "FPA12";
  var nodeRoot = xmlDocument.addElement("p:FatturaElettronica");
  nodeRoot.setAttribute("versione", trasmissionFormat);


  this.initSchemarefs();
  this.initNamespaces();
  for (var j in this.param.namespaces) {
    var prefix = this.param.namespaces[j]['prefix'];
    var namespace = this.param.namespaces[j]['namespace'];
    nodeRoot.setAttribute(prefix, namespace);
  }
  var attrsSchemaLocation = ''
  for (var j in this.param.schemaRefs) {
    var schema = this.param.schemaRefs[j];
    if (schema.length > 0) {
      attrsSchemaLocation += " " + schema;
    }
  }
  if (attrsSchemaLocation.length > 0)
    nodeRoot.setAttribute("xsi:schemaLocation", attrsSchemaLocation);

  //Header

  var nodeFatturaElettronicaHeader = nodeRoot.addElement("FatturaElettronicaHeader");

  var nodeDatiTrasmissione = nodeFatturaElettronicaHeader.addElement("DatiTrasmissione");
  var nodeIdTrasmittente = nodeDatiTrasmissione.addElement("IdTrasmittente");
  var nodeIdPaese = nodeIdTrasmittente.addElement("IdPaese");
  nodeIdPaese.addTextNode(this.datiContribuente.nazione);
  var nodeIdCodice = nodeIdTrasmittente.addElement("IdCodice");
  nodeIdCodice.addTextNode((this.datiContribuente.nazione == 'IT' ? this.datiContribuente.codiceFiscale.substring(2) : this.datiContribuente.codiceFiscale));
  var nodeProgressivoInvio = nodeDatiTrasmissione.addElement("ProgressivoInvio");
  var progressivoinvio = '';
  progressivoinvio += this.param.incremental;

  nodeProgressivoInvio.addTextNode(this.param.incremental);
  var nodeFormatoTrasmissione = nodeDatiTrasmissione.addElement("FormatoTrasmissione");
  nodeFormatoTrasmissione.addTextNode(trasmissionFormat);
  var nodeCodiceDestinatario = nodeDatiTrasmissione.addElement("CodiceDestinatario");
  //var x = new Registr
  //var utils = new Utils(this.banDocument);
  //nodeCodiceDestinatario.addTextNode(JSON.stringify(this.invoiceObj));

  //nodeCodiceDestinatario.addTextNode('9999999');
  
  // nodeCodiceDestinatario.addTextNode(info);

  // var nodeContattiTrasmittente = nodeDatiTrasmissione.addElement("ContattiTrasmittente");
  //   var nodeTelefono = nodeContattiTrasmittente.addElement("Telefono");
  //   var nodeEmail = nodeContattiTrasmittente.addElement("Email");
  var nodePECDestinatario = nodeDatiTrasmissione.addElement("PECDestinatario");
  nodePECDestinatario.addTextNode(this.invoiceObj.customer_info.email);


  var nodeCedentePrestatore = nodeFatturaElettronicaHeader.addElement("CedentePrestatore");
  var nodeDatiAnagrafici = nodeCedentePrestatore.addElement("DatiAnagrafici");
  var nodeIdFiscaleIVA = nodeDatiAnagrafici.addElement("IdFiscaleIVA");
  var nodeIdPaese = nodeIdFiscaleIVA.addElement("IdPaese");
  nodeIdPaese.addTextNode(this.datiContribuente.nazione);
  var nodeIdCodice = nodeIdFiscaleIVA.addElement("IdCodice");
  nodeIdCodice.addTextNode((this.datiContribuente.nazione == 'IT' ? this.datiContribuente.codiceFiscale.substring(2) : this.datiContribuente.codiceFiscale));
  // var nodeCodiceFiscale = nodeDatiAnagrafici.addElement("CodiceFiscale");
  var nodeAnagrafica = nodeDatiAnagrafici.addElement("Anagrafica");
  if (this.datiContribuente.tipoContribuente === 0)
  {
    var nodeNome = nodeAnagrafica.addElement("Nome");
    var nodeCognome = nodeAnagrafica.addElement("Cognome");

    nodeNome.addTextNode(this.datiContribuente.nome);
    nodeCognome.addTextNode(this.datiContribuente.cognome);
   
  }
  else if (this.datiContribuente.tipoContribuente === 1)
  {
    var nodeDenominazione = nodeAnagrafica.addElement("Denominazione");
    nodeDenominazione.addTextNode(this.datiContribuente.societa);
  }
  




  //   var nodeTitolo = nodeAnagrafica.addElement("Titolo");
  //   var nodCodEORI = nodeAnagrafica.addElement("CodEORI");
  // var nodeAlboProfessionale = nodeDatiAnagrafici.addElement("AlboProfessionale");
  // var nodeProvinciaAlbo = nodeDatiAnagrafici.addElement("ProvinciaAlbo");
  // var nodeNumeroIscrizioneAlbo = nodeDatiAnagrafici.addElement("NumeroIscrizioneAlbo");
  // var nodeDataiscrizioneAlbo = nodeDatiAnagrafici.addElement("DataIscrizioneAlbo");
  var nodeRegimeFiscale = nodeDatiAnagrafici.addElement("RegimeFiscale");
  var regFis = 'RF';
  if (this.datiContribuente.tipoRegimeFiscale+1 < 10)
    regFis += '0';
  regFis += this.datiContribuente.tipoRegimeFiscale+1;
  nodeRegimeFiscale.addTextNode(regFis);
  var nodeSede = nodeCedentePrestatore.addElement("Sede");
  var nodeIndirizzo = nodeSede.addElement("Indirizzo");
  nodeIndirizzo.addTextNode(this.datiContribuente.indirizzo);
  var nodeNumeroCivico = nodeSede.addElement("NumeroCivico");
  nodeNumeroCivico.addTextNode(this.datiContribuente.ncivico);
  var nodeCAP = nodeSede.addElement("CAP");
  nodeCAP.addTextNode(this.datiContribuente.cap);
  var nodeComune = nodeSede.addElement("Comune");
  nodeComune.addTextNode(this.datiContribuente.comune);
  var nodeProvincia = nodeSede.addElement("Provincia");
  nodeProvincia.addTextNode(this.datiContribuente.provincia);
  var nodeNazione = nodeSede.addElement("Nazione");
  nodeNazione.addTextNode(this.datiContribuente.nazione);

  // var nodeStabileOrganizzazione = nodeCedentePrestatore.addElement("StabileOrganizzazione");
  // var nodeNumeroCivico = nodeStabileOrganizzazione.addElement("NumeroCivico");
  // var nodeCAP = nodeStabileOrganizzazione.addElement("CAP");
  // var nodeComune = nodeStabileOrganizzazione.addElement("Comune");
  // var nodeProvincia = nodeStabileOrganizzazione.addElement("Provincia");
  // var nodeNazione = nodeStabileOrganizzazione.addElement("Nazione");
  // var nodeIscrizioneREA = nodeCedentePrestatore.addElement("IscrizioneREA")
  //   var nodeUfficio = nodeIscrizioneREA.addElement("Ufficio");
  //   var nodeNumeroREA = nodeIscrizioneREA.addElement("NumeroREA");
  //   var nodeCapitaleSociale = nodeIscrizioneREA.addElement("SocioUnico");
  //   var nodeStatoLiquidazione = nodeIscrizioneREA.addElement("StatoLiquidazione");
  // var nodeContatti = nodeCedentePrestatore.addElement("Contatti");
  //   var nodeTelefono = nodeContatti.addElement("Telefono");
  //   var nodeFax = nodeContatti.addElement("Fax");
  //   var nodeEmail = nodeContatti.addElement("Email");
  // var nodeRiferimentoAmministrazione = nodeCedentePrestatore.addElement("RiferimentoAmministrazione");
  // var nodeRappresentanteFiscale = nodeFatturaElettronicaHeader.addElement("RappresentanteFiscale");
  //   var nodeDatiAnagrafici = nodeRappresentanteFiscale.addElement("DatiAnagrafici");
  //     var nodeIdFiscaleIVA = nodeDatiAnagrafici.addElement("IdFiscaleIVA");
  //     var nodeIdPaese = nodeIdFiscaleIVA.addElement("IdPaese");
  //     var nodeIdCodice = nodeIdFiscaleIVA.addElement("IdCodice");
  //   var nodeCodiceFiscale = nodeDatiAnagrafici.addElement("CodiceFiscale");
  //   var nodeAnagrafica = nodeDatiAnagrafici.addElement("Anagrafica");
  //     var nodeDenominazione = nodeAnagrafica.addElement("Denominazione");
  //     var nodeDenominazione = nodeAnagrafica.addElement("Nome");
  //     var nodeCognome = nodeAnagrafica.addElement("Cognome");
  //     var nodeTitolo = nodeAnagrafica.addElement("Titolo");
  //     var nodCodEORI = nodeAnagrafica.addElement("CodEORI");     
  var nodeCessionarioCommittente = nodeFatturaElettronicaHeader.addElement("CessionarioCommittente");
  var nodeDatiAnagrafici = nodeCessionarioCommittente.addElement("DatiAnagrafici")
  // var nodeIdFiscaleIVA = nodeDatiAnagrafici.addElement("IdFiscaleIVA");
  //   var nodeIdPaese = nodeIdFiscaleIVA.addElement("IdPaese");
  //   var nodeIdCodice = nodeIdFiscaleIVA.addElement("IdCodice");
  // var nodeCodiceFiscale = nodeDatiAnagrafici.addElement("CodiceFiscale");
  var nodeAnagrafica = nodeDatiAnagrafici.addElement("Anagrafica");
  // nodeAnagrafica.addTextNode(JSON.stringify(this.invoiceObj));
  if (this.invoiceObj.customer_info.business_name)
  {
      var nodeDenominazione = nodeAnagrafica.addElement("Denominazione");
      nodeDenominazione.addTextNode(this.invoiceObj.customer_info.business_name)
  }
  else if (this.invoiceObj.customer_info.first_name && this.invoiceObj.customer_info.last_name)
  {
    var nodeNome = nodeAnagrafica.addElement("Nome");
    var nodeCognome = nodeAnagrafica.addElement("Cognome");

    nodeNome.addTextNode(this.invoiceObj.customer_info.first_name)
    nodeCognome.addTextNode(this.invoiceObj.customer_info.last_name)
  }
  // var nodeTitolo = nodeAnagrafica.addElement("Titolo");
  // var nodCodEORI = nodeAnagrafica.addElement("CodEORI");



  var nodeSede = nodeCessionarioCommittente.addElement("Sede");
  var nodeIndirizzo = nodeSede.addElement("Indirizzo");
  nodeIndirizzo.addTextNode(this.invoiceObj.customer_info.address1);
  //   var nodeNumeroCivico = nodeSede.addElement("NumeroCivico");

  var nodeCAP = nodeSede.addElement("CAP");
  nodeCAP.addTextNode(this.invoiceObj.customer_info.postal_code);
  var nodeComune = nodeSede.addElement("Comune");
  nodeComune.addTextNode(this.invoiceObj.customer_info.city);
  if (this.invoiceObj.customer_info.country === 'IT')
  {
    var nodeProvincia = nodeSede.addElement("Provincia");
    nodeProvincia.addTextNode(nodeComune.addTextNode(this.invoiceObj.customer_info.state));
  }
  var nodeNazione = nodeSede.addElement("Nazione");
  nodeNazione.addTextNode(this.invoiceObj.customer_info.country);



  // var nodeStabileOrganizzazione = nodeCessionarioCommittente.addElement("StabileOrganizzazione");
  //   var nodeNumeroCivico = nodeStabileOrganizzazione.addElement("NumeroCivico");
  //   var nodeCAP = nodeStabileOrganizzazione.addElement("CAP");
  //   var nodeComune = nodeStabileOrganizzazione.addElement("Comune");
  //   var nodeProvincia = nodeStabileOrganizzazione.addElement("Provincia");
  //   var nodeNazione = nodeStabileOrganizzazione.addElement("Nazione");
  // var nodeRappresentanteFiscale = nodeCessionarioCommittente.addElement("RappresentanteFiscale");
  //   var nodeIdFiscaleIVA = nodeCessionarioCommittente.addElement("IdFiscaleIVA");
  //     var nodeIdPaese = nodeIdFiscaleIVA.addElement("IdPaese");
  //     var nodeIdCodice = nodeIdFiscaleIVA.addElement("IdCodice");
  //   var nodeDenominazione = nodeRappresentanteFiscale.addElement("Denominazione");
  //   var nodeNome = nodeRappresentanteFiscale.addElement("Nome");
  //   var nodeCognome = nodeRappresentanteFiscale.addElement("Cognome");
  // var nodeTerzoIntermediarioOSogettoEmittente = nodeFatturaElettronicaHeader.addElement("TerzoIntermediarioOSoggettoEmittente");
  //   var nodeDatiAnagrafici = nodeTerzoIntermediarioOSogettoEmittente.addElement("DatiAnagrafici");
  //     var nodeIdFiscaleIVA = nodeDatiAnagrafici.addElement("IdFiscaleIVA");
  //       var nodeIdPaese = nodeIdFiscaleIVA.addElement("IdPaese");
  //       var nodeIdCodice = nodeIdFiscaleIVA.addElement("IdCodice");
  //     var nodeCodiceFiscale = nodeDatiAnagrafici.addElement("CodiceFiscale");
  //     var nodeAnagrafica = nodeDatiAnagrafici.addElement("Anagrafica");
  //       var nodeDenominazione = nodeAnagrafica.addElement("Denominazione");
  //       var nodeDenominazione = nodeAnagrafica.addElement("Nome");
  //       var nodeCognome = nodeAnagrafica.addElement("Cognome");
  //       var nodeTitolo = nodeAnagrafica.addElement("Titolo");
  //       var nodCodEORI = nodeAnagrafica.addElement("CodEORI");
  // var nodeSoggettoEmittente = nodeFatturaElettronicaHeader.addElement("SoggettoEmittente");

  // Body
  var nodeFatturaElettronicaBody = nodeRoot.addElement("FatturaElettronicaBody");
  var nodeDatiGenerali = nodeFatturaElettronicaBody.addElement("DatiGenerali");
  var nodeDatiGeneraliDocumento = nodeDatiGenerali.addElement("DatiGeneraliDocumento");
  var nodeTipoDocumento = nodeDatiGeneraliDocumento.addElement("TipoDocumento");
  docType = '';
  if (!this.invoiceObj.document_info.doc_type || this.invoiceObj.document_info.doc_type == '10')
    docType = 'TD01';
  if ( this.invoiceObj.document_info.doc_type == '12')
    docType = 'TD04'
  nodeTipoDocumento.addTextNode(docType);
  var nodeDivisa = nodeDatiGeneraliDocumento.addElement("Divisa");
  nodeDivisa.addTextNode(this.invoiceObj.document_info.currency);
  var nodeData = nodeDatiGeneraliDocumento.addElement("Data");
  nodeData.addTextNode(this.invoiceObj.document_info.date);
  var nodeNumero = nodeDatiGeneraliDocumento.addElement("Numero");
  nodeNumero.addTextNode(this.invoiceObj.document_info.number);
  // var nodeDatiRitenuta = nodeDatiGeneraliDocumento.addElement("DatiRitenuta");
  //   var nodeTipoRitenuta = nodeDatiRitenuta.addElement("TipoRitenuta");
  //   var nodeImportoRitenuta = nodeDatiRitenuta.addElement("ImportoRitenuta");
  //   var nodeAliquotaRitenuta = nodeDatiRitenuta.addElement("AliquotaRitenuta");
  //   var nodeCausalePagamento = nodeDatiRitenuta.addElement("CausalePagamento");
  // var nodeDatiBollo = nodeDatiGeneraliDocumento.addElement("DatiBollo");
  //   var nodeBolloVirtuale = nodeDatiBollo.addElement("BolloVirtuale");
  //   var nodeImportoBollo = nodeDatiBollo.addElement("ImportoBollo");
  // var nodeDatiCassaPrevidenziale = nodeDatiGeneraliDocumento.addElement("DatiCassaPrevidenziale");
  //   var nodeTipoCassa = nodeDatiCassaPrevidenziale.addElement("TipoCassa");
  //   var nodeAlCassa = nodeDatiCassaPrevidenziale.addElement("AlCassa");
  //   var nodeImportoContributoCassa = nodeDatiCassaPrevidenziale.addElement("ImportoContributoCassa");
  //   var nodeImponibileCassa = nodeDatiCassaPrevidenziale.addElement("ImponibileCassa");
  //   var nodeAliquotaIVA = nodeDatiCassaPrevidenziale.addElement("AliquotaIVA");
  //   var nodeRitenuta = nodeDatiCassaPrevidenziale.addElement("Ritenuta");
  //   var nodeNatura = nodeDatiCassaPrevidenziale.addElement("Natura");
  //   var nodeRiferimentoAmministrazione = nodeDatiCassaPrevidenziale.addElement("RiferimentoAmministrazione");
  // var nodeScontoMaggiorazione = nodeDatiGeneraliDocumento.addElement("ScontoMaggiorazione")
  //   var nodeTipo = nodeScontoMaggiorazione.addElement("Tipo");
  //   var nodePercentuale = nodeScontoMaggiorazione.addElement("Percentuale");
  //   var nodeImporto = nodeScontoMaggiorazione.addElement("Importo");
  // var nodeImportoTotaleDocumento = nodeDatiGeneraliDocumento.addElement("ImportoTotaleDocumento");
  // var nodeArrotondamento = nodeDatiGeneraliDocumento.addElement("Arrotondamento");
  //   var nodeCausale = nodeDatiGeneraliDocumento.addElement("Causale");
  //   var nodeArt73 = nodeDatiGeneraliDocumento.addElement("Art73");
  // var nodeDatiOrdineAcquisto = nodeDatiGenerali.addElement("DatiOrdineAcquisto");
  //   var nodeRiferimentoNumeroLinea = nodeDatiOrdineAcquisto.addElement("RiferimentoNumeroLinea");
  //   var nodeIdDocumento = nodeDatiOrdineAcquisto.addElement("IdDocumento");
  //   var nodeData = nodeDatiOrdineAcquisto.addElement("Data");
  //   var nodeNumItem = nodeDatiOrdineAcquisto.addElement("NumItem");
  //   var nodeCodiceCommessaConvenzione = nodeDatiOrdineAcquisto.addElement("CodiceCommessaConvenzione");
  //   var nodeCodiceCUP = nodeDatiOrdineAcquisto.addElement("CodiceCUP");
  //   var nodeCodiceCIG = nodeDatiOrdineAcquisto.addElement("CodiceCIG");
  // var nodeDatiContratto = nodeDatiGenerali.addElement("DatiContratto");
  // var nodeDatiConvenzione = nodeDatiGenerali.addElement("DatiConvenzione");
  // var nodeDatiRicezione = nodeDatiGenerali.addElement("DatiRicezione");
  // var nodeDatiFattureCollegate = nodeDatiGenerali.addElement("DatiFattureCollegate");
  // var nodeDatiSAL = nodeDatiGenerali.addElement("DatiSAL");
  //   var nodeRiferimentoFase = nodeDatiSAL.addElement("RiferimentoFase");
  // var nodeDatiDDT = nodeDatiGenerali.addElement("DatiDDT");
  //   var nodeNumeroDDT = nodeDatiDDT.addElement("NumeroDDT");
  //   var nodeDataDDT = nodeDatiDDT.addElement("DataDDT");
  //   var nodeRiferimentoNumeroLinea = nodeDatiDDT.addElement("RiferimentoNumeroLinea");
  // var nodeDatiTrasporto = nodeDatiGenerali.addElement("DatiTrasporto");
  //   var nodeDatiAnagraficiVettore = nodeDatiTrasporto.addElement("DatiAnagraficiVettore");
  //     var nodeIdFiscaleIVA = nodeDatiAnagraficiVettore.addElement("IdFiscaleIVA");
  //       var nodeIdPaese = nodeIdFiscaleIVA.addElement("IdPaese");
  //       var nodeIdCodice = nodeIdFiscaleIVA.addElement("IdCodice");
  //     var nodeCodiceFiscale = nodeDatiAnagraficiVettore.addElement("CodiceFiscale");
  //     var nodeAnagrafica = nodeDatiAnagraficiVettore.addElement("Anagrafica");
  //       var nodeDenominazione = nodeAnagrafica.addElement("Denominazione");
  //       var nodeDenominazione = nodeAnagrafica.addElement("Nome");
  //       var nodeCognome = nodeAnagrafica.addElement("Cognome");
  //       var nodeTitolo = nodeAnagrafica.addElement("Titolo");
  //       var nodCodEORI = nodeAnagrafica.addElement("CodEORI");
  //     var nodeNumeroLicenzaGuida = nodeDatiAnagraficiVettore.addElement("NumeroLicenzaGuida");
  //   var nodeMezzoTrasporto = nodeDatiTrasporto.addElement("MezzoTrasporto");
  //   var nodeCausaleTrasporto = nodeDatiTrasporto.addElement("CausaleTrasporto");
  //   var nodeNumeroColli = nodeDatiTrasporto.addElement("NumeroColli");
  // var nodeDescrizione = nodeDatiTrasporto.addElement("Descrizione");
  // var nodeUnitaMisuraPeso = nodeDatiTrasporto.addElement("UnitaMisuraPeso");
  // var nodePesoLordo = nodeDatiTrasporto.addElement("PesoLordo");
  // var nodePesoNetto = nodeDatiTrasporto.addElement("PesoNetto");
  // var nodeDataOraRitiro = nodeDatiTrasporto.addElement("DataOraRitiro");
  // var nodeDataInizioTrasporto = nodeDatiTrasporto.addElement("DataInizioTrasporto");
  // var nodeTipoResa = nodeDatiTrasporto.addElement("TipoResa");
  // var nodeIndirizzoResa = nodeDatiTrasporto.addElement("IndirizzoResa");
  //   var nodeIndirizzo = nodeIndirizzoResa.addElement("Indirizzo");
  //   var nodeNumeroCivico = nodeIndirizzoResa.addElement("NumeroCivico");
  //   var nodeCAP = nodeIndirizzoResa.addElement("CAP");
  //   var nodeComune = nodeIndirizzoResa.addElement("Comune");
  //   var nodeProvincia = nodeIndirizzoResa.addElement("Provincia");
  //   var nodeNazione = nodeIndirizzoResa.addElement("Nazione");
  // var nodeDataOraConsegna = nodeDatiTrasporto.addElement("DataOraConsegna");
  // var nodeFatturaPrincipale = nodeDatiGenerali.addElement("FatturaPrincipale");
  //   var nodeNumeroFatturaPrincipale = nodeFatturaPrincipale.addElement("NumeroFatturaPrincipale");
  //   var nodeDataFatturaPrincipale = nodeFatturaPrincipale.addElement("DataFatturaPrincipale");
  var nodeDatiBeniServizi = nodeFatturaElettronicaBody.addElement("DatiBeniServizi");
  for (var i = 0; i < this.invoiceObj.items.length; i++) {
    var nodeDettaglioLinee = nodeDatiBeniServizi.addElement("DettaglioLinee");
    var nodeNumeroLinea = nodeDettaglioLinee.addElement("NumeroLinea");
    nodeNumeroLinea.addTextNode(i + 1);
    // var nodeTipoCessionePrestazione = nodeDettaglioLinee.addElement("TipoCessionePrestazione");
    // var nodeCodiceArticolo = nodeDettaglioLinee.addElement("CodiceArticolo");
    // var nodeCodiceTipo = nodeCodiceArticolo.addElement("CodiceTipo");
    // var nodeCodiceValore = nodeCodiceArticolo.addElement("CodiceValore");
    var nodeDescrizione = nodeDettaglioLinee.addElement("Descrizione");
    nodeDescrizione.addTextNode(this.invoiceObj.items[i].description);
    var nodeQuantita = nodeDettaglioLinee.addElement("Quantita");
    nodeQuantita.addTextNode(this.invoiceObj.items[i].quantity);
    // var nodeUnitaMisura = nodeDettaglioLinee.addElement("UnitaMisura");
    // var nodeDataInizioPeriodo = nodeDettaglioLinee.addElement("DataInizioPeriodo");
    // var nodeDataFinePeriodo = nodeDettaglioLinee.addElement("DataFinePeriodo");
    var nodePrezzoUnitario = nodeDettaglioLinee.addElement("PrezzoUnitario");
    nodePrezzoUnitario.addTextNode(this.invoiceObj.items[i].unit_price.amount_vat_inclusive)
    // var nodeScontoMaggiorazione = nodeDettaglioLinee.addElement("ScontoMaggiorazione");
    //   var nodeTipo = nodeScontoMaggiorazione.addElement("Tipo")
    //   var nodePercentuale = nodeScontoMaggiorazione.addElement("Percentuale")
    //   var nodeImporto = nodeScontoMaggiorazione.addElement("Importo")
    var nodePrezzoTotale = nodeDettaglioLinee.addElement("PrezzoTotale");
    nodePrezzoTotale.addTextNode(this.invoiceObj.items[i].total_amount_vat_inclusive);
    var nodeAliquotaIVA = nodeDettaglioLinee.addElement("AliquotaIVA");
    nodeAliquotaIVA.addTextNode(this.invoiceObj.items[i].unit_price.vat_rate);
    // var nodeRitenuta = nodeDettaglioLinee.addElement("Ritenuta");
    // var nodeNatura = nodeDettaglioLinee.addElement("Natura");
    // var nodeRiferimentoAmministrazione = nodeDettaglioLinee.addElement("RiferimentoAmministrazione");
    // var nodeAltriDatiGestionali = nodeDettaglioLinee.addElement("AltriDatiGestionali");
    //   var nodeTipoDato = nodeAltriDatiGestionali.addElement("TipoDato");
    //   var nodeRiferimentoTesto = nodeAltriDatiGestionali.addElement("RiferimentoTesto");
    //   var nodeRiferimentoNumero = nodeAltriDatiGestionali.addElement("RiferimentoNumero");
    //   var nodeRiferimentoData = nodeAltriDatiGestionali.addElement("RiferimentoData");
  }
  var nodeDatiRiepilogo = nodeDatiBeniServizi.addElement("DatiRiepilogo")
  var nodeAliquotaIVA = nodeDatiRiepilogo.addElement("AliquotaIVA");
  // nodeAliquotaIVA.addTextNode(this.invoiceObj.billing_info.total_vat_rates.vat_rate);

  nodeAliquotaIVA.addTextNode(this.invoiceObj.billing_info.total_vat_rates[0].vat_rate);

  //nodeAliquotaIVA.addTextNode('22');
  // var nodeNatura = nodeDatiRiepilogo.addElement("Natura");
  // var nodeSpeseAccessorie = nodeDatiRiepilogo.addElement("SpeseAccessorie");
  // var nodeArrotondamento = nodeDatiRiepilogo.addElement("Arrotondamento");
  var nodeImponibileImporto = nodeDatiRiepilogo.addElement("ImponibileImporto");
  nodeImponibileImporto.addTextNode(this.invoiceObj.billing_info.total_vat_rates[0].total_amount_vat_inclusive);

  var nodeImposta = nodeDatiRiepilogo.addElement("Imposta");
  nodeImposta.addTextNode(this.invoiceObj.billing_info.total_vat_rates[0].total_vat_amount);
  // var nodeEsigibilitaIVA = nodeDatiRiepilogo.addElement("EsigibilitaIVA");
  // var nodeRiferimentoNormativo = nodeDatiRiepilogo.addElement("RiferimentoNormativo");
  // var nodeDatiVeicoli = nodeFatturaElettronicaBody.addElement("DatiVeicoli");
  //   var nodeData = nodeDatiVeicoli.addElement("Data");
  //   var nodeTotalePercorso = nodeDatiVeicoli.addElement("TotalePercorso");
  // var nodeDatiPagamento = nodeFatturaElettronicaBody.addElement("DatiPagamento");
  //   var nodeCondizioniPagamento = nodeDatiPagamento.addElement("CondizioniPagamento");
  //   var nodeDettaglioPagamento = nodeDatiPagamento.addElement("DettaglioPagamento");
  //     var nodeBeneficiario = nodeDettaglioPagamento.addElement("Beneficiario");
  //     var nodeModalitaPagamento = nodeDettaglioPagamento.addElement("ModalitaPagamento");
  //     var nodeDataRiferimentoTerminiPagamento = nodeDettaglioPagamento.addElement("DataRiferimentoTerminiPagamento");
  //     var nodeGiorniTerminiPagamento = nodeDettaglioPagamento.addElement("GiorniTerminiPagamento");
  //     var nodeDataScadenzaPagamento = nodeDettaglioPagamento.addElement("DataScadenzaPagamento");
  //     var nodeImportoPagamento = nodeDettaglioPagamento.addElement("ImportoPagamento");
  //     var nodeCodUfficioPostale = nodeDettaglioPagamento.addElement("CodUfficioPostale");
  //     var nodeCognomeQuietanzante = nodeDettaglioPagamento.addElement("CognomeQuietanzante");
  //     var nodeNomeQuitanzante = nodeDettaglioPagamento.addElement("NomeQuitanzante");
  //     var nodeCFQuietanzante = nodeDettaglioPagamento.addElement("CFQuietanzante");
  // var nodeTitoloQuietanzante = nodeDettaglioPagamento.addElement("TitoloQuietanzante");
  // var nodeIstitutoFinanziario = nodeDettaglioPagamento.addElement("IstitutoFinanziario");
  // var nodeIBAN = nodeDettaglioPagamento.addElement("IBAN");
  // var nodeABI = nodeDettaglioPagamento.addElement("ABI");
  // var nodeCAB = nodeDettaglioPagamento.addElement("CAB");
  // var nodeBIC = nodeDettaglioPagamento.addElement("BIC");
  // var nodeScontoPagamentoAnticipato = nodeDettaglioPagamento.addElement("ScontoPagamentoAnticipato");
  // var nodeDataLimitePagamentoAnticipato = nodeDettaglioPagamento.addElement("DataLimitePagamentoAnticipato");
  // var nodePenalitaPagamentiRitardati = nodeDettaglioPagamento.addElement("PenalitaPagamentiRitardati");
  // var nodeDataDecorrenzaPenale = nodeDettaglioPagamento.addElement("DataDecorrenzaPenale");
  // var nodeCodicePagamento = nodeDettaglioPagamento.addElement("CodicePagamento");
  // var nodeAllegati = nodeFatturaElettronicaBody.addElement("Allegati");
  //   var nodeNomeAttachment = nodeAllegati.addElement("NomeAttachment");
  //   var nodeAlgoritmoCompressione = nodeAllegati.addElement("AlgoritmoCompressione");
  //   var nodeFormatoAttachment = nodeAllegati.addElement("FormatoAttachment");
  //   var nodeDescrizioneAttachment = nodeAllegati.addElement("DescrizioneAttachment");
  //   var nodeAttachment = nodeAllegati.addElement("Attachment");   
}

FatturaElettronica.prototype.getErrorMessage = function (errorId) {
  //Document language
  var lang = this.banDocument.locale;
  if (lang.length > 2)
    lang = lang.substr(0, 2);
  var rtnMsg = '';
  if (errorId == this.ID_ERR_ACCOUNTING_TYPE_NOTVALID) {
    if (lang == 'de')
      rtnMsg = "The file is not valid. The table Accounts is missing";
    else if (lang == 'fr')
      rtnMsg = "The file is not valid. The table Accounts is missing";
    else if (lang == 'it')
      rtnMsg = "Il tipo di contabilità non è valido. Manca la tabella Conti";
    else
      rtnMsg = "The file is not valid. The table Accounts is missing";
  }
  if (errorId == this.ID_ERR_TABLE_ADDRESS_MISSING) {
    if (lang == 'de')
      rtnMsg = "Address columns of table Accounts are missing. Please update table Accounts with the command Toos - Add new functionalities";
    else if (lang == 'fr')
      rtnMsg = "Address columns of table Accounts are missing. Please update table Accounts with the command Toos - Add new functionalities";
    else if (lang == 'it')
      rtnMsg = "Le colonne indirizzi nella tabella Conti sono mancanti. Aggiornare con il comando Strumenti - Aggiungi nuove funzionalità";
    else
      rtnMsg = "Address columns of table Accounts are missing. Please update table Accounts with the command Toos - Add new functionalities";
  }
  if (errorId == this.ID_ERR_TABLE_ADDRESS_NOT_UPDATED) {
    if (lang == 'de')
      rtnMsg = "Address columns are outdated. Please update them with the command Tools - Convert to new file";
    else if (lang == 'fr')
      rtnMsg = "Address columns are outdated. Please update them with the command Tools - Convert to new file";
    else if (lang == 'it')
      rtnMsg = "Le colonne indirizzi nella tabella Conti sono di una versione non compatibile. Aggiornare con il comando Strumenti - Converti in nuovo file";
    else
      rtnMsg = "Address columns are outdated. Please update them with the command Tools - Convert to new file";
  }
  if (errorId == this.ID_ERR_VERSION) {
    if (lang == 'de')
      rtnMsg = "The function %1 is not supported. Please install the latest version of Banana Accounting";
    else if (lang == 'fr')
      rtnMsg = "The function %1 is not supported. Please install the latest version of Banana Accounting";
    else if (lang == 'it')
      rtnMsg = "Metodo %1 non supportato. Aggiornare Banana alla versione più recente";
    else
      rtnMsg = "The function %1 is not supported. Please install the latest version of Banana Accounting";
  }
  return rtnMsg + " [" + errorId + "] ";
}

FatturaElettronica.prototype.initParam = function () {
  this.banDocument = Banana.document;
  this.debug = false;
  this.invoiceObj = null;
  this.name = "Banana Accounting FatturaElettronica";
  this.param = {};
  this.version = "V1.0";


  /* errors id*/
  this.ID_ERR_ACCOUNTING_TYPE_NOTVALID = "ID_ERR_ACCOUNTING_TYPE_NOTVALID";
  this.ID_ERR_TABLE_ADDRESS_MISSING = "ID_ERR_TABLE_ADDRESS_MISSING";
  this.ID_ERR_TABLE_ADDRESS_NOT_UPDATED = "ID_ERR_TABLE_ADDRESS_NOT_UPDATED";
  this.ID_ERR_VERSION = "ID_ERR_VERSION";

}

FatturaElettronica.prototype.initDatiContribuente = function()
{
  this.datiContribuente = JSON.parse(this.banDocument.getScriptSettings("ch.banana.script.italy_vat.daticontribuente.js"));
}

FatturaElettronica.prototype.setDatiContribuente = function(newDatiContribuenti)
{
  this.datiContribuente = newDatiContribuenti;
}

FatturaElettronica.prototype.initNamespaces = function () {
  this.param.namespaces = [
    {
      'namespace': 'http://www.w3.org/2001/XMLSchema-instance',
      'prefix': 'xmlns:xsi'
    },
    {
      'namespace': 'http://www.w3.org/2000/09/xmldsig#',
      'prefix': 'xmlns:ds'
    },
    {
      'namespace': 'http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2',
      'prefix': 'xmlns:p'
    },
  ];
}

FatturaElettronica.prototype.initSchemarefs = function () {
  this.param.schemaRefs = [
    'http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2 http://www.fatturapa.gov.it/export/fatturazione/sdi/fatturapa/v1.2/Schema_del_file_xml_FatturaPA_versione_1.2.xsd'
  ];
};

FatturaElettronica.prototype.saveData = function (output) {
  var fileName = "";

  if (this.datiContribuente.nazione === 'IT')
    fileName += this.datiContribuente.codiceFiscale;
  else
    fileName += this.datiContribuente.codiceFiscale;

  fileName += '_'

  var numeroInvio = this.param.incremental.toString(36).toUpperCase();
  
  for (var i = 5; i > numeroInvio.length; i--)
    fileName += '0'

  fileName += numeroInvio;
  // Names the file to 'test.xml', easier to reload each time on browser, for testing purposes
  //fileName = 'test';

  fileName = Banana.IO.getSaveFileName("Save as", fileName, "XML file (*.xml);;All files (*)")
  if (fileName.length) {
    var file = Banana.IO.getLocalFile(fileName)
    file.codecName = "UTF-8";
    file.write(output);
    if (file.errorString) {
      Banana.Ui.showInformation("Write error", file.errorString);
    }
    else {
      Banana.IO.openUrl(fileName);
    }
  }
}

FatturaElettronica.prototype.saveDataWithName = function(output, fileName)
{
  fileName = Banana.IO.getSaveFileName("Save as", fileName, "XML file (*.xml);;All files (*)")
  if (fileName.length) {
    var file = Banana.IO.getLocalFile(fileName)
    file.codecName = "UTF-8";
    file.write(output);
    if (file.errorString) {
      Banana.Ui.showInformation("Write error", file.errorString);
    }
    else {
      Banana.IO.openUrl(fileName);
    }
  }
}

FatturaElettronica.prototype.setParam = function (param) {
  this.param = param;
  this.verifyParam();
}

FatturaElettronica.prototype.verifyParam = function () {
  if (!this.name)
    this.name = '';
  if (!this.param)
    this.param = {};
  if (!this.version)
    this.version = '';
}
