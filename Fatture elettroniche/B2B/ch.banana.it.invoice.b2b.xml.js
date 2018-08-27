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
// @task = app.command
// @inputdatasource = none
// @timeout = -1

//TODO: aggiungere partita iva nella stampa

function exec(inData, options) {
   var bananaInvoice = new BananaInvoice(Banana.document);
   if (!Banana.document || !bananaInvoice.verifyBananaVersion()) {
      return "@Cancel";
   }

   var param = {};
   if (inData.length>0) {
      param = JSON.parse(inData);
   }
   else if (options && options.useLastSettings) {
      param = JSON.parse(Banana.document.getScriptSettings());
   }
   else {
      if (!settingsDialog())
         return "@Cancel";
      param = JSON.parse(Banana.document.getScriptSettings());
   }
  
   bananaInvoice.setParam(param);
   
   var jsonInvoice = {};
   if (bananaInvoice.param.selezione == 0 && bananaInvoice.param.selezioneNoFattura.length > 0)
      jsonInvoice = bananaInvoice.getInvoiceJson(bananaInvoice.param.selezioneNoFattura);
  
   if (bananaInvoice.param.output == 0) {
      var repDocObj = Banana.Report.newReport('');
      var repStyleObj = Banana.Report.newStyleSheet();
      bananaInvoice.print(jsonInvoice, repDocObj, repStyleObj);
      Banana.Report.preview(repDocObj, repStyleObj);
   }
   else {
      bananaInvoice.printXML(jsonInvoice);
   }
}

/*Update script's parameters*/
function settingsDialog() {

   var bananaInvoice = new BananaInvoice(Banana.document);
   var savedParam = Banana.document.getScriptSettings();
   if (savedParam.length > 0) {
      bananaInvoice.setParam(JSON.parse(savedParam));
   }
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
   
   //Lettura dati
   var elencoClienti = bananaInvoice.getCustomers();
   //clienteComboBox.currentText = bananaInvoice.param.selezioneNoCliente;
   clienteComboBox.addItems(elencoClienti);
    
   if (bananaInvoice.param.selezione == 1)
      clienteRadioButton.checked = true;
   else
      numeroFatturaRadioButton.checked = true;
  	
   var selectedRow = parseInt(Banana.document.cursor.rowNr);
   var noFattura = '';
   if (Banana.document.table('Transactions') && Banana.document.table('Transactions').rowCount>selectedRow) {
      var noFattura = Banana.document.table('Transactions').value(selectedRow, "DocInvoice");
   }
   numeroFatturaLineEdit.text = noFattura;
   
   if (bananaInvoice.param.output == 1)
      stampaXmlRadioButton.checked = true;
   else
      stampaPDFRadioButton.checked = true;
      
   dialog.checkdata = function () {
      dialog.accept();
   }
   dialog.enableButtons = function () {
      if (numeroFatturaRadioButton.checked) {
         numeroFatturaLineEdit.enabled = true;
         clienteComboBox.enabled = false;
      }
      else {
         numeroFatturaLineEdit.enabled = false;
         clienteComboBox.enabled = true;
      }
   }
   dialog.showHelp = function () {
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
   bananaInvoice.param.selezioneNoFattura = numeroFatturaLineEdit.text;
   bananaInvoice.param.selezioneNoCliente = clienteComboBox.currentText;
   if (clienteRadioButton.checked)
      bananaInvoice.param.selezione = 1;
   else
      bananaInvoice.param.selezione = 0;
   if (stampaXmlRadioButton.checked)
       bananaInvoice.param.output = 1;
   else
      bananaInvoice.param.output = 0;
      
   var paramToString = JSON.stringify(bananaInvoice.param);
   Banana.document.setScriptSettings(paramToString);
   return true;
}

function BananaInvoice(banDocument) {
   this.banDocument = banDocument;
   if (this.banDocument === undefined)
      this.banDocument = Banana.document;
   this.initParam();
   
   //errors
   this.ID_ERR_VERSION = "ID_ERR_VERSION";
   
   //default settings
   this.mmInvoiceTableTopMargin = 60;
   
   this.mmInvoiceTableWidth = 180;
   
   this.mmInvoiceHeaderCol1Width = 35;
   this.mmInvoiceHeaderCol2Width = 55;
   this.mmInvoiceHeaderCol3Width = 90;
   
   this.mmDescriptionColWidth = 90;
   this.mmQuantityColWidth = 30;
   this.mmUnitPriceColWidth = 30;
   this.mmTotalColWidth = 30;

}

BananaInvoice.prototype.applyStyle = function (repStyleObj) {
   if (!repStyleObj) {
      repStyleObj = reportObj.newStyleSheet();
   }

   //Set default values
   if (!this.param.font_family) {
      this.param.font_family = "Helvetica";
   }

   if (!this.param.color_1) {
      this.param.color_1 = "#337ab7";
   }

   if (!this.param.color_2) {
      this.param.color_2 = "#ffffff";
   }

   //====================================================================//
   // GENERAL
   //====================================================================//
   repStyleObj.addStyle("@page").setAttribute("margin", "0");
   repStyleObj.addStyle("body", "font-size: 11pt; font-family:" + this.param.font_family);
   repStyleObj.addStyle(".amount", "text-align:right");
   repStyleObj.addStyle(".bold", "font-weight: bold");
   repStyleObj.addStyle(".border-bottom", "border-bottom:2px solid " + this.param.color_1);
   repStyleObj.addStyle(".padding-right", "padding-right:5px");
   repStyleObj.addStyle(".padding-left", "padding-left:5px");
   repStyleObj.addStyle(".pageReset", "counter-reset: page");
   repStyleObj.addStyle(".subtotal_cell", "font-weight:bold; background-color:" + this.param.color_1 + "; color: " + this.param.color_2 + "; padding:5px");
   repStyleObj.addStyle(".thin-border-top", "border-top:thin solid " + this.param.color_1);
   repStyleObj.addStyle(".total_cell", "font-weight:bold; background-color:" + this.param.color_1 + "; color: " + this.param.color_2 + "; padding:5px");

   /* 
   *  Text begin
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
   logoStyle.setAttribute("height", this.param.image_height + "mm");

   var logoStyle = repStyleObj.addStyle(".logo");
   logoStyle.setAttribute("position", "absolute");
   logoStyle.setAttribute("margin-top", "10mm");
   logoStyle.setAttribute("margin-left", "20mm");
   
   //====================================================================//
   // TABLES
   //====================================================================//
   var headerStyle = repStyleObj.addStyle(".pageHeader");
   headerStyle.setAttribute("position", "absolute");
   headerStyle.setAttribute("margin-top", "10mm");
   headerStyle.setAttribute("margin-left", "22mm");
   headerStyle.setAttribute("margin-right", "10mm");
   headerStyle.setAttribute("width", "100%");
   repStyleObj.addStyle(".pageHeaderCol1", "width:50%");
   repStyleObj.addStyle(".pageHeaderCol2", "width:49%");

   var headerStyle = repStyleObj.addStyle(".invoiceTable");
   headerStyle.setAttribute("margin-left", "20mm");
   headerStyle.setAttribute("margin-top", this.mmInvoiceTableTopMargin.toString()+'mm');
   repStyleObj.addStyle(".pxCol","width:1mm;");
  
   repStyleObj.addStyle(".invoiceTableHeader", "font-weight:bold; background-color:" + this.param.color_1 + "; color:" + this.param.color_2);
   repStyleObj.addStyle(".invoiceTableHeader td", "padding:5px;");

   repStyleObj.addStyle(".invoiceInfo td", "padding-bottom:15px;");
   

}

BananaInvoice.prototype.getAddressTo = function (invoiceAddress) {

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

BananaInvoice.prototype.getCompanyAddress = function (invoiceSupplier) {

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
      supplierAddress = supplierAddress + invoiceSupplier.vat_number;
   }
   return supplierAddress;
}

BananaInvoice.prototype.getCompanyName = function (invoiceSupplier) {

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

BananaInvoice.prototype.getCustomers = function () {
   var customersList = [];
   var journal = this.banDocument.invoicesCustomers();
   for (var i = 0; i < journal.rowCount; i++) {
      var tRow = journal.row(i);
      if (tRow.value('ObjectType') === 'InvoiceDocument') {
         var customerId = JSON.parse(tRow.value('CounterpartyId'));
         if (customersList.indexOf(customerId)<0)
            customersList.push(customerId);
      }
   }
   var tableAccounts = Banana.document.table('Accounts');
   if (tableAccounts) {
      for (var i = 0; i < customersList.count; i++) {
         var row = tableAccounts.findRowByValue('Account', customersList[i]);
         Banana.console.debug("row " + row + " " + customersList[i]);
         if (row>=0)
            customersList[i] = customersList[i] + ' ' + tableAccounts.value(row, "Description");
      }
   }
   return customersList;
}

BananaInvoice.prototype.getErrorMessage = function (errorId, lang) {

   if (!lang)
      lang = 'en';
   switch (errorId) {
      case this.ID_ERR_VERSION:
         if (lang == 'it')
            return "Metodo %1 non supportato. Aggiornare Banana ad una versione più recente.";
         else
            return "Method %1 not supported. Please update to a more recent version of Banana Accounting.";
   }
   return '';
}

BananaInvoice.prototype.getInvoiceJson = function (number) {

   var journal = this.banDocument.invoicesCustomers();
   var jsonInvoice = {};
  
   for (var i = 0; i < journal.rowCount; i++) {
      var tRow = journal.row(i);
      if (tRow.value('ObjectJSonData') && tRow.value('ObjectType') === 'InvoiceDocument') {
         var jsonData = {};
         jsonData = JSON.parse(tRow.value('ObjectJSonData'));
         if (jsonData.InvoiceDocument.document_info.number === number) {
            return jsonData.InvoiceDocument;
         }
      }
   }

   return jsonInvoice;
}

BananaInvoice.prototype.getInvoiceTexts = function (lang) {

   if (!lang)
      lang = 'en';
   var texts = {};
   if (lang == 'it') {
      texts.customer = 'No Cliente';
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
      texts.param_print_header = 'Includi intestazione pagina (1=si, 0=no)';
      texts.param_print_logo = 'Stampa logo (1=si, 0=no)';
      texts.payment_due_date_label = 'Scadenza';
      texts.payment_terms_label = 'Pagamento';
   }
   else if (lang == 'de') {
      texts.customer = 'Kunde-Nr';
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
      texts.param_font_family = 'Typ Schriftzeichen';
      texts.param_print_header = 'Seitenüberschrift einschliessen (1=ja, 0=nein)';
      texts.param_print_logo = 'Logo ausdrucken (1=ja, 0=nein)';
      texts.payment_due_date_label = 'Fälligkeitsdatum';
      texts.payment_terms_label = 'Zahlungsbedingungen';
   }
   else if (lang == 'fr') {
      texts.customer = 'No Client';
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
      texts.param_font_family = 'Police de caractère';
      texts.param_print_header = 'Inclure en-tête de page (1=oui, 0=non)';
      texts.param_print_logo = 'Imprimer logo (1=oui, 0=non)';
      texts.payment_due_date_label = 'Echéance';
      texts.payment_terms_label = 'Paiement';
   }
   else if (lang == 'nl') {
      texts.customer = 'Klantennummer';
      texts.date = 'Datum';
      texts.description = 'Beschrijving';
      texts.invoice = 'Factuur';
      texts.page = 'Pagina';
      texts.rounding = 'Afronding';
      texts.total = 'Totaal';
      texts.totalnet = 'Totaal netto';
      texts.vat = 'BTW';
      texts.qty = 'Hoeveelheid';
      texts.unit_ref = 'Eenheid';
      texts.unit_price = 'Eenheidsprijs';
      texts.vat_number = 'BTW-nummer: ';
      texts.bill_to = 'Factuuradres';
      texts.shipping_to = 'Leveringsadres';
      texts.from = 'VAN:';
      texts.to = 'TOT:';
      texts.param_color_1 = 'Achtergrond kleur';
      texts.param_color_2 = 'tekstkleur';
      texts.param_font_family = 'Lettertype';
      texts.param_print_header = 'Pagina-koptekst opnemen (1=ja, 0=nee)';
      texts.param_print_logo = 'Druklogo (1=ja, 0=nee)';
      texts.payment_due_date_label = 'Vervaldatum';
      texts.payment_terms_label = 'Betaling';
   }
   else {
      texts.customer = 'Customer No';
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
      texts.param_font_family = 'Font type';
      texts.param_print_header = 'Include page header (1=yes, 0=no)';
      texts.param_print_logo = 'Print logo (1=yes, 0=no)';
      texts.payment_due_date_label = 'Due date';
      texts.payment_terms_label = 'Payment';
   }
   return texts;
}

BananaInvoice.prototype.initParam = function () {
   this.param = {};
   /*output 0 PDF, 1 XML*/
   this.param.output = 0;
   /*selezione 0 n.fattura, 1 cliente*/
   this.param.selezione = 0;
   this.param.selezioneNoCliente = '';
   this.param.selezioneNoFattura = '';
   this.param.print_header = true;
   this.param.print_logo = true;
   this.param.font_family = '';
   this.param.color_1 = '#337ab7';
   this.param.color_2 = '#ffffff';
}

BananaInvoice.prototype.isEmpty = function (obj) {
   for(var key in obj) {
      if(obj.hasOwnProperty(key))
         return false;
   }
   return true;
}

BananaInvoice.prototype.print = function (invoiceObj, repDocObj, repStyleObj) {

   if (this.isEmpty(invoiceObj)) {
      //ERROR
      return;
   }
   // Invoice texts which need translation
   var langDoc = '';
   if (invoiceObj.customer_info.lang)
      langDoc = invoiceObj.customer_info.lang;
   if (langDoc.length <= 0)
      langDoc = invoiceObj.document_info.locale;
   var texts = this.getInvoiceTexts(langDoc);

   // Invoice document
   var reportObj = Banana.Report;

   if (!repDocObj) {
      var documentTitle = texts.invoice;
      if (invoiceObj.document_info.title) {
         documentTitle = invoiceObj.document_info.title;
      }
      repDocObj = reportObj.newReport(documentTitle + ' ' + invoiceObj.document_info.number);
   } else {
      var pageBreak = repDocObj.addPageBreak();
      //pageBreak.addClass("pageReset");
   }
   
   //Text begin
   if (invoiceObj.document_info.text_begin) {
      this.mmInvoiceTableTopMargin = 90;
      repDocObj.addParagraph(invoiceObj.document_info.text_begin, "begin_text");
   }

   this.printPageHeader(invoiceObj, repDocObj, repStyleObj, texts);
   var tableObj = repDocObj.addTable("invoiceTable");
   for (var i=0;i<this.mmInvoiceTableWidth;i++) {
      tableObj.addColumn('pxCol');
   }
   this.printTableHeader(invoiceObj, tableObj, texts);
   this.printTableContent(invoiceObj, tableObj, texts);
   this.printClosureText(invoiceObj, repDocObj, texts);
   this.applyStyle(repStyleObj);

   
   return repDocObj;
}

BananaInvoice.prototype.printClosureText = function (invoiceObj, repDocObj, texts) {
   /*
   *  Adds the footer of the invoice: notes, greetings and text closure
   */
   //Notes
   for (var i = 0; i < invoiceObj.note.length; i++) {
      if (invoiceObj.note[i].description) {
         repDocObj.addParagraph(invoiceObj.note[i].description, 'notes');
      }
   }

   //Greetings
   if (invoiceObj.document_info.greetings) {
      repDocObj.addParagraph(invoiceObj.document_info.greetings, 'greetings');
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
         repDocObj.addParagraph(text[i], 'params');
      }
   }
}

BananaInvoice.prototype.printPageHeader = function (invoiceObj, repDocObj, repStyleObj, texts) {
   /*
   *  Adds logo and company name to the page header, the output is printed on every page
   */
   var tab = repDocObj.getHeader().addTable("pageHeader");
   var col1 = tab.addColumn("pageHeaderCol1");
   var col2 = tab.addColumn("pageHeaderCol2");
   var headerLogoSection = repDocObj.addSection("");

   if (this.param.print_logo) {
      var logoPrinted=false;
      if (typeof (Banana.Report.logoFormat)) {
         var logoFormat = Banana.Report.logoFormat("Logo");
         if (logoFormat) {
            var logoElement = logoFormat.createDocNode(headerLogoSection, repStyleObj, "logo");
            repDocObj.getHeader().addChild(logoElement);
            logoPrinted = true;
         }
      }
      if (!logoPrinted) {
         repDocObj.addImage("documents:logo", "logoStyle");
      }
   }

   if (this.param.print_header) {
      tableRow = tab.addRow();
      var cell1 = tableRow.addCell("", "");
      var cell2 = tableRow.addCell("", "amount");
      var supplierNameLines = this.getCompanyName(invoiceObj.supplier_info).split('\n');
      for (var i = 0; i < supplierNameLines.length; i++) {
         cell2.addParagraph(supplierNameLines[i], "bold", 1);
      }
      var supplierLines = this.getCompanyAddress(invoiceObj.supplier_info).split('\n');
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
}

BananaInvoice.prototype.printTableContent = function (invoiceObj, table, texts) {
   /*
   *  Adds the content of the invoice: items and totals
   */
   //Items
   for (var i = 0; i < invoiceObj.items.length; i++) {
      var item = invoiceObj.items[i];

      var className = "item_cell";
      if (item.item_type && item.item_type.indexOf("total") === 0) {
         className = "subtotal_cell";
      }
      if (item.item_type && item.item_type.indexOf("note") === 0) {
         className = "note_cell";
      }

      var tableRow = table.addRow();
      var descriptionCell = tableRow.addCell("", "padding-left padding-right thin-border-top " + className, this.mmDescriptionColWidth);
      descriptionCell.addParagraph(item.description);
      descriptionCell.addParagraph(item.description2);

      if (className == "note_cell") {
         tableRow.addCell('', "padding-left padding-right thin-border-top " + className, this.mmQuantityColWidth+this.mmUnitPriceColWidth+this.mmTotalColWidth);
      }
      else if (className == "subtotal_cell") {
         tableRow.addCell('', "amount padding-left padding-right thin-border-top " + className, this.mmQuantityColWidth+this.mmUnitPriceColWidth);
         tableRow.addCell(this.toInvoiceAmountFormat(invoiceObj, item.total_amount_vat_exclusive), "amount padding-left padding-right thin-border-top " + className, this.mmTotalColWidth);
      }
      else {
         tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.quantity), "amount padding-left padding-right thin-border-top " + className, this.mmQuantityColWidth);
         tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.unit_price.calculated_amount_vat_exclusive), "amount padding-left padding-right thin-border-top " + className, this.mmUnitPriceColWidth);
         tableRow.addCell(this.toInvoiceAmountFormat(invoiceObj, item.total_amount_vat_exclusive), "amount padding-left padding-right thin-border-top " + className, this.mmTotalColWidth);
      }
   }

   tableRow = table.addRow();
   tableRow.addCell("", "border-bottom", this.mmInvoiceTableWidth);

   tableRow = table.addRow();
   tableRow.addCell("", "", this.mmInvoiceTableWidth);


   //TOTAL NET
   if (invoiceObj.billing_info.total_vat_rates.length > 0) {
      tableRow = table.addRow();
      tableRow.addCell(" ", "padding-left padding-right", this.mmDescriptionColWidth)
      tableRow.addCell(texts.totalnet, "padding-left padding-right", this.mmQuantityColWidth);
      tableRow.addCell(" ", "padding-left padding-right", this.mmUnitPriceColWidth)
      tableRow.addCell(this.toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_amount_vat_exclusive), "amount padding-left padding-right", this.mmTotalColWidth);

      for (var i = 0; i < invoiceObj.billing_info.total_vat_rates.length; i++) {
         tableRow = table.addRow();
         tableRow.addCell("", "padding-left padding-right", this.mmDescriptionColWidth);
         tableRow.addCell(texts.vat + " " + invoiceObj.billing_info.total_vat_rates[i].vat_rate + "%", "padding-left padding-right", this.mmQuantityColWidth);
         tableRow.addCell(this.toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_vat_rates[i].total_amount_vat_exclusive), "amount padding-left padding-right", this.mmUnitPriceColWidth);
         tableRow.addCell(this.toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_vat_rates[i].total_vat_amount), "amount padding-left padding-right", this.mmTotalColWidth);
      }
   }


   //TOTAL ROUNDING DIFFERENCE
   if (invoiceObj.billing_info.total_rounding_difference.length) {
      tableRow = table.addRow();
      tableRow.addCell(" ", "padding-left padding-right", this.mmDescriptionColWidth);
      tableRow.addCell(texts.rounding, "padding-left padding-right", this.mmQuantityColWidth);
      tableRow.addCell(" ", "padding-left padding-right", this.mmUnitPriceColWidth)
      tableRow.addCell(this.toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_rounding_difference), "amount padding-left padding-right", this.mmTotalColWidth);
   }

   tableRow = table.addRow();
   tableRow.addCell("", "", this.mmInvoiceTableWidth);


   //FINAL TOTAL
   tableRow = table.addRow();
   tableRow.addCell("", "", this.mmDescriptionColWidth)
   tableRow.addCell(texts.total.toUpperCase() + " " + invoiceObj.document_info.currency, "total_cell", this.mmQuantityColWidth);
   tableRow.addCell(" ", "total_cell", this.mmUnitPriceColWidth);
   tableRow.addCell(this.toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_to_pay), "total_cell amount", this.mmTotalColWidth);

   tableRow = table.addRow();
   tableRow.addCell("", "", this.mmInvoiceTableWidth);

}

BananaInvoice.prototype.printTableHeader = function (invoiceObj, table, texts) {
   /*
   *  Adds invoice details (date, invoice n., customer n.), bill address and columns header
   *  to the table header in order to print this content on multiple pages
   */

   var tableRow = table.getHeader().addRow('invoiceInfo');
   var cell1 = tableRow.addCell('', 'invoiceInfo', this.mmInvoiceHeaderCol1Width);
   var cell2 = tableRow.addCell('', 'invoiceInfo bold', this.mmInvoiceHeaderCol2Width);
   var cell3 = tableRow.addCell('', 'invoiceInfo', this.mmInvoiceHeaderCol3Width);

   var invoiceDate = Banana.Converter.toLocaleDateFormat(invoiceObj.document_info.date);
   //Document title
   var documentTitle = texts.invoice;
   if (invoiceObj.document_info.title) {
      documentTitle = invoiceObj.document_info.title;
   }
   cell1.addParagraph(documentTitle + ":", "");
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
   cell2.addParagraph("", "").addFieldPageNr();

   var addressLines = this.getAddressTo(invoiceObj.customer_info).split('\n');
   for (var i = 0; i < addressLines.length; i++) {
      cell3.addParagraph(addressLines[i]);
   }
   
   //columns titles
   tableRow = table.getHeader().addRow('invoiceTableHeader');
   tableRow.addCell(texts.description, 'invoiceTableHeader', this.mmDescriptionColWidth);
   tableRow.addCell(texts.qty, 'invoiceTableHeader amount', this.mmQuantityColWidth);
   tableRow.addCell(texts.unit_price, 'invoiceTableHeader amount', this.mmUnitPriceColWidth);
   tableRow.addCell(texts.total + ' ' + invoiceObj.document_info.currency, 'invoiceTableHeader amount', this.mmTotalColWidth);

}

BananaInvoice.prototype.printXML = function (jsonInvoice) {

   var eFattura = new EFattura(this.banDocument);
   eFattura.initDatiContribuente();
   if (!eFattura.datiContribuente)
      return;
   var xmlDocument = Banana.Xml.newDocument("root");
   eFattura.createInstance(xmlDocument, jsonInvoice);
   //param.incremental++;
   //updateScriptSettings(param);
   var output = Banana.Xml.save(xmlDocument);
   if (output != "@Cancel") {
      eFattura.saveData(output);
   }
}

BananaInvoice.prototype.setParam = function (param) {
   if (param && typeof (param) === 'object') {
      this.param = param;
   } else if (param && typeof (param) === 'string') {
      this.param = JSON.parse(param)
   }
   this.verifyParam();
}

BananaInvoice.prototype.toInvoiceAmountFormat = function (invoiceObj, value) {
   if (invoiceObj && invoiceObj.document_info)
      return Banana.Converter.toLocaleNumberFormat(value, invoiceObj.document_info.decimals_amounts, true);
   return '';
}

BananaInvoice.prototype.verifyBananaVersion = function () {
   if (!this.banDocument)
      return false;
   if (typeof (Banana.document.invoicesCustomers) === 'undefined') {
      var msg = this.getErrorMessage(this.ID_ERR_VERSION, 'it');
      msg = msg.replace("%1", 'Banana.document.invoicesCustomers');
      this.banDocument.addMessage(msg, this.ID_ERR_VERSION);
      return false;
   }
   else if (typeof (Banana.IO) === 'undefined') {
      var msg = this.getErrorMessage(this.ID_ERR_VERSION, 'it');
      msg = msg.replace("%1", 'Banana.IO');
      this.banDocument.addMessage(msg, this.ID_ERR_VERSION);
      return false;
   }
   else if (typeof (Banana.Xml.newDocument) === 'undefined') {
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

BananaInvoice.prototype.verifyParam = function () {
   if (!this.param.output)
      this.param.output = 0;
   if (!this.param.selezione)
      this.param.selezione = 0;
   if (!this.param.selezioneCliente)
      this.param.selezioneCliente = '';
   if (!this.param.selezioneFattura)
      this.param.selezioneFattura = '';
   if (!this.param.print_header)
      this.param.print_header = false;
   if (!this.param.print_logo)
      this.param.print_logo = false;
   if (!this.param.font_family)
      this.param.font_family = '';
   if (!this.param.color_1)
      this.param.color_1 = '#337ab7';
   if (!this.param.color_2)
      this.param.color_2 = '#ffffff';
}

