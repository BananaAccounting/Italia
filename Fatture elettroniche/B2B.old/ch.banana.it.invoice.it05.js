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
// @id = ch.banana.it.invoice.it05.js
// @api = 1.0
// @pubdate = 2018-12-24
// @publisher = Banana.ch SA
// @description = Style 5 IT: Invoice with net amounts, quantity column, logo, 2 colours
// @description.it = Stile 5 IT: Fattura con importi netti, colonna quantità, logo, 2 colori
// @doctype = *
// @task = report.customer.invoice

var docTableStart = "110mm";

/*Update script's parameters*/
function settingsDialog() {
   var param = initParam();
   var savedParam = Banana.document.getScriptSettings();
   if (savedParam.length > 0) {
      param = JSON.parse(savedParam);
   }
   param = verifyParam(param);

   var dialogTitle = 'Settings';
   var convertedParam = convertParam(param);
   var pageAnchor = 'dlgSettings';
   if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor))
      return;
   for (var i = 0; i < convertedParam.data.length; i++) {
      // Read values to param (through the readValue function)
      convertedParam.data[i].readValue();
   }

   var paramToString = JSON.stringify(param);
   var value = Banana.document.setScriptSettings(paramToString);
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
   currentParam.name = 'print_quantity';
   currentParam.title = texts.param_print_quantity;
   currentParam.type = 'bool';
   currentParam.value = param.print_quantity ? true : false;
   currentParam.readValue = function () {
      param.print_quantity = this.value;
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

   return convertedParam;
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


function getTitle(invoiceObj, texts) {
   var documentTitle = texts.invoice;
   if (invoiceObj.document_info.title) {
      documentTitle = invoiceObj.document_info.title;
   }
   return documentTitle;
}

function initParam() {
   var param = {};
   param.print_header = true;
   param.print_logo = true;
   param.print_quantity = false;
   param.font_family = '';
   param.color_1 = '#337ab7';
   param.color_2 = '#ffffff';
   return param;
}

function printDocument(jsonInvoice, repDocObj, repStyleObj) {
   var param = initParam();
   var savedParam = Banana.document.getScriptSettings();
   if (savedParam.length > 0) {
      param = JSON.parse(savedParam);
      param = verifyParam(param);
   }
   repDocObj = printInvoice(jsonInvoice, repDocObj, repStyleObj, param);
   setInvoiceStyle(repDocObj, repStyleObj, param);
}

function printHeader(reportObj, invoiceObj, param) {
   if (param.header_row_1) {
      if (param.header_row_1.length>0)
         reportObj.addParagraph(param.header_row_1, "headerRow1");
      if (param.header_row_2.length>0)
         reportObj.addParagraph(param.header_row_2, "headerRow2");
      if (param.header_row_3.length>0)
         reportObj.addParagraph(param.header_row_3, "headerRow3");
      if (param.header_row_4.length>0)
         reportObj.addParagraph(param.header_row_4, "headerRow4");
      if (param.header_row_5.length>0)
         reportObj.addParagraph(param.header_row_5, "headerRow5");
   }
   else {
      var supplierNameLines = getInvoiceSupplierName(invoiceObj.supplier_info).split('\n');
      for (var i = 0; i < supplierNameLines.length; i++) {
         reportObj.addParagraph(supplierNameLines[i], "headerRow1");
      }
      var supplierLines = getInvoiceSupplier(invoiceObj.supplier_info).split('\n');
      for (var i = 0; i < supplierLines.length; i++) {
         reportObj.addParagraph(supplierLines[i], "headerRows");
      }
   }
}

function printInvoice(jsonInvoice, repDocObj, repStyleObj, param) {
   // jsonInvoice can be a json string or a js object
   var invoiceObj = null;
   if (typeof (jsonInvoice) === 'object') {
      invoiceObj = jsonInvoice;
   } else if (typeof (jsonInvoice) === 'string') {
      invoiceObj = JSON.parse(jsonInvoice)
   }
   param = verifyParam(param);

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


   /***********
     1. HEADER
   ***********/
   var logoFormat = Banana.Report.logoFormat("Logo");
   if (logoFormat && param.print_logo) {
      var headerLogoSection = repDocObj.addSection("");
      var logoElement = logoFormat.createDocNode(headerLogoSection, repStyleObj, "logo");
      repDocObj.getHeader().addChild(logoElement);
      if (param.print_header)
         printHeader(headerLogoSection, invoiceObj, param);
   }
   else {
      var tab = repDocObj.getHeader().addTable("header_table");
      var col1 = tab.addColumn("col1");

      var tableRow = tab.addRow();
      var cell1 = tableRow.addCell("", "");
      if (param.print_header)
         printHeader(cell1, invoiceObj, param);
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
   var cell1 = tableRow.addCell("", "infoCell1", 1);
   var cell2 = tableRow.addCell("", "infoCell2 bold", 1);
   var cell3 = tableRow.addCell("", "infoCell3", 1);

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
   cell2.addParagraph(invoiceObj.customer_info.vat_number || " ", "");

   // cell2.addParagraph(invoiceObj.supplier_info.vat_number, "");
   cell2.addParagraph(payment_terms, "");
   cell2.addParagraph("", "").addFieldPageNr();

   var addressLines = getInvoiceAddress(invoiceObj.customer_info).split('\n');
   for (var i = 0; i < addressLines.length; i++) {
      cell3.addParagraph(addressLines[i]);
   }

   //Text begin
   if (invoiceObj.document_info.text_begin) {
      docTableStart = "125mm";
      repDocObj.addParagraph(invoiceObj.document_info.text_begin, "begin_text");
   }
   else {
      docTableStart = "110mm";
   }

   printInvoiceDetails(invoiceObj, repDocObj.getHeader(), param, texts);

   /***************
     3. TABLE ITEMS
   ***************/
   repTableObj = repDocObj.addTable("doc_table");
   var repTableCol1 = repTableObj.addColumn("repTableCol1");
   var repTableCol2 = repTableObj.addColumn("repTableCol2");
   var repTableCol3 = repTableObj.addColumn("repTableCol3");
   var repTableCol4 = repTableObj.addColumn("repTableCol4");

   var dd = repTableObj.getHeader().addRow();
   
   if (param.print_quantity) {
      dd.addCell(texts.description, "doc_table_header", 1);
      dd.addCell(texts.qty, "doc_table_header amount", 1);
      dd.addCell(texts.unit_price, "doc_table_header amount", 1);
   }
   else {
      dd.addCell(texts.description, "doc_table_header", 3);
   }
   dd.addCell(texts.total + " " + invoiceObj.document_info.currency, "doc_table_header amount", 1);


   //ITEMS
   for (var i = 0; i < invoiceObj.items.length; i++) {
      var item = invoiceObj.items[i];
      tableRow = repTableObj.addRow();

      var className = "item_cell";
      if (item.item_type && item.item_type.indexOf("total") === 0) {
         className = "subtotal_cell";
      }
      if (item.item_type && item.item_type.indexOf("note") === 0) {
         className = "note_cell";
      }

      var colDesSpan = 1;
      if (!param.print_quantity)
         colDesSpan = 3;

      var descriptionCell = tableRow.addCell("", "padding-left padding-right " + className, colDesSpan);
      descriptionCell.addParagraph(item.description);
      descriptionCell.addParagraph(item.description2);

      if (className == "note_cell") {
         if (param.print_quantity) {
            tableRow.addCell("", "padding-left padding-right " + className, 2);
         }
         tableRow.addCell("", "padding-left padding-right " + className, 1);
      }
      else if (className == "subtotal_cell") {
         if (param.print_quantity) {
            tableRow.addCell("", "padding-left padding-right " + className, 2);
         }
         tableRow.addCell(toInvoiceAmountFormat(invoiceObj, item.total_amount_vat_exclusive), "amount padding-left padding-right " + className, 1);
      }
      else {
         if (param.print_quantity) {
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.quantity), "amount padding-left padding-right " + className, 1);
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.unit_price.calculated_amount_vat_exclusive), "amount padding-left padding-right " + className, 1);
         }
         tableRow.addCell(toInvoiceAmountFormat(invoiceObj, item.total_amount_vat_exclusive), "amount padding-left padding-right " + className, 1);
      }
   }

   tableRow = repTableObj.addRow();
   tableRow.addCell("", "border-bottom", 4);

   tableRow = repTableObj.addRow();
   tableRow.addCell("", "", 4);


   //TOTAL NET
   if (invoiceObj.billing_info.total_vat_rates.length > 0) {
      tableRow = repTableObj.addRow();
      tableRow.addCell(" ", "padding-left padding-right", 1)
      tableRow.addCell(texts.totalnet, "padding-left padding-right", 1);
      tableRow.addCell(" ", "padding-left padding-right", 1)
      tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_amount_vat_exclusive), "amount padding-left padding-right", 1);

      for (var i = 0; i < invoiceObj.billing_info.total_vat_rates.length; i++) {
         tableRow = repTableObj.addRow();
         tableRow.addCell("", "padding-left padding-right", 1);
         tableRow.addCell(texts.vat + " " + invoiceObj.billing_info.total_vat_rates[i].vat_rate + "%", "padding-left padding-right", 1);
         tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_vat_rates[i].total_amount_vat_exclusive), "amount padding-left padding-right", 1);
         tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_vat_rates[i].total_vat_amount), "amount padding-left padding-right", 1);
      }
   }


   //TOTAL ROUNDING DIFFERENCE
   if (invoiceObj.billing_info.total_rounding_difference.length) {
      tableRow = repTableObj.addRow();
      tableRow.addCell(" ", "padding-left padding-right", 1);
      tableRow.addCell(texts.rounding, "padding-left padding-right", 1);
      tableRow.addCell(" ", "padding-left padding-right", 1)
      tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_rounding_difference), "amount padding-left padding-right", 1);
   }

   tableRow = repTableObj.addRow();
   tableRow.addCell("", "", 4);


   //FINAL TOTAL
   /*tableRow = repTableObj.addRow();
   tableRow.addCell("", "", 1)
   tableRow.addCell(texts.total_invoice, "total_cell", 1);
   tableRow.addCell(" ", "total_cell", 1);
   tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_to_pay), "total_cell amount", 1);

   tableRow = repTableObj.addRow();
   tableRow.addCell("", "", 4);*/

   //FINAL TOTAL
   tableRow = repTableObj.addRow();
   tableRow.addCell("", "", 1);
   tableRow.addCell(texts.total.toUpperCase() + " " + invoiceObj.document_info.currency, "padding-left bold thin-border-bottom total", 2);
   tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_to_pay), "padding-right bold amount thin-border-bottom total", 1);

   tableRow = repTableObj.addRow();
   tableRow.addCell("", "", 4);
   

   //Notes
   for (var i = 0; i < invoiceObj.note.length; i++) {
      if (invoiceObj.note[i].description) {
         tableRow = repTableObj.addRow();
         tableRow.addCell(invoiceObj.note[i].description, "", 4);
      }
   }

   //Greetings
   if (invoiceObj.document_info.greetings) {
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
         tableRow = repTableObj.addRow();
         tableRow.addCell(text[i], "", 4);
      }
   }

   /***********
     4. FOOTER
   ***********/
   if (param.footer && param.footer.length>0) {
      var tabFooter = repDocObj.getFooter().addTable("footer_table");
      var col = tabFooter.addColumn("col");
      var lines = param.footer.split("\n");
      for (var i = 0; i<lines.length; i++) {
         var tableRow = tabFooter.addRow();
         tableRow.addCell(lines[i], "center");
      }
   }
   
   return repDocObj;
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
   var cell1 = tableRow.addCell("", "infoCell1", 1);
   var cell2 = tableRow.addCell("", "infoCell2 bold", 1);
   var cell3 = tableRow.addCell("", "infoCell3", 1);

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
   cell2.addParagraph(invoiceObj.customer_info.vat_number || " ", "");
   cell2.addParagraph(payment_terms, "");
   cell2.addParagraph("", "").addFieldPageNr();
}

//====================================================================//
// STYLES
//====================================================================//
function setInvoiceStyle(reportObj, repStyleObj, param) {

   if (!repStyleObj) {
      repStyleObj = reportObj.newStyleSheet();
   }

   //Set default values
   //Set default values
   if (!param.font_family) {
      param.font_family = "Helvetica";
   }

   if (!param.color_1) {
      param.color_1 = "#337ab7";
   }

   if (!param.color_2) {
      param.color_2 = "#ffffff";
   }

   //====================================================================//
   // GENERAL
   //====================================================================//

   repStyleObj.addStyle(".pageReset", "counter-reset: page");
   repStyleObj.addStyle("body", "font-size: 12pt; font-family:" + param.font_family);
   repStyleObj.addStyle(".amount", "text-align:right");
   repStyleObj.addStyle(".bold", "font-weight: bold");
   repStyleObj.addStyle(".center", "text-align:center;");
   repStyleObj.addStyle(".doc_table_header", "font-weight:bold; background-color:" + param.color_1 + "; color:" + param.color_2);
   repStyleObj.addStyle(".doc_table_header td", "padding:5px;");
   repStyleObj.addStyle(".total", "font-size:15pt; color:" + param.color_1);
   repStyleObj.addStyle(".total_cell", "font-weight:bold; background-color:" + param.color_1 + "; color: " + param.color_2 + "; padding:5px");
   repStyleObj.addStyle(".subtotal_cell", "font-weight:bold; background-color:" + param.color_1 + "; color: " + param.color_2 + "; padding:5px");
   
   repStyleObj.addStyle(".border-left", "border-left:thin solid " + param.color_1);
   repStyleObj.addStyle(".border-right", "border-right:thin solid " + param.color_1);
   repStyleObj.addStyle(".border-top", "border-top:thin solid " + param.color_1);
   repStyleObj.addStyle(".thin-border-bottom", "border-bottom:thin solid " + param.color_1);

   //repStyleObj.addStyle(".col1", "width:50%");
   //repStyleObj.addStyle(".col2", "width:49%");
   repStyleObj.addStyle(".headerRow1", "font-weight:bold; color:" + param.color_1);
   repStyleObj.addStyle(".headerRow2", "font-weight:bold; padding-bottom:5px;");
   repStyleObj.addStyle(".headerRow3", "font-weight:bold;");
   repStyleObj.addStyle(".headerRow4", "font-weight:bold;");
   repStyleObj.addStyle(".headerRow5", "font-weight:bold;");
   repStyleObj.addStyle(".infoCol1", "width:15%;");
   repStyleObj.addStyle(".infoCol2", "width:30%;");
   repStyleObj.addStyle(".infoCol3", "width:54%;");
   repStyleObj.addStyle(".infoCell1", "font-size:10pt;");
   repStyleObj.addStyle(".infoCell2", "font-size:10pt;");
   repStyleObj.addStyle(".border-bottom", "border-bottom:2px solid " + param.color_1);
   repStyleObj.addStyle(".padding-right", "padding-right:5px");
   repStyleObj.addStyle(".padding-left", "padding-left:5px");

   repStyleObj.addStyle(".repTableCol1", "width:44%");
   repStyleObj.addStyle(".repTableCol2", "width:16%");
   repStyleObj.addStyle(".repTableCol3", "width:19%");
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
   var logoStyle = repStyleObj.addStyle(".logo");
   logoStyle.setAttribute("position", "absolute");
   logoStyle.setAttribute("margin-top", "10mm");
   logoStyle.setAttribute("margin-left", "20mm");
   logoStyle.setAttribute("margin-right", "10mm");

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
   infoStyle.setAttribute("margin-left", "20mm");
   infoStyle.setAttribute("margin-right", "10mm");
   //repStyleObj.addStyle("table.info_table td", "border: thin solid black");

   var infoStyle = repStyleObj.addStyle(".info_table_row0");
   infoStyle.setAttribute("position", "absolute");
   infoStyle.setAttribute("margin-top", "45mm");
   infoStyle.setAttribute("margin-left", "20mm");
   infoStyle.setAttribute("margin-right", "10mm");
   //repStyleObj.addStyle("table.info_table td", "border: thin solid black");
   //infoStyle.setAttribute("width", "100%");

   var infoStyle = repStyleObj.addStyle("@page:first-view table.info_table_row0");
   infoStyle.setAttribute("display", "none");

   var itemsStyle = repStyleObj.addStyle(".doc_table");
   itemsStyle.setAttribute("margin-top", docTableStart); //106
   itemsStyle.setAttribute("margin-left", "23mm"); //20
   itemsStyle.setAttribute("margin-right", "10mm");
   //repStyleObj.addStyle("table.doc_table td", "border: thin solid black; padding: 3px;");
   itemsStyle.setAttribute("width", "100%");

   var footerStyle = repStyleObj.addStyle(".footer_table");
   footerStyle.setAttribute("margin-bottom", "20mm");
   footerStyle.setAttribute("margin-top", "10mm");
   footerStyle.setAttribute("margin-left", "20mm");
   footerStyle.setAttribute("margin-right", "10mm");
   footerStyle.setAttribute("width", "100%");
   //repStyleObj.addStyle(".footer_table.td", "border:1 px solid " + param.color_1);
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
      texts.total = 'Importo';
      texts.total_invoice = 'Totale fattura';
      texts.totalnet = 'Imponibile Iva';
      texts.vat = 'Iva';
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
      texts.param_print_header = 'Visualizza intestazione pagina';
      texts.param_print_logo = 'Stampa logo';
      texts.param_print_quantity = 'Visualizza colonna quantità';
      texts.payment_due_date_label = 'Scadenza';
      texts.payment_terms_label = 'Pagamento';
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
      texts.total_invoice = 'Total Rechnung';
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
      texts.param_font_family = 'Schriftart';
      texts.param_print_header = 'Seitenüberschrift einschliessen';
      texts.param_print_logo = 'Logo ausdrucken';
      texts.param_print_quantity = 'Spalte Menge einschliessen';
      texts.payment_due_date_label = 'Fälligkeitsdatum';
      texts.payment_terms_label = 'Zahlungsbedingungen';
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
      texts.total_invoice = 'Total facture';
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
      texts.param_font_family = 'Police de caractère';
      texts.param_print_header = 'Inclure en-tête de page';
      texts.param_print_logo = 'Imprimer logo';
      texts.param_print_quantity = 'Inclure colonne Quantité';
      texts.payment_due_date_label = 'Echéance';
      texts.payment_terms_label = 'Paiement';
   }
   else {
      texts.customer = 'Customer No';
      texts.customer_vatnumber = 'Customer Vat Number';
      texts.date = 'Date';
      texts.description = 'Description';
      texts.invoice = 'Invoice';
      texts.total_invoice = 'Total invoice';
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
      texts.param_font_family = 'Font type';
      texts.param_print_header = 'Display page header';
      texts.param_print_logo = 'Print logo';
      texts.param_print_quantity = 'Display column Quantity';
      texts.payment_due_date_label = 'Due date';
      texts.payment_terms_label = 'Payment';
   }
   return texts;
}

function toInvoiceAmountFormat(invoice, value) {

   return Banana.Converter.toLocaleNumberFormat(value, invoice.document_info.decimals_amounts, true);
}

function verifyParam(param) {
   if (!param.print_header)
      param.print_header = false;
   if (!param.print_logo)
      param.print_logo = false;
   if (!param.print_quantity)
      param.print_quantity = false;
   if (!param.font_family)
      param.font_family = '';
   if (!param.color_1)
      param.color_1 = '#337ab7';
   if (!param.color_2)
      param.color_2 = '#ffffff';

   return param;
}

