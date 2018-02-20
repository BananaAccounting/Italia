// Copyright [2017] [Banana.ch SA - Lugano Switzerland]
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
// @inputdatasource = none
// @pubdate = 2018-02-20
// @publisher = Banana.ch SA
// @task = app.command
// @timeout = -1

var debug = false;

/*
 * Update script's parameters
*/
function settingsDialog() {

  var param = initParam();
  var savedParam = Banana.document.getScriptSettings();
  if (savedParam.length > 0) {
    param = JSON.parse(savedParam);
  }
  param = verifyParam(param);
  
  var accountingData = {};
  accountingData = readAccountingData(accountingData);
  if (param.annoSelezionato.length<=0)
    param.annoSelezionato = accountingData.openingYear;
  
  var dialog = Banana.Ui.createUi("ch.banana.script.italy_vat_2017.report.registri.dialog.ui");
  //Groupbox periodo
  var index = 0;
  if (param.periodoSelezionato == 'm')
    index = parseInt(param.periodoValoreMese);
  else if (param.periodoSelezionato == 'q')
    index = parseInt(param.periodoValoreTrimestre) + 13;
  else if (param.periodoSelezionato == 's')
    index = parseInt(param.periodoValoreSemestre) + 18;
  else if (param.periodoSelezionato == 'y')
    index = 21;
  var periodoComboBox = dialog.tabWidget.findChild('periodoComboBox');
  if (periodoComboBox)
    periodoComboBox.currentIndex = index;
  //Groupbox anno per il momento impostati fissi perché non è possibile caricare gli anni sul combobox
  var index = 0;
  if (param.annoSelezionato == '2017')
    index = 1;
  else if (param.annoSelezionato == '2018')
    index = 2;
  var annoComboBox = dialog.tabWidget.findChild('annoComboBox');
  if (annoComboBox)
    annoComboBox.currentIndex = index;

  //Tipo registro
  var tipoRegistroComboBox = dialog.tabWidget.findChild('tipoRegistroComboBox');
  if (tipoRegistroComboBox)
    tipoRegistroComboBox.currentIndex = param.tipoRegistro;
  //Colonna protocollo
  index = 0;
  if (param.colonnaProtocollo == 'Doc')
    index = 1;
  var colProtocolloComboBox = dialog.tabWidget.findChild('colProtocolloComboBox');
  if (colProtocolloComboBox)
    colProtocolloComboBox.currentIndex = index;
  //Opzioni
  var visualizzaDataOraCheckBox = dialog.tabWidget.findChild('visualizzaDataOraCheckBox');
  if (visualizzaDataOraCheckBox)
    visualizzaDataOraCheckBox.checked = param.visualizzaDataOra;
  var numerazioneAutomaticaCheckBox = dialog.tabWidget.findChild('numerazioneAutomaticaCheckBox');
  if (numerazioneAutomaticaCheckBox)
    numerazioneAutomaticaCheckBox.checked = param.numerazioneAutomatica;
  var stampaDefinitivaCheckBox = dialog.tabWidget.findChild('stampaDefinitivaCheckBox');
  if (stampaDefinitivaCheckBox)
    stampaDefinitivaCheckBox.checked = param.stampaDefinitiva;
  var stampaOrizzontaleCheckBox = dialog.tabWidget.findChild('stampaOrizzontaleCheckBox');
  if (stampaOrizzontaleCheckBox)
    stampaOrizzontaleCheckBox.checked = param.stampaOrizzontale;
  var inizioNumerazionePagineSpinBox = dialog.tabWidget.findChild('inizioNumerazionePagineSpinBox');
  if (inizioNumerazionePagineSpinBox) {
    if (param.inizioNumerazionePagine.length>0)
      inizioNumerazionePagineSpinBox.value = parseInt(param.inizioNumerazionePagine);
    else  
      inizioNumerazionePagineSpinBox.value = 1;
  }
  //Testi
  var testoRegistriComboBox = dialog.tabWidget.findChild('testoRegistriComboBox');
  var testoGroupBox = dialog.tabWidget.findChild('testoGroupBox');
  var testoLineEdit = dialog.tabWidget.findChild('testoLineEdit');
  var tempStampaTestoRegistroAcquisti = param.stampaTestoRegistroAcquisti;
  var tempStampaTestoRegistroVendite = param.stampaTestoRegistroVendite;
  var tempStampaTestoRegistroCorrispettivi = param.stampaTestoRegistroCorrispettivi;
  var tempTestoRegistroAcquisti = param.testoRegistroAcquisti;
  var tempTestoRegistroVendite = param.testoRegistroVendite;
  var tempTestoRegistroCorrispettivi = param.testoRegistroCorrispettivi;
  var tempTestoRegistriCurrentIndex = param.testoRegistriComboBoxIndex;
  if (testoRegistriComboBox)
    testoRegistriComboBox.currentIndex = param.testoRegistriComboBoxIndex;
  if (testoGroupBox && param.testoRegistriComboBoxIndex == 0) {
    testoGroupBox.checked = tempStampaTestoRegistroAcquisti;
    testoLineEdit.setText(tempTestoRegistroAcquisti);
  }
  else if (testoGroupBox && param.testoRegistriComboBoxIndex == 1) {
    testoGroupBox.checked = tempStampaTestoRegistroVendite;
    testoLineEdit.setText(tempTestoRegistroVendite);
  }
  else if (testoGroupBox && param.testoRegistriComboBoxIndex == 2) {
    testoGroupBox.checked = tempStampaTestoRegistroCorrispettivi;
    testoLineEdit.setText(tempTestoRegistroCorrispettivi);
  }
  
  //dialog functions
  dialog.checkdata = function () {
    dialog.accept();
  }
  dialog.enableButtons = function () {
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
  //Groupbox periodo
  var index = parseInt(periodoComboBox.currentIndex.toString());
  if (index < 0 || index == 12 || index == 17 || index == 20)
    index = 0;
  if (index < 12) {
    param.periodoSelezionato = 'm';
    param.periodoValoreMese = index.toString();
  }
  else if (index > 12 && index < 17) {
    param.periodoSelezionato = 'q';
    param.periodoValoreTrimestre = (index-13).toString();
  }
  else if (index > 17 && index < 20) {
    param.periodoSelezionato = 's';
    param.periodoValoreSemestre = (index-18).toString();
  }
  else {
    param.periodoSelezionato = 'y';
  }
  //Groupbox anno
  var index = parseInt(annoComboBox.currentIndex.toString());
  if (index <=0)
    param.annoSelezionato = '2016';
  else if (index ==1)
    param.annoSelezionato = '2017';
  else if (index ==2)
    param.annoSelezionato = '2018';

  //Tipo registro
  if (tipoRegistroComboBox)
    param.tipoRegistro = tipoRegistroComboBox.currentIndex.toString();
  //Colonna protocollo
  param.colonnaProtocollo = 'DocProtocol';
  index = parseInt(colProtocolloComboBox.currentIndex.toString());
  if (index == 1)
    param.colonnaProtocollo = 'Doc';
  //Opzioni
  if (visualizzaDataOraCheckBox)
    param.visualizzaDataOra = visualizzaDataOraCheckBox.checked;
  if (numerazioneAutomaticaCheckBox)
    param.numerazioneAutomatica = numerazioneAutomaticaCheckBox.checked;
  if (stampaDefinitivaCheckBox)
    param.stampaDefinitiva = stampaDefinitivaCheckBox.checked;
  if (stampaOrizzontaleCheckBox)
    param.stampaOrizzontale = stampaOrizzontaleCheckBox.checked;
  if (inizioNumerazionePagineSpinBox)
      param.inizioNumerazionePagine = parseInt(inizioNumerazionePagineSpinBox.value.toString());
  //Testi
  param.testoRegistriComboBoxIndex = testoRegistriComboBox.currentIndex.toString();
  if (param.testoRegistriComboBoxIndex == 0) {
    param.stampaTestoRegistroAcquisti = testoGroupBox.checked;
    if (param.stampaTestoRegistroAcquisti)
      param.testoRegistroAcquisti = testoLineEdit.plainText;
    param.stampaTestoRegistroVendite = tempStampaTestoRegistroVendite;
    param.testoRegistroVendite = tempTestoRegistroVendite;
    param.stampaTestoRegistroCorrispettivi = tempStampaTestoRegistroCorrispettivi;
    param.testoRegistroCorrispettivi = tempTestoRegistroCorrispettivi;
  }
  else if (param.testoRegistriComboBoxIndex == 1) {
    param.stampaTestoRegistroVendite = testoGroupBox.checked;
    if (param.stampaTestoRegistroVendite)
      param.testoRegistroVendite = testoLineEdit.plainText;
    param.stampaTestoRegistroAcquisti = tempStampaTestoRegistroAcquisti;
    param.testoRegistroAcquisti = tempTestoRegistroAcquisti;
    param.stampaTestoRegistroCorrispettivi = tempStampaTestoRegistroCorrispettivi;
    param.testoRegistroCorrispettivi = tempTestoRegistroCorrispettivi;
  }
  else if (param.testoRegistriComboBoxIndex == 2) {
    param.stampaTestoRegistroCorrispettivi = testoGroupBox.checked;
    if (param.stampaTestoRegistroCorrispettivi)
      param.testoRegistroCorrispettivi = testoLineEdit.plainText;
    param.stampaTestoRegistroAcquisti = tempStampaTestoRegistroAcquisti;
    param.testoRegistroAcquisti = tempTestoRegistroAcquisti;
    param.stampaTestoRegistroVendite = tempStampaTestoRegistroVendite;
    param.testoRegistroVendite = tempTestoRegistroVendite;
  }
  
  var paramToString = JSON.stringify(param);
  Banana.document.setScriptSettings(paramToString);
  return true;
}

function addPageFooter(report, stylesheet, param)
{
  // Page footer
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
  if (param.visualizzaDataOra) {
    var d = new Date();
    var datestring = ("0" + d.getDate()).slice(-2) + "/" + ("0"+(d.getMonth()+1)).slice(-2) + "/" + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);  
  }
  cell_center.addParagraph(datestring, "center");

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

function addPageHeader(report, stylesheet, param)
{
  // Page header
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

  var line1 = param.datiContribuente.societa;
  if (line1.length)
    line1 += " ";
  if (param.datiContribuente.cognome.length)
    line1 += param.datiContribuente.cognome;
  if (param.datiContribuente.nome.length)
    line1 += param.datiContribuente.nome;
  if (line1.length)
    cell_left.addParagraph(line1);
  
  var line2 = '';
  if (param.datiContribuente.indirizzo.length)
    line2 = param.datiContribuente.indirizzo + " ";
  if (param.datiContribuente.ncivico.length)
    line2 += " " + param.datiContribuente.ncivico;
  if (line2.length)
    cell_left.addParagraph(line2);

  var line3 = '';
  if (param.datiContribuente.cap.length)
    line3 = param.datiContribuente.cap + " ";
  if (param.datiContribuente.comune.length)
    line3 += param.datiContribuente.comune + " ";
  if (param.datiContribuente.provincia.length)
    line3 += "(" +  param.datiContribuente.provincia + ")";
  if (line3.length)
    cell_left.addParagraph(line3);
  
  var line4 = '';
  if (param.datiContribuente.partitaIva.length)
    line4 = "P.IVA: " + param.datiContribuente.partitaIva;
  if (line4.length)
    cell_left.addParagraph(line4, "vatNumber");
  
  //cell_center
  var cell_center = row.addCell("", "header_cell_center");
  var text = '';
  if (param.tipoRegistro == 0)
    text = 'Registro IVA Vendite';
  else if (param.tipoRegistro == 1)
    text = 'Registro IVA Acquisti';
  else if (param.tipoRegistro == 2)
    text = 'Registro IVA Corrispettivi';
  else if (param.tipoRegistro == 3)
    text = 'Liquidazione IVA';
  else if (param.tipoRegistro == 4)
    text = 'Registro IVA unico';
  cell_center.addParagraph(text, "");

  //cell_right1
  var cell_right1 = row.addCell("", "header_cell_right");
  cell_right1.addParagraph("pag. ", "right").addFieldPageNr();

  //cell_right
  var period = "/" + param.openingYear;
  if (param.openingYear != param.closureYear)
    period +=  "-" + param.closureYear;
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

function exec(inData) {

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
  else {
    if (!settingsDialog())
      return "@Cancel";
    param = JSON.parse(Banana.document.getScriptSettings());
  }
  
  //add accounting data
  param = readAccountingData(param);

  var report = Banana.Report.newReport("Registri IVA");
  var stylesheet = Banana.Report.newStyleSheet();
  //Non funziona
  /*if (param.inizioNumerazionePagine)
   report.setFirstPageNumber(param.inizioNumerazionePagine);*/
  addPageHeader(report, stylesheet, param);
  addPageFooter(report, stylesheet, param);
  setStyle(report, stylesheet, param);
  param = loadJournalData(param);
  printDocument(report, stylesheet, param);
  
  //Debug
  if (debug) {
    for (var i=0; i<param.periods.length; i++) {
      report.addPageBreak();
      _debug_printJournal(param.periods[i], report, stylesheet);
    }
  }
  
  Banana.Report.preview(report, stylesheet);
  return;

}

function formatAmount(amount) {
  var amountFormatted = amount;
  if (amountFormatted)
    amountFormatted = Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(amountFormatted))
  else
      amountFormatted = "";
  if (Banana.SDecimal.isZero(amountFormatted))
    return "";
  return amountFormatted;
}

function initParam()
{
  var param = {};

  param.tipoRegistro = 0;
  param.colonnaProtocollo = 'DocProtocol';
  param.visualizzaDataOra = false;
  param.numerazioneAutomatica = false;
  param.stampaDefinitiva = false;
  param.inizioNumerazionePagine = 1;
  param.testoRegistriComboBoxIndex = 0;
  param.stampaTestoRegistroAcquisti = false;
  param.stampaTestoRegistroVendite = false;
  param.stampaTestoRegistroCorrispettivi = false;
  param.stampaOrizzontale = false;
  param.testoRegistroAcquisti = '';
  param.testoRegistroVendite = '';
  param.testoRegistroCorrispettivi = '';

  param.annoSelezionato = '';
  param.periodoSelezionato = 'm';
  param.periodoValoreMese = '';
  param.periodoValoreTrimestre = '';
  param.periodoValoreSemestre = '';

  return param;
}

function loadJournalData_Period(journal, param) {
  var periodStart = Banana.Converter.toDate(param.startDate);
  var periodEnd = Banana.Converter.toDate(param.endDate);
  param.journal = {};
  param.journal.rows = [];

  for (var i=0; i < journal.rows.length;i++) {
    var jsonLine = journal.rows[i];
    var content = jsonLine["JDate"];
    var currentDate = Banana.Converter.stringToDate(content, "YYYY-MM-DD");
    if (currentDate >= periodStart && currentDate <= periodEnd)
      param.journal.rows.push(jsonLine);
  }
  return param;
}

function loadJournalData(param) {
  //carica un'unica volta il giornale con l'intero periodo
  var periodYear = {};
  periodYear.startDate = param.fileInfo["OpeningDate"];
  periodYear.endDate = param.fileInfo["ClosureDate"];
  periodYear = loadJournal(periodYear);
  
  param.periods = [];
  var periods = createPeriods(param);
  for (var i=0; i<periods.length; i++) {
    //periods[i] = loadJournal(periods[i]);
    periods[i] = loadJournalData_Period(periodYear.journal, periods[i]);
    periods[i].numerazioneAutomatica = param.numerazioneAutomatica;
    periods[i].colonnaProtocollo = param.colonnaProtocollo;
    param.periods.push(periods[i]);
  }
  //aggiunge l'anno intero se periodo è annuale
  if (param.periodoSelezionato == "y") {
    periodYear.numerazioneAutomatica = param.numerazioneAutomatica;
    periodYear.colonnaProtocollo = param.colonnaProtocollo;
    param.periods.push(periodYear);
  }

  //PeriodComplete (inizio contabilità/fine periodo selezionato) serve per il calcolo dei corrispettivi da ventilare (acquisti per rivendita)
  for (var i=0; i<param.periods.length; i++) {
    var periodComplete = {};
    periodComplete.startDate = param.fileInfo["OpeningDate"];
    periodComplete.endDate = param.periods[i].endDate;
    periodComplete = loadJournalData_Period(periodYear.journal, periodComplete);
    param.periods[i] = loadJournalData_AddTotals(param.periods[i], periodComplete);
    param.periods[i].periodComplete = periodComplete;
  }

  return param;
}

function loadJournalData_AddTotals(period, periodComplete) {
  //Raggruppa totali per registro
  var registri = [];
  
  for (var index in period.journal.rows) {
    if (typeof period.journal.rows[index] !== "object" || period.journal.rows[index].IT_Registro.length<=0)
      continue;

    var register = period.journal.rows[index].IT_Registro.toLowerCase();
    var gr = period.journal.rows[index].IT_Gr_IVA;
    if (!registri[register])
      registri[register] = {};
    //Totali corrispettivi
    //I corrispettivi da ventilare vengono separati e riconosciuto tramite il codice gr C-VEN
    if (register == "corrispettivi") {
      var date = period.journal.rows[index].JDate;
      var vatCode = period.journal.rows[index].JVatCodeWithoutSign;
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
      currentObject.contoFattureNormali = Banana.SDecimal.add(period.journal.rows[index].IT_CorrFattureNormali, currentObject.contoFattureNormali);
      currentObject.contoFattureFiscali = Banana.SDecimal.add(period.journal.rows[index].IT_CorrFattureFiscali, currentObject.contoFattureFiscali);
      currentObject.contoFattureScontrini = Banana.SDecimal.add(period.journal.rows[index].IT_CorrFattureScontrini, currentObject.contoFattureScontrini);
      currentObject.contoFattureDifferite = Banana.SDecimal.add(period.journal.rows[index].IT_CorrFattureDifferite, currentObject.contoFattureDifferite);
      currentObject.contoCorrispettiviNormali = Banana.SDecimal.add(period.journal.rows[index].IT_CorrispettiviNormali, currentObject.contoCorrispettiviNormali);
      currentObject.contoCorrispettiviScontrini = Banana.SDecimal.add(period.journal.rows[index].IT_CorrispettiviScontrini, currentObject.contoCorrispettiviScontrini);
      currentObject.contoRicevuteFiscali = Banana.SDecimal.add(period.journal.rows[index].IT_CorrRicevuteFiscali, currentObject.contoRicevuteFiscali);
      currentObject.totaleGiornaliero = Banana.SDecimal.add(period.journal.rows[index].IT_CorrTotaleGiornaliero, currentObject.totaleGiornaliero);
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

      var vatCode = period.journal.rows[index].JVatCodeWithoutSign;
      var vatRate = period.journal.rows[index].IT_Aliquota;
      var vatAmount = period.journal.rows[index].IT_ImportoIva;
      var vatPosted = period.journal.rows[index].IT_IvaContabilizzata;
      var vatNonDed = period.journal.rows[index].VatNonDeductible;
      var vatTaxable = period.journal.rows[index].IT_Imponibile;
      var vatTaxableDed = period.journal.rows[index].IT_ImponibileDetraibile;
      var vatTaxableNonDed = period.journal.rows[index].IT_ImponibileNonDetraibile;
      var vatPercNonDed = period.journal.rows[index].VatPercentNonDeductible;
      var vatGross =  period.journal.rows[index].IT_Lordo;

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
          var tableVatCodes = Banana.document.table("VatCodes");
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
  period.acquistiPerRivendita = loadJournalData_Ventilazione(registri["corrispettivi"], periodComplete) ;

  return period;
}
function loadJournalData_Ventilazione(corrispettivi, periodComplete) {
  var acquistiPerRivendita = [];
  //Ventilazione corrispettivi
  for (var index in periodComplete.journal.rows) {
    if (typeof periodComplete.journal.rows[index] !== "object")
      continue;

    var gr = periodComplete.journal.rows[index].IT_Gr_IVA;
    var vatCode = periodComplete.journal.rows[index].JVatCodeWithoutSign;
    var totAcquisti = 0;

    if (periodComplete.journal.rows[index].IT_Registro.toLowerCase() == "acquisti" && gr == "A-IM-RI") {
      var currentObject = {};
      currentObject.totaleAcquisti = '';
      if (acquistiPerRivendita[vatCode]) {
        currentObject = acquistiPerRivendita[vatCode];
      }
      currentObject.totaleAcquisti = Banana.SDecimal.add(periodComplete.journal.rows[index].IT_Lordo, currentObject.totaleAcquisti);
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
    var tableVatCodes = Banana.document.table("VatCodes");
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

function printDocument(report, stylesheet, param) {
  var addPageBreak = false;
  for (var i=0; i<param.periods.length; i++) {
    //tipoRegistro 0 = vendite
    //tipoRegistro 4 = registro iva unico
    if (param.tipoRegistro == 0 || param.tipoRegistro == 4) {
      var printed = printRegistroAcquistiVendite(report, stylesheet, param.periods[i], 'vendite', addPageBreak);
      if (printed)
        addPageBreak = true;
    }
    //tipoRegistro 3 = liquidazione
    if (param.tipoRegistro == 0 || param.tipoRegistro == 3 || param.tipoRegistro == 4) {
      param = printDocument_LoadVatCodes(param, param.periods[i]);
      var printed = printLiquidazione(report, stylesheet, param, param.periods[i], addPageBreak);
      if (printed)
        addPageBreak = true;
    }
    //tipoRegistro 1 = acquisti
    if (param.tipoRegistro == 1 || param.tipoRegistro == 4) {
      var printed = printRegistroAcquistiVendite(report, stylesheet, param.periods[i], 'acquisti', addPageBreak);
      if (printed)
        addPageBreak = true;
    }
    //tipoRegistro 2 = corrispettivi
    if (param.tipoRegistro == 2 || param.tipoRegistro == 4) {
      var printed = printRegistroCorrispettivi(report, stylesheet, param.periods[i], addPageBreak);
    }
    //if (i+1<param.periods.length)
    //  report.addPageBreak();
  }
  return true;
}

function printDocument_LoadVatCodes(param, period) {
  param.vatPeriods = [];
  param = loadVatCodes(param, period.startDate, period.endDate);
  if (param.vatPeriods.length <= 0)
    return param;

  //commentato perché lasciato calcolo nel modulo liquidazione (loadVatCodes)
  /*if (period.startDate == period.periodComplete.startDate && period.endDate == period.periodComplete.endDate) {
    //periodo anno completo bisogna escludere crediti di periodo
    param.vatPeriods[0]["OPATTIVE"] = sumVatAmounts(param.vatPeriods[0], ["V","C"]);
    param.vatPeriods[0]["OPDIFFERENZA"] = sumVatAmounts(param.vatPeriods[0], ["OPATTIVE","OPPASSIVE"]);
    param.vatPeriods[0]["L-CI"] = {};
    param.vatPeriods[0]["L-CIA"] = Banana.document.vatCurrentBalance("L-CIA", period.startDate, period.endDate);
    param.vatPeriods[0]["L-CO"] = Banana.document.vatCurrentBalance("L-CO", period.startDate, period.endDate);
    param.vatPeriods[0]["L"] = sumVatAmounts(param.vatPeriods[0], ["L-AC","L-CIA","L-CO","L-INT","L-RI","L-SP"]);
    param.vatPeriods[0]["Total"] = sumVatAmounts(param.vatPeriods[0], ["V","C","A","L"]);
  }
  else {
    param.vatPeriods[0]["OPATTIVE"] = sumVatAmounts(param.vatPeriods[0], ["V","C"]);
    param.vatPeriods[0]["OPDIFFERENZA"] = sumVatAmounts(param.vatPeriods[0], ["OPATTIVE","OPPASSIVE"]);
    param.vatPeriods[0]["L-CI"] = Banana.document.vatCurrentBalance("L-CI", period.startDate, period.endDate);
    param.vatPeriods[0]["L-CIA"] = Banana.document.vatCurrentBalance("L-CIA", period.periodComplete.startDate, period.periodComplete.endDate);
    param.vatPeriods[0]["L-CO"] = Banana.document.vatCurrentBalance("L-CO", period.periodComplete.startDate, period.periodComplete.endDate);
    param.vatPeriods[0]["L-RI"] = {};
    param.vatPeriods[0]["L"] = sumVatAmounts(param.vatPeriods[0], ["L-AC","L-CI","L-CIA","L-CO","L-INT","L-SP"]);
    param.vatPeriods[0]["Total"] = sumVatAmounts(param.vatPeriods[0], ["V","C","A","L"]);
  }*/

  //confronto di due date
  //var periodStart = Banana.Converter.toDate(period.startDate);
  //var periodEnd = Banana.Converter.toDate(period.endDate);
  //var periodCompleteStart = Banana.Converter.toDate(param.fileInfo["OpeningDate"]);
  //var periodCompleteEnd = Banana.Converter.toDate(param.fileInfo["ClosureDate"]);
  //if (periodStart.getTime() === periodCompleteStart.getTime() && periodEnd.getTime() === periodCompleteEnd.getTime())

  return param;
}

function printLiquidazione(report, stylesheet, param, period, addPageBreak) {

  if (addPageBreak)
    report.addPageBreak();

  //Tabella Prospetto di liquidazione IVA
  report.addParagraph("Prospetto di liquidazione IVA", "h1");
  report.addParagraph(getPeriodText(period), "h1_period");
  printed = printLiquidazione_Summary(report, stylesheet, period);
  if (printed)
    report.addPageBreak();

  //Tabella Riepilogo IVA
  report.addParagraph("Riepilogo IVA", "h1");
  report.addParagraph("Periodo: " + getPeriodText(param.vatPeriods[0]), "h1_period");
  var table = report.addTable("vat_table");
  
  //Totale operazioni attive
  var amount = param.vatPeriods[0]["OPATTIVE"].vatTaxable;
  var row = table.addRow();
  row.addCell("Totale operazioni attive (al netto dell'IVA)", "description");
  if (Banana.SDecimal.sign(amount)<0) {
    row.addCell(formatAmount(amount), "amount");
    row.addCell("");
  }
  else {
    row.addCell("");
    row.addCell(formatAmount(amount), "amount");
  }

  //Totale operazioni passive
  amount = param.vatPeriods[0]["OPPASSIVE"].vatTaxable;
  row = table.addRow();
  row.addCell("Totale operazioni passive (al netto dell'IVA)", "description");
  if (Banana.SDecimal.sign(amount)<0) {
    row.addCell(formatAmount(amount), "amount");
    row.addCell("");
  }
  else {
    row.addCell("");
    row.addCell(formatAmount(amount), "amount");
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
  amount = param.vatPeriods[0]["OPATTIVE"].vatPosted;
  row = table.addRow();
  row.addCell("IVA esigibile", "description");
  if (Banana.SDecimal.sign(amount)<0) {
    row.addCell(formatAmount(amount), "amount");
    row.addCell("");
  }
  else {
    row.addCell("");
    row.addCell(formatAmount(amount), "amount");
  }
  
  //IVA detratta
  amount = param.vatPeriods[0]["OPPASSIVE"].vatPosted;
  row = table.addRow();
  var description = "IVA detratta";
  if (!Banana.SDecimal.isZero(param.vatPeriods[0].datiContribuente.liqPercProrata))
    description = "IVA detratta (Prorata: " + Banana.SDecimal.round(param.vatPeriods[0].datiContribuente.liqPercProrata, {'decimals':2}).toString() + "%)";
  row.addCell(description, "description");
  if (Banana.SDecimal.sign(amount)<0) {
    row.addCell(formatAmount(amount), "amount");
    row.addCell("");
  }
  else {
    row.addCell("");
    row.addCell(formatAmount(amount), "amount");
  }

  //Saldo IVA di periodo (IVA esigibile - IVA detratta)
  amount = param.vatPeriods[0]["OPDIFFERENZA"].vatPosted;
  row = table.addRow();
  row.addCell("Saldo IVA di periodo (mensile o trimestrale)", "description");
  if (Banana.SDecimal.sign(amount)<=0) {
    row.addCell(formatAmount(amount), "amount");
    row.addCell("");
  }
  else {
    row.addCell("");
    row.addCell(formatAmount(amount), "amount");
  }
  
  //Credito IVA periodo precedente (mensile o trimestrale)
  amount = param.vatPeriods[0]["L-CI"].vatPosted;
  row = table.addRow();
  row.addCell("Credito IVA periodo precedente (mensile o trimestrale)", "description");
  if (Banana.SDecimal.sign(amount)<=0) {
    row.addCell(formatAmount(amount), "amount");
    row.addCell("");
  }
  else {
    row.addCell("");
    row.addCell(formatAmount(amount), "amount");
  }

  //Ammontare dei versamenti
  amount = param.vatPeriods[0]["L-RI"].vatPosted;
  if (!Banana.SDecimal.isZero(amount)) {
    row = table.addRow();
    row.addCell("Ammontare dei versamenti", "description");
    if (Banana.SDecimal.sign(amount)<=0) {
      row.addCell(formatAmount(amount), "amount");
      row.addCell("");
    }
    else {
      row.addCell("");
      row.addCell(formatAmount(amount), "amount");
    }
  }
  
  //Credito o debito IVA di periodo (IVA esigibile - IVA detratta - Credito IVA periodo precedente)
  amount = Banana.SDecimal.add(param.vatPeriods[0]["OPDIFFERENZA"].vatPosted, param.vatPeriods[0]["L-CI"].vatPosted);
  row = table.addRow();
  row.addCell("Credito o debito IVA di periodo", "description");
  if (Banana.SDecimal.sign(amount)<=0) {
    row.addCell(formatAmount(amount), "amount");
    row.addCell("");
  }
  else {
    row.addCell("");
    row.addCell(formatAmount(amount), "amount");
  }

  //Riga di separazione
  var row = table.addRow();
  row.addCell("", "separator", 3);

  //Credito IVA anno precedente
  amount = param.vatPeriods[0]["L-CIA"].vatPosted;
  row = table.addRow();
  row.addCell("Credito IVA anno precedente", "description");
  if (Banana.SDecimal.sign(amount)<0) {
    row.addCell(formatAmount(amount), "amount");
    row.addCell("");
  }
  else {
    row.addCell("");
    row.addCell(formatAmount(amount), "amount");
  }

  //Credito IVA anno precedente compensato F24
  amount = param.vatPeriods[0]["L-CO"].vatPosted;
  row = table.addRow();
  row.addCell("Credito IVA anno precedente compensato F24", "description");
  if (Banana.SDecimal.sign(amount)<0) {
    row.addCell(formatAmount(amount), "amount");
    row.addCell("");
  }
  else {
    row.addCell("");
    row.addCell(formatAmount(amount), "amount");
  }

  //Riga di separazione
  var row = table.addRow();
  row.addCell("", "separator", 3);

  //Interessi dovuti
  amount = param.vatPeriods[0]["L-INT"].vatPosted
  row = table.addRow();
  row.addCell("Interessi dovuti per liquidazioni trimestrali", "description");
  if (Banana.SDecimal.sign(amount)<=0) {
    row.addCell(formatAmount(amount), "amount");
    row.addCell("");
  }
  else {
    row.addCell("");
    row.addCell(formatAmount(amount), "amount");
  }
  /*propone interessi trimestrali se importo è diverso da quello visualizzato*/
  /*var amountInteressi = 0;
  if (param.vatPeriods[0]["L-INT"] && param.vatPeriods[0]["L-INT"].vatPosted)
    amountInteressi = Banana.SDecimal.abs(param.vatPeriods[0]["L-INT"].vatPosted);
  var amountInteressiCalcolati = 0;
  if (param.vatPeriods[0].datiContribuente.liqTipoVersamento == 1)
    amountInteressiCalcolati = calculateInterestAmount(param.vatPeriods[0]);
  if (param.vatPeriods[0].datiContribuente.liqTipoVersamento == 1 && amountInteressi != amountInteressiCalcolati) {
    var msg = getErrorMessage(ID_ERR_LIQUIDAZIONE_INTERESSI_DIFFERENTI);
    msg = msg.replace("%1", param.vatPeriods[0].datiContribuente.liqPercInteressi );
    msg = msg.replace("%2", Banana.Converter.toLocaleNumberFormat(amountInteressiCalcolati) );
    row.addCell(msg, "amount warning");
  }
  else if (param.vatPeriods[0].datiContribuente.liqTipoVersamento == 0 && amountInteressi != amountInteressiCalcolati)
    row.addCell(getErrorMessage(ID_ERR_LIQUIDAZIONE_INTERESSI_VERSAMENTO_MENSILE), "amount warning");
  else
    row.addCell("");*/

  //Acconto dovuto
  amount = param.vatPeriods[0]["L-AC"].vatPosted;
  row = table.addRow();
  row.addCell("Acconto dovuto", "description");
  if (Banana.SDecimal.sign(amount)<=0) {
    row.addCell(formatAmount(amount), "amount");
    row.addCell("");
  }
  else {
    row.addCell("");
    row.addCell(formatAmount(amount), "amount");
  }

  //Saldo finale di periodo
  amount = param.vatPeriods[0]["Total"].vatPosted;
  row = table.addRow();
  row.addCell("Saldo finale di periodo", "description bold");
  if (Banana.SDecimal.sign(amount)<=0) {
    row.addCell(formatAmount(amount), "amount bold");
    row.addCell("");
  }
  else {
    row.addCell("");
    row.addCell(formatAmount(amount), "amount bold");
  }
  return true;
}

function printLiquidazione_Summary(report, stylesheet, period) {

  if (!period.registri["vendite"] && !period.registri["acquisti"] && !period.registri["corrispettivi"])
    return false;

  if (period.registri["vendite"]) {
    printLiquidazione_SummaryTable(report, stylesheet, period.registri["vendite"], "RIEPILOGO GENERALE IVA VENDITE");
  }
  if (period.registri["corrispettivi"]) {
    printLiquidazione_SummaryTable(report, stylesheet, period.registri["corrispettivi"], "RIEPILOGO GENERALE IVA CORRISPETTIVI");
    printRegistroCorrispettivi_Ventilazione(report, period);
  }
  if (period.registri["acquisti"]) {
    //controlla se ci sono importi non deducibili
    var totNonDed = 0;
    for (var vatRate in period.registri["acquisti"].totaliAliquota) {
      totNonDed = Banana.SDecimal.add(period.registri["acquisti"].totaliAliquota[vatRate].vatTaxableNonDed, totNonDed);
    }  
    if (!Banana.SDecimal.isZero(totNonDed)) {
      printLiquidazione_SummaryTable(report, stylesheet, period.registri["acquisti"], "ACQUISTI IVA DETRAIBILE DEL PERIODO");
      printLiquidazione_SummaryTable(report, stylesheet, period.registri["acquisti"], "ACQUISTI IVA INDETRAIBILE DEL PERIODO");
    }
    printLiquidazione_SummaryTable(report, stylesheet, period.registri["acquisti"], "RIEPILOGO GENERALE IVA ACQUISTI");
  }
  
  return true;
}

function printLiquidazione_SummaryTable(report, stylesheet, data, title) {
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

function printRegistroAcquistiVendite(report, stylesheet, period, register, addPageBreak) {
  
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
  for (var index in period.journal.rows) {
    if (typeof period.journal.rows[index] !== "object")
      continue;
    if (period.journal.rows[index].IT_Registro.toLowerCase() != register.toLowerCase())
      continue;
    var row = period.journal.rows[index];
    var progRegistro = row.DocProtocol;
    if (period.numerazioneAutomatica)
      progRegistro = row.IT_ProgRegistro;
    else if (period.colonnaProtocollo == 'Doc')
      progRegistro = row.Doc;
    row.IT_ProgRegistro = progRegistro;
    transactions.push(row);
  }
  // Sort per progressivo registro
  transactions.sort(sortBy_ProgRegistro);  

  //Tabella
  var table = report.addTable("register_table");
  var headerRow = table.getHeader().addRow();
  headerRow.addCell(titolo, "h1", 10);
  var headerRow = table.getHeader().addRow();
  headerRow.addCell(getPeriodText(period), "h1_period", 10);
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
  var title = "TOTALI DI PERIODO PER ALIQUOTA - Registro " + register.toUpperCase() + " (" + getPeriodText(period) + ")";
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
  row.addCell("TOTALI DI PERIODO PER CODICI - Registro " + register.toUpperCase() + " (" + getPeriodText(period) + ")", "h2", 10);
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

function printRegistroCorrispettivi(report, stylesheet, period, addPageBreak) {

  var register = "corrispettivi";
  if (!period.registri[register]) {
    //report.addParagraph("Nessun movimento trovato nel periodo", "");
    return false;
  }

  if (addPageBreak)
    report.addPageBreak();

  //Titolo
  report.addParagraph("Registro dei corrispettivi", "h1");
  report.addParagraph(getPeriodText(period), "h1_period");

  //Tabella REGISTRO DEI CORRISPETTIVI 
  var table = report.addTable("corrispettivi_table");
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

  var corrispettivi = period.registri[register];
  for (var key in corrispettivi) {
    if (key.indexOf('|')<=0)
      continue;
    row = table.addRow();
    var date = key.substring(0, key.indexOf('|'));
    row.addCell(Banana.Converter.toLocaleDateFormat(date, "dd/mm/yy"), "");
    row.addCell(corrispettivi[key].vatCode, "");
    var vatCodeDes = '';
    var vatCodeGr = '';
    var tableVatCodes = Banana.document.table("VatCodes");
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
  headerRow.addCell("CALCOLO VENTILAZIONE CORRISPETTIVI (GR=C-VEN) " + getPeriodText(period), "title h4", 8);
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
  
  //Controlla se la ventilazione è stata fatta
  printRegistroCorrispettivi_Ventilazione(report, period);

  //Riepilogo IVA PER ALIQUOTA
  if (!corrispettivi.totaliAliquota)
    return true;
  var table = report.addTable("corrispettivi_riepilogo_table");
  var row = table.addRow();
  var title = "#RIEPILOGO PER ALIQUOTA IVA CORRISPETTIVI (" + getPeriodText(period) + ")";
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
  row.addCell("#RIEPILOGO PER CODICE IVA CORRISPETTIVI (" + getPeriodText(period) + ")", "bold");
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
  
  return true;
}

/*Controlla se registrazioni per la ventilazione dei corrispettivi corrispondono al calcolo.*/
function printRegistroCorrispettivi_Ventilazione(report, period) {
  var ventilazioneCalcolata = 0;
  var ventilazioneRegistrata = 0;
  
  var corrispettivi = period.registri["corrispettivi"];
  var corrispettiviCalcolati = period.acquistiPerRivendita;

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
      var msg = getErrorMessage(ID_ERR_REGISTRI_VENTILAZIONE_DIVERSA);
      msg = msg.replace("%1",  Banana.Converter.toLocaleNumberFormat(ventilazioneCalcolata) );
      msg = msg.replace("%2", Banana.Converter.toLocaleNumberFormat(ventilazioneRegistrata) );
      report.addParagraph(msg, "warning");
    }
  }
}

function setStyle(report, stylesheet, param) {
  if (!stylesheet) {
    stylesheet = report.newStyleSheet();
  }
  if (param.stampaOrizzontale)
    stylesheet.addStyle("@page", "size:landscape;margin:2em;font-size: 9px; ");
  else
    stylesheet.addStyle("@page", "size:portrait;margin:2em;font-size: 9px; ");
  if (param.stampaDefinitiva)
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

function verifyParam(param) {
  if (!param.tipoRegistro)
    param.tipoRegistro = 0;
  if (!param.colonnaProtocollo)
    param.colonnaProtocollo = 'DocProtocol';
  if (!param.visualizzaDataOra)
    param.visualizzaDataOra = false;
  if (!param.numerazioneAutomatica)
    param.numerazioneAutomatica = false;
  if (!param.stampaDefinitiva)
    param.stampaDefinitiva = false;
  if (!param.inizioNumerazionePagine)
    param.inizioNumerazionePagine = 1;
  if (!param.testoRegistriComboBoxIndex)
    param.testoRegistriComboBoxIndex = 0;
  if (!param.stampaTestoRegistroAcquisti)
    param.stampaTestoRegistroAcquisti = false;
  if (!param.stampaTestoRegistroVendite)
    param.stampaTestoRegistroVendite = false;
  if (!param.stampaTestoRegistroCorrispettivi)
    param.stampaTestoRegistroCorrispettivi = false;
  if (!param.stampaOrizzontale)
    param.stampaOrizzontale = false;
  if (!param.testoRegistroAcquisti)
    param.testoRegistroAcquisti = '';
  if (!param.testoRegistroVendite)
    param.testoRegistroVendite = '';
  if (!param.testoRegistroCorrispettivi)
   param.testoRegistroCorrispettivi = '';

  if (!param.annoSelezionato)
    param.annoSelezionato = '';
   if (!param.periodoSelezionato)
    param.periodoSelezionato = 'm';
  if (!param.periodoValoreMese)
    param.periodoValoreMese = '';
  if (!param.periodoValoreTrimestre)
    param.periodoValoreTrimestre = '';
  if (!param.periodoValoreSemestre)
    param.periodoValoreSemestre = '';

  return param;
}

/**
* output integers with leading zeros
*/
function zeroPad(num, places) {
  if (num.toString().length > places)
      num = 0;
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}

/** Sort transactions by date */
this.sort = function( transactions) {
  var sortedTransactions = transactions.sort(_sort);
  if (transactions.length<=0)
    return transactions;
  var i=0;
  var previousProgr = parseInt(transactions[0].IT_ProgRegistro);
  while (i<transactions.length) {
    var progr = parseInt(transactions[i].IT_ProgRegistro);
    if (previousProgr > 0 && previousProgr > progr)
      return transactions.reverse();
    else if (previousProgr > 0 && previousProgr < progr)
      return transactions;
    i++;
  }
  return transactions;
 }

 function sortBy_ProgRegistro(a,b) {
  var  value_a  = a.IT_ProgRegistro.replace(/[^0-9]+/, '');
  var  value_b  = b.IT_ProgRegistro.replace(/[^0-9]+/, '');
  if (parseInt(value_a) < parseInt(value_b))
    return -1;
  if (parseInt(value_a) > parseInt(value_b))
    return 1;
  return 0;
}
