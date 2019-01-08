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
// @id = ch.banana.it.efattura.b2b
// @api = 1.0
// @pubdate = 2019-01-08
// @publisher = Banana.ch SA
// @description = [BETA] Fattura elettronica (XML, PDF)...
// @description.it = [BETA] Fattura elettronica (XML, PDF)...
// @doctype = *
// @task = app.command
// @inputdatasource = none
// @timeout = -1
// @includejs = ch.banana.it.invoice.it05.js
// @includejs = ch.banana.script.italy_vat_2017.errors.js
// @includejs = ch.banana.script.italy_vat_2017.journal.js
// @includejs = ch.banana.script.italy_vat.daticontribuente.js
// @includejs = ch.banana.script.italy_vat_2017.xml.js

//TODO: aggiungere codice destinatario

function exec(inData, options) {
   if (!Banana.document) {
      return "@Cancel";
   }

   var eFattura = new EFattura(Banana.document);
   if (!eFattura.verifyBananaVersion())
      return "@Cancel";

   var param = {};
   if (inData.length > 0) {
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
   
   eFattura.setParam(param);
   var jsonCustomerList = eFattura.loadData();
   
   if (jsonCustomerList.length<=0)
      return;
      
   if (eFattura.param.output == 0) {
      //anteprima
      var docs = [];
      var styles = [];
      for (var i in jsonCustomerList) {
         var jsonInvoices = jsonCustomerList[i];
         for (var j = 0; j < jsonInvoices.length; j++) {
            var jsonInvoice = jsonInvoices[j];
//Banana.console.log(JSON.stringify(jsonInvoice));
            if (jsonInvoice.customer_info) {
               var repDocObj = Banana.Report.newReport('');
               var repStyleObj = Banana.Report.newStyleSheet();
               eFattura.createReport(jsonInvoice, repDocObj, repStyleObj);
               docs.push(repDocObj);
               styles.push(repStyleObj);
            }
         }
      }
      if (docs.length) {
         Banana.Report.preview("", docs, styles);
         /*TEST*/
         /*if (typeof (Banana.Report.exportPdf) !== 'undefined') {
            var destFolder = "c:\\temp\\";
            var fileName = destFolder + "helloworld.pdf"
            Banana.Report.exportPdf(fileName, docs, styles);
         }*/
         /*END TEST*/
      }
   }
   else {
      //output xml
      for (var i in jsonCustomerList) {
         var jsonInvoices = jsonCustomerList[i];
         var xmlDocument = Banana.Xml.newDocument("root");
         var output = eFattura.createXml(jsonInvoices, xmlDocument, true);
         if (output != "@Cancel") {
            var xslt = "<?xml-stylesheet type='text/xsl' href='fatturaordinaria_v1.2.1.xslt'?>";
            var outputStyled = output.slice(0, 39) + xslt + output.slice(39);
            eFattura.saveFile(outputStyled);
         }
      }
   }
}

/*Update script's parameters*/
var blockSignal=false;
function settingsDialog() {
   var eFattura = new EFattura(Banana.document);
   var savedParam = Banana.document.getScriptSettings();
   if (savedParam.length > 0) {
      eFattura.setParam(JSON.parse(savedParam));
   }

   var dialog = Banana.Ui.createUi("ch.banana.it.efattura.b2b.dialog.ui");
   var allRadioButton = dialog.tabWidget.findChild('allRadioButton');
   var numeroFatturaRadioButton = dialog.tabWidget.findChild('numeroFatturaRadioButton');
   var numeroFatturaLineEdit = dialog.tabWidget.findChild('numeroFatturaLineEdit');
   var clienteRadioButton = dialog.tabWidget.findChild('clienteRadioButton');
   var clienteComboBox = dialog.tabWidget.findChild('clienteComboBox');
   var stampaPDFRadioButton = dialog.tabWidget.findChild('stampaPDFRadioButton');
   var stampaXmlRadioButton = dialog.tabWidget.findChild('stampaXmlRadioButton');
   var numeroProgressivoLineEdit = dialog.tabWidget.findChild('numeroProgressivoLineEdit');
   var destFolderLineEdit = dialog.tabWidget.findChild('destFolderLineEdit');
   var apriXmlCheckBox = dialog.tabWidget.findChild('apriXmlCheckBox');

   var printHeaderCheckBox = dialog.tabWidget.findChild('printHeaderCheckBox');
   var printLogoCheckBox = dialog.tabWidget.findChild('printLogoCheckBox');
   var printQuantityCheckBox = dialog.tabWidget.findChild('printQuantityCheckBox');
   var fontTypeLineEdit = dialog.tabWidget.findChild('fontTypeLineEdit');
   var bgColorLineEdit = dialog.tabWidget.findChild('bgColorLineEdit');
   var textColorLineEdit = dialog.tabWidget.findChild('textColorLineEdit');
   var invoiceRow1LineEdit = dialog.tabWidget.findChild('invoiceRow1LineEdit');
   var invoiceRow2LineEdit = dialog.tabWidget.findChild('invoiceRow2LineEdit');
   var invoiceRow3LineEdit = dialog.tabWidget.findChild('invoiceRow3LineEdit');
   var invoiceRow4LineEdit = dialog.tabWidget.findChild('invoiceRow4LineEdit');
   var invoiceRow5LineEdit = dialog.tabWidget.findChild('invoiceRow5LineEdit');
   var invoiceFooterTextEdit = dialog.tabWidget.findChild('invoiceFooterTextEdit');

   
   //periodo
   var periodAllRadioButton = dialog.findChild('periodAllRadioButton');
   var periodAllLabel = dialog.findChild('periodAllLabel');
   var periodSelectedRadioButton = dialog.findChild('periodSelectedRadioButton');
   var startDateLabel = dialog.findChild('startDateLabel');
   var startDateEdit = dialog.findChild('startDateEdit');
   var toDateLabel = dialog.findChild('toDateLabel');
   var toDateEdit = dialog.findChild('toDateEdit');
   var periodComboBox = dialog.findChild('periodComboBox');
   var yearComboBox = dialog.findChild('yearComboBox');
   


   //Lettura dati
   if (eFattura.param.selection == 2)
      allRadioButton.checked = true;
   else if (eFattura.param.selection == 1)
      clienteRadioButton.checked = true;
   else
      numeroFatturaRadioButton.checked = true;

   numeroFatturaLineEdit.text = eFattura.param.selection_invoice;
   var elencoClienti = eFattura.getCustomerList();
   clienteComboBox.addItems(elencoClienti);
   var index = 0;
   for (var i in elencoClienti) {
      if (elencoClienti[i].indexOf(eFattura.param.selection_customer)>=0) {
         index = i;
         break;
      }
   }
   //clienteComboBox.currentText = eFattura.param.selection_customer;
   clienteComboBox.currentIndex = index;

   var selectedRow = parseInt(Banana.document.cursor.rowNr);
   if (selectedRow && Banana.document.table('Transactions') && Banana.document.table('Transactions').rowCount > selectedRow) {
      var noFattura = Banana.document.table('Transactions').value(selectedRow, "DocInvoice");
      if (noFattura)
         numeroFatturaLineEdit.text = noFattura;
   }

   if (eFattura.param.output == 1)
      stampaXmlRadioButton.checked = true;
   else
      stampaPDFRadioButton.checked = true;
   numeroProgressivoLineEdit.text = eFattura.param.xml.progressive || '0';
   destFolderLineEdit.text = eFattura.param.xml.destination_folder;
   apriXmlCheckBox.checked = eFattura.param.xml.open_file;

   printHeaderCheckBox.checked = eFattura.param.report.print_header;
   printLogoCheckBox.checked = eFattura.param.report.print_logo;
   printQuantityCheckBox.checked = eFattura.param.report.print_quantity;
   fontTypeLineEdit.text = eFattura.param.report.font_family;
   bgColorLineEdit.text = eFattura.param.report.color_1;
   textColorLineEdit.text = eFattura.param.report.color_2;
   invoiceRow1LineEdit.text = eFattura.param.report.header_row_1;
   invoiceRow2LineEdit.text = eFattura.param.report.header_row_2;
   invoiceRow3LineEdit.text = eFattura.param.report.header_row_3;
   invoiceRow4LineEdit.text = eFattura.param.report.header_row_4;
   invoiceRow5LineEdit.text = eFattura.param.report.header_row_5;
   //invoiceFooterTextEdit.setHtml(eFattura.param.report.footer);
   invoiceFooterTextEdit.setText(eFattura.param.report.footer);


   //Groupbox periodo
   if (eFattura.param.periodAll)
      periodAllRadioButton.checked = true;
   else
      periodSelectedRadioButton.checked = true;
   var accountingData = {};
   eFattura.readAccountingData(accountingData);
   periodAllLabel.text = accountingData.openingYear;
   var years = [];
   years.push(accountingData.openingYear);
   if (accountingData.closureYear != accountingData.openingYear) {
      periodAllLabel.text += '/' + accountingData.closureYear;
      years.push(accountingData.closureYear);
   }
   var fromDate = eFattura.param.periodStartDate;
   var toDate = eFattura.param.periodEndDate;
   if (!fromDate || !toDate) {
      fromDate = Banana.Converter.stringToDate(accountingData.accountingOpeningDate, "YYYY-MM-DD");
      toDate = Banana.Converter.stringToDate(accountingData.accountingClosureDate, "YYYY-MM-DD");
   }
   startDateEdit.setDate(fromDate);
   toDateEdit.setDate(toDate);
   periodComboBox.currentIndex = parseInt(eFattura.param.periodSelected);
   yearComboBox.addItems(years);
   
   var periods = [];
   periods.push("");
   periods.push("gennaio");
   periods.push("febbraio");
   periods.push("marzo");
   periods.push("aprile");
   periods.push("maggio");
   periods.push("giugno");
   periods.push("luglio");
   periods.push("agosto");
   periods.push("settembre");
   periods.push("ottobre");
   periods.push("novembre");
   periods.push("dicembre");
   periods.push("------");
   periods.push("1. trimestre");
   periods.push("2. trimestre");
   periods.push("3. trimestre");
   periods.push("4. trimestre");
   periods.push("------");
   periods.push("1. semestre");
   periods.push("2. semestre");
   periods.push("------");
   periods.push("Anno");
   periodComboBox.addItems(periods);

   
   //funzioni dialogo
   dialog.checkdata = function () {
      dialog.accept();
   }
   dialog.enableButtons = function () {
      if (periodAllRadioButton.checked) {
         startDateEdit.enabled = false;
         startDateEdit.update();
         toDateEdit.enabled = false;
         toDateEdit.update();
         periodComboBox.enabled = false;
         periodComboBox.update();
         yearComboBox.enabled = false;
         yearComboBox.update();
      }
      else {
         startDateEdit.enabled = true;
         startDateEdit.update();
         toDateEdit.enabled = true;
         toDateEdit.update();
         periodComboBox.enabled = true;
         periodComboBox.update();
         yearComboBox.enabled = true;
         yearComboBox.update();
      }
      if (numeroFatturaRadioButton.checked) {
         numeroFatturaLineEdit.enabled = true;
         clienteComboBox.enabled = false;
      }
      else if (clienteRadioButton.checked) {
         numeroFatturaLineEdit.enabled = false;
         clienteComboBox.enabled = true;
      }
      else {
         numeroFatturaLineEdit.enabled = false;
         clienteComboBox.enabled = false;
      }
   }
   dialog.updateDates = function () {
      blockSignal=true;
      var index = parseInt(periodComboBox.currentIndex.toString());
      if (index == 0) {
         return;
      }
      else if (index == 13 || index == 18 || index == 21) {
         periodComboBox.currentIndex = index+1;
         return;
      }
      var year = yearComboBox.currentIndex.toString();
      if (year.length < 4)
         year = accountingData.closureYear;
      var fromDate = year + '-01-01';
      var toDate = year + '-12-31';
      if (index == 1) {
         fromDate = year + '-01-01';
         toDate = year + '-01-31';
      }
      else if (index == 2) {
         //mese con 28 o 29 giorni
         var day = 28;
         if (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0))
           day = 29;
         fromDate = year + '-02-01';
         toDate = year + '-02-' + day.toString();
      }
      else if (index == 3) {
         fromDate = year + '-03-01';
         toDate = year + '-03-31';
      }
      else if (index == 4) {
         fromDate = year + '-04-01';
         toDate = year + '-04-30';
      }
      else if (index == 5) {
         fromDate = year + '-05-01';
         toDate = year + '-05-31';
      }
      else if (index == 6) {
         fromDate = year + '-06-01';
         toDate = year + '-06-30';
      }
      else if (index == 7) {
         fromDate = year + '-07-01';
         toDate = year + '-07-31';
      }
      else if (index == 8) {
         fromDate = year + '-08-01';
         toDate = year + '-08-31';
      }
      else if (index == 9) {
         fromDate = year + '-09-01';
         toDate = year + '-09-30';
      }
      else if (index == 10) {
         fromDate = year + '-10-01';
         toDate = year + '-10-31';
      }
      else if (index == 11) {
         fromDate = year + '-11-01';
         toDate = year + '-11-30';
      }
      else if (index == 12) {
         fromDate = year + '-12-01';
         toDate = year + '-12-31';
      }
      else if (index == 14) {
         fromDate = year + '-01-01';
         toDate = year + '-03-31';
      }
      else if (index == 15) {
         fromDate = year + '-04-01';
         toDate = year + '-06-30';
      }
      else if (index == 16) {
         fromDate = year + '-07-01';
         toDate = year + '-09-30';
      }
      else if (index == 17) {
         fromDate = year + '-10-01';
         toDate = year + '-12-31';
      }
      else if (index == 19) {
         fromDate = year + '-01-01';
         toDate = year + '-06-30';
      }
      else if (index == 20) {
         fromDate = year + '-06-30';
         toDate = year + '-12-31';
      }
      else if (index == 22) {
         fromDate = year + '-01-01';
         toDate = year + '-12-31';
      }
      fromDate = Banana.Converter.toInternalDateFormat(fromDate, "yyyy-mm-dd");
      toDate = Banana.Converter.toInternalDateFormat(toDate, "yyyy-mm-dd");
      startDateEdit.setDate(fromDate);
      toDateEdit.setDate(toDate);
      blockSignal=false;
  }
   dialog.updatePeriods = function () {
      if (blockSignal)
         return;
      periodComboBox.currentIndex = 0;         
   }
   dialog.showHelp = function () {
      Banana.Ui.showHelp("ch.banana.it.efattura.b2b");
   }
   dialog.buttonBox.accepted.connect(dialog, dialog.checkdata);
   dialog.buttonBox.helpRequested.connect(dialog, dialog.showHelp);
   allRadioButton.clicked.connect(dialog.enableButtons);
   numeroFatturaRadioButton.clicked.connect(dialog.enableButtons);
   clienteRadioButton.clicked.connect(dialog.enableButtons);
   periodAllRadioButton.clicked.connect(dialog, dialog.enableButtons);
   periodSelectedRadioButton.clicked.connect(dialog, dialog.enableButtons);
   periodComboBox.currentIndexChanged.connect(dialog, dialog.updateDates);
   startDateEdit.dateChanged.connect(dialog, dialog.updatePeriods);
   toDateEdit.dateChanged.connect(dialog, dialog.updatePeriods);

   //Visualizzazione dialogo
   Banana.application.progressBar.pause();
   dialog.enableButtons();
   var dlgResult = dialog.exec();
   Banana.application.progressBar.resume();
   if (dlgResult !== 1)
      return false;

   //Salvataggio dati
   eFattura.param.selection_invoice = numeroFatturaLineEdit.text;
   eFattura.param.selection_customer = eFattura.getCustomerId(clienteComboBox.currentText);
   //Banana.console.debug("selection_customer" +  eFattura.param.selection_customer );
   if (allRadioButton.checked)
      eFattura.param.selection = 2;
   else if (clienteRadioButton.checked)
      eFattura.param.selection = 1;
   else
      eFattura.param.selection = 0;
   if (stampaXmlRadioButton.checked)
      eFattura.param.output = 1;
   else
      eFattura.param.output = 0;

   eFattura.param.xml.progressive = parseInt(numeroProgressivoLineEdit.text);
   eFattura.param.xml.destination_folder = destFolderLineEdit.text;
   eFattura.param.xml.open_file = apriXmlCheckBox.checked;

   eFattura.param.report.print_header = printHeaderCheckBox.checked;
   eFattura.param.report.print_logo = printLogoCheckBox.checked;
   eFattura.param.report.print_quantity = printQuantityCheckBox.checked;
   eFattura.param.report.font_family = fontTypeLineEdit.text;
   eFattura.param.report.color_1 = bgColorLineEdit.text;
   eFattura.param.report.color_2 = textColorLineEdit.text;
   eFattura.param.report.header_row_1 = invoiceRow1LineEdit.text;
   eFattura.param.report.header_row_2 = invoiceRow2LineEdit.text;
   eFattura.param.report.header_row_3 = invoiceRow3LineEdit.text;
   eFattura.param.report.header_row_4 = invoiceRow4LineEdit.text;
   eFattura.param.report.header_row_5 = invoiceRow5LineEdit.text;
   //eFattura.param.report.footer = invoiceFooterTextEdit.html;
   eFattura.param.report.footer = invoiceFooterTextEdit.plainText;

   
   //Groupbox periodo
   if (periodAllRadioButton.checked) {
      eFattura.param.periodAll = true;
      eFattura.param.periodStartDate = accountingData.accountingOpeningDate;
      eFattura.param.periodEndDate = accountingData.accountingClosureDate;
   }
   else {
      eFattura.param.periodAll = false;
      eFattura.param.periodStartDate = startDateEdit.text < 10 ? "0" + startDateEdit.text : startDateEdit.text;
      eFattura.param.periodStartDate = Banana.Converter.toInternalDateFormat(eFattura.param.periodStartDate, "dd/mm/yyyy");
      eFattura.param.periodEndDate = toDateEdit.text < 10 ? "0" + toDateEdit.text : toDateEdit.text;
      eFattura.param.periodEndDate = Banana.Converter.toInternalDateFormat(eFattura.param.periodEndDate, "dd/mm/yyyy");
      eFattura.param.periodSelected = periodComboBox.currentIndex.toString();
   }
   
   var paramToString = JSON.stringify(eFattura.param);
   Banana.document.setScriptSettings(paramToString);
   return true;
}

function EFattura(banDocument) {
   this.banDocument = banDocument;
   if (this.banDocument === undefined)
      this.banDocument = Banana.document;
   this.name = "Banana Accounting EFattura";
   this.version = "V1.0";
   this.helpId = "ch.banana.it.efattura.b2b.js";
   this.errorList = [];

   /* errors id*/
   this.ID_ERR_ACCOUNTING_TYPE_NOTVALID = "ID_ERR_ACCOUNTING_TYPE_NOTVALID";
   this.ID_ERR_DATICONTRIBUENTE_NOTFOUND = "ID_ERR_DATICONTRIBUENTE_NOTFOUND";
   this.ID_ERR_NOINVOICE = "ID_ERR_NOINVOICE";
   this.ID_ERR_TABLE_ADDRESS_MISSING = "ID_ERR_TABLE_ADDRESS_MISSING";
   this.ID_ERR_TABLE_ADDRESS_NOT_UPDATED = "ID_ERR_TABLE_ADDRESS_NOT_UPDATED";
   this.ID_ERR_VERSION = "ID_ERR_VERSION";
   this.ID_ERR_VERSION_NOTSUPPORTED = "ID_ERR_VERSION_NOTSUPPORTED";
   this.ID_ERR_XML_FORMATO_NONVALIDO = "ID_ERR_XML_FORMATO_NONVALIDO";
   this.ID_ERR_XML_LUNGHEZZA_NONVALIDA = "ID_ERR_XML_LUNGHEZZA_NONVALIDA";
   this.ID_ERR_XML_LUNGHEZZAMIN_NONVALIDA = "ID_ERR_XML_LUNGHEZZAMIN_NONVALIDA";
   this.ID_ERR_XML_LUNGHEZZAMAX_NONVALIDA = "ID_ERR_XML_LUNGHEZZAMAX_NONVALIDA";

   this.initParam();
   this.initNamespaces();
   this.initSchemarefs();
   this.journalInvoices = this.banDocument.invoicesCustomers();
}

EFattura.prototype.addMessage = function (msg, idMsg) {
   this.errorList.push(msg + " idMsg:[" + this.helpId + "::" + idMsg + "]");
   this.banDocument.addMessage(msg, this.helpId + "::" + idMsg);
}

//Aggiunge il testo al nodo controllando la stringa
//len: una sola cifra lunghezza fissa, due cifre separate da ... lunghezza min e max, nessuna cifra non controlla
//context: dà ulteriori informazioni nella stringa del messaggio d'errrore
EFattura.prototype.addTextNode = function (parentNode, text, len, context) {
   if (!parentNode)
      return;
      
   if (!text)
      text = '';
      
   var fixedLen = 0;
   var minLen = 0;
   var maxLen = 0;
   var msg = '';
   if (len && len.indexOf("...")>0) {
      var lenArray = len.split("...");
      if (lenArray.length>1) {
         minLen = parseInt(lenArray[0]);
         maxLen = parseInt(lenArray[1]);
      }
   }
   else if (len && len.length>0) {
      fixedLen = parseInt(len);
   }
   if (fixedLen > 0 && text.length != fixedLen) {
      var msg = this.getErrorMessage(this.ID_ERR_XML_LUNGHEZZA_NONVALIDA);
      msg = msg.replace("%1", context);
      msg = msg.replace("%2", text);
      msg = msg.replace("%3", fixedLen);
      this.addMessage(msg, this.ID_ERR_XML_LUNGHEZZA_NONVALIDA);
   }
   else if (maxLen && text.length > maxLen) {
      var msg = this.getErrorMessage(this.ID_ERR_XML_LUNGHEZZAMAX_NONVALIDA);
      msg = msg.replace("%1", context);
      msg = msg.replace("%2", text);
      msg = msg.replace("%3", maxLen);
      this.addMessage(msg, this.ID_ERR_XML_LUNGHEZZAMAX_NONVALIDA);
   }
   else if (minLen && text.length < minLen) {
      var msg = this.getErrorMessage(this.ID_ERR_XML_LUNGHEZZAMIN_NONVALIDA);
      msg = msg.replace("%1", context);
      msg = msg.replace("%2", text);
      msg = msg.replace("%3", minLen);
      this.addMessage(msg, this.ID_ERR_XML_LUNGHEZZAMIN_NONVALIDA);
   }
   parentNode.addTextNode(text);
}

EFattura.prototype.createReport = function (jsonInvoice, report, stylesheet) {

   if (jsonInvoice && jsonInvoice.customer_info) {
      printInvoice(jsonInvoice, report, stylesheet, this.param.report);
      var debug=false;
      if (debug) {
         this.journal = new Journal(this.banDocument);
         this.journal.load();
         report.addPageBreak();
         this.journal._debugPrintJournal(report, stylesheet);
         report.addPageBreak();
         this.journal._debugPrintCustomersSuppliers(report, stylesheet);
      }
      setInvoiceStyle(report, stylesheet, this.param.report);
      stylesheet.addStyle("@page").setAttribute("margin", "0");
   }
}

EFattura.prototype.createXml = function (jsonInvoiceList, xmlDocument, indent) {

   if (!xmlDocument || jsonInvoiceList.length<=0)
      return "@Cancel";
      
   var nodeRoot = this.createXmlHeader(jsonInvoiceList[0], xmlDocument);
   if (!nodeRoot || this.isEmpty(nodeRoot))
      return "@Cancel";
   for (var i = 0; i < jsonInvoiceList.length; i++) {
      this.createXmlBody(jsonInvoiceList[i], nodeRoot);
   }
   return Banana.Xml.save(xmlDocument, indent);
}
/*
* xml instance file <FatturaElettronicaBody>
*/
EFattura.prototype.createXmlBody = function (jsonInvoice, nodeRoot) {

   var invoiceObj = null;
   if (typeof (jsonInvoice) === 'object') {
      invoiceObj = jsonInvoice;
   } else if (typeof (jsonInvoice) === 'string') {
      invoiceObj = JSON.parse(jsonInvoice)
   }

   if (!nodeRoot || !invoiceObj || this.isEmpty(this.datiContribuente))
      return;

   //Numero fattura da visualizzare in eventuali messaggi d'errore per facilitare l'individuazione dell'errore
   var msgHelpNoFattura = " (No fattura " + invoiceObj.document_info.number + ")";
   
   // Body
   var nodeFatturaElettronicaBody = nodeRoot.addElement("FatturaElettronicaBody");
   var nodeDatiGenerali = nodeFatturaElettronicaBody.addElement("DatiGenerali");
   var nodeDatiGeneraliDocumento = nodeDatiGenerali.addElement("DatiGeneraliDocumento");
   var nodeTipoDocumento = nodeDatiGeneraliDocumento.addElement("TipoDocumento");
   var docType = this.getValueFromJournal("IT_TipoDoc", invoiceObj.customer_info.number, invoiceObj.document_info.number);
   this.addTextNode(nodeTipoDocumento, docType, '4', 'DatiGeneraliDocumento/TipoDocumento '+ msgHelpNoFattura);
   var nodeDivisa = nodeDatiGeneraliDocumento.addElement("Divisa");
   this.addTextNode(nodeDivisa, invoiceObj.document_info.currency, '3', 'DatiGeneraliDocumento/Divisa '+ msgHelpNoFattura);
   var nodeData = nodeDatiGeneraliDocumento.addElement("Data");
   this.addTextNode(nodeData, invoiceObj.document_info.date, '10', 'DatiGeneraliDocumento/Data '+ msgHelpNoFattura);
   var nodeNumero = nodeDatiGeneraliDocumento.addElement("Numero");
   this.addTextNode(nodeNumero, invoiceObj.document_info.number, '1...20', 'DatiGeneraliDocumento/Numero '+ msgHelpNoFattura);

   //In total_vat_rates[] non sono presenti imponibile/imposta per aliquota allo 0%, da correggere in Banana
   var imponibileAliquota0 = 0;
   var nodeDatiBeniServizi = nodeFatturaElettronicaBody.addElement("DatiBeniServizi");
   for (var i = 0; i < invoiceObj.items.length; i++) {
      if (invoiceObj.items[i].item_type !== "item")
         continue;
      var nodeDettaglioLinee = nodeDatiBeniServizi.addElement("DettaglioLinee");
      var nodeNumeroLinea = nodeDettaglioLinee.addElement("NumeroLinea");
      this.addTextNode(nodeNumeroLinea, parseInt(i + 1).toString(), '1...4', 'DettaglioLinee/NumeroLinea '+ msgHelpNoFattura);
      var nodeDescrizione = nodeDettaglioLinee.addElement("Descrizione");
      this.addTextNode(nodeDescrizione, invoiceObj.items[i].description, '1...1000', 'DettaglioLinee/Descrizione '+ msgHelpNoFattura);
      var stampaQuantita = false;
      if (!Banana.SDecimal.isZero(invoiceObj.items[i].quantity))
         stampaQuantita = true;
      if (stampaQuantita && parseInt(invoiceObj.items[i].quantity)===1 && invoiceObj.items[i].mesure_unit.length<=0)
         stampaQuantita = false;
      if (stampaQuantita) {
         var quantita = Banana.SDecimal.round(invoiceObj.items[i].quantity, {'decimals':4});
         var nodeQuantita = nodeDettaglioLinee.addElement("Quantita");
         this.addTextNode(nodeQuantita, quantita , '4...21', 'DettaglioLinee/Quantita '+ msgHelpNoFattura);
         var nodeUnitaMisura = nodeDettaglioLinee.addElement("UnitaMisura");
         this.addTextNode(nodeUnitaMisura, invoiceObj.items[i].mesure_unit , '1...10', 'DettaglioLinee/UnitaMisura '+ msgHelpNoFattura);
      }
      var nodePrezzoUnitario = nodeDettaglioLinee.addElement("PrezzoUnitario");
      this.addTextNode(nodePrezzoUnitario, invoiceObj.items[i].unit_price.calculated_amount_vat_exclusive, '4...21', 'DettaglioLinee/PrezzoUnitario '+ msgHelpNoFattura);
      var nodePrezzoTotale = nodeDettaglioLinee.addElement("PrezzoTotale");
      this.addTextNode(nodePrezzoTotale, invoiceObj.items[i].total_amount_vat_exclusive, '4...21', 'DettaglioLinee/PrezzoTotale '+ msgHelpNoFattura);
      var nodeAliquotaIVA = nodeDettaglioLinee.addElement("AliquotaIVA");
      var aliquotaIva = Banana.SDecimal.round(invoiceObj.items[i].unit_price.vat_rate, {'decimals':2});
      if (invoiceObj.items[i].unit_price.vat_code.length>0) {
         this.addTextNode(nodeAliquotaIVA, aliquotaIva, '4...6', 'DettaglioLinee/AliquotaIVA '+ msgHelpNoFattura);
         if (Banana.SDecimal.isZero(aliquotaIva)) {
            imponibileAliquota0 = Banana.SDecimal.add(invoiceObj.items[i].total_amount_vat_exclusive, imponibileAliquota0);
            var natura = this.getValueFromJournal("IT_Natura", invoiceObj.customer_info.number, invoiceObj.document_info.number, invoiceObj.items[i].origin_row);
            var nodeNatura = nodeDettaglioLinee.addElement("Natura");
            this.addTextNode(nodeNatura, natura, '2', 'DettaglioLinee/Natura '+ msgHelpNoFattura);
         }
      }
   }
   var nodeDatiRiepilogo = nodeDatiBeniServizi.addElement("DatiRiepilogo")
   for (var i = 0; i < invoiceObj.billing_info.total_vat_rates.length; i++) {
      var nodeAliquotaIVA = nodeDatiRiepilogo.addElement("AliquotaIVA");
      var aliquotaIva = Banana.SDecimal.round(invoiceObj.billing_info.total_vat_rates[i].vat_rate, {'decimals':2});
      if (aliquotaIva.length<=0)
         aliquotaIva = "0.00";
      this.addTextNode(nodeAliquotaIVA, aliquotaIva, '4...6', 'DatiRiepilogo/AliquotaIVA '+ msgHelpNoFattura);

      var nodeImponibileImporto = nodeDatiRiepilogo.addElement("ImponibileImporto");
      this.addTextNode(nodeImponibileImporto, invoiceObj.billing_info.total_vat_rates[i].total_amount_vat_exclusive, '4...15', 'DatiRiepilogo/ImponibileImporto '+ msgHelpNoFattura);

      var nodeImposta = nodeDatiRiepilogo.addElement("Imposta");
      this.addTextNode(nodeImposta, invoiceObj.billing_info.total_vat_rates[i].total_vat_amount, '4...15', 'DatiRiepilogo/Imposta '+ msgHelpNoFattura);
   }
   if (!Banana.SDecimal.isZero(imponibileAliquota0)) {
      var nodeAliquotaIVA = nodeDatiRiepilogo.addElement("AliquotaIVA");
      this.addTextNode(nodeAliquotaIVA, "0.00", '4...6', 'DatiRiepilogo/AliquotaIVA '+ msgHelpNoFattura);
      var nodeImponibileImporto = nodeDatiRiepilogo.addElement("ImponibileImporto");
      this.addTextNode(nodeImponibileImporto, imponibileAliquota0, '4...15', 'DatiRiepilogo/ImponibileImporto '+ msgHelpNoFattura);
      var nodeImposta = nodeDatiRiepilogo.addElement("Imposta");
      this.addTextNode(nodeImposta, "0.00", '4...15', 'DatiRiepilogo/Imposta '+ msgHelpNoFattura);
   }
}

/*
* xml instance file <FatturaElettronicaHeader>
*/
EFattura.prototype.createXmlHeader = function (jsonInvoice, xmlDocument) {
   var invoiceObj = null;
   if (typeof (jsonInvoice) === 'object') {
      invoiceObj = jsonInvoice;
   } else if (typeof (jsonInvoice) === 'string') {
      invoiceObj = JSON.parse(jsonInvoice)
   }

   if (!xmlDocument || !invoiceObj || this.isEmpty(this.datiContribuente))
      return null;

   //<Document>
   var formatoTrasmissione = this.getValueFromJournal("IT_XmlFormatoTrasmissione", invoiceObj.customer_info.number, invoiceObj.document_info.number);
   if (formatoTrasmissione !== "FPA12" && formatoTrasmissione !== "FPR12") {
      var msg = this.getErrorMessage(this.ID_ERR_XML_FORMATO_NONVALIDO);
      this.addMessage(msg, this.ID_ERR_XML_FORMATO_NONVALIDO);
      return null;
   }

   var nodeRoot = xmlDocument.addElement("p:FatturaElettronica");
   nodeRoot.setAttribute("versione", formatoTrasmissione);

   for (var j in this.namespaces) {
      var prefix = this.namespaces[j]['prefix'];
      var namespace = this.namespaces[j]['namespace'];
      nodeRoot.setAttribute(prefix, namespace);
   }
   var attrsSchemaLocation = ''
   for (var j in this.schemaRefs) {
      var schema = this.schemaRefs[j];
      if (schema.length > 0) {
         attrsSchemaLocation += " " + schema;
      }
   }
   if (attrsSchemaLocation.length > 0)
      nodeRoot.setAttribute("xsi:schemaLocation", attrsSchemaLocation);

   //Numero fattura da visualizzare in eventuali messaggi d'errore per facilitare l'individuazione dell'errore
   var msgHelpNoFattura = " (No fattura " + invoiceObj.document_info.number + ")";

   //Header

   var nodeFatturaElettronicaHeader = nodeRoot.addElement("FatturaElettronicaHeader");

   //[1.1] DatiTrasmissione 
   var nodeDatiTrasmissione = nodeFatturaElettronicaHeader.addElement("DatiTrasmissione");
   //[1.1.1] IdTrasmittente 
   var nodeIdTrasmittente = nodeDatiTrasmissione.addElement("IdTrasmittente");
   //[1.1.1.1] IdPaese 
   var nodeIdPaese = nodeIdTrasmittente.addElement("IdPaese");
   this.addTextNode(nodeIdPaese, this.datiContribuente.nazione, '2', 'IdTrasmittente/IdPaese' + msgHelpNoFattura);
   //[1.1.1.2] IdCodice 
   var nodeIdCodice = nodeIdTrasmittente.addElement("IdCodice");
   this.addTextNode(nodeIdCodice, this.datiContribuente.codiceFiscale, '1...28', 'IdTrasmittente/IdCodice' + msgHelpNoFattura);
   //[1.1.2] ProgressivoInvio 
   var nodeProgressivoInvio = nodeDatiTrasmissione.addElement("ProgressivoInvio");
   this.addTextNode(nodeProgressivoInvio, this.getProgressiveNumber(), '1...10', 'DatiTrasmissione/ProgressivoInvio' + msgHelpNoFattura);
   //[1.1.3] FormatoTrasmissione 
   var nodeFormatoTrasmissione = nodeDatiTrasmissione.addElement("FormatoTrasmissione");
   this.addTextNode(nodeFormatoTrasmissione, formatoTrasmissione, '5', 'DatiTrasmissione/FormatoTrasmissione' + msgHelpNoFattura);
   var nodeCodiceDestinatario = nodeDatiTrasmissione.addElement("CodiceDestinatario");
   var codiceDestinatario = this.getValueFromJournal("IT_XmlCodiceDestinatario", invoiceObj.customer_info.number, invoiceObj.document_info.number);
   if (codiceDestinatario === "0000000") {
      this.addTextNode(nodeCodiceDestinatario, codiceDestinatario, '7', 'DatiTrasmissione/CodiceDestinatario' + msgHelpNoFattura);
      var nodePECDestinatario = nodeDatiTrasmissione.addElement("PECDestinatario");
      var pecDestinatario = this.getValueFromJournal("IT_XmlPECDestinatario", invoiceObj.customer_info.number, invoiceObj.document_info.number);
      this.addTextNode(nodePECDestinatario, pecDestinatario, '7...256', 'DatiTrasmissione/PECDestinatario' + msgHelpNoFattura);
   }
   else{
      this.addTextNode(nodeCodiceDestinatario, codiceDestinatario, '6...7', 'DatiTrasmissione/CodiceDestinatario' + msgHelpNoFattura);
   }
   //[1.2] CedentePrestatore 
   var nodeCedentePrestatore = nodeFatturaElettronicaHeader.addElement("CedentePrestatore");
   //[1.2.1] DatiAnagrafici 
   var nodeDatiAnagrafici = nodeCedentePrestatore.addElement("DatiAnagrafici");
   //[1.2.1.1] IdFiscaleIVA 
   var nodeIdFiscaleIVA = nodeDatiAnagrafici.addElement("IdFiscaleIVA");
   //[1.2.1.1.1] IdPaese 
   var nodeIdPaese = nodeIdFiscaleIVA.addElement("IdPaese");
   this.addTextNode(nodeIdPaese, this.datiContribuente.nazione, '2', 'CedentePrestatore/DatiAnagrafici/IdFiscaleIVA/IdPaese' + msgHelpNoFattura);
   //[1.2.1.1.2] IdCodice 
   var nodeIdCodice = nodeIdFiscaleIVA.addElement("IdCodice");
   this.addTextNode(nodeIdCodice, this.datiContribuente.partitaIva, '1...28', 'CedentePrestatore/DatiAnagrafici/IdFiscaleIVA/IdCodice' + msgHelpNoFattura);
   //[1.2.1.2] CodiceFiscale 
   if (this.datiContribuente.codiceFiscale.length>0) {
      var nodeCodiceFiscale = nodeDatiAnagrafici.addElement("CodiceFiscale");
      this.addTextNode(nodeCodiceFiscale, this.datiContribuente.codiceFiscale, '11...16', 'CedentePrestatore/DatiAnagrafici/CodiceFiscale' + msgHelpNoFattura);
   }
   //[1.2.1.3] Anagrafica 
   var nodeAnagrafica = nodeDatiAnagrafici.addElement("Anagrafica");
   if (this.datiContribuente.tipoContribuente === 0) {
      var nodeNome = nodeAnagrafica.addElement("Nome");
      var nodeCognome = nodeAnagrafica.addElement("Cognome");

      this.addTextNode(nodeNome, this.datiContribuente.nome, '1...60', '<CedentePrestatore><DatiAnagrafici><Anagrafica><Nome>' + msgHelpNoFattura);
      this.addTextNode(nodeCognome, this.datiContribuente.cognome, '1...60', '<CedentePrestatore><DatiAnagrafici><Anagrafica><Cognome>' + msgHelpNoFattura);

   }
   else if (this.datiContribuente.tipoContribuente === 1) {
      var nodeDenominazione = nodeAnagrafica.addElement("Denominazione");
      this.addTextNode(nodeDenominazione, this.datiContribuente.societa, '1...80', '<CedentePrestatore><DatiAnagrafici><Anagrafica><Denominazione>' + msgHelpNoFattura);
   }

   var nodeRegimeFiscale = nodeDatiAnagrafici.addElement("RegimeFiscale");
   var regFis = 'RF';
   if (this.datiContribuente.tipoRegimeFiscale + 1 < 10)
      regFis += '0';
   regFis += this.datiContribuente.tipoRegimeFiscale + 1;
   this.addTextNode(nodeRegimeFiscale, regFis, '4', '<CedentePrestatore><DatiAnagrafici><RegimeFiscale>' + msgHelpNoFattura);
   var nodeSede = nodeCedentePrestatore.addElement("Sede");
   var nodeIndirizzo = nodeSede.addElement("Indirizzo");
   this.addTextNode(nodeIndirizzo, this.datiContribuente.indirizzo, '1...60', '<CedentePrestatore><Sede><Indirizzo>' + msgHelpNoFattura);
   if (this.datiContribuente.ncivico.length>0) {
      var nodeNumeroCivico = nodeSede.addElement("NumeroCivico");
      this.addTextNode(nodeNumeroCivico, this.datiContribuente.ncivico, '1...8', '<CedentePrestatore><Sede><NumeroCivico>' + msgHelpNoFattura);
   }
   var nodeCAP = nodeSede.addElement("CAP");
   this.addTextNode(nodeCAP, this.datiContribuente.cap, '5', '<CedentePrestatore><Sede><CAP>' + msgHelpNoFattura);
   var nodeComune = nodeSede.addElement("Comune");
   this.addTextNode(nodeComune, this.datiContribuente.comune, '1...60', '<CedentePrestatore><Sede><Comune>' + msgHelpNoFattura);
   if (this.datiContribuente.nazione === 'IT') {
      var nodeProvincia = nodeSede.addElement("Provincia");
      this.addTextNode(nodeProvincia, this.datiContribuente.provincia, '2', '<CedentePrestatore><Sede><Provincia>' + msgHelpNoFattura);
   }
   var nodeNazione = nodeSede.addElement("Nazione");
   this.addTextNode(nodeNazione, this.datiContribuente.nazione, '2', '<CedentePrestatore><Sede><Nazione>' + msgHelpNoFattura);

   var nodeCessionarioCommittente = nodeFatturaElettronicaHeader.addElement("CessionarioCommittente");
   var nodeDatiAnagrafici = nodeCessionarioCommittente.addElement("DatiAnagrafici");
   if (invoiceObj.customer_info.vat_number) {
      var nodeIdFiscaleIVA = nodeDatiAnagrafici.addElement("IdFiscaleIVA");
      var nodeIdPaese = nodeIdFiscaleIVA.addElement("IdPaese");
      var countryCode = invoiceObj.customer_info.country_code;
      if (!countryCode || countryCode.length<=0) {
         countryCode = this.getCountryCode(invoiceObj.customer_info.country);
      }
      this.addTextNode(nodeIdPaese, countryCode, '2', '<CessionarioCommittente><DatiAnagrafici><IdFiscaleIVA><IdPaese>' + msgHelpNoFattura);
      var nodeIdCodice = nodeIdFiscaleIVA.addElement("IdCodice");
      this.addTextNode(nodeIdCodice, invoiceObj.customer_info.vat_number, '1...28', '<CessionarioCommittente><DatiAnagrafici><IdFiscaleIVA><IdCodice>' + msgHelpNoFattura);
   }
   else {
      var nodeCodiceFiscale = nodeDatiAnagrafici.addElement("CodiceFiscale");
      this.addTextNode(nodeCodiceFiscale, invoiceObj.customer_info.fiscal_number, '11...16', '<CessionarioCommittente><DatiAnagrafici><CodiceFiscale>' + msgHelpNoFattura);
   }
   var nodeAnagrafica = nodeDatiAnagrafici.addElement("Anagrafica");
   // nodeAnagrafica.addTextNode(JSON.stringify(invoiceObj));
   if (invoiceObj.customer_info.business_name) {
      var nodeDenominazione = nodeAnagrafica.addElement("Denominazione");
      this.addTextNode(nodeDenominazione, invoiceObj.customer_info.business_name, '1...80', '<CessionarioCommittente><DatiAnagrafici><Anagrafica><Denominazione>' + msgHelpNoFattura);
   }
   else {
      var nodeNome = nodeAnagrafica.addElement("Nome");
      var nodeCognome = nodeAnagrafica.addElement("Cognome");

      this.addTextNode(nodeNome, invoiceObj.customer_info.first_name, '1...60', '<CessionarioCommittente><DatiAnagrafici><Anagrafica><Nome>' + msgHelpNoFattura);
      this.addTextNode(nodeCognome, invoiceObj.customer_info.last_name, '1...60', '<CessionarioCommittente><DatiAnagrafici><Anagrafica><Cognome>' + msgHelpNoFattura);
   }

   var nodeSede = nodeCessionarioCommittente.addElement("Sede");
   var nodeIndirizzo = nodeSede.addElement("Indirizzo");
   this.addTextNode(nodeIndirizzo, invoiceObj.customer_info.address1, '1...60', '<CessionarioCommittente><Sede><Indirizzo>' + msgHelpNoFattura);

   var nodeCAP = nodeSede.addElement("CAP");
   this.addTextNode(nodeCAP, invoiceObj.customer_info.postal_code, '5', '<CessionarioCommittente><Sede><CAP>' + msgHelpNoFattura);
   var nodeComune = nodeSede.addElement("Comune");
   this.addTextNode(nodeComune, invoiceObj.customer_info.city, '1...60', '<CessionarioCommittente><Sede><Comune>' + msgHelpNoFattura);
   var countryCode = invoiceObj.customer_info.country_code;
   if (!countryCode || countryCode.length<=0) {
      countryCode = this.getCountryCode(invoiceObj.customer_info.country);
   }
   if (countryCode === 'IT') {
      var nodeProvincia = nodeSede.addElement("Provincia");
      this.addTextNode(nodeProvincia, invoiceObj.customer_info.state, '2', '<CessionarioCommittente><Sede><Provincia>' + msgHelpNoFattura);
   }
   var nodeNazione = nodeSede.addElement("Nazione");
   this.addTextNode(nodeNazione, countryCode, '2', '<CessionarioCommittente><Sede><Nazione>' + msgHelpNoFattura);

   return nodeRoot;
}

EFattura.prototype.getCountryCode = function(countryName) {
  var countryCode = 'it';
  if (!countryName || countryName.length<=0)
    return countryCode.toUpperCase();
  countryCode = countryName.toLowerCase();
  if (countryCode == 'italy' || countryCode == 'italia') {
    countryCode = 'it';
  }
  if (countryCode == 'germany' || countryCode == 'germania' || countryCode == 'deutschland') {
    countryCode = 'de';
  }
  if (countryCode == 'france' || countryCode == 'francia') {
    countryCode = 'fr';
  }
  if (countryCode == 'switzerland' || countryCode == 'schweiz'|| countryCode == 'suisse'|| countryCode == 'svizzera') {
    countryCode = 'ch';
  }
  if (countryCode == 'japan' || countryCode == 'jpn') {
    countryCode = 'jp';
  }
 return countryCode.toUpperCase();
}

EFattura.prototype.getCustomerId = function (customerDescription) {
   var customerId = customerDescription;
   if (customerId.length<=0)
      return customerId;
      
   var posStart = 0;
   var posEnd = customerId.indexOf("   ");
   if (posEnd<=posStart)
      return customerId;
   
   customerId = customerId.substring(posStart, posEnd).trim();
   //Banana.console.debug(customerId);
   /*var tableAccounts = this.banDocument.table('Accounts');
   if (tableAccounts) {
      var tRowAccounts = tableAccounts.findRowByValue('Account', customerId);
      if (!tRowAccounts)
         customerId = '';
   }*/
   
   return customerId;
}

EFattura.prototype.getCustomerList = function () {

   var customersList = [];
   
   if (!this.journalInvoices)
      return customersList;

   /*tiene solamente i clienti che hanno delle fatture*/
   var customerIdList = [];
   for (var i = 0; i < this.journalInvoices.rowCount; i++) {
      var tRow = this.journalInvoices.row(i);
      if (tRow.value('ObjectType') === 'InvoiceDocument' && tRow.value('CounterpartyId').length > 0) {
         var customerId = tRow.value('CounterpartyId').toString();
         if (customerIdList.indexOf(customerId) < 0) {
            customerIdList.push(customerId);
         }
      }
   }
   
   for (var i = 0; i < this.journalInvoices.rowCount; i++) {
      var tRow = this.journalInvoices.row(i);
      if (tRow.value('ObjectType') === 'Counterparty' && tRow.value('CounterpartyId').length > 0) {
         var customerId = tRow.value('CounterpartyId').toString();
         if (customerIdList.indexOf(customerId) < 0)
            continue;
         var jsonData = JSON.parse(tRow.value('ObjectJSonData'));
         if (jsonData && jsonData.Counterparty && jsonData.Counterparty.customer_info) {
            if (jsonData.Counterparty.customer_info.business_name)
               customerId += "   " + jsonData.Counterparty.customer_info.business_name;
            else if (jsonData.Counterparty.customer_info.last_name)
               customerId += "   " + jsonData.Counterparty.customer_info.last_name + " " + jsonData.Counterparty.customer_info.first_name;
         }
         customersList.push(customerId);
      }
   }
   
   return customersList;
}

EFattura.prototype.getErrorMessage = function (errorId) {
   //Document language
   var lang = this.banDocument.locale;
   if (lang.length > 2)
      lang = lang.substr(0, 2);
   var rtnMsg = '';
   if (errorId == this.ID_ERR_ACCOUNTING_TYPE_NOTVALID) {
      if (lang == 'it')
         rtnMsg = "Il tipo di contabilità non è valido. Manca la tabella Conti";
      else
         rtnMsg = "The file is not valid. The table Accounts is missing";
   }
   else if (errorId == this.ID_ERR_DATICONTRIBUENTE_NOTFOUND) {
      if (lang == 'it')
         rtnMsg = "Dati contribuente non definiti. Impostare con il comando dell'app 'Dati contribuente'";
      else
         rtnMsg = "Dati contribuente not found. Please use the app command 'Dati contribuente'";
   }
   else if (errorId == this.ID_ERR_NOINVOICE) {
      if (lang == 'it')
         rtnMsg = "Nessuna fattura trovata. Controllare se i conti appartengono al gruppo clienti e il periodo impostato è corretto";
      else
         rtnMsg = "No invoice found. Please check if accounts belong to customer's group and if the period is correct";
   }
   else if (errorId == this.ID_ERR_TABLE_ADDRESS_MISSING) {
      if (lang == 'it')
         rtnMsg = "Le colonne indirizzi nella tabella Conti sono mancanti. Aggiornare con il comando Strumenti - Aggiungi nuove funzionalità";
      else
         rtnMsg = "Address columns of table Accounts are missing. Please update table Accounts with the command Toos - Add new functionalities";
   }
   else if (errorId == this.ID_ERR_TABLE_ADDRESS_NOT_UPDATED) {
      if (lang == 'it')
         rtnMsg = "Le colonne indirizzi nella tabella Conti sono di una versione non compatibile. Aggiornare con il comando Strumenti - Converti in nuovo file";
      else
         rtnMsg = "Address columns are outdated. Please update them with the command Tools - Convert to new file";
   }
   else if (errorId == this.ID_ERR_VERSION) {
      if (lang == 'it')
         rtnMsg = "Metodo %1 non supportato. Aggiornare Banana alla versione più recente";
      else
         rtnMsg = "The function %1 is not supported. Please install the latest version of Banana Accounting";
   }
   else if (errorId == this.ID_ERR_VERSION_NOTSUPPORTED) {
      if (lang == 'it')
         rtnMsg = "Lo script non funziona con questa versione di Banana Contabilità. Aggiornare a Banana Experimental";
      else
         rtnMsg = "This script does not run with this version of Banana Accounting. Please update to Banana Experimental";
   }
   else if (errorId == this.ID_ERR_XML_FORMATO_NONVALIDO) {
      if (lang == 'it')
         rtnMsg = "Formato trasmissione non valido";
      else
         rtnMsg = "Not valid transmission format";
   }
   else if (errorId == this.ID_ERR_XML_LUNGHEZZA_NONVALIDA) {
      if (lang == 'it')
         rtnMsg = "Lunghezza campo non valida: %1, valore inserito: %2, lunghezza richiesta: %3";
      else
         rtnMsg = "Invalid element size. Node: %1, current value: %2, required size: %3";
   }
   else if (errorId == this.ID_ERR_XML_LUNGHEZZAMIN_NONVALIDA) {
      if (lang == 'it')
         rtnMsg = "Lunghezza campo non valida: %1, valore inserito: %2, lunghezza minima: %3";
      else
         rtnMsg = "Invalid element size. Node: %1, current value: %2, minimum size: %3";
   }
   else if (errorId == this.ID_ERR_XML_LUNGHEZZAMAX_NONVALIDA) {
      if (lang == 'it')
         rtnMsg = "Lunghezza campo non valida: %1, valore inserito: %2, lunghezza massima: %3";
      else
         rtnMsg = "Invalid element size. Node: %1, current value: %2, maximum size: %3";
   }

   return rtnMsg + " [" + errorId + "] ";
}

EFattura.prototype.getProgressiveNumber = function () {
   var numeroInvio = 0;
   if (this.param.xml && this.param.xml.progressive)
      numeroInvio = parseInt(this.param.xml.progressive);

   //base-36 [0-9a-z]
   numeroInvio = numeroInvio.toString(36).toUpperCase();

   var stringaNumeroInvio = '';
   for (var i = 5; i > numeroInvio.length; i--)
      stringaNumeroInvio += '0'
   stringaNumeroInvio += numeroInvio;
   return stringaNumeroInvio;
}

EFattura.prototype.getValueFromJournal = function (columnName, customerId, invoiceId, originRow) {

   if (columnName.length<=0 ||customerId.length<=0 || invoiceId.length<=0)
      return "";

   if (!this.journal) {
      this.journal = new Journal(this.banDocument);
      this.journal.load();
   }

   if (!this.journal.customers || !this.journal.customers[customerId])
      return "";
   
   for (var j in this.journal.customers[customerId].transactions) {
      var rowJsonObj = this.journal.customers[customerId].transactions[j];
      if (rowJsonObj["IT_NoDoc"] === invoiceId && rowJsonObj[columnName]) {
         if (originRow) {
            if (rowJsonObj["JRowOrigin"] === originRow)
               return rowJsonObj[columnName];
         }
         else {
            return rowJsonObj[columnName];
         }
      }
   }
   return "";
}

EFattura.prototype.initDatiContribuente = function () {
   this.datiContribuente = {};
   var savedParam = this.banDocument.getScriptSettings("ch.banana.script.italy_vat.daticontribuente.js");
   if (savedParam.length > 0) {
      this.datiContribuente = JSON.parse(savedParam);
      return true;
   }
   else {
      var msg = this.getErrorMessage(this.ID_ERR_DATICONTRIBUENTE_NOTFOUND);
      this.addMessage(msg, this.ID_ERR_DATICONTRIBUENTE_NOTFOUND);
   }
   return false;
}

EFattura.prototype.initNamespaces = function () {
   this.namespaces = [
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

EFattura.prototype.initParam = function () {
   this.param = {};
   /*output 0=pdf, 1=xml*/
   this.param.output = 0;
   /*selection 0=fattura singola, 1=singolo cliente 2=tutto*/
   this.param.selection = 0;
   /*invoice number*/
   this.param.selection_invoice = '';
   this.param.selection_customer = '';
   
   /* periodSelected 0=none, 1=1.Q, 2=2.Q, 3=3Q, 4=4Q, 10=1.S, 12=2.S, 30=Year */
   this.param.periodAll = true;
   this.param.periodSelected = 1;
   this.param.periodStartDate = '';
   this.param.periodEndDate = '';
   
   this.param.xml = {};
   this.param.xml.progressive = '1';
   this.param.xml.open_file = false;
   this.param.xml.destination_folder = '';

   this.param.report = {};
   this.param.report.print_header = true;
   this.param.report.print_logo = true;
   this.param.report.print_quantity = false;
   this.param.report.font_family = '';
   this.param.report.color_1 = '#337ab7';
   this.param.report.color_2 = '#ffffff';
   this.param.report.header_row_1 = '';
   this.param.report.header_row_2 = '';
   this.param.report.header_row_3 = '';
   this.param.report.header_row_4 = '';
   this.param.report.header_row_5 = '';
   this.param.report.footer = '';
}

EFattura.prototype.initSchemarefs = function () {
   this.schemaRefs = [
      'http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2 http://www.fatturapa.gov.it/export/fatturazione/sdi/fatturapa/v1.2/Schema_del_file_xml_FatturaPA_versione_1.2.xsd'
   ];
};

EFattura.prototype.isEmpty = function (obj) {
   for (var key in obj) {
      if (obj.hasOwnProperty(key))
         return false;
   }
   return true;
}

EFattura.prototype.loadData = function () {
   var jsonInvoiceList = [];
   if (this.param.selection == 0 && this.param.selection_invoice.length <= 0)
      return jsonInvoiceList;
   if (this.param.selection == 1 && this.param.selection_customer.length <= 0)
      return jsonInvoiceList;
   if (!this.initDatiContribuente())
      return jsonInvoiceList;

   if (!this.journalInvoices)
      return jsonInvoiceList;

   var periodAll = this.param.periodAll;
   var startDate = this.param.periodStartDate;
   var endDate = this.param.periodEndDate;
  
   for (var i = 0; i < this.journalInvoices.rowCount; i++) {
      var tRow = this.journalInvoices.row(i);
      if (tRow.value('ObjectJSonData') && tRow.value('ObjectType') === 'InvoiceDocument') {
         var jsonData = {};
         jsonData = JSON.parse(tRow.value('ObjectJSonData'));
         var addInvoice = true;
         if (parseInt(this.param.selection) === 0 && jsonData.InvoiceDocument.document_info.number !== this.param.selection_invoice) {
            addInvoice = false;
         }
         if (parseInt(this.param.selection) === 1 && jsonData.InvoiceDocument.customer_info.number !== this.param.selection_customer) {
            addInvoice = false;
         }
         if (addInvoice && !periodAll) {
            if (jsonData.InvoiceDocument.document_info.date < startDate || jsonData.InvoiceDocument.document_info.date > endDate) {
               addInvoice = false;
            }
         }
         if (addInvoice) {
            jsonInvoiceList.push(jsonData.InvoiceDocument);
         }
      }
   }

   if (jsonInvoiceList.length<=0) {
      var msg = this.getErrorMessage(this.ID_ERR_NOINVOICE);
      this.addMessage(msg, this.ID_ERR_NOINVOICE);
   }

   //raggruppa per cliente perché il file xml può contenere un solo cliente
   //se ci sono più clienti verranno creati più files xml
   var jsonCustomerList = {};
   for (var i = 0; i < jsonInvoiceList.length; i++) {
      var jsonInvoice = jsonInvoiceList[i];
      if (jsonInvoice.customer_info) {
         var accountId = jsonInvoice.customer_info.number;
         if (!jsonCustomerList[accountId])
            jsonCustomerList[accountId] = [];
         jsonCustomerList[accountId].push(jsonInvoice);
      }
   }
   
   return jsonCustomerList;
}

EFattura.prototype.readAccountingData = function (param) {
   if (!param || !this.banDocument)
      return;
   //Table FileInfo
   param.fileInfo = {};
   param.fileInfo["BasicCurrency"] = "";
   param.fileInfo["OpeningDate"] = "";
   param.fileInfo["ClosureDate"] = "";
   param.fileInfo["CustomersGroup"] = "";
   param.fileInfo["SuppliersGroup"] = "";
   param.fileInfo["Address"] = {};
   param.fileInfo["Address"]["Company"] = "";
   param.fileInfo["Address"]["Courtesy"] = "";
   param.fileInfo["Address"]["Name"] = "";
   param.fileInfo["Address"]["FamilyName"] = "";
   param.fileInfo["Address"]["Address1"] = "";
   param.fileInfo["Address"]["Address2"] = "";
   param.fileInfo["Address"]["Zip"] = "";
   param.fileInfo["Address"]["City"] = "";
   param.fileInfo["Address"]["State"] = "";
   param.fileInfo["Address"]["Country"] = "";
   param.fileInfo["Address"]["Web"] = "";
   param.fileInfo["Address"]["Email"] = "";
   param.fileInfo["Address"]["Phone"] = "";
   param.fileInfo["Address"]["Mobile"] = "";
   param.fileInfo["Address"]["Fax"] = "";
   param.fileInfo["Address"]["FiscalNumber"] = "";
   param.fileInfo["Address"]["VatNumber"] = "";

   if (this.banDocument.info) {
      param.fileInfo["BasicCurrency"] = this.banDocument.info("AccountingDataBase", "BasicCurrency");
      param.fileInfo["OpeningDate"] = this.banDocument.info("AccountingDataBase", "OpeningDate");
      param.fileInfo["ClosureDate"] = this.banDocument.info("AccountingDataBase", "ClosureDate");
      if (this.banDocument.info("AccountingDataBase", "CustomersGroup"))
         param.fileInfo["CustomersGroup"] = this.banDocument.info("AccountingDataBase", "CustomersGroup");
      if (this.banDocument.info("AccountingDataBase", "SuppliersGroup"))
         param.fileInfo["SuppliersGroup"] = this.banDocument.info("AccountingDataBase", "SuppliersGroup");
      param.fileInfo["Address"]["Company"] = this.banDocument.info("AccountingDataBase", "Company");
      param.fileInfo["Address"]["Courtesy"] = this.banDocument.info("AccountingDataBase", "Courtesy");
      param.fileInfo["Address"]["Name"] = this.banDocument.info("AccountingDataBase", "Name");
      param.fileInfo["Address"]["FamilyName"] = this.banDocument.info("AccountingDataBase", "FamilyName");
      param.fileInfo["Address"]["Address1"] = this.banDocument.info("AccountingDataBase", "Address1");
      param.fileInfo["Address"]["Address2"] = this.banDocument.info("AccountingDataBase", "Address2");
      param.fileInfo["Address"]["Zip"] = this.banDocument.info("AccountingDataBase", "Zip");
      param.fileInfo["Address"]["City"] = this.banDocument.info("AccountingDataBase", "City");
      param.fileInfo["Address"]["State"] = this.banDocument.info("AccountingDataBase", "State");
      param.fileInfo["Address"]["Country"] = this.banDocument.info("AccountingDataBase", "Country");
      param.fileInfo["Address"]["Web"] = this.banDocument.info("AccountingDataBase", "Web");
      param.fileInfo["Address"]["Email"] = this.banDocument.info("AccountingDataBase", "Email");
      param.fileInfo["Address"]["Phone"] = this.banDocument.info("AccountingDataBase", "Phone");
      param.fileInfo["Address"]["Mobile"] = this.banDocument.info("AccountingDataBase", "Mobile");
      param.fileInfo["Address"]["Fax"] = this.banDocument.info("AccountingDataBase", "Fax");
      param.fileInfo["Address"]["FiscalNumber"] = this.banDocument.info("AccountingDataBase", "FiscalNumber");
      param.fileInfo["Address"]["VatNumber"] = this.banDocument.info("AccountingDataBase", "VatNumber");
   }

   param.accountingOpeningDate = '';
   param.accountingClosureDate = '';
   if (param.fileInfo["OpeningDate"])
      param.accountingOpeningDate = param.fileInfo["OpeningDate"];
   if (param.fileInfo["ClosureDate"])
      param.accountingClosureDate = param.fileInfo["ClosureDate"];

   param.openingYear = '';
   param.closureYear = '';
   if (param.accountingOpeningDate.length >= 10)
      param.openingYear = param.accountingOpeningDate.substring(0, 4);
   if (param.accountingClosureDate.length >= 10)
      param.closureYear = param.accountingClosureDate.substring(0, 4);

   return param;
}

EFattura.prototype.saveFile = function (output) {
   var fileName = "";
   var nazione = "";
   var codiceFiscale = "";
   if (!this.isEmpty(this.datiContribuente)) {
      nazione = this.datiContribuente.nazione;
      codiceFiscale = this.datiContribuente.codiceFiscale;
   }

   //???
   if (nazione === "IT")
      fileName += codiceFiscale;
   else
      fileName += codiceFiscale;

   fileName += "_";

   fileName += this.getProgressiveNumber();
   // Names the file to 'test.xml', easier to reload each time on browser, for testing purposes
   //fileName = 'test';

   if (this.param.xml.destination_folder.length > 0)
      fileName = this.param.xml.destination_folder + fileName + ".xml";
   
   fileName = Banana.IO.getSaveFileName("Save as", fileName, "XML file (*.xml);;All files (*)");
   if (fileName.length) {
      var file = Banana.IO.getLocalFile(fileName);
      file.codecName = "UTF-8";
      file.write(output);
      if (file.errorString) {
         Banana.Ui.showInformation("Write error", file.errorString);
      }
      else {
         if (this.param.xml.open_file)
            Banana.IO.openUrl(fileName);
         this.param.xml.progressive++;
         this.banDocument.setScriptSettings(JSON.stringify(this.param))
      }
   }

}

EFattura.prototype.setDatiContribuente = function (newDatiContribuenti) {
   this.datiContribuente = newDatiContribuenti;
}

EFattura.prototype.setParam = function (param) {
   this.param = param;
   this.verifyParam();
}

EFattura.prototype.verifyBananaVersion = function () {
   //From Experimental 06/09/2018
   var requiredVersion = "9.0.3.180906";
   if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) < 0) {
      var msg = this.getErrorMessage(this.ID_ERR_VERSION_NOTSUPPORTED);
      this.addMessage(msg, this.ID_ERR_VERSION_NOTSUPPORTED);
      return false;
   }
   //controlla se gli indirizzi sono stati impostati
   if (this.banDocument.table('Accounts')) {
      var tColumnNames = this.banDocument.table('Accounts').columnNames.join(";");
      if (tColumnNames.indexOf('Town') > 0 || tColumnNames.indexOf('Company') > 0) {
         //The address columns are not updated
         var msg = this.getErrorMessage(this.ID_ERR_TABLE_ADDRESS_NOT_UPDATED);
         this.addMessage(msg, this.ID_ERR_TABLE_ADDRESS_NOT_UPDATED);
         return false;
      }
      else if (tColumnNames.indexOf('OrganisationName') <= 0) {
         var msg = this.getErrorMessage(this.ID_ERR_TABLE_ADDRESS_MISSING);
         this.addMessage(msg, this.ID_ERR_TABLE_ADDRESS_MISSING);
         return false;
      }
   }
   else {
      var msg = this.getErrorMessage(this.ID_ERR_ACCOUNTING_TYPE_NOTVALID);
      this.addMessage(msg, this.ID_ERR_ACCOUNTING_TYPE_NOTVALID);
      return false;
   }

   return true;
}

EFattura.prototype.verifyParam = function () {
   if (!this.param)
      this.param = {};
      
   if (!this.param.output)   
      this.param.output = 0;
   if (!this.param.selection)   
      this.param.selection = 0;
   if (!this.param.selection_invoice)   
      this.param.selection_invoice = '';
   if (!this.param.selection_customer)   
      this.param.selection_customer = '';

   if (!this.param.periodAll)
      this.param.periodAll = false;
   if (!this.param.periodSelected)
      this.param.periodSelected = 1;
   if (!this.param.periodStartDate)
      this.param.periodStartDate = '';
   if (!this.param.periodEndDate)
      this.param.periodEndDate = '';
      
   if (!this.param.xml)   
      this.param.xml = {};
   if (!this.param.xml.progressive)   
      this.param.xml.progressive = '1';
   if (!this.param.xml.open_file)   
      this.param.xml.open_file = false;
   if (!this.param.xml.destination_folder)   
      this.param.xml.destination_folder = '';

   if (!this.param.report)   
      this.param.report = {};
   if (!this.param.report.print_header)   
      this.param.report.print_header = false;
   if (!this.param.report.print_logo)   
      this.param.report.print_logo = false;
   if (!this.param.report.print_quantity)   
      this.param.report.print_quantity = false;
   if (!this.param.report.font_family)   
      this.param.report.font_family = '';
   if (!this.param.report.color_1)   
      this.param.report.color_1 = '#337ab7';
   if (!this.param.report.color_2)   
      this.param.report.color_2 = '#ffffff';
   if (!this.param.report.header_row_1)   
      this.param.report.header_row_1 = '';
   if (!this.param.report.header_row_2)   
      this.param.report.header_row_2 = '';
   if (!this.param.report.header_row_3)   
      this.param.report.header_row_3 = '';
   if (!this.param.report.header_row_4)   
      this.param.report.header_row_4 = '';
   if (!this.param.report.header_row_5)   
      this.param.report.header_row_5 = '';
   if (!this.param.report.footer)   
      this.param.report.footer = '';
}
