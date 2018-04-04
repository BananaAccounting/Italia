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
// @api = 1.0
// @id = ch.banana.script.italy_vat_2017.report.registri.js
// @description = Registri IVA...
// @doctype = 100.110;110.110;130.110;100.130
// @encoding = utf-8
// @includejs = ch.banana.script.italy_vat_2017.errors.js
// @includejs = ch.banana.script.italy_vat_2017.journal.js
// @includejs = ch.banana.script.italy_vat_2017.report.liquidazione.js
// @includejs = ch.banana.script.italy_vat_2017.xml.js
// @includejs = ch.banana.script.italy_vat.daticontribuente.js
// @inputdatasource = none
// @pubdate = 2018-03-28
// @publisher = Banana.ch SA
// @task = app.command
// @timeout = -1

var debug = false;

function exec(inData, options) {

  if (!Banana.document)
    return "@Cancel";

  // Check version
  if (typeof (Banana.document.journalCustomersSuppliers) === 'undefined') {
    var msg = getErrorMessage(ID_ERR_VERSIONE);
    msg = msg.replace("%1", "Banana.document.journalCustomersSuppliers" );
    Banana.document.addMessage( msg, ID_ERR_VERSIONE);
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
  
  var registri = new Registri(Banana.document);
  registri.setParam(param);
  registri.loadData();

  var report = Banana.Report.newReport("Registri IVA");
  var stylesheet = Banana.Report.newStyleSheet();
  registri.printDocument(report, stylesheet);
  
  //Debug
  /*if (debug) {
    for (var i=0; i<param.periods.length; i++) {
      report.addPageBreak();
      _debug_printJournal(registri.param.periods[i], report, stylesheet);
    }
  }*/
  
  Banana.Report.preview(report, stylesheet);
  return;
}

/*
 * Update script's parameters
 * Viene utilizzata la classe Registri cosi i parametri vengono inizializzati/verificati correttamente
*/
function settingsDialog() {

  var registri = new Registri(Banana.document);
  var savedParam = Banana.document.getScriptSettings();
  if (savedParam.length > 0) {
    registri.setParam(JSON.parse(savedParam));
  }
  
  var accountingData = {};
  accountingData = new Utils(Banana.document).readAccountingData(accountingData);
  registri.param.annoSelezionato = accountingData.openingYear;
  
  var dialog = Banana.Ui.createUi("ch.banana.script.italy_vat_2017.report.registri.dialog.ui");
  //Lettura dati
  //periodo
  var trimestreRadioButton = dialog.tabWidget.findChild('trimestreRadioButton');
  var trimestreComboBox = dialog.tabWidget.findChild('trimestreComboBox');
  var meseRadioButton = dialog.tabWidget.findChild('meseRadioButton');
  var meseComboBox = dialog.tabWidget.findChild('meseComboBox');
  var dataRadioButton = dialog.tabWidget.findChild('dataRadioButton');
  var annoRadioButton = dialog.tabWidget.findChild('annoRadioButton');
  var annoLabel = dialog.tabWidget.findChild('annoLabel');
  var dalDateEdit = dialog.tabWidget.findChild('dalDateEdit');
  var alDateEdit = dialog.tabWidget.findChild('alDateEdit');
  var alLabelText = dialog.tabWidget.findChild('alLabelText');
  if (registri.param.periodoSelezionato == 'q')
    trimestreRadioButton.checked = true;
  else if (registri.param.periodoSelezionato == 'm')
    meseRadioButton.checked = true;
  else if (registri.param.periodoSelezionato == 'c')
    dataRadioButton.checked = true;
  else
    annoRadioButton.checked = true;
  annoLabel.text = registri.param.annoSelezionato;
  if (accountingData.openingYear != accountingData.closureYear)
    annoLabel.text += "/" + accountingData.closureYear;
  trimestreComboBox.currentIndex = parseInt(registri.param.periodoValoreTrimestre);
  meseComboBox.currentIndex = parseInt(registri.param.periodoValoreMese);
  var fromDate = registri.param.periodoDataDal;
  var toDate = registri.param.periodoDataAl;
  if (!fromDate || !toDate) {
      fromDate = Banana.Converter.stringToDate(accountingData.accountingOpeningDate, "YYYY-MM-DD");
      toDate = Banana.Converter.stringToDate(accountingData.accountingClosureDate, "YYYY-MM-DD");
  }
  fromDate = Banana.Converter.toInternalDateFormat(fromDate, "dd/mm/yyyy");
  toDate = Banana.Converter.toInternalDateFormat(toDate, "dd/mm/yyyy");
  dalDateEdit.setDate(fromDate);
  alDateEdit.setDate(toDate);
  //Tipo registro
  var tipoRegistroComboBox = dialog.tabWidget.findChild('tipoRegistroComboBox');
  if (tipoRegistroComboBox)
    tipoRegistroComboBox.currentIndex = registri.param.tipoRegistro;
  //Colonna protocollo
  index = 0;
  if (registri.param.colonnaProtocollo == 'Doc')
    index = 1;
  var colProtocolloComboBox = dialog.tabWidget.findChild('colProtocolloComboBox');
  if (colProtocolloComboBox)
    colProtocolloComboBox.currentIndex = index;
  //Opzioni
  var visualizzaDataOraCheckBox = dialog.tabWidget.findChild('visualizzaDataOraCheckBox');
  if (visualizzaDataOraCheckBox)
    visualizzaDataOraCheckBox.checked = registri.param.visualizzaDataOra;
  var numerazioneAutomaticaCheckBox = dialog.tabWidget.findChild('numerazioneAutomaticaCheckBox');
  if (numerazioneAutomaticaCheckBox)
    numerazioneAutomaticaCheckBox.checked = registri.param.numerazioneAutomatica;
  var stampaDefinitivaCheckBox = dialog.tabWidget.findChild('stampaDefinitivaCheckBox');
  if (stampaDefinitivaCheckBox)
    stampaDefinitivaCheckBox.checked = registri.param.stampaDefinitiva;
  var stampaOrizzontaleCheckBox = dialog.tabWidget.findChild('stampaOrizzontaleCheckBox');
  if (stampaOrizzontaleCheckBox)
    stampaOrizzontaleCheckBox.checked = registri.param.stampaOrizzontale;
  var inizioNumerazionePagineSpinBox = dialog.tabWidget.findChild('inizioNumerazionePagineSpinBox');
  if (inizioNumerazionePagineSpinBox) {
    var nInizio = parseInt(registri.param.inizioNumerazionePagine);
    if (nInizio <= 0)
      nInizio = 1;
    inizioNumerazionePagineSpinBox.value = nInizio;
  }
  //Testi
  var testoRegistriComboBox = dialog.tabWidget.findChild('testoRegistriComboBox');
  var testoGroupBox = dialog.tabWidget.findChild('testoGroupBox');
  var testoLineEdit = dialog.tabWidget.findChild('testoLineEdit');
  var tempStampaTestoRegistroAcquisti = registri.param.stampaTestoRegistroAcquisti;
  var tempStampaTestoRegistroVendite = registri.param.stampaTestoRegistroVendite;
  var tempStampaTestoRegistroCorrispettivi = registri.param.stampaTestoRegistroCorrispettivi;
  var tempTestoRegistroAcquisti = registri.param.testoRegistroAcquisti;
  var tempTestoRegistroVendite = registri.param.testoRegistroVendite;
  var tempTestoRegistroCorrispettivi = registri.param.testoRegistroCorrispettivi;
  var tempTestoRegistriCurrentIndex = registri.param.testoRegistriComboBoxIndex;
  if (testoRegistriComboBox)
    testoRegistriComboBox.currentIndex = registri.param.testoRegistriComboBoxIndex;
  if (testoGroupBox && registri.param.testoRegistriComboBoxIndex == 0) {
    testoGroupBox.checked = tempStampaTestoRegistroAcquisti;
    testoLineEdit.setText(tempTestoRegistroAcquisti);
  }
  else if (testoGroupBox && registri.param.testoRegistriComboBoxIndex == 1) {
    testoGroupBox.checked = tempStampaTestoRegistroVendite;
    testoLineEdit.setText(tempTestoRegistroVendite);
  }
  else if (testoGroupBox && registri.param.testoRegistriComboBoxIndex == 2) {
    testoGroupBox.checked = tempStampaTestoRegistroCorrispettivi;
    testoLineEdit.setText(tempTestoRegistroCorrispettivi);
  }
  
  //dialog functions
  dialog.checkdata = function () {
    dialog.accept();
  }
  dialog.enableButtons = function () {
    //Periodo
    if (annoRadioButton.checked) {
        trimestreComboBox.enabled = false;
        trimestreComboBox.update();
        meseComboBox.enabled = false;
        meseComboBox.update();
        dalDateEdit.enabled = false;
        dalDateEdit.update();
        alLabelText.enabled = false;
        alLabelText.update();
        alDateEdit.enabled = false;
        alDateEdit.update();
    }
    else if (trimestreRadioButton.checked) {
        trimestreComboBox.enabled = true;
        trimestreComboBox.update();
        meseComboBox.enabled = false;
        meseComboBox.update();
        dalDateEdit.enabled = false;
        dalDateEdit.update();
        alLabelText.enabled = false;
        alLabelText.update();
        alDateEdit.enabled = false;
        alDateEdit.update();
    }
    else if (meseRadioButton.checked) {
        trimestreComboBox.enabled = false;
        trimestreComboBox.update();
        meseComboBox.enabled = true;
        meseComboBox.update();
        dalDateEdit.enabled = false;
        dalDateEdit.update();
        alLabelText.enabled = false;
        alLabelText.update();
        alDateEdit.enabled = false;
        alDateEdit.update();
    }
    else if (dataRadioButton.checked) {
        trimestreComboBox.enabled = false;
        trimestreComboBox.update();
        meseComboBox.enabled = false;
        meseComboBox.update();
        dalDateEdit.enabled = true;
        dalDateEdit.update();
        alLabelText.enabled = true;
        alLabelText.update();
        alDateEdit.enabled = true;
        alDateEdit.update();
    }
    //Testi
    if (tempTestoRegistriCurrentIndex == '0') {
      tempStampaTestoRegistroAcquisti = testoGroupBox.checked;
      tempTestoRegistroAcquisti = testoLineEdit.plainText;
    }
    else if (tempTestoRegistriCurrentIndex == '1') {
      tempStampaTestoRegistroVendite = testoGroupBox.checked;
      tempTestoRegistroVendite = testoLineEdit.plainText;
    }
    else if (tempTestoRegistriCurrentIndex == '2') {
      tempStampaTestoRegistroCorrispettivi = testoGroupBox.checked;
      tempTestoRegistroCorrispettivi = testoLineEdit.plainText;
    }
    tempTestoRegistriCurrentIndex = testoRegistriComboBox.currentIndex.toString();
    testoGroupBox.checked = false;
    testoLineEdit.setText('');
    if (tempTestoRegistriCurrentIndex == '0') {
      testoGroupBox.checked = tempStampaTestoRegistroAcquisti;
      testoLineEdit.setText(tempTestoRegistroAcquisti);
    }
    else if (tempTestoRegistriCurrentIndex == '1') {
      testoGroupBox.checked = tempStampaTestoRegistroVendite;
      testoLineEdit.setText(tempTestoRegistroVendite);
    }
    else if (tempTestoRegistriCurrentIndex == '2') {
      testoGroupBox.checked = tempStampaTestoRegistroCorrispettivi;
      testoLineEdit.setText(tempTestoRegistroCorrispettivi);
    }
  }
  dialog.showHelp = function () {
    Banana.Ui.showHelp("ch.banana.script.italy_vat_2017");
  }
  dialog.buttonBox.accepted.connect(dialog, dialog.checkdata);
  dialog.buttonBox.helpRequested.connect(dialog, dialog.showHelp);
  annoRadioButton.clicked.connect(dialog.enableButtons);
  trimestreRadioButton.clicked.connect(dialog.enableButtons);
  meseRadioButton.clicked.connect(dialog.enableButtons);
  dataRadioButton.clicked.connect(dialog.enableButtons);
  if (testoRegistriComboBox['currentIndexChanged(QString)'])
     testoRegistriComboBox['currentIndexChanged(QString)'].connect(dialog, dialog.enableButtons);
  else
     testoRegistriComboBox.currentIndexChanged.connect(dialog, dialog.enableButtons);
  testoGroupBox.clicked.connect(dialog, dialog.enableButtons);
  
  //Visualizzazione dialogo
  Banana.application.progressBar.pause();
  dialog.enableButtons();
  var dlgResult = dialog.exec();
  Banana.application.progressBar.resume();
  if (dlgResult !== 1)
    return false;

  //Salvataggio dati
  //periodo
  if (trimestreRadioButton.checked)
    registri.param.periodoSelezionato = 'q';
  else if (meseRadioButton.checked)
    registri.param.periodoSelezionato = 'm';
  else if (dataRadioButton.checked)
    registri.param.periodoSelezionato = 'c';
  else
    registri.param.periodoSelezionato = 'y';
  var index = parseInt(trimestreComboBox.currentIndex.toString());
  registri.param.periodoValoreTrimestre = index.toString();
  index = parseInt(meseComboBox.currentIndex.toString());
  registri.param.periodoValoreMese = index.toString();
  registri.param.periodoDataDal = dalDateEdit.text < 10 ? "0" + dalDateEdit.text : dalDateEdit.text;
  registri.param.periodoDataAl = alDateEdit.text < 10 ? "0" + alDateEdit.text : alDateEdit.text;
  //Reimposta l'anno per contabilità che non iniziano al 1. gennaio
  if (accountingData.openingYear != accountingData.closureYear &&
    (registri.param.periodoSelezionato == 'q' || registri.param.periodoSelezionato == 'm')) {
    registri.param.datiContribuente = {};
    registri.param.datiContribuente.liqTipoVersamento = -1;
    var periods = new Utils(Banana.document).createPeriods(registri.param);
    if (periods.length>0) {
      var accountingStartDate = Banana.Converter.toInternalDateFormat(accountingData.accountingOpeningDate,"yyyy-mm-dd");
      var periodStartDate = Banana.Converter.toInternalDateFormat(periods[0].startDate,"yyyymmdd");
      if (periodStartDate < accountingStartDate)
        registri.param.annoSelezionato = accountingData.closureYear;
    }
  }
  //Tipo registro
  if (tipoRegistroComboBox)
    registri.param.tipoRegistro = tipoRegistroComboBox.currentIndex.toString();
  //Colonna protocollo
  registri.param.colonnaProtocollo = 'DocProtocol';
  index = parseInt(colProtocolloComboBox.currentIndex.toString());
  if (index == 1)
    registri.param.colonnaProtocollo = 'Doc';
  //Opzioni
  if (visualizzaDataOraCheckBox)
    registri.param.visualizzaDataOra = visualizzaDataOraCheckBox.checked;
  if (numerazioneAutomaticaCheckBox)
    registri.param.numerazioneAutomatica = numerazioneAutomaticaCheckBox.checked;
  if (stampaDefinitivaCheckBox)
    registri.param.stampaDefinitiva = stampaDefinitivaCheckBox.checked;
  if (stampaOrizzontaleCheckBox)
    registri.param.stampaOrizzontale = stampaOrizzontaleCheckBox.checked;
  if (inizioNumerazionePagineSpinBox)
      registri.param.inizioNumerazionePagine = inizioNumerazionePagineSpinBox.value.toString();
  //Testi
  registri.param.testoRegistriComboBoxIndex = testoRegistriComboBox.currentIndex.toString();
  if (registri.param.testoRegistriComboBoxIndex == 0) {
    registri.param.stampaTestoRegistroAcquisti = testoGroupBox.checked;
    if (registri.param.stampaTestoRegistroAcquisti)
      registri.param.testoRegistroAcquisti = testoLineEdit.plainText;
    registri.param.stampaTestoRegistroVendite = tempStampaTestoRegistroVendite;
    registri.param.testoRegistroVendite = tempTestoRegistroVendite;
    registri.param.stampaTestoRegistroCorrispettivi = tempStampaTestoRegistroCorrispettivi;
    registri.param.testoRegistroCorrispettivi = tempTestoRegistroCorrispettivi;
  }
  else if (registri.param.testoRegistriComboBoxIndex == 1) {
    registri.param.stampaTestoRegistroVendite = testoGroupBox.checked;
    if (registri.param.stampaTestoRegistroVendite)
      registri.param.testoRegistroVendite = testoLineEdit.plainText;
    registri.param.stampaTestoRegistroAcquisti = tempStampaTestoRegistroAcquisti;
    registri.param.testoRegistroAcquisti = tempTestoRegistroAcquisti;
    registri.param.stampaTestoRegistroCorrispettivi = tempStampaTestoRegistroCorrispettivi;
    registri.param.testoRegistroCorrispettivi = tempTestoRegistroCorrispettivi;
  }
  else if (registri.param.testoRegistriComboBoxIndex == 2) {
    registri.param.stampaTestoRegistroCorrispettivi = testoGroupBox.checked;
    if (registri.param.stampaTestoRegistroCorrispettivi)
      registri.param.testoRegistroCorrispettivi = testoLineEdit.plainText;
    registri.param.stampaTestoRegistroAcquisti = tempStampaTestoRegistroAcquisti;
    registri.param.testoRegistroAcquisti = tempTestoRegistroAcquisti;
    registri.param.stampaTestoRegistroVendite = tempStampaTestoRegistroVendite;
    registri.param.testoRegistroVendite = tempTestoRegistroVendite;
  }
  
  var paramToString = JSON.stringify(registri.param);
  Banana.document.setScriptSettings(paramToString);
  return true;
}

function Registri(banDocument) {
  this.banDocument = banDocument;
  if (this.banDocument === undefined)
    this.banDocument = Banana.document;
  this.initParam();
}

Registri.prototype.addPageFooter = function(report, stylesheet) {

  // Page footer
  if (report === undefined || stylesheet === undefined)
    return;

  var pageFooter = report.getFooter();

  //Tabella
  var table = pageFooter.addTable("footer_table");
  table.addColumn("footer_col_left");
  table.addColumn("footer_col_center");
  table.addColumn("footer_col_right");

  //cell_left
  var row = table.addRow();
  var cell_left = row.addCell("", "footer_cell_left");

  //cell_center
  var cell_center = row.addCell("", "footer_cell_center");
  var datestring = '';
  if (this.param.visualizzaDataOra) {
    var d = new Date();
    datestring = ("0" + d.getDate()).slice(-2) + "/" + ("0"+(d.getMonth()+1)).slice(-2) + "/" + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
  }
  var pDate = cell_center.addParagraph(datestring, "center");
  pDate.excludeFromTest();

  //cell_right
  var row = table.addRow();
  var cell_right = row.addCell("", "footer_cell_right");

  //add style
  stylesheet.addStyle(".footer_table", "margin-top:1em;width:100%;");
  stylesheet.addStyle(".footer_col_left", "width:33%;");
  stylesheet.addStyle(".footer_col_center", "width:33%;");
  stylesheet.addStyle(".footer_col_right", "width:33%");
  stylesheet.addStyle(".footer_cell_left", "font-size:9px");
  stylesheet.addStyle(".footer_cell_center", "font-size:9px;padding-right:0;margin-right:0;");
  stylesheet.addStyle(".footer_cell_right", "font-size:9px;padding-left:0;margin-left:0;");
  stylesheet.addStyle(".center", "text-align: center;");
}

Registri.prototype.addPageHeader = function(report, stylesheet) {

  // Page header
  if (report === undefined || stylesheet === undefined)
    return;

  var pageHeader = report.getHeader();

  //Tabella
  var table = pageHeader.addTable("header_table");
  table.addColumn("header_col_left");
  table.addColumn("header_col_center");
  table.addColumn("header_col_right");
  table.addColumn("header_col_right");
  
  //cell_left
  var row = table.addRow();
  var cell_left = row.addCell("", "header_cell_left");

  var line1 = this.param.datiContribuente.societa;
  if (line1.length)
    line1 += " ";
  if (this.param.datiContribuente.cognome.length)
    line1 += this.param.datiContribuente.cognome;
  if (this.param.datiContribuente.nome.length)
    line1 += this.param.datiContribuente.nome;
  if (line1.length)
    cell_left.addParagraph(line1);
  
  var line2 = '';
  if (this.param.datiContribuente.indirizzo.length)
    line2 = this.param.datiContribuente.indirizzo + " ";
  if (this.param.datiContribuente.ncivico.length)
    line2 += " " + this.param.datiContribuente.ncivico;
  if (line2.length)
    cell_left.addParagraph(line2);

  var line3 = '';
  if (this.param.datiContribuente.cap.length)
    line3 = this.param.datiContribuente.cap + " ";
  if (this.param.datiContribuente.comune.length)
    line3 += this.param.datiContribuente.comune + " ";
  if (this.param.datiContribuente.provincia.length)
    line3 += "(" +  this.param.datiContribuente.provincia + ")";
  if (line3.length)
    cell_left.addParagraph(line3);
  
  var line4 = '';
  if (this.param.datiContribuente.partitaIva.length)
    line4 = "P.IVA: " + this.param.datiContribuente.partitaIva;
  if (line4.length)
    cell_left.addParagraph(line4, "vatNumber");
  
  //cell_center
  var cell_center = row.addCell("", "header_cell_center");
  var text = '';
  if (this.param.tipoRegistro == 0)
    text = 'Registro IVA Vendite';
  else if (this.param.tipoRegistro == 1)
    text = 'Registro IVA Acquisti';
  else if (this.param.tipoRegistro == 2)
    text = 'Registro IVA Corrispettivi';
  else if (this.param.tipoRegistro == 3)
    text = 'Liquidazione IVA';
  else if (this.param.tipoRegistro == 4)
    text = 'Registro IVA unico';
  cell_center.addParagraph(text, "");

  //cell_right1
  if (typeof (report.setFirstPageNumber) !== 'undefined') {
    var nInizio = 1;
    if (parseInt(this.param.inizioNumerazionePagine)>1)
      nInizio = parseInt(this.param.inizioNumerazionePagine);
    report.setFirstPageNumber(parseInt(this.param.inizioNumerazionePagine));
  }
  var cell_right1 = row.addCell("", "header_cell_right");
  cell_right1.addParagraph("pag. ", "right").addFieldPageNr();

  //cell_right
  var period = "/" + this.param.annoSelezionato;
  var cell_right2 = row.addCell("", "header_cell_right");
  cell_right2.addParagraph(period, "period_header");

  //add style
  stylesheet.addStyle(".header_table", "margin-top:1em;width:100%;");
  stylesheet.addStyle(".header_col_left", "width:43%;");
  stylesheet.addStyle(".header_col_center", "width:44%;");
  stylesheet.addStyle(".header_col_right1", "width:5%");
  stylesheet.addStyle(".header_col_right2", "width:5%");
  stylesheet.addStyle(".header_cell_left", "font-size:9px");
  stylesheet.addStyle(".header_cell_center", "font-size:9px;padding-right:0;margin-right:0;");
  stylesheet.addStyle(".header_cell_right", "font-size:9px;padding-left:0;margin-left:0;");
  stylesheet.addStyle(".period_header", "padding-bottom: 1em;padding-top:0;");
  stylesheet.addStyle(".right", "text-align: right;");
}

Registri.prototype.formatAmount = function(amount) {

  var amountFormatted = amount;
  if (amountFormatted)
    amountFormatted = Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(amountFormatted))
  else
      amountFormatted = "";
  if (Banana.SDecimal.isZero(amountFormatted))
    return "";
  return amountFormatted;
}

Registri.prototype.initParam = function() {

  this.param = {};

  this.param.tipoRegistro = 0;
  this.param.colonnaProtocollo = 'DocProtocol';
  this.param.visualizzaDataOra = false;
  this.param.numerazioneAutomatica = false;
  this.param.stampaDefinitiva = false;
  this.param.inizioNumerazionePagine = 1;
  this.param.testoRegistriComboBoxIndex = 0;
  this.param.stampaTestoRegistroAcquisti = false;
  this.param.stampaTestoRegistroVendite = false;
  this.param.stampaTestoRegistroCorrispettivi = false;
  this.param.stampaOrizzontale = false;
  this.param.testoRegistroAcquisti = '';
  this.param.testoRegistroVendite = '';
  this.param.testoRegistroCorrispettivi = '';

  this.param.annoSelezionato = '';
  this.param.periodoSelezionato = 'm';
  this.param.periodoValoreMese = '';
  this.param.periodoValoreTrimestre = '';
  this.param.periodoValoreSemestre = '';
  this.param.periodoDataDal = '';
  this.param.periodoDataAl = '';
}

Registri.prototype.loadData = function() {
  
  this.param.datiContribuente = new DatiContribuente(this.banDocument).readParam();
  var utils = new Utils(this.banDocument);
  this.param = utils.readAccountingData(this.param);
  var journal = new Journal(this.banDocument);
  journal.load(); 

  this.param.periods = [];
  //aggiunge l'anno intero se periodo è annuale altrimenti i singoli periodi selezionati
  if (this.param.periodoSelezionato == 'y') {
    var periodYear = journal.getPeriod(this.param.fileInfo["OpeningDate"], this.param.fileInfo["ClosureDate"]);
    periodYear.numerazioneAutomatica = this.param.numerazioneAutomatica;
    periodYear.colonnaProtocollo = this.param.colonnaProtocollo;
    this.param.periods.push(periodYear);
  }
  //periodo custom dal... al...
  else if (this.param.periodoSelezionato == 'c') {
    var startDate = Banana.Converter.toInternalDateFormat(this.param.periodoDataDal, "dd/mm/yyyy");
    var endDate = Banana.Converter.toInternalDateFormat(this.param.periodoDataAl, "dd/mm/yyyy"); 
    var periodCustom = journal.getPeriod(startDate, endDate);
    periodCustom.numerazioneAutomatica = this.param.numerazioneAutomatica;
    periodCustom.colonnaProtocollo = this.param.colonnaProtocollo;
    this.param.periods.push(periodCustom);
  }
  else {
    var periods = utils.createPeriods(this.param);
    for (var i=0; i<periods.length; i++) {
      periods[i] = journal.getPeriod(periods[i].startDate, periods[i].endDate);
      periods[i].numerazioneAutomatica = this.param.numerazioneAutomatica;
      periods[i].colonnaProtocollo = this.param.colonnaProtocollo;
      this.param.periods.push(periods[i]);
    }
  }

  //PeriodComplete (inizio contabilità/fine periodo selezionato) serve per il calcolo dei corrispettivi da ventilare (acquisti per rivendita)
  for (var i=0; i<this.param.periods.length; i++) {
    console.log( "this.param.periods[i] " + this.param.periods[i].startDate + " " + this.param.periods[i].endDate);
    var periodComplete = journal.getPeriod(this.param.fileInfo["OpeningDate"], this.param.periods[i].endDate);
    this.param.periods[i] = this.loadDataTotals(this.param.periods[i], periodComplete);
    this.param.periods[i].periodComplete = periodComplete;
  }
  
}

Registri.prototype.loadDataTotals = function(period, periodComplete) {

  //Raggruppa totali per registro
  var registri = [];
  
  for (var index in period.transactions) {
    if (typeof period.transactions[index] !== "object" || period.transactions[index].IT_Registro.length<=0)
      continue;

    var register = period.transactions[index].IT_Registro.toLowerCase();
    var gr = period.transactions[index].IT_Gr_IVA;
    if (!registri[register])
      registri[register] = {};
    //Totali corrispettivi
    //I corrispettivi da ventilare vengono separati e riconosciuto tramite il codice gr C-VEN
    if (register == "corrispettivi") {
      var date = period.transactions[index].JDate;
      var vatCode = period.transactions[index].JVatCodeWithoutSign;
      var key = date + "|" + vatCode;
      var currentObject = {};
      currentObject.contoFattureNormali = 0;
      currentObject.contoFattureFiscali = 0;
      currentObject.contoFattureScontrini = 0;
      currentObject.contoFattureDifferite = 0;
      currentObject.contoCorrispettiviNormali = 0;
      currentObject.contoCorrispettiviScontrini = 0;
      currentObject.contoRicevuteFiscali = 0;
      currentObject.totaleGiornaliero = 0;
      currentObject.vatCode = '';
      currentObject.gr = '';
      if (registri[register][key]) {
        currentObject = registri[register][key];
      }
      currentObject.contoFattureNormali = Banana.SDecimal.add(period.transactions[index].IT_CorrFattureNormali, currentObject.contoFattureNormali);
      currentObject.contoFattureFiscali = Banana.SDecimal.add(period.transactions[index].IT_CorrFattureFiscali, currentObject.contoFattureFiscali);
      currentObject.contoFattureScontrini = Banana.SDecimal.add(period.transactions[index].IT_CorrFattureScontrini, currentObject.contoFattureScontrini);
      currentObject.contoFattureDifferite = Banana.SDecimal.add(period.transactions[index].IT_CorrFattureDifferite, currentObject.contoFattureDifferite);
      currentObject.contoCorrispettiviNormali = Banana.SDecimal.add(period.transactions[index].IT_CorrispettiviNormali, currentObject.contoCorrispettiviNormali);
      currentObject.contoCorrispettiviScontrini = Banana.SDecimal.add(period.transactions[index].IT_CorrispettiviScontrini, currentObject.contoCorrispettiviScontrini);
      currentObject.contoRicevuteFiscali = Banana.SDecimal.add(period.transactions[index].IT_CorrRicevuteFiscali, currentObject.contoRicevuteFiscali);
      currentObject.totaleGiornaliero = Banana.SDecimal.add(period.transactions[index].IT_CorrTotaleGiornaliero, currentObject.totaleGiornaliero);
      currentObject.vatCode = vatCode;
      currentObject.gr = gr;
      //if (!Banana.SDecimal.isZero(currentObject.totaleGiornaliero))
        registri[register][key] = currentObject;
    }
    //tutti i codici IVA eccetto C-VEN (corrispettivi da ventilare con aliquota 0%) devono essere inclusi 
    if (gr != "C-VEN") {
      if (!registri[register].totaliAliquota)
        registri[register].totaliAliquota = [];
      if (!registri[register].totaliCodice)
        registri[register].totaliCodice = [];

      var vatCode = period.transactions[index].JVatCodeWithoutSign;
      var vatRate = period.transactions[index].IT_Aliquota;
      var vatAmount = period.transactions[index].IT_ImportoIva;
      var vatPosted = period.transactions[index].IT_IvaContabilizzata;
      var vatNonDed = period.transactions[index].VatNonDeductible;
      var vatTaxable = period.transactions[index].IT_Imponibile;
      var vatTaxableDed = period.transactions[index].IT_ImponibileDetraibile;
      var vatTaxableNonDed = period.transactions[index].IT_ImponibileNonDetraibile;
      var vatPercNonDed = period.transactions[index].VatPercentNonDeductible;
      var vatGross =  period.transactions[index].IT_Lordo;

      if (vatRate.length>0) {
        if (registri[register].totaliAliquota[vatRate]) {
          registri[register].totaliAliquota[vatRate].vatAmount = Banana.SDecimal.add(registri[register].totaliAliquota[vatRate].vatAmount, vatAmount);
          registri[register].totaliAliquota[vatRate].vatPosted = Banana.SDecimal.add(registri[register].totaliAliquota[vatRate].vatPosted, vatPosted);
          registri[register].totaliAliquota[vatRate].vatNonDed = Banana.SDecimal.add(registri[register].totaliAliquota[vatRate].vatNonDed, vatNonDed);
          registri[register].totaliAliquota[vatRate].vatTaxable = Banana.SDecimal.add(registri[register].totaliAliquota[vatRate].vatTaxable, vatTaxable);
          registri[register].totaliAliquota[vatRate].vatTaxableDed = Banana.SDecimal.add(registri[register].totaliAliquota[vatRate].vatTaxableDed, vatTaxableDed);
          registri[register].totaliAliquota[vatRate].vatTaxableNonDed = Banana.SDecimal.add(registri[register].totaliAliquota[vatRate].vatTaxableNonDed, vatTaxableNonDed);
          registri[register].totaliAliquota[vatRate].vatGross = Banana.SDecimal.add(registri[register].totaliAliquota[vatRate].vatGross, vatGross);

        }
        else {
          registri[register].totaliAliquota[vatRate] = {};
          registri[register].totaliAliquota[vatRate].vatAmount = vatAmount;
          registri[register].totaliAliquota[vatRate].vatPosted = vatPosted;
          registri[register].totaliAliquota[vatRate].vatNonDed = vatNonDed;
          registri[register].totaliAliquota[vatRate].vatTaxable = vatTaxable;
          registri[register].totaliAliquota[vatRate].vatTaxableDed = vatTaxableDed;
          registri[register].totaliAliquota[vatRate].vatTaxableNonDed = vatTaxableNonDed;
          registri[register].totaliAliquota[vatRate].vatPercNonDed = vatPercNonDed;
          registri[register].totaliAliquota[vatRate].vatGross = vatGross;
        }
      }

      if (vatCode.length>0) {
        if (registri[register].totaliCodice[vatCode]) {
          registri[register].totaliCodice[vatCode].vatAmount = Banana.SDecimal.add(registri[register].totaliCodice[vatCode].vatAmount, vatAmount);
          registri[register].totaliCodice[vatCode].vatPosted = Banana.SDecimal.add(registri[register].totaliCodice[vatCode].vatPosted, vatPosted);
          registri[register].totaliCodice[vatCode].vatNonDed = Banana.SDecimal.add(registri[register].totaliCodice[vatCode].vatNonDed, vatNonDed);
          registri[register].totaliCodice[vatCode].vatTaxable = Banana.SDecimal.add(registri[register].totaliCodice[vatCode].vatTaxable, vatTaxable);
          registri[register].totaliCodice[vatCode].vatTaxableDed = Banana.SDecimal.add(registri[register].totaliCodice[vatCode].vatTaxableDed, vatTaxableDed);
          registri[register].totaliCodice[vatCode].vatTaxableNonDed = Banana.SDecimal.add(registri[register].totaliCodice[vatCode].vatTaxableNonDed, vatTaxableNonDed);
          registri[register].totaliCodice[vatCode].vatGross = Banana.SDecimal.add(registri[register].totaliCodice[vatCode].vatGross, vatGross);
        }
        else {
          registri[register].totaliCodice[vatCode] = {};
          registri[register].totaliCodice[vatCode].vatAmount = vatAmount;
          registri[register].totaliCodice[vatCode].vatPosted = vatPosted;
          registri[register].totaliCodice[vatCode].vatNonDed = vatNonDed;
          registri[register].totaliCodice[vatCode].vatTaxable = vatTaxable;
          registri[register].totaliCodice[vatCode].vatTaxableDed = vatTaxableDed;
          registri[register].totaliCodice[vatCode].vatTaxableNonDed = vatTaxableNonDed;
          registri[register].totaliCodice[vatCode].vatPercNonDed = vatPercNonDed;
          registri[register].totaliCodice[vatCode].vatGross = vatGross;
          registri[register].totaliCodice[vatCode].vatRate = vatRate;
          registri[register].totaliCodice[vatCode].vatCodeDes = '';
          registri[register].totaliCodice[vatCode].gr = gr;
          var tableVatCodes = this.banDocument.table("VatCodes");
          if (tableVatCodes) {
            var vatCodeRow = tableVatCodes.findRowByValue("VatCode", vatCode);
             if (vatCodeRow)
               registri[register].totaliCodice[vatCode].vatCodeDes = vatCodeRow.value("Description");
          }
        }
      }
    }
  }
  
  period.registri = registri;
  period.acquistiPerRivendita = this.loadDataVentilazione(registri["corrispettivi"], periodComplete) ;

  return period;
}

Registri.prototype.loadDataVentilazione = function(corrispettivi, periodComplete) {

  var acquistiPerRivendita = [];
  //Ventilazione corrispettivi
  for (var index in periodComplete.transactions) {
    if (typeof periodComplete.transactions[index] !== "object")
      continue;

    var gr = periodComplete.transactions[index].IT_Gr_IVA;
    var vatCode = periodComplete.transactions[index].JVatCodeWithoutSign;
    var totAcquisti = 0;

    if (periodComplete.transactions[index].IT_Registro.toLowerCase() == "acquisti" && gr == "A-IM-RI") {
      var currentObject = {};
      currentObject.totaleAcquisti = '';
      if (acquistiPerRivendita[vatCode]) {
        currentObject = acquistiPerRivendita[vatCode];
      }
      currentObject.totaleAcquisti = Banana.SDecimal.add(periodComplete.transactions[index].IT_Lordo, currentObject.totaleAcquisti);
      acquistiPerRivendita[vatCode] = currentObject;
    }
  }
  
  var totAcquisti=0;
  for (var key in acquistiPerRivendita) {
    totAcquisti = Banana.SDecimal.add(acquistiPerRivendita[key].totaleAcquisti, totAcquisti);
  }
  var totDaVentilare=0;
  for (var key in corrispettivi) {
    if (corrispettivi[key].gr == "C-VEN")
      totDaVentilare = Banana.SDecimal.add(corrispettivi[key].totaleGiornaliero, totDaVentilare);
  }
  totDaVentilare = Banana.SDecimal.invert(totDaVentilare);
  
  for (var key in acquistiPerRivendita) {
    var vatCode = key.split('|');
    if (vatCode.length>0)
      vatCode = vatCode[0];
    var vatCodeDes = '';
    var vatCodeRate = '';
    var tableVatCodes = this.banDocument.table("VatCodes");
    if (tableVatCodes) {
      var vatCodeRow = tableVatCodes.findRowByValue("VatCode", vatCode);
      if (vatCodeRow) {
        vatCodeDes = vatCodeRow.value("Description");
        vatCodeRate = vatCodeRow.value("VatRate");
      }
    }
    var aliquota = Banana.SDecimal.round(vatCodeRate, {'decimals':2});
    var incidenza = Banana.SDecimal.divide(acquistiPerRivendita[key].totaleAcquisti, totAcquisti); 
    var daVentilare = Banana.SDecimal.multiply(totDaVentilare, incidenza); 
    var imponibile = Banana.SDecimal.divide(Banana.SDecimal.multiply(daVentilare , 100), Banana.SDecimal.add(100, aliquota));
    var iva = Banana.SDecimal.divide(Banana.SDecimal.multiply(daVentilare , aliquota), Banana.SDecimal.add(100, aliquota));
    acquistiPerRivendita[key].vatCode = vatCode;
    acquistiPerRivendita[key].vatCodeDes = vatCodeDes;
    acquistiPerRivendita[key].vatRate = vatCodeRate;
    acquistiPerRivendita[key].aliquota = aliquota;
    acquistiPerRivendita[key].incidenza = incidenza;
    acquistiPerRivendita[key].daVentilare = Banana.SDecimal.round(daVentilare, {'decimals':2});
    acquistiPerRivendita[key].imponibile = Banana.SDecimal.round(imponibile, {'decimals':2});
    acquistiPerRivendita[key].iva = Banana.SDecimal.round(iva, {'decimals':2});
  } 
  return acquistiPerRivendita;
}

Registri.prototype.printDocument = function(report, stylesheet) {
  
  this.addPageHeader(report, stylesheet);
  this.addPageFooter(report, stylesheet);
  this.setStyle(stylesheet);
  
  var addPageBreak = false;
  for (var i=0; i<this.param.periods.length; i++) {
    //tipoRegistro 0 = vendite
    //tipoRegistro 4 = registro iva unico
    if (this.param.tipoRegistro == 0 || this.param.tipoRegistro == 4) {
      var printed = this.printRegistroAcquistiVendite(report, this.param.periods[i], 'vendite', addPageBreak);
      if (printed)
        addPageBreak = true;
    }
    //tipoRegistro 3 = liquidazione
    if (this.param.tipoRegistro == 0 || this.param.tipoRegistro == 3 || this.param.tipoRegistro == 4) {
      var liquidazionePeriodica = new LiquidazionePeriodica(this.banDocument);
      liquidazionePeriodica.setParam(this.param);
      var vatAmounts = liquidazionePeriodica.loadVatCodes(this.param.periods[i].startDate, this.param.periods[i].endDate);
      this.param.vatPeriods = [];
      this.param.vatPeriods.push(vatAmounts);
      //OPATTIVE non include la liquidazione nella stampa dei registri
      this.param.vatPeriods[0]["OPATTIVE"] = liquidazionePeriodica.sumVatAmounts(this.param.vatPeriods[0], ["V","C"]);
      this.param.vatPeriods[0]["OPDIFFERENZA"] = liquidazionePeriodica.sumVatAmounts(this.param.vatPeriods[0], ["OPATTIVE","OPPASSIVE"]);
      var printed = this.printLiquidazione(report, this.param.periods[i], addPageBreak);
      if (printed)
        addPageBreak = true;
    }
    //tipoRegistro 1 = acquisti
    if (this.param.tipoRegistro == 1 || this.param.tipoRegistro == 4) {
      var printed = this.printRegistroAcquistiVendite(report, this.param.periods[i], 'acquisti', addPageBreak);
      if (printed)
        addPageBreak = true;
    }
    //tipoRegistro 2 = corrispettivi
    if (this.param.tipoRegistro == 2 || this.param.tipoRegistro == 4) {
      var printed = this.printRegistroCorrispettivi(report, this.param.periods[i], addPageBreak);
      if (printed)
        addPageBreak = true;
    }
  }
  return true;
}

Registri.prototype.printLiquidazione = function(report, period, addPageBreak) {

  if (!report)
    return;

  if (addPageBreak)
    report.addPageBreak();

  var utils = new Utils(this.banDocument);

  //Tabella Prospetto di liquidazione IVA
  report.addParagraph("Prospetto di liquidazione IVA", "h1");
  report.addParagraph(utils.getPeriodText(period), "h1_period");
  printed = this.printLiquidazioneSummary(report, period);
  if (printed)
    report.addPageBreak();

  //Tabella Riepilogo IVA
  report.addParagraph("Riepilogo IVA", "h1");
  report.addParagraph("Periodo: " + utils.getPeriodText(this.param.vatPeriods[0]), "h1_period");
  var table = report.addTable("vat_table");
  
  //Totale operazioni attive
  var amount = this.param.vatPeriods[0]["OPATTIVE"].vatTaxable;
  var row = table.addRow();
  row.addCell("Totale operazioni attive (al netto dell'IVA)", "description");
  if (Banana.SDecimal.sign(amount)<0) {
    row.addCell(this.formatAmount(amount), "amount");
    row.addCell("");
  }
  else {
    row.addCell("");
    row.addCell(this.formatAmount(amount), "amount");
  }

  //Totale operazioni passive
  amount = this.param.vatPeriods[0]["OPPASSIVE"].vatTaxable;
  row = table.addRow();
  row.addCell("Totale operazioni passive (al netto dell'IVA)", "description");
  if (Banana.SDecimal.sign(amount)<0) {
    row.addCell(this.formatAmount(amount), "amount");
    row.addCell("");
  }
  else {
    row.addCell("");
    row.addCell(this.formatAmount(amount), "amount");
  }

  //Riga di separazione
  var row = table.addRow();
  row.addCell("", "separator", 3);

  //Riga di titolo
  var row = table.addRow();
  row.addCell("", "description bold");
  row.addCell("DEBITO", "amount bold");
  row.addCell("CREDITO", "amount bold");
  
  //IVA esigibile
  amount = this.param.vatPeriods[0]["OPATTIVE"].vatPosted;
  row = table.addRow();
  row.addCell("IVA esigibile", "description");
  if (Banana.SDecimal.sign(amount)<0) {
    row.addCell(this.formatAmount(amount), "amount");
    row.addCell("");
  }
  else {
    row.addCell("");
    row.addCell(this.formatAmount(amount), "amount");
  }
  
  //IVA detratta
  amount = this.param.vatPeriods[0]["OPPASSIVE"].vatPosted;
  row = table.addRow();
  var description = "IVA detratta";
  if (!Banana.SDecimal.isZero(this.param.vatPeriods[0].datiContribuente.liqPercProrata))
    description = "IVA detratta (Prorata: " + Banana.SDecimal.round(this.param.vatPeriods[0].datiContribuente.liqPercProrata, {'decimals':2}).toString() + "%)";
  row.addCell(description, "description");
  if (Banana.SDecimal.sign(amount)<0) {
    row.addCell(this.formatAmount(amount), "amount");
    row.addCell("");
  }
  else {
    row.addCell("");
    row.addCell(this.formatAmount(amount), "amount");
  }

  //Saldo IVA di periodo (IVA esigibile - IVA detratta)
  amount = this.param.vatPeriods[0]["OPDIFFERENZA"].vatPosted;
  row = table.addRow();
  row.addCell("Saldo IVA di periodo (mensile o trimestrale)", "description");
  if (Banana.SDecimal.sign(amount)<=0) {
    row.addCell(this.formatAmount(amount), "amount");
    row.addCell("");
  }
  else {
    row.addCell("");
    row.addCell(this.formatAmount(amount), "amount");
  }
  
  //Credito IVA periodo precedente (mensile o trimestrale)
  amount = this.param.vatPeriods[0]["L-CI"].vatPosted;
  row = table.addRow();
  row.addCell("Credito IVA periodo precedente (mensile o trimestrale)", "description");
  if (Banana.SDecimal.sign(amount)<=0) {
    row.addCell(this.formatAmount(amount), "amount");
    row.addCell("");
  }
  else {
    row.addCell("");
    row.addCell(this.formatAmount(amount), "amount");
  }

  //Ammontare dei versamenti
  amount = this.param.vatPeriods[0]["L-RI"].vatPosted;
  if (!Banana.SDecimal.isZero(amount)) {
    row = table.addRow();
    row.addCell("Ammontare dei versamenti", "description");
    if (Banana.SDecimal.sign(amount)<=0) {
      row.addCell(this.formatAmount(amount), "amount");
      row.addCell("");
    }
    else {
      row.addCell("");
      row.addCell(this.formatAmount(amount), "amount");
    }
  }
  
  //Credito o debito IVA di periodo (IVA esigibile - IVA detratta - Credito IVA periodo precedente)
  amount = Banana.SDecimal.add(this.param.vatPeriods[0]["OPDIFFERENZA"].vatPosted, this.param.vatPeriods[0]["L-CI"].vatPosted);
  row = table.addRow();
  row.addCell("Credito o debito IVA di periodo", "description");
  if (Banana.SDecimal.sign(amount)<=0) {
    row.addCell(this.formatAmount(amount), "amount");
    row.addCell("");
  }
  else {
    row.addCell("");
    row.addCell(this.formatAmount(amount), "amount");
  }

  //Riga di separazione
  var row = table.addRow();
  row.addCell("", "separator", 3);

  //Credito IVA anno precedente
  amount = this.param.vatPeriods[0]["L-CIA"].vatPosted;
  row = table.addRow();
  row.addCell("Credito IVA anno precedente", "description");
  if (Banana.SDecimal.sign(amount)<0) {
    row.addCell(this.formatAmount(amount), "amount");
    row.addCell("");
  }
  else {
    row.addCell("");
    row.addCell(this.formatAmount(amount), "amount");
  }

  //Credito IVA anno precedente compensato F24
  amount = this.param.vatPeriods[0]["L-CO"].vatPosted;
  row = table.addRow();
  row.addCell("Credito IVA anno precedente compensato F24", "description");
  if (Banana.SDecimal.sign(amount)<0) {
    row.addCell(this.formatAmount(amount), "amount");
    row.addCell("");
  }
  else {
    row.addCell("");
    row.addCell(this.formatAmount(amount), "amount");
  }

  //Riga di separazione
  var row = table.addRow();
  row.addCell("", "separator", 3);

  //Interessi dovuti
  amount = this.param.vatPeriods[0]["L-INT"].vatPosted
  row = table.addRow();
  row.addCell("Interessi dovuti per liquidazioni trimestrali", "description");
  if (Banana.SDecimal.sign(amount)<=0) {
    row.addCell(this.formatAmount(amount), "amount");
    row.addCell("");
  }
  else {
    row.addCell("");
    row.addCell(this.formatAmount(amount), "amount");
  }
  /*propone interessi trimestrali se importo è diverso da quello visualizzato*/
  /*var amountInteressi = 0;
  if (this.param.vatPeriods[0]["L-INT"] && this.param.vatPeriods[0]["L-INT"].vatPosted)
    amountInteressi = Banana.SDecimal.abs(this.param.vatPeriods[0]["L-INT"].vatPosted);
  var amountInteressiCalcolati = 0;
  if (this.param.vatPeriods[0].datiContribuente.liqTipoVersamento == 1)
    amountInteressiCalcolati = calculateInterestAmount(this.param.vatPeriods[0]);
  if (this.param.vatPeriods[0].datiContribuente.liqTipoVersamento == 1 && amountInteressi != amountInteressiCalcolati) {
    var msg = getErrorMessage(ID_ERR_LIQUIDAZIONE_INTERESSI_DIFFERENTI);
    msg = msg.replace("%1", this.param.vatPeriods[0].datiContribuente.liqPercInteressi );
    msg = msg.replace("%2", Banana.Converter.toLocaleNumberFormat(amountInteressiCalcolati) );
    row.addCell(msg, "amount warning");
  }
  else if (this.param.vatPeriods[0].datiContribuente.liqTipoVersamento == 0 && amountInteressi != amountInteressiCalcolati)
    row.addCell(getErrorMessage(ID_ERR_LIQUIDAZIONE_INTERESSI_VERSAMENTO_MENSILE), "amount warning");
  else
    row.addCell("");*/

  //Acconto dovuto
  amount = this.param.vatPeriods[0]["L-AC"].vatPosted;
  row = table.addRow();
  row.addCell("Acconto dovuto", "description");
  if (Banana.SDecimal.sign(amount)<=0) {
    row.addCell(this.formatAmount(amount), "amount");
    row.addCell("");
  }
  else {
    row.addCell("");
    row.addCell(this.formatAmount(amount), "amount");
  }

  //Saldo finale di periodo
  amount = this.param.vatPeriods[0]["Total"].vatPosted;
  row = table.addRow();
  row.addCell("Saldo finale di periodo", "description bold");
  if (Banana.SDecimal.sign(amount)<=0) {
    row.addCell(this.formatAmount(amount), "amount bold");
    row.addCell("");
  }
  else {
    row.addCell("");
    row.addCell(this.formatAmount(amount), "amount bold");
  }
  return true;
}

Registri.prototype.printLiquidazioneSummary = function(report, period) {

  if (!period.registri["vendite"] && !period.registri["acquisti"] && !period.registri["corrispettivi"])
    return false;

  if (period.registri["vendite"]) {
    this.printLiquidazioneSummaryTable(report, period.registri["vendite"], "RIEPILOGO GENERALE IVA VENDITE");
  }
  if (period.registri["acquisti"]) {
    //controlla se ci sono importi non deducibili
    var totNonDed = 0;
    for (var vatRate in period.registri["acquisti"].totaliAliquota) {
      totNonDed = Banana.SDecimal.add(period.registri["acquisti"].totaliAliquota[vatRate].vatTaxableNonDed, totNonDed);
    }  
    if (!Banana.SDecimal.isZero(totNonDed)) {
      this.printLiquidazioneSummaryTable(report, period.registri["acquisti"], "ACQUISTI IVA DETRAIBILE DEL PERIODO");
      this.printLiquidazioneSummaryTable(report, period.registri["acquisti"], "ACQUISTI IVA INDETRAIBILE DEL PERIODO");
    }
    this.printLiquidazioneSummaryTable(report, period.registri["acquisti"], "RIEPILOGO GENERALE IVA ACQUISTI");
  }
  if (period.registri["corrispettivi"]) {
    this.printLiquidazioneSummaryTable(report, period.registri["corrispettivi"], "RIEPILOGO GENERALE IVA CORRISPETTIVI");
    this.printRegistroCorrispettiviConguaglio(report, period);
  }
  
  return true;
}

Registri.prototype.printLiquidazioneSummaryTable = function(report, data, title) {

  var tot1=0;
  var tot2=0;
  var table = report.addTable("summary_table");
  if (title.length>0) {
    row = table.addRow();
    row.addCell(title, "h2", 6); 
  }
  row = table.addRow();
  row.addCell("Cod.IVA", "bold");
  row.addCell("Gr.IVA", "bold");
  row.addCell("Aliquota", "right bold");
  row.addCell("Descrizione", "bold expand");
  row.addCell("Imponibile", "right bold");
  row.addCell("Imposta", "right bold");
  //registri vendite/acquisti
  for (var vatCode in data.totaliCodice) {
    row = table.addRow();
    row.addCell(vatCode, "");
    row.addCell(data.totaliCodice[vatCode].gr, "");
    row.addCell(data.totaliCodice[vatCode].vatRate, "right");
    row.addCell(data.totaliCodice[vatCode].vatCodeDes);
    if (title.toLowerCase().indexOf("indetraibile")>0) {
      row.addCell(Banana.Converter.toLocaleNumberFormat(data.totaliCodice[vatCode].vatTaxableNonDed), "right");
      row.addCell(Banana.Converter.toLocaleNumberFormat(data.totaliCodice[vatCode].vatNonDed), "right");
      tot1 = Banana.SDecimal.add(data.totaliCodice[vatCode].vatTaxableNonDed, tot1);
      tot2 = Banana.SDecimal.add(data.totaliCodice[vatCode].vatNonDed, tot2);
    }
    else if (title.toLowerCase().indexOf("detraibile")>0) {
      row.addCell(Banana.Converter.toLocaleNumberFormat(data.totaliCodice[vatCode].vatTaxableDed), "right");
      row.addCell(Banana.Converter.toLocaleNumberFormat(data.totaliCodice[vatCode].vatPosted), "right");
      tot1 = Banana.SDecimal.add(data.totaliCodice[vatCode].vatTaxableDed, tot1);
      tot2 = Banana.SDecimal.add(data.totaliCodice[vatCode].vatPosted, tot2);
    }
    else {
      row.addCell(Banana.Converter.toLocaleNumberFormat(data.totaliCodice[vatCode].vatTaxable), "right");
      row.addCell(Banana.Converter.toLocaleNumberFormat(data.totaliCodice[vatCode].vatAmount), "right");
      tot1 = Banana.SDecimal.add(data.totaliCodice[vatCode].vatTaxable, tot1);
      tot2 = Banana.SDecimal.add(data.totaliCodice[vatCode].vatAmount, tot2);
    }
  }

  //Totale
  row = table.addRow();
  row.addCell("", "", 3);
  row.addCell("Totali", "total");
  row.addCell(Banana.Converter.toLocaleNumberFormat(tot1), "right total");
  row.addCell(Banana.Converter.toLocaleNumberFormat(tot2), "right total");

}

Registri.prototype.printRegistroAcquistiVendite = function(report, period, register, addPageBreak) {
  
  //Titolo
  var titolo = '';
  if (register == 'vendite')
    titolo = 'Registro fatture emesse';
  else if (register == 'acquisti')
    titolo = 'Registro fatture ricevute';

  if (!period.registri[register] || (!period.registri[register].totaliAliquota && !period.registri[register].totaliCodice)) {
    /*report.addParagraph(titolo, "h1");
    report.addParagraph(getPeriodText(period), "h1_period");
    report.addParagraph("Nessun movimento trovato nel periodo", "");*/
    return false;
  }
  
  if (addPageBreak)
    report.addPageBreak();

  //Sort delle regitrazioni
  var transactions = [];
  for (var index in period.transactions) {
    if (typeof period.transactions[index] !== "object")
      continue;
    if (period.transactions[index].IT_Registro.toLowerCase() != register.toLowerCase())
      continue;
    var row = period.transactions[index];
    var progRegistro = row.DocProtocol;
    if (period.numerazioneAutomatica)
      progRegistro = row.IT_ProgRegistro;
    else if (period.colonnaProtocollo == 'Doc')
      progRegistro = row.Doc;
    row.IT_ProgRegistro = progRegistro;
    transactions.push(row);
  }
  // Sort per progressivo registro
  transactions.sort(this.sortByProgRegistro);  

  //Tabella
  var table = report.addTable("register_table");
  var headerRow = table.getHeader().addRow();
  headerRow.addCell(titolo, "h1", 10);
  var headerRow = table.getHeader().addRow();
  headerRow.addCell(new Utils(this.banDocument).getPeriodText(period), "h1_period", 10);
  var headerRow = table.getHeader().addRow();
  headerRow.addCell("N.Prot.", "title right");
  headerRow.addCell("Data Reg.", "title right");
  headerRow.addCell("Data Doc", "title right");
  headerRow.addCell("Descrizione", "title");
  headerRow.addCell("N.Doc", "title");
  headerRow.addCell("Tot.Doc", "title right");
  headerRow.addCell("Imponibile", "title right");
  headerRow.addCell("Cod.IVA", "title right");
  headerRow.addCell("%", "title right");
  headerRow.addCell("Imposta", "title right");

  //Righe
  var totCol1=0;
  var totCol2=0;
  var totCol3=0;
  for (var index in transactions) {

    var vatCode = transactions[index].JVatCodeWithoutSign;
    var vatRate = transactions[index].IT_Aliquota;
    var vatAmount = transactions[index].IT_ImportoIva;
    var vatTaxable = transactions[index].IT_Imponibile;
    var vatGross = transactions[index].IT_Lordo;

    var row = table.addRow();
    row.addCell(transactions[index].IT_ProgRegistro, "right");
    row.addCell(Banana.Converter.toLocaleDateFormat(transactions[index].JDate, "dd/mm/yy"), "right");
    row.addCell(Banana.Converter.toLocaleDateFormat(transactions[index].IT_DataDoc, "dd/mm/yy"), "right");
    var cell = row.addCell();
    var descrizione = xml_unescapeString(transactions[index].IT_ClienteIntestazione);
    if (descrizione.length>1)
      cell.addParagraph(descrizione);
    if (transactions[index].Description.length>0)
      cell.addParagraph(transactions[index].Description);
    row.addCell(transactions[index].IT_NoDoc, "right");
    row.addCell(Banana.Converter.toLocaleNumberFormat(vatGross), "right");
    row.addCell(Banana.Converter.toLocaleNumberFormat(vatTaxable), "right");
    row.addCell(vatCode, "right");
    row.addCell(Banana.Converter.toLocaleNumberFormat(vatRate), "right");
    row.addCell(Banana.Converter.toLocaleNumberFormat(vatAmount), "right");

    //Totali
    totCol1 = Banana.SDecimal.add(vatGross, totCol1);
    totCol2 = Banana.SDecimal.add(vatTaxable, totCol2);
    totCol3 = Banana.SDecimal.add(vatAmount, totCol3);
  }

  //Riga totale
  var row = table.addRow();
  row.addCell("", "", 3);
  row.addCell("Totali", "total bold", 2);
  row.addCell(Banana.Converter.toLocaleNumberFormat(totCol1), "right bold");
  row.addCell(Banana.Converter.toLocaleNumberFormat(totCol2), "right bold");
  row.addCell("");
  row.addCell("");
  row.addCell(Banana.Converter.toLocaleNumberFormat(totCol3), "right bold");

  //Riepilogo IVA PER ALIQUOTA DETRAIBILE
  var row = table.addRow();
  var title = "TOTALI DI PERIODO PER ALIQUOTA - Registro " + register.toUpperCase() + " (" + new Utils(this.banDocument).getPeriodText(period) + ")";
  row.addCell(title, "h2", 10);
  if (register.toLowerCase() == "acquisti") {
    row = table.addRow();
    row.addCell("", "", 10);
    row = table.addRow();
    row.addCell("TOTALE IVA DETRAIBILE", "h4", 10);
  }
  var tot1=0;
  var tot2=0;
  var totNonDed = 0;
  for (var vatRate in period.registri[register].totaliAliquota) {
    row = table.addRow();
    row.addCell("IVA " + vatRate + "%", "", 5);
    row.addCell("");
    row.addCell(Banana.Converter.toLocaleNumberFormat(period.registri[register].totaliAliquota[vatRate].vatTaxableDed), "right");
    row.addCell("");
    row.addCell("");
    row.addCell(Banana.Converter.toLocaleNumberFormat(period.registri[register].totaliAliquota[vatRate].vatPosted), "right");
    tot1 = Banana.SDecimal.add(period.registri[register].totaliAliquota[vatRate].vatTaxableDed, tot1);
    tot2 = Banana.SDecimal.add(period.registri[register].totaliAliquota[vatRate].vatPosted, tot2);
    totNonDed = Banana.SDecimal.add(period.registri[register].totaliAliquota[vatRate].vatTaxableNonDed, totNonDed);
  }  
  row = table.addRow();
  row.addCell("Totali", "bold", 5);
  row.addCell("");
  row.addCell(Banana.Converter.toLocaleNumberFormat(tot1), "right bold");
  row.addCell("");
  row.addCell("");
  row.addCell(Banana.Converter.toLocaleNumberFormat(tot2), "right bold");
  
  //Riepilogo IVA PER ALIQUOTA INDETRAIBILE (dovrebbe essere solo per acquisti)
  if (!Banana.SDecimal.isZero(totNonDed)) {
    row = table.addRow();
    row.addCell("", "", 10);
    row = table.addRow();
    row.addCell("TOTALE IVA INDETRAIBILE", "h4", 10);
    var tot1=0;
    var tot2=0;
    for (var vatRate in period.registri[register].totaliAliquota) {
      row = table.addRow();
      row.addCell("IVA " + vatRate + "%", "", 5);
      row.addCell("");
      row.addCell(Banana.Converter.toLocaleNumberFormat(period.registri[register].totaliAliquota[vatRate].vatTaxableNonDed), "right");
      row.addCell("");
      row.addCell("");
      row.addCell(Banana.Converter.toLocaleNumberFormat(period.registri[register].totaliAliquota[vatRate].vatNonDed), "right");
      tot1 = Banana.SDecimal.add(period.registri[register].totaliAliquota[vatRate].vatTaxableNonDed, tot1);
      tot2 = Banana.SDecimal.add(period.registri[register].totaliAliquota[vatRate].vatNonDed, tot2);
    }  
    row = table.addRow();
    row.addCell("Totali", "bold", 5);
    row.addCell("");
    row.addCell(Banana.Converter.toLocaleNumberFormat(tot1), "right bold");
    row.addCell("");
    row.addCell("");
    row.addCell(Banana.Converter.toLocaleNumberFormat(tot2), "right bold");
  }

  //Riepilogo IVA per CODICE
  row = table.addRow();
  row.addCell("", "", 10);
  row = table.addRow();
  row.addCell("TOTALI DI PERIODO PER CODICI - Registro " + register.toUpperCase() + " (" + new Utils(this.banDocument).getPeriodText(period) + ")", "h2", 10);
  var tot1=0;
  var tot2=0;
  for (var vatCode in period.registri[register].totaliCodice) {
    row = table.addRow();
    row.addCell(vatCode + " " + period.registri[register].totaliCodice[vatCode].vatCodeDes, "", 5);
    row.addCell("");
    row.addCell(Banana.Converter.toLocaleNumberFormat(period.registri[register].totaliCodice[vatCode].vatTaxable), "right");
    row.addCell("");
    row.addCell(Banana.Converter.toLocaleNumberFormat(period.registri[register].totaliCodice[vatCode].vatRate), "right");
    row.addCell(Banana.Converter.toLocaleNumberFormat(period.registri[register].totaliCodice[vatCode].vatAmount), "right");
    tot1 = Banana.SDecimal.add(period.registri[register].totaliCodice[vatCode].vatTaxable, tot1);
    tot2 = Banana.SDecimal.add(period.registri[register].totaliCodice[vatCode].vatAmount, tot2);
  }  
  row = table.addRow();
  row.addCell("Totali", "bold", 5);
  row.addCell("");
  row.addCell(Banana.Converter.toLocaleNumberFormat(tot1), "right bold");
  row.addCell("");
  row.addCell("");
  row.addCell(Banana.Converter.toLocaleNumberFormat(tot2), "right bold");
  
  return true;
}

Registri.prototype.printRegistroCorrispettivi = function(report, period, addPageBreak) {

  var corrispettivi = period.registri["corrispettivi"];
  if (!corrispettivi) {
    //report.addParagraph("Nessun movimento trovato nel periodo", "");
    return false;
  }

  if (addPageBreak)
    report.addPageBreak();

  //Titolo
  report.addParagraph("Registro dei corrispettivi", "h1");
  report.addParagraph(new Utils(this.banDocument).getPeriodText(period), "h1_period");

  //Tabella REGISTRO DEI CORRISPETTIVI 
  var table = report.addTable("corrispettivi_table");
  var headerRow = table.getHeader().addRow();
  headerRow.addCell("CORRISPETTIVI DA VENTILARE (GR=C-VEN)", "title h4", 12);
  headerRow = table.getHeader().addRow();
  headerRow.addCell("Data", "title");
  headerRow.addCell("Cod.IVA", "title");
  headerRow.addCell("Gr.IVA", "title");
  headerRow.addCell("Des.cod.IVA", "title");
  headerRow.addCell("Fatt.normali", "title right");
  headerRow.addCell("Fatt.fiscali", "title right");
  headerRow.addCell("Fatt.scontr.", "title right");
  headerRow.addCell("Fatt.differ.", "title right");
  headerRow.addCell("Corr.normali", "title right");
  headerRow.addCell("Corr.scontr.", "title right");
  headerRow.addCell("Ric.fiscali", "title right");
  headerRow.addCell("Tot.giorn.", "title right");

  var tot1=0;
  var tot2=0;
  var tot3=0;
  var tot4=0;
  var tot5=0;
  var tot6=0;
  var tot7=0;
  var tot8=0;

  for (var key in corrispettivi) {
    if (key.indexOf('|')<=0)
      continue;
    //inserisce solamente i corrispettivi con un importo (così non vengono inclusi i codici c-reg, corrispettivi ventilati)
    if (Banana.SDecimal.isZero(corrispettivi[key].totaleGiornaliero))
      continue;
    row = table.addRow();
    var date = key.substring(0, key.indexOf('|'));
    row.addCell(Banana.Converter.toLocaleDateFormat(date, "dd/mm/yy"), "");
    row.addCell(corrispettivi[key].vatCode, "");
    var vatCodeDes = '';
    var vatCodeGr = '';
    var tableVatCodes = this.banDocument.table("VatCodes");
    if (tableVatCodes) {
      var vatCodeRow = tableVatCodes.findRowByValue("VatCode", corrispettivi[key].vatCode);
      if (vatCodeRow)
        vatCodeDes = vatCodeRow.value("Description");
        vatCodeGr = vatCodeRow.value("Gr");
    }
    row.addCell(vatCodeGr, "");
    row.addCell(vatCodeDes, "");
    row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(corrispettivi[key].contoFattureNormali)), "right");
    row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(corrispettivi[key].contoFattureFiscali)), "right");
    row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(corrispettivi[key].contoFattureScontrini)), "right");
    row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(corrispettivi[key].contoFattureDifferite)), "right");
    row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(corrispettivi[key].contoCorrispettiviNormali)), "right");
    row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(corrispettivi[key].contoCorrispettiviScontrini)), "right");
    row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(corrispettivi[key].contoRicevuteFiscali)), "right");
    row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(corrispettivi[key].totaleGiornaliero)), "right");
    tot1 = Banana.SDecimal.add(corrispettivi[key].contoFattureNormali, tot1);
    tot2 = Banana.SDecimal.add(corrispettivi[key].contoFattureFiscali, tot2);
    tot3 = Banana.SDecimal.add(corrispettivi[key].contoFattureScontrini, tot3);
    tot4 = Banana.SDecimal.add(corrispettivi[key].contoFattureDifferite, tot4);
    tot5 = Banana.SDecimal.add(corrispettivi[key].contoCorrispettiviNormali, tot5);
    tot6 = Banana.SDecimal.add(corrispettivi[key].contoCorrispettiviScontrini, tot6);
    tot7 = Banana.SDecimal.add(corrispettivi[key].contoRicevuteFiscali, tot7);
    tot8 = Banana.SDecimal.add(corrispettivi[key].totaleGiornaliero, tot8);
  }  
  
  row = table.addRow();
  row.addCell("", "", 3);
  row.addCell("Totali", "total");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(tot1)), "right total");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(tot2)), "right total");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(tot3)), "right total");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(tot4)), "right total");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(tot5)), "right total");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(tot6)), "right total");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(tot7)), "right total");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(tot8)), "right total");

  //Tabella CALCOLO VENTILAZIONE CORRISPETTIVI
  var table = report.addTable("corrispettivi_calcolo_ventilazione_table");
  var headerRow = table.getHeader().addRow();
  headerRow.addCell("CALCOLO VENTILAZIONE CORRISPETTIVI (GR=C-VEN) " + new Utils(this.banDocument).getPeriodText(period), "title h4", 8);
  headerRow = table.getHeader().addRow();
  headerRow.addCell("Cod.IVA", "title");
  headerRow.addCell("%IVA", "title");
  headerRow.addCell("Descrizione", "title");
  headerRow.addCell("Tot.Acquisti", "title right");
  headerRow.addCell("%Incid.", "title right");
  headerRow.addCell("Corrispettivi lordi", "title right");
  headerRow.addCell("Imponibile", "title right");
  headerRow.addCell("Imposta", "title right");

  tot1=0;
  tot2=0;
  tot3=0;
  tot4=0;
  tot5=0;

  for (var key in period.acquistiPerRivendita) {
    row = table.addRow();
    row.addCell(key, "");
    row.addCell(period.acquistiPerRivendita[key].vatRate, "");
    row.addCell(period.acquistiPerRivendita[key].vatCodeDes, "");
    row.addCell(Banana.Converter.toLocaleNumberFormat(period.acquistiPerRivendita[key].totaleAcquisti), "right");
    row.addCell(Banana.Converter.toLocaleNumberFormat(period.acquistiPerRivendita[key].incidenza*100), "right");
    row.addCell(Banana.Converter.toLocaleNumberFormat(period.acquistiPerRivendita[key].daVentilare), "right");
    row.addCell(Banana.Converter.toLocaleNumberFormat(period.acquistiPerRivendita[key].imponibile), "right");
    row.addCell(Banana.Converter.toLocaleNumberFormat(period.acquistiPerRivendita[key].iva), "right");

    tot1 = Banana.SDecimal.add(period.acquistiPerRivendita[key].totaleAcquisti, tot1);
    tot2 = Banana.SDecimal.add(period.acquistiPerRivendita[key].incidenza*100, tot2);
    tot3 = Banana.SDecimal.add(period.acquistiPerRivendita[key].daVentilare, tot3);
    tot4 = Banana.SDecimal.add(period.acquistiPerRivendita[key].imponibile, tot4);
    tot5 = Banana.SDecimal.add(period.acquistiPerRivendita[key].iva, tot5);
  }  
  //Totale
  row = table.addRow();
  row.addCell("", "", 3);
  row.addCell(Banana.Converter.toLocaleNumberFormat(tot1), "right total");
  row.addCell(Banana.Converter.toLocaleNumberFormat(tot2), "right total");
  row.addCell(Banana.Converter.toLocaleNumberFormat(tot3), "right total");
  row.addCell(Banana.Converter.toLocaleNumberFormat(tot4), "right total");
  row.addCell(Banana.Converter.toLocaleNumberFormat(tot5), "right total");
  
  //Riepilogo IVA PER ALIQUOTA
  if (!corrispettivi.totaliAliquota)
    return true;
  var table = report.addTable("corrispettivi_riepilogo_table");
  var row = table.addRow();
  var title = "#RIEPILOGO PER ALIQUOTA IVA CORRISPETTIVI (" + new Utils(this.banDocument).getPeriodText(period) + ")";
  row.addCell(title, "h4");
  row.addCell("", "", 3);
  var tot1=0;
  var tot2=0;
  for (var vatRate in corrispettivi.totaliAliquota) {
    row = table.addRow();
    row.addCell("IVA " + vatRate + "%");
    row.addCell(Banana.Converter.toLocaleNumberFormat(corrispettivi.totaliAliquota[vatRate].vatTaxableDed), "right");
    row.addCell("");
    row.addCell(Banana.Converter.toLocaleNumberFormat(corrispettivi.totaliAliquota[vatRate].vatPosted), "right");
    tot1 = Banana.SDecimal.add(corrispettivi.totaliAliquota[vatRate].vatTaxableDed, tot1);
    tot2 = Banana.SDecimal.add(corrispettivi.totaliAliquota[vatRate].vatPosted, tot2);
  }  
  row = table.addRow();
  row.addCell("Totali", "bold");
  row.addCell(Banana.Converter.toLocaleNumberFormat(tot1), "right bold");
  row.addCell("");
  row.addCell(Banana.Converter.toLocaleNumberFormat(tot2), "right bold");
  
  //Riepilogo IVA per CODICE
  row = table.addRow();
  row.addCell("", "", 4);
  row = table.addRow();
  row.addCell("#RIEPILOGO PER CODICE IVA CORRISPETTIVI (" + new Utils(this.banDocument).getPeriodText(period) + ")", "bold");
  row.addCell("", "", 3);
  var tot1=0;
  var tot2=0;
  for (var vatCode in corrispettivi.totaliCodice) {
    row = table.addRow();
    row.addCell(vatCode + " " +corrispettivi.totaliCodice[vatCode].vatCodeDes);
    row.addCell(Banana.Converter.toLocaleNumberFormat(corrispettivi.totaliCodice[vatCode].vatTaxable), "right");
    row.addCell(Banana.Converter.toLocaleNumberFormat(corrispettivi.totaliCodice[vatCode].vatRate), "right");
    row.addCell(Banana.Converter.toLocaleNumberFormat(corrispettivi.totaliCodice[vatCode].vatAmount), "right");
    tot1 = Banana.SDecimal.add(corrispettivi.totaliCodice[vatCode].vatTaxable, tot1);
    tot2 = Banana.SDecimal.add(corrispettivi.totaliCodice[vatCode].vatAmount, tot2);
  }  
  row = table.addRow();
  row.addCell("Totali", "bold");
  row.addCell(Banana.Converter.toLocaleNumberFormat(tot1), "right bold");
  row.addCell("");
  row.addCell(Banana.Converter.toLocaleNumberFormat(tot2), "right bold");
  
  //CONGUAGLIO VENTILAZIONE (solo a fine anno)
  this.printRegistroCorrispettiviConguaglio(report, period);

  return true;
}

/*Calcola il conguaglio dei corrispettivi ventilati (solamente a fine anno)*/
Registri.prototype.printRegistroCorrispettiviConguaglio = function(report, period) {

  var periodoCompleto=false;
  if (Banana.Converter.toDate(period.startDate).getTime() === Banana.Converter.toDate(this.param.fileInfo["OpeningDate"]).getTime() 
    && Banana.Converter.toDate(period.endDate).getTime() === Banana.Converter.toDate(this.param.fileInfo["ClosureDate"]).getTime())
    periodoCompleto=true;
  if (!periodoCompleto)
    return;

  var ventilazioneCalcolata = 0;
  var ventilazioneRegistrata = 0;
  
  var corrispettivi = period.registri["corrispettivi"];

  for (var key in period.acquistiPerRivendita) {
    ventilazioneCalcolata = Banana.SDecimal.add(period.acquistiPerRivendita[key].iva, ventilazioneCalcolata);
  }
  if (!Banana.SDecimal.isZero(ventilazioneCalcolata))
    ventilazioneCalcolata = Banana.SDecimal.round(ventilazioneCalcolata, {'decimals':2});

  for (var vatCode in corrispettivi.totaliCodice) {
    if (corrispettivi.totaliCodice[vatCode].gr == "C-REG")
      ventilazioneRegistrata = Banana.SDecimal.add(corrispettivi.totaliCodice[vatCode].vatAmount, ventilazioneRegistrata);
  }
  if (!Banana.SDecimal.isZero(ventilazioneRegistrata))
    ventilazioneRegistrata = Banana.SDecimal.round(ventilazioneRegistrata, {'decimals':2});

  if (!Banana.SDecimal.isZero(ventilazioneCalcolata) || !Banana.SDecimal.isZero(ventilazioneRegistrata)) {
    //var differenza = Banana.SDecimal.subtract(ventilazioneRegistrata, ventilazioneCalcolata);
    if (ventilazioneCalcolata != ventilazioneRegistrata) {
      report.addParagraph(" ", "warning");
      var msg = getErrorMessage(ID_ERR_REGISTRI_VENTILAZIONE_DIVERSA);
      msg = msg.replace("%1",  Banana.Converter.toLocaleNumberFormat(ventilazioneCalcolata) );
      msg = msg.replace("%2", Banana.Converter.toLocaleNumberFormat(ventilazioneRegistrata) );
      report.addParagraph(msg, "warning");
    }
  }
  //propone registrazioni di assestamento
  report.addParagraph(" ", "warning");
  var tot1=0;
  var tot2=0;
  var tot3=0;
  var table = report.addTable("corrispettivi_conguaglio");
  var row = table.addRow();
  row.addCell("RETTIFICA DELL'IVA VENTILATA SU BASE ANNUALE", "h4", 5); 
  row = table.addRow("h2");
  row.addCell("Data", "bold");
  row.addCell("Descrizione", "bold");
  row.addCell("  Aliquota %", "right bold");
  row.addCell("  IVA calcolata", "bold ");
  row.addCell("  IVA registrata", "bold ");
  row.addCell("  Rettifica", "bold ");
  for (var key in period.acquistiPerRivendita) {
    row = table.addRow();
    row.addCell(period.endDate, "right");
    row.addCell("Conguaglio annuale ventilazione corrispettivi ");
    row.addCell(period.acquistiPerRivendita[key].aliquota, "right");
    var ivaCalcolata = period.acquistiPerRivendita[key].iva;
    var ivaRegistrata = this.printRegistroCorrispettiviIvaRegistrata(period, period.acquistiPerRivendita[key].vatRate);
    var ivaConguaglio = Banana.SDecimal.subtract(ivaCalcolata, ivaRegistrata);
    row.addCell(Banana.Converter.toLocaleNumberFormat(ivaCalcolata), "right");
    row.addCell(Banana.Converter.toLocaleNumberFormat(ivaRegistrata), "right");
    row.addCell(Banana.Converter.toLocaleNumberFormat(ivaConguaglio), "right");
    tot1 = Banana.SDecimal.add(ivaCalcolata, tot1);
    tot2 = Banana.SDecimal.add(ivaRegistrata, tot2);
    tot3 = Banana.SDecimal.add(ivaConguaglio, tot3);
  }  
  row = table.addRow();
  row.addCell("Totali", "bold", 3);
  row.addCell(Banana.Converter.toLocaleNumberFormat(tot1), "right bold");
  row.addCell(Banana.Converter.toLocaleNumberFormat(tot2), "right bold");
  row.addCell(Banana.Converter.toLocaleNumberFormat(tot3), "right bold");
  report.addParagraph(" ", "warning");

}

Registri.prototype.printRegistroCorrispettiviIvaRegistrata = function(period, aliquota) {

  var ventilazioneRegistrata = 0;
  var corrispettivi = period.registri["corrispettivi"];
  for (var vatCode in corrispettivi.totaliCodice) {
    if (corrispettivi.totaliCodice[vatCode].gr == "C-REG" && corrispettivi.totaliCodice[vatCode].vatRate == aliquota)
      ventilazioneRegistrata = Banana.SDecimal.add(corrispettivi.totaliCodice[vatCode].vatAmount, ventilazioneRegistrata);
  }
  if (!Banana.SDecimal.isZero(ventilazioneRegistrata))
    ventilazioneRegistrata = Banana.SDecimal.round(ventilazioneRegistrata, {'decimals':2});
  return ventilazioneRegistrata;
}

Registri.prototype.setParam = function(param) {

  this.param = param;
  this.verifyParam();
}

Registri.prototype.setStyle = function(stylesheet) {

  if (!stylesheet) {
    stylesheet = report.newStyleSheet();
  }
  if (this.param.stampaOrizzontale)
    stylesheet.addStyle("@page", "size:landscape;margin:2em;font-size: 9px; ");
  else
    stylesheet.addStyle("@page", "size:portrait;margin:2em;font-size: 9px; ");
  if (this.param.stampaDefinitiva)
    stylesheet.addStyle("@page", "fill-empty-area:dash 0.5 black; ");
  stylesheet.addStyle("phead", "font-weight: bold; margin-bottom: 1em");
  stylesheet.addStyle("thead", "font-weight:bold;background-color:#6699cc;color:#ffffff;");
  stylesheet.addStyle("td", "padding-right: 0em;");
  stylesheet.addStyle("td.underlined", "border-bottom: 1px solid black");
  stylesheet.addStyle(".amount", "text-align: right");
  stylesheet.addStyle(".bold", "font-weight:bold");
  stylesheet.addStyle(".expand", "width:100%;");
  stylesheet.addStyle(".period", "padding-bottom: 1em;padding-top:1em;");
  stylesheet.addStyle(".center", "text-align: center");
  stylesheet.addStyle(".right", "text-align: right");
  stylesheet.addStyle(".title", "padding: 0.4em;");
  stylesheet.addStyle(".h1", "font-weight:bold;font-size:12px;text-align: center;background-color:#ffffff;color:#000000;");
  stylesheet.addStyle(".h1_period", "font-weight:bold;font-size:9px;padding-bottom:2em;padding-top:0.5em;text-align: center;background-color:#ffffff;color:#000000;");
  stylesheet.addStyle(".h2", "font-weight:bold;padding:0.3em;background-color:#eeeeee;color:#333333;");
  stylesheet.addStyle(".h3", "font-weight:bold;border-top:1px solid black;padding-top:1em;");
  stylesheet.addStyle(".h4", "font-weight:bold;background-color:#ffffff;color:#000000;");
  stylesheet.addStyle(".total", "font-weight:bold;padding-bottom:20px;");
  stylesheet.addStyle(".warning", "color: red;");
  /*tables*/
  stylesheet.addStyle(".register_table", "width:100%;");
  //stylesheet.addStyle(".register_table td", "border:1px solid black;");
  stylesheet.addStyle(".corrispettivi_table", "width:100%;");
  stylesheet.addStyle(".corrispettivi_calcolo_ventilazione_table", "width:100%;");
  stylesheet.addStyle(".corrispettivi_riepilogo_table", "width:100%;");
  stylesheet.addStyle(".summary_table", "width:100%;");
  stylesheet.addStyle(".vat_table td", "padding-bottom:2px;");
  stylesheet.addStyle(".vat_table td.separator", "border-top:1px solid black;");

}

Registri.prototype.sortByProgRegistro = function(a, b) {

  var  value_a  = a.IT_ProgRegistro.replace(/[^0-9]+/, '');
  var  value_b  = b.IT_ProgRegistro.replace(/[^0-9]+/, '');
  if (parseInt(value_a) < parseInt(value_b))
    return -1;
  if (parseInt(value_a) > parseInt(value_b))
    return 1;
  return 0;
}

Registri.prototype.verifyParam = function() {

  if (!this.param.tipoRegistro)
    this.param.tipoRegistro = 0;
  if (!this.param.colonnaProtocollo)
    this.param.colonnaProtocollo = 'DocProtocol';
  if (!this.param.visualizzaDataOra)
    this.param.visualizzaDataOra = false;
  if (!this.param.numerazioneAutomatica)
    this.param.numerazioneAutomatica = false;
  if (!this.param.stampaDefinitiva)
    this.param.stampaDefinitiva = false;
  if (!this.param.inizioNumerazionePagine)
    this.param.inizioNumerazionePagine = 1;
  if (!this.param.testoRegistriComboBoxIndex)
    this.param.testoRegistriComboBoxIndex = 0;
  if (!this.param.stampaTestoRegistroAcquisti)
    this.param.stampaTestoRegistroAcquisti = false;
  if (!this.param.stampaTestoRegistroVendite)
    this.param.stampaTestoRegistroVendite = false;
  if (!this.param.stampaTestoRegistroCorrispettivi)
    this.param.stampaTestoRegistroCorrispettivi = false;
  if (!this.param.stampaOrizzontale)
    this.param.stampaOrizzontale = false;
  if (!this.param.testoRegistroAcquisti)
    this.param.testoRegistroAcquisti = '';
  if (!this.param.testoRegistroVendite)
    this.param.testoRegistroVendite = '';
  if (!this.param.testoRegistroCorrispettivi)
   this.param.testoRegistroCorrispettivi = '';

  if (!this.param.annoSelezionato)
    this.param.annoSelezionato = '';
   if (!this.param.periodoSelezionato)
    this.param.periodoSelezionato = 'm';
  if (!this.param.periodoValoreMese)
    this.param.periodoValoreMese = '';
  if (!this.param.periodoValoreTrimestre)
    this.param.periodoValoreTrimestre = '';
  if (!this.param.periodoValoreSemestre)
    this.param.periodoValoreSemestre = '';
  if (!this.param.periodoDataDal)
    this.param.periodoDataDal = '';
  if (!this.param.periodoDataAl)
    this.param.periodoDataAl = '';
}
