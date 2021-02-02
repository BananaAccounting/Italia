// Copyright [2021] [Banana.ch SA - Lugano Switzerland]
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
// @pubdate = 2021-02-02
// @publisher = Banana.ch SA
// @description = Fattura elettronica XML...
// @description.it = Fattura elettronica XML...
// @doctype = *
// @task = app.command
// @inputdatasource = none
// @timeout = -1
// @includejs = ch.banana.it.efattura.b2b.xml.js

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

   if (jsonCustomerList.length <= 0)
      return;

   //output xml
   for (var i in jsonCustomerList) {
      var jsonInvoices = jsonCustomerList[i];
      var xmlDocument = Banana.Xml.newDocument("root");
      eFattura.clearErrorList();
      var output = eFattura.createXml(jsonInvoices, xmlDocument, true);
      if (output != "@Cancel") {
         if (eFattura.param.output == 0) {
            //Preview HTML
            var escapedString = xml_escapeString(eFattura.param.xml.xslt_filename);
            var xslt = "<?xml-stylesheet type='text/xsl' href='" + escapedString + "'?>";
            var outputStyled = output.slice(0, 39) + xslt + output.slice(39);
            eFattura.saveFile(outputStyled, "html");
         }
         else {
            eFattura.saveFile(outputStyled, "xml");
         }
      }
   }
}

/*Update script's parameters*/
var blockSignal = false;
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
   var stampaHtmlRadioButton = dialog.tabWidget.findChild('stampaHTMLRadioButton');
   var stampaXmlRadioButton = dialog.tabWidget.findChild('stampaXMLRadioButton');
   var numeroProgressivoLineEdit = dialog.tabWidget.findChild('numeroProgressivoLineEdit');
   var destFolderLineEdit = dialog.tabWidget.findChild('destFolderLineEdit');
   var apriXmlCheckBox = dialog.tabWidget.findChild('apriXmlCheckBox');
   var xsltLineEdit = dialog.tabWidget.findChild('xsltLineEdit');


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
      if (elencoClienti[i].indexOf(eFattura.param.selection_customer) >= 0) {
         index = i;
         break;
      }
   }
   //clienteComboBox.currentText = eFattura.param.selection_customer;
   clienteComboBox.currentIndex = index;

   //imposta il numero fattura dalla selezione della tabella registrazioni
   var selectedRow = parseInt(Banana.document.cursor.rowNr);
   if (selectedRow && Banana.document.table('Transactions') && Banana.document.table('Transactions').rowCount > selectedRow) {
      var noFattura = Banana.document.table('Transactions').value(selectedRow, "DocInvoice");
      if (noFattura && noFattura.length > 0)
         numeroFatturaLineEdit.text = noFattura;
   }

   if (eFattura.param.output == 1)
      stampaXmlRadioButton.checked = true;
   else
      stampaHtmlRadioButton.checked = true;
   numeroProgressivoLineEdit.text = eFattura.param.xml.progressive || '0';
   destFolderLineEdit.text = eFattura.param.xml.destination_folder;
   apriXmlCheckBox.checked = eFattura.param.xml.open_file;
   xsltLineEdit.text = eFattura.param.xml.xslt_filename;

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
      if (numeroFatturaLineEdit.text.length <= 0 && numeroFatturaRadioButton.checked) {
         var msg = eFattura.getErrorMessage(eFattura.ID_ERR_INVOICENUMBER_MISSING);
         eFattura.addMessage(msg, eFattura.ID_ERR_INVOICENUMBER_MISSING);
         return;
      }
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
      blockSignal = true;
      var index = parseInt(periodComboBox.currentIndex.toString());
      if (index == 0) {
         return;
      }
      else if (index == 13 || index == 18 || index == 21) {
         periodComboBox.currentIndex = index + 1;
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
      blockSignal = false;
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
   eFattura.param.xml.xslt_filename = xsltLineEdit.text;


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
   this.ID_ERR_INVOICENUMBER_MISSING = "ID_ERR_INVOICENUMBER_MISSING";
   this.ID_ERR_NOINVOICE = "ID_ERR_NOINVOICE";
   this.ID_ERR_TABLE_ADDRESS_MISSING = "ID_ERR_TABLE_ADDRESS_MISSING";
   this.ID_ERR_TABLE_ADDRESS_NOT_UPDATED = "ID_ERR_TABLE_ADDRESS_NOT_UPDATED";
   this.ID_ERR_VERSION = "ID_ERR_VERSION";
   this.ID_ERR_VERSION_NOTSUPPORTED = "ID_ERR_VERSION_NOTSUPPORTED";
   this.ID_ERR_XML_FORMATO_NONVALIDO = "ID_ERR_XML_FORMATO_NONVALIDO";
   this.ID_ERR_XML_LUNGHEZZA_NONVALIDA = "ID_ERR_XML_LUNGHEZZA_NONVALIDA";
   this.ID_ERR_XML_LUNGHEZZAMIN_NONVALIDA = "ID_ERR_XML_LUNGHEZZAMIN_NONVALIDA";
   this.ID_ERR_XML_LUNGHEZZAMAX_NONVALIDA = "ID_ERR_XML_LUNGHEZZAMAX_NONVALIDA";
   this.ID_ERR_DOCTYPE_NOTVALID = "ID_ERR_DOCTYPE_NOTVALID";
   this.ID_ERR_NATURA_NOTVALID = "ID_ERR_NATURA_NOTVALID";

   this.initParam();
   this.initNamespaces();
   this.initSchemarefs();
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
   if (len && len.indexOf("...") > 0) {
      var lenArray = len.split("...");
      if (lenArray.length > 1) {
         minLen = parseInt(lenArray[0]);
         maxLen = parseInt(lenArray[1]);
      }
   }
   else if (len && len.length > 0) {
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

EFattura.prototype.formatAmount = function (amount) {

   var amountFormatted = amount;
   /*if (amountFormatted)
     amountFormatted = Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(amountFormatted))
   else
       amountFormatted = "";*/
   if (Banana.SDecimal.isZero(amountFormatted))
      return "0.00";
   return amountFormatted;
}

EFattura.prototype.clearErrorList = function () {
   this.errorList = [];
}

EFattura.prototype.createXml = function (jsonInvoiceList, xmlDocument, indent) {

   if (!xmlDocument || jsonInvoiceList.length <= 0)
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

   //tipodocumento
   var docType = 'TD01';
   for (var key in invoiceObj.parameters) {
      if (key.startsWith('TD') && key.len > 2)
         docType = key.substr(3);
   }

   //nel caso il tipodocumento non sia un tipo ammesso, segnala l'errore
   if (!['TD01', 'TD02', 'TD03', 'TD04', 'TD05', 'TD06', 'TD16', 'TD17', 'TD18', 'TD19', 'TD20', 'TD21', 'TD22', 'TD23', 'TD24', 'TD25', 'TD26', 'TD27'].includes(docType)) {
      var msg = this.getErrorMessage(this.ID_ERR_DOCTYPE_NOTVALID);
      msg = msg.replace("%1", docType);
      this.addMessage(msg, this.ID_ERR_DOCTYPE_NOTVALID);
   }


   this.addTextNode(nodeTipoDocumento, docType, '4', 'DatiGeneraliDocumento/TipoDocumento ' + msgHelpNoFattura);
   var nodeDivisa = nodeDatiGeneraliDocumento.addElement("Divisa");
   this.addTextNode(nodeDivisa, invoiceObj.document_info.currency, '3', 'DatiGeneraliDocumento/Divisa ' + msgHelpNoFattura);
   var nodeData = nodeDatiGeneraliDocumento.addElement("Data");
   this.addTextNode(nodeData, invoiceObj.document_info.date, '10', 'DatiGeneraliDocumento/Data ' + msgHelpNoFattura);
   var nodeNumero = nodeDatiGeneraliDocumento.addElement("Numero");
   this.addTextNode(nodeNumero, invoiceObj.document_info.number, '1...20', 'DatiGeneraliDocumento/Numero ' + msgHelpNoFattura);

   //2.1.1.9 <ImportoTotaleDocumento> Importo totale del documento al netto dell'eventuale sconto e comprensivo di imposta a debito del cessionario / committente
   //Elemento non obbligatorio, però se non specificato risultano fatture con totale 0 nel nostro sistema di interscambio
   var nodeTotaleDocumento = nodeDatiGeneraliDocumento.addElement("ImportoTotaleDocumento");
   var totaleDaPagare = Banana.SDecimal.round(invoiceObj.billing_info.total_to_pay, { 'decimals': 2 });
   this.addTextNode(nodeTotaleDocumento, this.formatAmount(totaleDaPagare), '4...15', 'DatiGeneraliDocumento/ImportoTotaleDocumento ' + msgHelpNoFattura);

   //In total_vat_rates[] non sono presenti imponibile/imposta per aliquota allo 0%, da correggere in Banana
   //imponibili con aliquota allo 0% vengono raggruppati per codice natura perché nel riepilogo la natura dev'essere specificata
   var imponibileAliquota0List = [];
   var nodeDatiBeniServizi = nodeFatturaElettronicaBody.addElement("DatiBeniServizi");
   for (var i = 0; i < invoiceObj.items.length; i++) {
      if (invoiceObj.items[i].item_type !== "item" && invoiceObj.items[i].item_type !== "note")
         continue;
      var nodeDettaglioLinee = nodeDatiBeniServizi.addElement("DettaglioLinee");
      var nodeNumeroLinea = nodeDettaglioLinee.addElement("NumeroLinea");
      this.addTextNode(nodeNumeroLinea, parseInt(i + 1).toString(), '1...4', 'DettaglioLinee/NumeroLinea ' + msgHelpNoFattura);
      var nodeDescrizione = nodeDettaglioLinee.addElement("Descrizione");
      this.addTextNode(nodeDescrizione, invoiceObj.items[i].description, '1...1000', 'DettaglioLinee/Descrizione ' + msgHelpNoFattura);
      var stampaQuantita = false;
      if (!Banana.SDecimal.isZero(invoiceObj.items[i].quantity))
         stampaQuantita = true;
      if (stampaQuantita && parseInt(invoiceObj.items[i].quantity) === 1 && invoiceObj.items[i].mesure_unit.length <= 0)
         stampaQuantita = false;
      if (stampaQuantita) {
         var quantita = Banana.SDecimal.round(invoiceObj.items[i].quantity, { 'decimals': 4 });
         var nodeQuantita = nodeDettaglioLinee.addElement("Quantita");
         this.addTextNode(nodeQuantita, quantita, '4...21', 'DettaglioLinee/Quantita ' + msgHelpNoFattura);
         var nodeUnitaMisura = nodeDettaglioLinee.addElement("UnitaMisura");
         this.addTextNode(nodeUnitaMisura, invoiceObj.items[i].mesure_unit, '1...10', 'DettaglioLinee/UnitaMisura ' + msgHelpNoFattura);
      }
      var nodePrezzoUnitario = nodeDettaglioLinee.addElement("PrezzoUnitario");
      var prezzoUnitario = invoiceObj.items[i].unit_price.calculated_amount_vat_exclusive;
      this.addTextNode(nodePrezzoUnitario, this.formatAmount(prezzoUnitario), '4...21', 'DettaglioLinee/PrezzoUnitario ' + msgHelpNoFattura);
      var nodePrezzoTotale = nodeDettaglioLinee.addElement("PrezzoTotale");
      var prezzoTotale = invoiceObj.items[i].total_amount_vat_exclusive;
      this.addTextNode(nodePrezzoTotale, this.formatAmount(prezzoTotale), '4...21', 'DettaglioLinee/PrezzoTotale ' + msgHelpNoFattura);
      var nodeAliquotaIVA = nodeDettaglioLinee.addElement("AliquotaIVA");
      var aliquotaIva = Banana.SDecimal.round(invoiceObj.items[i].unit_price.vat_rate, { 'decimals': 2 });
      //se la linea di dettaglio è una linea di descrizione con importo totale a 0, imposta il codice IVA al 22%, così non chiede il codice natura
      if (invoiceObj.items[i].item_type === "note" && Banana.SDecimal.isZero(prezzoTotale) && Banana.SDecimal.isZero(aliquotaIva)) {
         aliquotaIva = Banana.SDecimal.round("22", { 'decimals': 2 });
      }
      //Aliquota IVA: nel caso di non applicabilità, il campo deve essere valorizzato a zero
      //if (invoiceObj.items[i].unit_price.vat_code.length>0) {
      this.addTextNode(nodeAliquotaIVA, aliquotaIva, '4...6', 'DettaglioLinee/AliquotaIVA ' + msgHelpNoFattura);
      if (Banana.SDecimal.isZero(aliquotaIva) && this.banDocument.table("VatCodes")) {
         //riprende il codice natura dalla tabella codici iva, colonna Gr1
         var natura = this.getCodiceNatura(invoiceObj.items[i].unit_price.vat_code);
         if (natura.length) {
            if (!['N1', 'N2.1', 'N2.2', 'N3.1', 'N3.2', 'N3.3', 'N3.4', 'N3.5', 'N3.6', 'N4', 'N5', 'N6.1', 'N6.2', 'N6.3', 'N6.4', 'N6.5', 'N6.6', 'N6.7', 'N6.8', 'N6.9', 'N7'].includes(natura)) {
               var msg = this.getErrorMessage(this.ID_ERR_NATURA_NOTVALID);
               msg = msg.replace("%1", natura);
               this.addMessage(msg, this.ID_ERR_NATURA_NOTVALID);
            }
         }

         var nodeNatura = nodeDettaglioLinee.addElement("Natura");
         this.addTextNode(nodeNatura, natura, '2...4', 'DettaglioLinee/Natura ' + msgHelpNoFattura);
         if (natura.length <= 0)
            natura = "void";
         if (!imponibileAliquota0List[natura])
            imponibileAliquota0List[natura] = 0;
         var imponibileAliquota0 = invoiceObj.items[i].total_amount_vat_exclusive;
         imponibileAliquota0List[natura] = Banana.SDecimal.add(imponibileAliquota0, imponibileAliquota0List[natura]);
      }
      //}
   }
   //Dati Riepilogo <1.N> blocco sempre obbligatorio contenente i dati di riepilogo per ogni aliquota IVA o natura
   for (var i = 0; i < invoiceObj.billing_info.total_vat_rates.length; i++) {
      var aliquotaIva = Banana.SDecimal.round(invoiceObj.billing_info.total_vat_rates[i].vat_rate, { 'decimals': 2 });
      if (Banana.SDecimal.isZero(aliquotaIva))
         continue;
      var nodeDatiRiepilogo = nodeDatiBeniServizi.addElement("DatiRiepilogo")
      var nodeAliquotaIVA = nodeDatiRiepilogo.addElement("AliquotaIVA");
      this.addTextNode(nodeAliquotaIVA, aliquotaIva, '4...6', 'DatiRiepilogo/AliquotaIVA ' + msgHelpNoFattura);

      var imponibileImporto = invoiceObj.billing_info.total_vat_rates[i].total_amount_vat_exclusive;
      var nodeImponibileImporto = nodeDatiRiepilogo.addElement("ImponibileImporto");
      this.addTextNode(nodeImponibileImporto, this.formatAmount(imponibileImporto), '4...15', 'DatiRiepilogo/ImponibileImporto ' + msgHelpNoFattura);

      var imposta = invoiceObj.billing_info.total_vat_rates[i].total_vat_amount;
      var nodeImposta = nodeDatiRiepilogo.addElement("Imposta");
      this.addTextNode(nodeImposta, this.formatAmount(imposta), '4...15', 'DatiRiepilogo/Imposta ' + msgHelpNoFattura);
   }
   for (var codNatura in imponibileAliquota0List) {
      var imponibileAliquota0 = imponibileAliquota0List[codNatura];
      if (Banana.SDecimal.isZero(imponibileAliquota0))
         continue;
      var nodeDatiRiepilogo = nodeDatiBeniServizi.addElement("DatiRiepilogo")
      var nodeAliquotaIVA = nodeDatiRiepilogo.addElement("AliquotaIVA");
      this.addTextNode(nodeAliquotaIVA, "0.00", '4...6', 'DatiRiepilogo/AliquotaIVA ' + msgHelpNoFattura);

      if (codNatura !== "void") {
         var nodeNatura = nodeDatiRiepilogo.addElement("Natura");
         this.addTextNode(nodeNatura, codNatura, '2...4', 'DettaglioLinee/Natura ' + msgHelpNoFattura);
      }

      var nodeImponibileImporto = nodeDatiRiepilogo.addElement("ImponibileImporto");
      this.addTextNode(nodeImponibileImporto, imponibileAliquota0, '4...15', 'DatiRiepilogo/ImponibileImporto ' + msgHelpNoFattura);

      var nodeImposta = nodeDatiRiepilogo.addElement("Imposta");
      this.addTextNode(nodeImposta, "0.00", '4...15', 'DatiRiepilogo/Imposta ' + msgHelpNoFattura);

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

   //Versione
   var formatoTrasmissione = "";
   var codiceDestinatario = "";
   var pecDestinatario = "";
   var accountObj = this.getAccount(invoiceObj.customer_info.number);
   if (accountObj && accountObj["Code1"]) {
      var value = accountObj["Code1"];
      if (value && value.length > 0) {
         var values = value.split(":");
         if (values.length > 0)
            formatoTrasmissione = values[0];
         if (values.length > 1)
            codiceDestinatario = values[1];
         if (values.length > 2)
            pecDestinatario = values[2];
      }
   }
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

   /*   
Come precisato nel provvedimento Agenzia delle Entrate 30 aprile 2018 n. 89757, nella sezione relativa ai dati per la trasmissione della e-fattura il fornitore deve riportare, nel campo “CodiceDestinatario”:
– il codice a 7 cifre eventualmente comunicato dal cliente, che indica il canale telematico da questi prescelto per la ricezione (web service o FTP);
– il codice “0000000” e, nel campo “PECDestinatario”, l’indirizzo di posta elettronica certificata, se il cliente richiede che le e-fatture gli siano recapitate a una casella PEC;
– il codice “0000000”, senza compilare il campo “PECDestinatario”, nell’ipotesi in cui non disponga dell’indirizzo telematico del proprio cliente.
*/

   var nodeCodiceDestinatario = nodeDatiTrasmissione.addElement("CodiceDestinatario");
   if (codiceDestinatario === "0000000") {
      this.addTextNode(nodeCodiceDestinatario, codiceDestinatario, '7', 'DatiTrasmissione/CodiceDestinatario' + msgHelpNoFattura);
      if (pecDestinatario.length > 0) {
         var nodePECDestinatario = nodeDatiTrasmissione.addElement("PECDestinatario");
         this.addTextNode(nodePECDestinatario, pecDestinatario, '7...256', 'DatiTrasmissione/PECDestinatario' + msgHelpNoFattura);
      }
   }
   else {
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
   if (this.datiContribuente.codiceFiscale.length > 0) {
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
   if (this.datiContribuente.ncivico.length > 0) {
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
      if (!countryCode || countryCode.length <= 0) {
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
   if (!countryCode || countryCode.length <= 0) {
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

/*
 * Ritorna un oggetto json con i dati del cliente o fornitore ripresi dalla tabella conti(indirizzo, saldo, ...)
 * @accountId	conto id presente nella tabella conti
 */
EFattura.prototype.getAccount = function (_accountId) {
   var jsonObj = {};
   if (!_accountId || _accountId.length <= 0)
      return jsonObj;
   if (!this.banDocument)
      return jsonObj;

   var tableAccounts = this.banDocument.table('Accounts');
   if (tableAccounts) {
      var row = tableAccounts.findRowByValue('Account', _accountId);
      if (row) {
         var jsonString = row.toJSON();
         jsonObj = JSON.parse(jsonString);
         for (var key in jsonObj) {
            if (jsonObj[key].length > 0)
               jsonObj[key] = xml_escapeString(jsonObj[key]);
         }
      }
   }
   return jsonObj;
}

EFattura.prototype.getCodiceNatura = function (vatCode) {
   //N1 esclusa ex art. 15 (bollo, spese anticipate in nome e per conto della controparte, omaggi, interessi moratori, ecc.)
   //N2 non soggetta (Fuori campo IVA/Escluso IVA, codice da utilizzare per i contribuenti minimi e forfettari)
   //N3 non imponibile (esportazione, cessione di beni intra UE)
   //N4 esente (esente art. 10 D.P.R. 633/72) 
   //N5 regime del margine / IVA non esposta in fattura ex art. 74-ter
   //N6 inversione contabile (reverse charge)
   //N7 IVA assolta in altro stato UE, vendite a distanza o prestazioni di servizi di telecomunicazioni
   //Il codice natura viene ripreso dalla tabella codici iva colonna Gr1
   //Se presente ESCL, la registrazione viene esclusa
   //Se presente NONE, il codice natura resta vuoto
   var codNatura = '';
   if (vatCode.length <= 0) {
      return codNatura;
   }
   if (this.banDocument.table("VatCodes")) {
      var rowVatCodes = this.banDocument.table("VatCodes").findRowByValue('VatCode', vatCode);
      if (rowVatCodes) {
         var vatGr = rowVatCodes.value("Gr");
         var vatGr1 = rowVatCodes.value("Gr1");
         var vatRate = rowVatCodes.value("VatRate");
         vatGr1 = vatGr1.toUpperCase();
         var rowVatDescription = rowVatCodes.value("Description");
         if (!rowVatDescription)
            rowVatDescription = "";
         rowVatDescription = rowVatDescription.toLowerCase();
         rowVatDescription = rowVatDescription.replace(" ", "");
         if (vatGr1.length == 2 && vatGr1.startsWith("N")) {
            codNatura = vatGr1;
         }
         else if (vatGr1 == "ESCL") {
            codNatura = vatGr1;
         }
         else if (vatGr1 == "NONE") {
            codNatura = '';
         }
         else if (rowVatDescription.indexOf("art.15") > 0) {
            codNatura = 'N1';
         }
         else if (rowVatDescription.indexOf("art.3") > 0) {
            codNatura = 'N1';
         }
         else if (vatGr.indexOf("-FC") >= 0) {
            codNatura = 'N2.1';
         }
         else if (rowVatDescription.indexOf("art.7") > 0) {
            codNatura = 'N3.1';
         }
         else if (vatGr.startsWith("V-NI") || vatGr.startsWith("A-NI")) {
            codNatura = 'N3.1';
         }
         else if (vatGr.startsWith("V-ES") || vatGr.startsWith("A-ES")) {
            codNatura = 'N4';
         }
         else if (rowVatDescription.indexOf("art.74") > 0) {
            codNatura = 'N5';
         }
         else if (vatGr.startsWith("V-NE") || vatGr.startsWith("A-NE")) {
            codNatura = 'N5';
         }
         else if (vatGr.indexOf("-REV") >= 0 && Banana.SDecimal.isZero(vatRate)) {
            codNatura = 'N6';
         }
      }
   }
   return codNatura;
}

EFattura.prototype.getCountryCode = function (countryName) {
   var countryCode = 'it';
   if (!countryName || countryName.length <= 0)
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
   if (countryCode == 'switzerland' || countryCode == 'schweiz' || countryCode == 'suisse' || countryCode == 'svizzera') {
      countryCode = 'ch';
   }
   if (countryCode == 'japan' || countryCode == 'jpn') {
      countryCode = 'jp';
   }
   return countryCode.toUpperCase();
}

/*riprende il numero conto cliente dalla stringa utilizzata dal dialogo dello script*/
EFattura.prototype.getCustomerId = function (customerDescription) {
   var customerId = customerDescription;
   if (customerId.length <= 0)
      return customerId;

   var posStart = 0;
   var posEnd = customerId.indexOf("   ");
   if (posEnd <= posStart)
      return customerId;

   customerId = customerId.substring(posStart, posEnd).trim();

   return customerId;
}

/*ritorna l'elenco dei conti clienti*/
EFattura.prototype.getCustomerList = function () {
   var customersList = [];

   if (!this.journalInvoices) {
      this.journalInvoices = this.banDocument.invoicesCustomers();
   }

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
   else if (errorId == this.ID_ERR_INVOICENUMBER_MISSING) {
      if (lang == 'it')
         rtnMsg = "Indicare il numero fattura";
      else
         rtnMsg = "Please indicate the invoice number";
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
   else if (errorId == this.ID_ERR_DOCTYPE_NOTVALID) {
      if (lang == 'it')
         rtnMsg = "Il campo TipoDocumento %1 non è valido. Verificare il valore inserito o forzarlo utilizzando il campo IT_TipoDoc_FatturaElettronica";
      else
         rtnMsg = "Document type %1 not valid. Please check the value or force it by using the field IT_TipoDoc_FatturaElettronica";
   }
   else if (errorId == this.ID_ERR_NATURA_NOTVALID) {
      if (lang == 'it')
         rtnMsg = "Il campo Natura %1 non è valido. Verificare il valore inserito nella tabella Codici IVA in corrispondenza della colonna Gr1";
      else
         rtnMsg = "The value of the field Natura %1 is not valid. Please check the column Gr1 of the table VatCodes";
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
   this.param.xml.destination_folder = '';
   this.param.xml.open_file = false;
   this.param.xml.xslt_filename = 'https://www.fatturapa.gov.it/export/documenti/fatturapa/v1.2.1/Foglio_di_stile_fatturaordinaria_v1.2.1.xsl';
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

   if (!this.journalInvoices) {
      this.journalInvoices = this.banDocument.invoicesCustomers();
   }

   var jsonInvoiceList = [];
   if (this.param.selection == 0 && this.param.selection_invoice.length <= 0)
      return jsonInvoiceList;
   if (this.param.selection == 1 && this.param.selection_customer.length <= 0)
      return jsonInvoiceList;
   if (!this.initDatiContribuente())
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

   if (jsonInvoiceList.length <= 0) {
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

EFattura.prototype.saveFile = function (output, fileExtension) {
   //nomenclatura nome file
   //Codice PaeseIdentificativo univoco del Trasmittente  _  Progressivo univoco del file
   var nazione = "";
   var codiceFiscale = "";
   if (!this.isEmpty(this.datiContribuente)) {
      nazione = this.datiContribuente.nazione;
      codiceFiscale = this.datiContribuente.codiceFiscale;
   }

   var fileName = nazione + codiceFiscale + "_";
   fileName += this.getProgressiveNumber();
   // Names the file to 'test.xml', easier to reload each time on browser, for testing purposes
   //fileName = 'test';

   // estensione xml o hmtl
   fileName += "." + fileExtension;

   if (this.param.xml.destination_folder.length > 0)
      fileName = this.param.xml.destination_folder + fileName;

   fileName = Banana.IO.getSaveFileName("Save as", fileName, fileExtension.toUpperCase() + " file (*." + fileExtension + ");;All files (*)");
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

   var banVersionMin = "10.0.7";
   var banDevVersionMin = "210127";

   //verifica se la versione è compatibile
   var isCompatible = false;
   if (banDevVersionMin)
      banVersionMin = banVersionMin + "." + banDevVersionMin;
   if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, banVersionMin) >= 0) {
      isCompatible = true;
   }

   //verifica se versione advanced
   var isAdvanced = false;
   if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, "10.0.7") >= 0) {
      var license = Banana.application.license;
      if (license.licenseType === "advanced" || license.isWithinMaxFreeLines) {
         isAdvanced = true;
      }
   }

   if (!isCompatible || !isAdvanced) {
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
   if (!this.param.xml.destination_folder)
      this.param.xml.destination_folder = '';
   if (!this.param.xml.open_file)
      this.param.xml.open_file = false;
   if (!this.param.xml.xslt_filename)
      this.param.xml.xslt_filename = '';

}