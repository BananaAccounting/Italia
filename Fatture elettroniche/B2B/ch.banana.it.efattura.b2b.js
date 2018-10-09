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
// @pubdate = 2018-10-09
// @publisher = Banana.ch SA
// @description = Esporta fattura (XML, PDF)...
// @description.it = Esporta fattura (XML, PDF)...
// @doctype = *
// @task = app.command
// @inputdatasource = none
// @timeout = -1
// @includejs = ch.banana.it.invoice.it05.js

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
   var jsonInvoiceList = eFattura.loadData();
   
   if (jsonInvoiceList.length<=0)
      return;
      
   if (eFattura.param.output == 0) {
      var docs = [];
      var styles = [];
      for (var i = 0; i < jsonInvoiceList.length; i++) {
         var jsonInvoice = jsonInvoiceList[i];
         //Banana.console.debug(JSON.stringify(jsonInvoice))
         if (jsonInvoice.customer_info) {
            var repDocObj = Banana.Report.newReport('');
            var repStyleObj = Banana.Report.newStyleSheet();
            repStyleObj.addStyle("@page").setAttribute("margin", "0");
            eFattura.createReport(jsonInvoice, repDocObj, repStyleObj);
            docs.push(repDocObj);
            styles.push(repStyleObj);
         }
      }
      if (docs.length) {
         Banana.Report.preview("", docs, styles);
      }
   }
   else {
      var xmlDocument = Banana.Xml.newDocument("root");
      var output = eFattura.createXml(jsonInvoiceList, xmlDocument, true);
      if (output != "@Cancel") {
         var xslt = "<?xml-stylesheet type='text/xsl' href='fatturaordinaria_v1.2.1.xslt'?>"
         var outputStyled = output.slice(0, 39) + xslt + output.slice(39)
         eFattura.saveFile(outputStyled);
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
   var numeroFatturaRadioButton = dialog.tabWidget.findChild('numeroFatturaRadioButton');
   var clienteRadioButton = dialog.tabWidget.findChild('clienteRadioButton');
   var numeroFatturaLineEdit = dialog.tabWidget.findChild('numeroFatturaLineEdit');
   var clienteComboBox = dialog.tabWidget.findChild('clienteComboBox');
   var stampaPDFRadioButton = dialog.tabWidget.findChild('stampaPDFRadioButton');
   var stampaXmlRadioButton = dialog.tabWidget.findChild('stampaXmlRadioButton');
   var apriXmlCheckBox = dialog.tabWidget.findChild('apriXmlCheckBox');

   var printHeaderCheckBox = dialog.tabWidget.findChild('printHeaderCheckBox');
   var printLogoCheckBox = dialog.tabWidget.findChild('printLogoCheckBox');
   var fontTypeLineEdit = dialog.tabWidget.findChild('fontTypeLineEdit');
   var bgColorLineEdit = dialog.tabWidget.findChild('bgColorLineEdit');
   var textColorLineEdit = dialog.tabWidget.findChild('textColorLineEdit');

   var numeroProgressivoLineEdit = dialog.tabWidget.findChild('numeroProgressivoLineEdit');
   
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
   var elencoClienti = eFattura.getCustomerList();
   clienteComboBox.addItems(elencoClienti);
   clienteComboBox.currentText = eFattura.param.selection_customer;

   if (eFattura.param.selection == 1)
      clienteRadioButton.checked = true;
   else
      numeroFatturaRadioButton.checked = true;

   numeroFatturaLineEdit.text = eFattura.param.selection_invoice;
   var selectedRow = parseInt(Banana.document.cursor.rowNr);
   if (selectedRow && Banana.document.table('Transactions') && Banana.document.table('Transactions').rowCount > selectedRow) {
      var noFattura = Banana.document.table('Transactions').value(selectedRow, "DocInvoice");
      if (noFattura)
         numeroFatturaLineEdit.text = noFattura;
   }

   numeroProgressivoLineEdit.text = eFattura.param.xml.progressive || '0';

   if (eFattura.param.output == 1)
      stampaXmlRadioButton.checked = true;
   else
      stampaPDFRadioButton.checked = true;

   apriXmlCheckBox.checked = eFattura.param.xml.open_file;
   printHeaderCheckBox.checked = eFattura.param.report.print_header;
   printLogoCheckBox.checked = eFattura.param.report.print_logo;
   fontTypeLineEdit.text = eFattura.param.report.font_family;
   bgColorLineEdit.text = eFattura.param.report.color_1;
   textColorLineEdit.text = eFattura.param.report.color_2;

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
      else {
         numeroFatturaLineEdit.enabled = false;
         clienteComboBox.enabled = true;
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
      Banana.Ui.showHelp("ch.banana.it.efattura.b2b.dialog.ui");
   }
   dialog.buttonBox.accepted.connect(dialog, dialog.checkdata);
   dialog.buttonBox.helpRequested.connect(dialog, dialog.showHelp);
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
   eFattura.param.selection_customer = clienteComboBox.currentText;
   if (clienteRadioButton.checked)
      eFattura.param.selection = 1;
   else
      eFattura.param.selection = 0;
   if (stampaXmlRadioButton.checked)
      eFattura.param.output = 1;
   else
      eFattura.param.output = 0;

   eFattura.param.xml.open_file = apriXmlCheckBox.checked;
   eFattura.param.report.print_header = printHeaderCheckBox.checked;
   eFattura.param.report.print_logo = printLogoCheckBox.checked;
   eFattura.param.report.font_family = fontTypeLineEdit.text;
   eFattura.param.report.color_1 = bgColorLineEdit.text;
   eFattura.param.report.color_2 = textColorLineEdit.text;

   eFattura.param.xml.progressive = parseInt(numeroProgressivoLineEdit.text);
   
   
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
   this.ID_ERR_XML_LUNGHEZZA_NONVALIDA = "ID_ERR_XML_LUNGHEZZA_NONVALIDA";
   this.ID_ERR_XML_LUNGHEZZAMIN_NONVALIDA = "ID_ERR_XML_LUNGHEZZAMIN_NONVALIDA";
   this.ID_ERR_XML_LUNGHEZZAMAX_NONVALIDA = "ID_ERR_XML_LUNGHEZZAMAX_NONVALIDA";

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
   printInvoice(jsonInvoice, report, stylesheet, this.param.report);
   setInvoiceStyle(report, stylesheet, this.param.report);
}

EFattura.prototype.createXml = function (jsonInvoiceList, xmlDocument, indent) {

   if (!xmlDocument || jsonInvoiceList.length<=0)
      return "@Cancel";
      
   var nodeRoot = this.createXmlHeader(jsonInvoiceList[0], xmlDocument);
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


   // Body
   var nodeFatturaElettronicaBody = nodeRoot.addElement("FatturaElettronicaBody");
   var nodeDatiGenerali = nodeFatturaElettronicaBody.addElement("DatiGenerali");
   var nodeDatiGeneraliDocumento = nodeDatiGenerali.addElement("DatiGeneraliDocumento");
   var nodeTipoDocumento = nodeDatiGeneraliDocumento.addElement("TipoDocumento");
   var docType = this.getTipoDocumento(invoiceObj.document_info.doc_type);
   this.addTextNode(nodeTipoDocumento, docType, '4', '<DatiGeneraliDocumento><TipoDocumento>');
   var nodeDivisa = nodeDatiGeneraliDocumento.addElement("Divisa");
   this.addTextNode(nodeDivisa, invoiceObj.document_info.currency, '3', '<DatiGeneraliDocumento><Divisa>');
   var nodeData = nodeDatiGeneraliDocumento.addElement("Data");
   this.addTextNode(nodeData, invoiceObj.document_info.date, '10', '<DatiGeneraliDocumento><Data>');
   var nodeNumero = nodeDatiGeneraliDocumento.addElement("Numero");
   this.addTextNode(nodeNumero, invoiceObj.document_info.number, '1...20', '<DatiGeneraliDocumento><Numero>');
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
   for (var i = 0; i < invoiceObj.items.length; i++) {
      var nodeDettaglioLinee = nodeDatiBeniServizi.addElement("DettaglioLinee");
      var nodeNumeroLinea = nodeDettaglioLinee.addElement("NumeroLinea");
      this.addTextNode(nodeNumeroLinea, parseInt(i + 1).toString(), '1...4', '<DettaglioLinee><NumeroLinea>');
      // var nodeTipoCessionePrestazione = nodeDettaglioLinee.addElement("TipoCessionePrestazione");
      // var nodeCodiceArticolo = nodeDettaglioLinee.addElement("CodiceArticolo");
      // var nodeCodiceTipo = nodeCodiceArticolo.addElement("CodiceTipo");
      // var nodeCodiceValore = nodeCodiceArticolo.addElement("CodiceValore");
      var nodeDescrizione = nodeDettaglioLinee.addElement("Descrizione");
      this.addTextNode(nodeDescrizione, invoiceObj.items[i].description, '1...1000', '<DettaglioLinee><Descrizione>');
      if (!Banana.SDecimal.isZero(invoiceObj.items[i].quantity)) {
         var nodeQuantita = nodeDettaglioLinee.addElement("Quantita");
         var quantita = Banana.Converter.toLocaleNumberFormat(invoiceObj.items[i].quantity,2,false);
         this.addTextNode(nodeQuantita, quantita , '4...21', '<DettaglioLinee><Quantita>');
      }
      // var nodeUnitaMisura = nodeDettaglioLinee.addElement("UnitaMisura");
      // var nodeDataInizioPeriodo = nodeDettaglioLinee.addElement("DataInizioPeriodo");
      // var nodeDataFinePeriodo = nodeDettaglioLinee.addElement("DataFinePeriodo");
      var nodePrezzoUnitario = nodeDettaglioLinee.addElement("PrezzoUnitario");
      this.addTextNode(nodePrezzoUnitario, invoiceObj.items[i].unit_price.calculated_amount_vat_exclusive, '4...21', '<DettaglioLinee><PrezzoUnitario>');
      // var nodeScontoMaggiorazione = nodeDettaglioLinee.addElement("ScontoMaggiorazione");
      //   var nodeTipo = nodeScontoMaggiorazione.addElement("Tipo")
      //   var nodePercentuale = nodeScontoMaggiorazione.addElement("Percentuale")
      //   var nodeImporto = nodeScontoMaggiorazione.addElement("Importo")
      var nodePrezzoTotale = nodeDettaglioLinee.addElement("PrezzoTotale");
      this.addTextNode(nodePrezzoTotale, invoiceObj.items[i].total_amount_vat_exclusive, '4...21', '<DettaglioLinee><PrezzoTotale>');
      var nodeAliquotaIVA = nodeDettaglioLinee.addElement("AliquotaIVA");
      var aliquotaIva = Banana.Converter.toLocaleNumberFormat(invoiceObj.items[i].unit_price.vat_rate,2,true);
      this.addTextNode(nodeAliquotaIVA, aliquotaIva, '4...6', '<DettaglioLinee><AliquotaIVA>');
      // var nodeRitenuta = nodeDettaglioLinee.addElement("Ritenuta");
      // var nodeNatura = nodeDettaglioLinee.addElement("Natura");
      // var nodeRiferimentoAmministrazione = nodeDettaglioLinee.addElement("RiferimentoAmministrazione");
      // var nodeAltriDatiGestionali = nodeDettaglioLinee.addElement("AltriDatiGestionali");
      //   var nodeTipoDato = nodeAltriDatiGestionali.addElement("TipoDato");
      //   var nodeRiferimentoTesto = nodeAltriDatiGestionali.addElement("RiferimentoTesto");
      //   var nodeRiferimentoNumero = nodeAltriDatiGestionali.addElement("RiferimentoNumero");
      //   var nodeRiferimentoData = nodeAltriDatiGestionali.addElement("RiferimentoData");
   }
   for (var i = 0; i < invoiceObj.billing_info.total_vat_rates.length; i++) {
      var nodeDatiRiepilogo = nodeDatiBeniServizi.addElement("DatiRiepilogo")
      var nodeAliquotaIVA = nodeDatiRiepilogo.addElement("AliquotaIVA");
      var aliquotaIva = Banana.Converter.toLocaleNumberFormat(invoiceObj.billing_info.total_vat_rates[i].vat_rate,2,true);
      this.addTextNode(nodeAliquotaIVA, aliquotaIva, '4...6', '<DatiRiepilogo><AliquotaIVA>');

      //nodeAliquotaIVA.addTextNode('22');
      // var nodeNatura = nodeDatiRiepilogo.addElement("Natura");
      // var nodeSpeseAccessorie = nodeDatiRiepilogo.addElement("SpeseAccessorie");
      // var nodeArrotondamento = nodeDatiRiepilogo.addElement("Arrotondamento");
      var nodeImponibileImporto = nodeDatiRiepilogo.addElement("ImponibileImporto");
      this.addTextNode(nodeImponibileImporto, invoiceObj.billing_info.total_vat_rates[i].total_amount_vat_exclusive, '4...15', '<DatiRiepilogo><ImponibileImporto>');

      var nodeImposta = nodeDatiRiepilogo.addElement("Imposta");
      this.addTextNode(nodeImposta, invoiceObj.billing_info.total_vat_rates[i].total_vat_amount, '4...15', '<DatiRiepilogo><Imposta>');
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

   var trasmissionFormat = "FPA12";
   var nodeRoot = xmlDocument.addElement("p:FatturaElettronica");
   nodeRoot.setAttribute("versione", trasmissionFormat);


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

   //Header

   var nodeFatturaElettronicaHeader = nodeRoot.addElement("FatturaElettronicaHeader");

   var nodeDatiTrasmissione = nodeFatturaElettronicaHeader.addElement("DatiTrasmissione");
   var nodeIdTrasmittente = nodeDatiTrasmissione.addElement("IdTrasmittente");
   var nodeIdPaese = nodeIdTrasmittente.addElement("IdPaese");
   this.addTextNode(nodeIdPaese, this.datiContribuente.nazione, '2', '<IdTrasmittente><IdPaese>');
   var nodeIdCodice = nodeIdTrasmittente.addElement("IdCodice");
   var idCodice = this.datiContribuente.nazione == 'IT' ? this.datiContribuente.codiceFiscale.substring(2) : this.datiContribuente.codiceFiscale;
   this.addTextNode(nodeIdCodice, idCodice, '1...28', '<IdTrasmittente><IdCodice>');
   var nodeProgressivoInvio = nodeDatiTrasmissione.addElement("ProgressivoInvio");
   this.addTextNode(nodeProgressivoInvio, this.param.xml.progressive, '1...10', '<DatiTrasmissione><ProgressivoInvio>');
   var nodeFormatoTrasmissione = nodeDatiTrasmissione.addElement("FormatoTrasmissione");
   this.addTextNode(nodeFormatoTrasmissione, trasmissionFormat, '5', '<DatiTrasmissione><FormatoTrasmissione>');
   var nodeCodiceDestinatario = nodeDatiTrasmissione.addElement("CodiceDestinatario");
   this.addTextNode(nodeCodiceDestinatario, '999999', '6...7', '<DatiTrasmissione><CodiceDestinatario>');

   var nodeCedentePrestatore = nodeFatturaElettronicaHeader.addElement("CedentePrestatore");
   var nodeDatiAnagrafici = nodeCedentePrestatore.addElement("DatiAnagrafici");
   var nodeIdFiscaleIVA = nodeDatiAnagrafici.addElement("IdFiscaleIVA");
   var nodeIdPaese = nodeIdFiscaleIVA.addElement("IdPaese");
   this.addTextNode(nodeIdPaese, this.datiContribuente.nazione, '2', '<CedentePrestatore><DatiAnagrafici><IdFiscaleIVA><IdPaese>');
   var nodeIdCodice = nodeIdFiscaleIVA.addElement("IdCodice");
   var idCodice = this.datiContribuente.nazione == 'IT' ? this.datiContribuente.codiceFiscale.substring(2) : this.datiContribuente.codiceFiscale
   this.addTextNode(nodeIdCodice, idCodice, '1...28', '<CedentePrestatore><DatiAnagrafici><IdFiscaleIVA><IdCodice>');
   // var nodeCodiceFiscale = nodeDatiAnagrafici.addElement("CodiceFiscale");
   var nodeAnagrafica = nodeDatiAnagrafici.addElement("Anagrafica");
   if (this.datiContribuente.tipoContribuente === 0) {
      var nodeNome = nodeAnagrafica.addElement("Nome");
      var nodeCognome = nodeAnagrafica.addElement("Cognome");

      this.addTextNode(nodeNome, this.datiContribuente.nome, '1...60', '<CedentePrestatore><DatiAnagrafici><Anagrafica><Nome>');
      this.addTextNode(nodeCognome, this.datiContribuente.cognome, '1...60', '<CedentePrestatore><DatiAnagrafici><Anagrafica><Cognome>');

   }
   else if (this.datiContribuente.tipoContribuente === 1) {
      var nodeDenominazione = nodeAnagrafica.addElement("Denominazione");
      this.addTextNode(nodeDenominazione, this.datiContribuente.societa, '1...80', '<CedentePrestatore><DatiAnagrafici><Anagrafica><Denominazione>');
   }

   //   var nodeTitolo = nodeAnagrafica.addElement("Titolo");
   //   var nodCodEORI = nodeAnagrafica.addElement("CodEORI");
   // var nodeAlboProfessionale = nodeDatiAnagrafici.addElement("AlboProfessionale");
   // var nodeProvinciaAlbo = nodeDatiAnagrafici.addElement("ProvinciaAlbo");
   // var nodeNumeroIscrizioneAlbo = nodeDatiAnagrafici.addElement("NumeroIscrizioneAlbo");
   // var nodeDataiscrizioneAlbo = nodeDatiAnagrafici.addElement("DataIscrizioneAlbo");
   var nodeRegimeFiscale = nodeDatiAnagrafici.addElement("RegimeFiscale");
   var regFis = 'RF';
   if (this.datiContribuente.tipoRegimeFiscale + 1 < 10)
      regFis += '0';
   regFis += this.datiContribuente.tipoRegimeFiscale + 1;
   this.addTextNode(nodeRegimeFiscale, regFis, '4', '<CedentePrestatore><DatiAnagrafici><RegimeFiscale>');
   var nodeSede = nodeCedentePrestatore.addElement("Sede");
   var nodeIndirizzo = nodeSede.addElement("Indirizzo");
   this.addTextNode(nodeIndirizzo, this.datiContribuente.indirizzo, '1...60', '<CedentePrestatore><Sede><Indirizzo>');
   if (this.datiContribuente.ncivico.length>0) {
      var nodeNumeroCivico = nodeSede.addElement("NumeroCivico");
      this.addTextNode(nodeNumeroCivico, this.datiContribuente.ncivico, '1...8', '<CedentePrestatore><Sede><NumeroCivico>');
   }
   var nodeCAP = nodeSede.addElement("CAP");
   this.addTextNode(nodeCAP, this.datiContribuente.cap, '5', '<CedentePrestatore><Sede><CAP>');
   var nodeComune = nodeSede.addElement("Comune");
   this.addTextNode(nodeComune, this.datiContribuente.comune, '1...60', '<CedentePrestatore><Sede><Comune>');
   if (this.datiContribuente.nazione === 'IT') {
      var nodeProvincia = nodeSede.addElement("Provincia");
      this.addTextNode(nodeProvincia, this.datiContribuente.provincia, '2', '<CedentePrestatore><Sede><Provincia>');
   }
   var nodeNazione = nodeSede.addElement("Nazione");
   this.addTextNode(nodeNazione, this.datiContribuente.nazione, '2', '<CedentePrestatore><Sede><Nazione>');

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
   var nodeDatiAnagrafici = nodeCessionarioCommittente.addElement("DatiAnagrafici");
   if (invoiceObj.customer_info.vat_number) {
      var nodeIdFiscaleIVA = nodeDatiAnagrafici.addElement("IdFiscaleIVA");
      var nodeIdPaese = nodeIdFiscaleIVA.addElement("IdPaese");
      var countryCode = invoiceObj.customer_info.country_code;
      if (!countryCode || countryCode.length<=0) {
         countryCode = this.getCountryCode(invoiceObj.customer_info.country);
      }
      this.addTextNode(nodeIdPaese, countryCode, '2', '<CessionarioCommittente><DatiAnagrafici><IdFiscaleIVA><IdPaese>');
      var nodeIdCodice = nodeIdFiscaleIVA.addElement("IdCodice");
      this.addTextNode(nodeIdCodice, invoiceObj.customer_info.vat_number, '1...28', '<CessionarioCommittente><DatiAnagrafici><IdFiscaleIVA><IdCodice>');
   }
   else {
      var nodeCodiceFiscale = nodeDatiAnagrafici.addElement("CodiceFiscale");
      this.addTextNode(nodeIdCodice, invoiceObj.customer_info.fiscal_number, '11...16', '<CessionarioCommittente><DatiAnagrafici><CodiceFiscale>');
   }
   var nodeAnagrafica = nodeDatiAnagrafici.addElement("Anagrafica");
   // nodeAnagrafica.addTextNode(JSON.stringify(invoiceObj));
   if (invoiceObj.customer_info.business_name) {
      var nodeDenominazione = nodeAnagrafica.addElement("Denominazione");
      this.addTextNode(nodeDenominazione, invoiceObj.customer_info.business_name, '1...80', '<CessionarioCommittente><DatiAnagrafici><Anagrafica><Denominazione>');
   }
   else {
      var nodeNome = nodeAnagrafica.addElement("Nome");
      var nodeCognome = nodeAnagrafica.addElement("Cognome");

      this.addTextNode(nodeNome, invoiceObj.customer_info.first_name, '1...60', '<CessionarioCommittente><DatiAnagrafici><Anagrafica><Nome>');
      this.addTextNode(nodeCognome, invoiceObj.customer_info.last_name, '1...60', '<CessionarioCommittente><DatiAnagrafici><Anagrafica><Cognome>');
   }
   // var nodeTitolo = nodeAnagrafica.addElement("Titolo");
   // var nodCodEORI = nodeAnagrafica.addElement("CodEORI");

   var nodeSede = nodeCessionarioCommittente.addElement("Sede");
   var nodeIndirizzo = nodeSede.addElement("Indirizzo");
   this.addTextNode(nodeIndirizzo, invoiceObj.customer_info.address1, '1...60', '<CessionarioCommittente><Sede><Indirizzo>');
   //   var nodeNumeroCivico = nodeSede.addElement("NumeroCivico");

   var nodeCAP = nodeSede.addElement("CAP");
   this.addTextNode(nodeCAP, invoiceObj.customer_info.postal_code, '5', '<CessionarioCommittente><Sede><CAP>');
   var nodeComune = nodeSede.addElement("Comune");
   this.addTextNode(nodeComune, invoiceObj.customer_info.city, '1...60', '<CessionarioCommittente><Sede><Comune>');
   var countryCode = invoiceObj.customer_info.country_code;
   if (!countryCode || countryCode.length<=0) {
      countryCode = this.getCountryCode(invoiceObj.customer_info.country);
   }
   if (countryCode === 'IT') {
      var nodeProvincia = nodeSede.addElement("Provincia");
      this.addTextNode(nodeProvincia, invoiceObj.customer_info.state, '2', '<CessionarioCommittente><Sede><Provincia>');
   }
   var nodeNazione = nodeSede.addElement("Nazione");
   this.addTextNode(nodeNazione, countryCode, '2', '<CessionarioCommittente><Sede><Nazione>');

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
 
   return nodeRoot;
}

EFattura.prototype.getInvoiceList = function () {
   var invoiceList = [];
   var journal = this.banDocument.invoicesCustomers();
   for (var i = 0; i < journal.rowCount; i++) {
      var tRow = journal.row(i);
      if (tRow.value('ObjectType') === 'InvoiceDocument' && tRow.value('Invoice').length > 0) {
         var invoiceId = tRow.value('Invoice').toString();
         if (invoiceList.indexOf(invoiceId) < 0)
            invoiceList.push(invoiceId);
      }
   }
   return invoiceList;
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

EFattura.prototype.getCustomerList = function () {
   var customersList = [];
   var journal = this.banDocument.invoicesCustomers();
   for (var i = 0; i < journal.rowCount; i++) {
      var tRow = journal.row(i);
      if (tRow.value('ObjectType') === 'InvoiceDocument' && tRow.value('CounterpartyId').length > 0) {
         var customerId = tRow.value('CounterpartyId').toString();
         if (customersList.indexOf(customerId) < 0)
            customersList.push(customerId);
      }
   }
   var tableAccounts = this.banDocument.table('Accounts');
   if (tableAccounts) {
      for (var i = 0; i < customersList.count; i++) {
         var row = tableAccounts.findRowByValue('Account', customersList[i]);
         if (row >= 0)
            customersList[i] = customersList[i] + ' ' + tableAccounts.value(row, "Description");
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
   else if (errorId == this.ID_ERR_XML_LUNGHEZZA_NONVALIDA) {
      if (lang == 'it')
         rtnMsg = "Dimensione elemento non valida. Elemento: %1, valore inserito: %2, dimensione richiesta: %3";
      else
         rtnMsg = "Invalid element size. Node: %1, current value: %2, required size: 3%";
   }
   else if (errorId == this.ID_ERR_XML_LUNGHEZZAMIN_NONVALIDA) {
      if (lang == 'it')
         rtnMsg = "Dimensione elemento non valida. Elemento: %1, valore inserito: %2, dimensione minima: %3";
      else
         rtnMsg = "Invalid element size. Node: %1, current value: %2, required size: 3%";
   }
   else if (errorId == this.ID_ERR_XML_LUNGHEZZAMAX_NONVALIDA) {
      if (lang == 'it')
         rtnMsg = "Dimensione elemento non valida. Elemento: %1, valore inserito: %2, dimensione massima: %3";
      else
         rtnMsg = "Invalid element size. Node: %1, current value: %2, required size: 3%";
   }

   return rtnMsg + " [" + errorId + "] ";
}

EFattura.prototype.getTipoDocumento = function (docType) {
   var tipoDocumento = "";

   if (!docType || docType == '10')
      tipoDocumento = 'TD01';
   if (docType == '12')
      tipoDocumento = 'TD04'

   return tipoDocumento;
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
   /*selection 0=fattura singola, 1=fatture cliente*/
   this.param.selection = 0;
   /*invoice number*/
   this.param.selection_invoice = '';
   /*customer number*/
   this.param.selection_customer = '';
   
   /* periodSelected 0=none, 1=1.Q, 2=2.Q, 3=3Q, 4=4Q, 10=1.S, 12=2.S, 30=Year */
   this.param.periodAll = true;
   this.param.periodSelected = 1;
   this.param.periodStartDate = '';
   this.param.periodEndDate = '';
   
   this.param.xml = {};
   this.param.xml.progressive = '1';
   this.param.xml.open_file = false;

   this.param.report = {};
   this.param.report.print_header = true;
   this.param.report.print_logo = true;
   this.param.report.font_family = '';
   this.param.report.color_1 = '#337ab7';
   this.param.report.color_2 = '#ffffff';
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
   else if (this.param.selection == 1 && this.param.selection_customer.length <= 0)
      return jsonInvoiceList;
   if (!this.initDatiContribuente())
      return jsonInvoiceList;

   var skipPeriod = this.param.periodAll;
   var startDate = this.param.periodStartDate;
   var endDate = this.param.periodEndDate;
   var journal = this.banDocument.invoicesCustomers();
   if (!journal)
      return jsonInvoiceList;
  
   for (var i = 0; i < journal.rowCount; i++) {
      var tRow = journal.row(i);
      if (tRow.value('ObjectJSonData') && tRow.value('ObjectType') === 'InvoiceDocument') {
         var jsonData = {};
         jsonData = JSON.parse(tRow.value('ObjectJSonData'));
         var addInvoice = false;
         if (parseInt(this.param.selection) === 0 && jsonData.InvoiceDocument.document_info.number == this.param.selection_invoice) {
            addInvoice = true;
         }
         if (parseInt(this.param.selection) === 1 && jsonData.InvoiceDocument.customer_info.number == this.param.selection_customer) {
            addInvoice = true;
         }
         if (!skipPeriod) {
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

   return jsonInvoiceList;
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
   var fileName = '';
   var nazione = '';
   var codiceFiscale = '';
   if (!this.isEmpty(this.datiContribuente)) {
      nazione = this.datiContribuente.nazione;
      codiceFiscale = this.datiContribuente.codiceFiscale;
   }

   //???
   if (nazione === 'IT')
      fileName += codiceFiscale;
   else
      fileName += codiceFiscale;

   fileName += '_'


   var numeroInvio = parseInt(this.param.xml.progressive).toString(36).toUpperCase();

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
      if (file.errorString)
         Banana.Ui.showInformation("Write error", file.errorString);
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

   if (!this.param.report)   
      this.param.report = {};
   if (!this.param.report.print_header)   
      this.param.report.print_header = true;
   if (!this.param.report.print_logo)   
      this.param.report.print_logo = true;
   if (!this.param.report.font_family)   
      this.param.report.font_family = '';
   if (!this.param.report.color_1)   
      this.param.report.color_1 = '#337ab7';
   if (!this.param.report.color_2)   
      this.param.report.color_2 = '#ffffff';
}
