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
// @id = ch.banana.script.italy_vat_2017.report.liquidazione.js
// @description = Comunicazione periodica IVA...
// @doctype = *;110
// @encoding = utf-8
// @includejs = ch.banana.script.italy_vat_2017.report.liquidazione.createinstance.js
// @includejs = ch.banana.script.italy_vat_2017.errors.js
// @includejs = ch.banana.script.italy_vat_2017.journal.js
// @includejs = ch.banana.script.italy_vat_2017.xml.js
// @inputdatasource = none
// @pubdate = 2017-12-04
// @publisher = Banana.ch SA
// @task = app.command
// @timeout = -1

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

  var dialog = Banana.Ui.createUi("ch.banana.script.italy_vat_2017.report.liquidazione.dialog.ui");
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
  dialog.periodoGroupBox.periodoComboBox.currentIndex = index;
  //Groupbox anno per il momento impostati fissi perché non è possibile caricare gli anni sul combobox
  var index = 0;
  if (param.annoSelezionato == '2017')
    index = 1;
  else if (param.annoSelezionato == '2018')
    index = 2;
  dialog.periodoGroupBox.annoComboBox.currentIndex = index;
  
  //Groupbox comunicazione
  dialog.intestazioneGroupBox.cfLabel_2.text = accountingData.datiContribuente.codiceFiscale;
  dialog.intestazioneGroupBox.partitaIvaLabel_2.text = accountingData.datiContribuente.partitaIva;
  var accountingYear = accountingData.openingYear;
  if (accountingYear != accountingData.closureYear)
    accountingYear +=  "-" + accountingData.closureYear;
  dialog.intestazioneGroupBox.annoImpostaLabel_2.text = accountingYear;

  var progressivo = parseInt(param.comunicazioneProgressivo, 10);
  if (!progressivo)
    progressivo = 1;
  else if (param.outputScript==1)
    progressivo += 1;
  progressivo = zeroPad(progressivo, 5);
  dialog.intestazioneGroupBox.progressivoInvioLineEdit.text = progressivo;
  dialog.intestazioneGroupBox.cfDichiaranteLineEdit.text = param.comunicazioneCFDichiarante;
  dialog.intestazioneGroupBox.codiceCaricaComboBox.currentIndex = param.comunicazioneCodiceCaricaDichiarante;
  dialog.intestazioneGroupBox.cfIntermediarioLineEdit.text = param.comunicazioneCFIntermediario;
  dialog.intestazioneGroupBox.impegnoComboBox.currentIndex = param.comunicazioneImpegno;
  dialog.intestazioneGroupBox.firmaDichiarazioneCheckBox.checked = param.comunicazioneFirmaDichiarazione;
  dialog.intestazioneGroupBox.firmaIntermediarioCheckBox.checked = param.comunicazioneFirmaIntermediario;
  var dataImpegno = Banana.Converter.stringToDate(param.comunicazioneImpegnoData, "YYYY-MM-DD");
  dialog.intestazioneGroupBox.dataImpegnoDateEdit.setDate(dataImpegno);
  var ultimoMese = param.comunicazioneUltimoMese;
  if (ultimoMese == '13')
    ultimoMese = '12';
  else if (ultimoMese == '99')
    ultimoMese = '13';
  dialog.intestazioneGroupBox.ultimoMeseComboBox.currentIndex = ultimoMese;
  
  //Groupbox stampa
  if (param.outputScript==1)
    dialog.stampaGroupBox.stampaXmlRadioButton.checked = true;
  else  
    dialog.stampaGroupBox.stampaReportRadioButton.checked = true;

  //dialog functions
  dialog.checkdata = function () {
    dialog.accept();
  }
  dialog.enableButtons = function () {
  }
  dialog.showHelp = function () {
    Banana.Ui.showHelp("ch.banana.script.italy_vat_2017");
  }
  var index='';
  dialog.buttonBox.accepted.connect(dialog, dialog.checkdata);
  dialog.buttonBox.helpRequested.connect(dialog, dialog.showHelp);
  //dialog.liquidazioneGroupBox.tipoVersamentoComboBox['currentIndexChanged(QString)'].connect(dialog, dialog.enableButtons);
  //dialog.periodoGroupBox.trimestreRadioButton.clicked.connect(dialog, dialog.enableButtons);
  //dialog.periodoGroupBox.meseRadioButton.clicked.connect(dialog, dialog.enableButtons);
  
  //Visualizzazione dialogo
  Banana.application.progressBar.pause();
  dialog.enableButtons();
  var dlgResult = dialog.exec();
  Banana.application.progressBar.resume();
  if (dlgResult !== 1)
    return false;

  //Salvataggio dati
  //Groupbox periodo
  var index = parseInt(dialog.periodoGroupBox.periodoComboBox.currentIndex.toString());
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
  var index = parseInt(dialog.periodoGroupBox.annoComboBox.currentIndex.toString());
  if (index <=0)
    param.annoSelezionato = '2016';
  else if (index ==1)
    param.annoSelezionato = '2017';
  else if (index ==2)
    param.annoSelezionato = '2018';
  
  //Groupbox comunicazione
  progressivo = dialog.intestazioneGroupBox.progressivoInvioLineEdit.text;
  progressivo = parseInt(progressivo, 10);
  if (!progressivo)
    progressivo = 1;
  param.comunicazioneProgressivo = zeroPad(progressivo, 5);
  param.comunicazioneCFDichiarante = dialog.intestazioneGroupBox.cfDichiaranteLineEdit.text;
  param.comunicazioneCodiceCaricaDichiarante = dialog.intestazioneGroupBox.codiceCaricaComboBox.currentIndex.toString();
  param.comunicazioneCFIntermediario = dialog.intestazioneGroupBox.cfIntermediarioLineEdit.text;
  param.comunicazioneImpegno = dialog.intestazioneGroupBox.impegnoComboBox.currentIndex.toString();
  dataImpegno = dialog.intestazioneGroupBox.dataImpegnoDateEdit.text;
  param.comunicazioneImpegnoData = Banana.Converter.toInternalDateFormat(dataImpegno);
  param.comunicazioneFirmaDichiarazione = dialog.intestazioneGroupBox.firmaDichiarazioneCheckBox.checked;
  param.comunicazioneFirmaIntermediario = dialog.intestazioneGroupBox.firmaIntermediarioCheckBox.checked;
  param.comunicazioneUltimoMese = dialog.intestazioneGroupBox.ultimoMeseComboBox.currentIndex.toString();
  if (param.comunicazioneUltimoMese == '12')
    param.comunicazioneUltimoMese = '13';
  else if (param.comunicazioneUltimoMese == '13')
    param.comunicazioneUltimoMese = '99';

  //Groupbox stampa
  if (dialog.stampaGroupBox.stampaXmlRadioButton.checked)
    param.outputScript = 1;
  else
    param.outputScript = 0;

  var paramToString = JSON.stringify(param);
  Banana.document.setScriptSettings(paramToString);
  return true;
}

function addPageHeader(report, stylesheet, param)
{
  // Page header
  var pageHeader = report.getHeader();

  //Tabella
  var table = pageHeader.addTable("header_table");
  table.addColumn("header_col_left");
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
  
  //cell_right
  var cell_right = row.addCell("", "header_cell_right");
  cell_right.addParagraph("Comunicazione periodica IVA", "right");
  cell_right.addParagraph(Banana.Converter.toLocaleDateFormat(new Date()), "right");
  cell_right.addParagraph(" Pagina ", "right").addFieldPageNr();
 
  //add style
  stylesheet.addStyle(".header_table", "margin-top:1em;width:100%;");
  stylesheet.addStyle(".header_col_left", "width:50%");
  stylesheet.addStyle(".header_col_right", "width:49%");
  stylesheet.addStyle(".header_cell_left", "font-size:8px");
  stylesheet.addStyle(".header_cell_right", "font-size:8px");
  stylesheet.addStyle(".period", "padding-bottom: 1em;");
  stylesheet.addStyle(".right", "text-align: right;");
}

function calculateInterestAmount(param) {
  if (Banana.SDecimal.sign(param["TotalWithoutInterests"].vatPosted)<=0) {
    var interestRate = Banana.SDecimal.round(param.datiContribuente.liqPercInteressi, {'decimals':2});
    var interestAmount = Banana.SDecimal.abs(param["TotalWithoutInterests"].vatPosted) * interestRate /100;
    interestAmount = Banana.SDecimal.roundNearest(interestAmount, '0.01');
    return interestAmount.toString();
  }
  return '';
}

function exec(inData) {

  if (!Banana.document)
    return "@Cancel";

  // Check version
  if (typeof (Banana.IO) === 'undefined') {
    var msg = getErrorMessage(ID_ERR_VERSIONE);
    msg = msg.replace("%1", "Banana.IO" );
    Banana.document.addMessage( msg, ID_ERR_VERSIONE);
    return "@Cancel";
  }

  var param = {};
  if (inData.length>0) {
    param = JSON.parse(inData);
    param = verifyParam(param);
  }
  else {
    if (!settingsDialog())
      return "@Cancel";
    param = JSON.parse(Banana.document.getScriptSettings());
  }
  
  param = readAccountingData(param);
  param.schemaRefs = init_schemarefs();
  param.namespaces = init_namespaces();

  // Calculate vat amounts for each vat code
  param.vatPeriods = [];
  var periods = createPeriods(param);
  for (var i=0; i<periods.length; i++) {
    param = loadVatCodes(param, periods[i].startDate, periods[i].endDate);
  }

  var output = createInstance(param)

  if (param.outputScript==0 && output != "@Cancel"){
    //print preview
    var report = Banana.Report.newReport("Report title");
    var stylesheet = Banana.Report.newStyleSheet();
    addPageHeader(report, stylesheet, param);
    setStyle(report, stylesheet);

    //Data
    for (var index=0; index<param.vatPeriods.length; index++) {
      printVatReport1(report, stylesheet, param.vatPeriods[index]);
    printVatReport2(report, stylesheet, param.vatPeriods[index]);
    if (index+1<param.vatPeriods.length)
      report.addPageBreak();
    }
    Banana.Report.preview(report, stylesheet);
    return;
  }
  else if (param.outputScript==1 && output != "@Cancel") {
    //xml file
    output = formatXml(output);
    saveData(output, param);
    return;
  }

  //return xml content
  return output;
}

function findVatCodes(table, column, code) {
  var vatCodes = [];
  for (var rowNr=0; rowNr < table.rowCount; rowNr++) {
  var gr1Codes = table.value(rowNr, column).split(";");
  if (gr1Codes.indexOf(code) >= 0) {
    var vatCode = table.value(rowNr, "VatCode").split(";");
    vatCodes.push(vatCode);
  }
  }
  return vatCodes;
}

function getPeriod(format, param) {
  var fromDate = Banana.Converter.toDate(param.startDate);
  var toDate = Banana.Converter.toDate(param.endDate);
  var firstDayOfPeriod = 1;
  var lastDayOfPeriod = new Date(toDate.getFullYear(),toDate.getMonth()+1,0).getDate().toString();
  if (fromDate.getDate() != firstDayOfPeriod)
    return "";
  if (toDate.getDate() != lastDayOfPeriod)
    return "";
  if (format === "y") {
    if (fromDate.getFullYear() === toDate.getFullYear())
      return fromDate.getFullYear();
  }
  else if (format === "m") {
    if (fromDate.getMonth() === toDate.getMonth())
      return (fromDate.getMonth()+1).toString();
  }
  else if (format === "q") {
    var q = [1,2,3,4];
    var q1 = q[Math.floor(fromDate.getMonth() / 3)];  
    var q2 = q[Math.floor(toDate.getMonth() / 3)];  
    if (q1 === q2)
      return q1.toString();
  }
  return "";
}

function getVatTotalFromBanana(startDate, endDate) {
  var total =  {
  vatAmount : "",
  vatTaxable : "",
  vatNotDeductible : "",
  vatPosted : ""
  };

  var tableVatReport = Banana.document.vatReport(startDate, endDate);
  var totalRow = tableVatReport.findRowByValue("Group", "_tot_");
  total.vatAmount = totalRow.value("VatAmount");
  total.vatTaxable = totalRow.value("VatTaxable");
  total.vatNotDeductible = totalRow.value("VatNonDeductible");
  total.vatPosted = totalRow.value("VatPosted");

  return total;
}

function initParam()
{
  var param = {};
  param.comunicazioneProgressivo = '';
  param.comunicazioneCFDichiarante = '';
  param.comunicazioneCodiceCaricaDichiarante = '';
  param.comunicazioneCFIntermediario = '';
  param.comunicazioneImpegno = '';
  param.comunicazioneImpegnoData = '';
  param.comunicazioneFirmaDichiarazione = true;
  param.comunicazioneFirmaIntermediario = true;
  param.comunicazioneUltimoMese = '';

  param.annoSelezionato = '';
  param.periodoSelezionato = 'm';
  param.periodoValoreMese = '';
  param.periodoValoreTrimestre = '';
  param.periodoValoreSemestre = '';
  
  /*
  0 = create print preview report
  1 = create file xml 
  2 = return xml string */
  param.outputScript = 0;

  return param;
}

function init_namespaces()
{
  var ns = [
    {
      'namespace' : 'urn:www.agenziaentrate.gov.it:specificheTecniche:sco:ivp',
      'prefix' : 'xmlns:iv'
    },
    {
      'namespace' : 'http://www.w3.org/2000/09/xmldsig#',
      'prefix' : 'xmlns:ds'
    },
  ];
  return ns;
}
function init_schemarefs()
{
  var schemaRefs = [
    //'http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v2.0 fornituraIvp_2017_v1.xsd',
   ];
  return schemaRefs;
};

function loadVatCodes(param, _startDate, _endDate) 
{
  var vatAmounts = {};

  // V = Vendite
  var tableVatCodes = Banana.document.table("VatCodes");
  var vatCodes = findVatCodes(tableVatCodes, "Gr", "V-IM-BA");
  vatAmounts["V-IM-BA"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-IM-REV");
  vatAmounts["V-IM-REV"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-IM-EU");
  vatAmounts["V-IM-EU"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-IM-ES");
  vatAmounts["V-IM-ES"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-IM");
  vatAmounts["V-IM"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-NI-EU");
  vatAmounts["V-NI-EU"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-NI");
  vatAmounts["V-NI"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-ES");
  vatAmounts["V-ES"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-NE");
  vatAmounts["V-NE"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "V-ED");
  vatAmounts["V-ED"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);

  vatAmounts["V-IM"] = sumVatAmounts(vatAmounts, ["V-IM","V-IM-BA","V-IM-REV","V-IM-EU","V-IM-ES"]);
  vatAmounts["V-NI"] = sumVatAmounts(vatAmounts, ["V-NI","V-NI-EU"]);
  vatAmounts["V"] = sumVatAmounts(vatAmounts, ["V-IM","V-NI","V-ES","V-NE","V-ED"]);

  // C = Corrispettivi
  vatCodes = findVatCodes(tableVatCodes, "Gr", "C-NVE");
  vatAmounts["C-NVE"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "C-VEN");
  vatAmounts["C-VEN"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "C-REG");
  vatAmounts["C-REG"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  //C-VEN non vengono sommati IN C perché devono essere registrati con il gruppo C-REG
  vatAmounts["C"] = sumVatAmounts(vatAmounts, ["C-NVE","C-REG"]);
  
  // A = Acquisti
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-IM-RI");
  vatAmounts["A-IM-RI"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-IM-BA");
  vatAmounts["A-IM-BA"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-IM-BN");
  vatAmounts["A-IM-BN"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-IM-AL");
  vatAmounts["A-IM-AL"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-IM-RI-REV");
  vatAmounts["A-IM-RI-REV"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-IM-RI-REV-S");
  vatAmounts["A-IM-RI-REV-S"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-IM-RI-EU");
  vatAmounts["A-IM-RI-EU"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-IM");
  vatAmounts["A-IM"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-NI-X");
  vatAmounts["A-NI-X"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-NI");
  vatAmounts["A-NI"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-ES");
  vatAmounts["A-ES"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-NE");
  vatAmounts["A-NE"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);
  vatCodes = findVatCodes(tableVatCodes, "Gr", "A-ED");
  vatAmounts["A-ED"] = Banana.document.vatCurrentBalance(vatCodes.join("|"), _startDate, _endDate);

  vatAmounts["A-IM"] = sumVatAmounts(vatAmounts, ["A-IM","A-IM-RI","A-IM-BA","A-IM-BN","A-IM-AL","A-IM-RI-REV","A-IM-RI-REV-S","A-IM-RI-EU"]);
  vatAmounts["A-NI"] = sumVatAmounts(vatAmounts, ["A-NI","A-NI-X"]);
  vatAmounts["A"] = sumVatAmounts(vatAmounts, ["A-IM","A-NI","A-ES","A-NE","A-ED"]);
  
  //Calcola la liquidazione prorata sugli acquisti se presente
  /* i soggetti che esercitano un’attività che dà luogo sia ad operazioni imponibili, per le quali è previsto il diritto alla detrazione dell’IVA sugli acquisti, 
  * sia ad operazioni esenti, per le quali, invece, *  non è previsto il diritto alla detrazione dell’IVA sugli acquisti, devono determinare, ai sensi del 
  * successivo art. 19-bis, il cosiddetto pro-rata generale di detraibilità. 
  * Esso rappresenta una percentuale da applicare al totale dell’IVA sugli acquisti,
  * che, determina l’ammontare di imposta detraibile
  */
  if (!Banana.SDecimal.isZero(param.datiContribuente.liqPercProrata)) {
    var percProrata = Banana.SDecimal.round(param.datiContribuente.liqPercProrata, {'decimals':2});
    var amountProrata = Banana.SDecimal.abs(vatAmounts["A"].vatPosted) * percProrata /100;
    amountProrata = Banana.SDecimal.roundNearest(amountProrata, '0.01');
    vatAmounts["A"].vatPosted = amountProrata;
  }

  //Liquidazione
  vatAmounts["L-AC"] = Banana.document.vatCurrentBalance("L-AC", _startDate, _endDate);
  vatAmounts["L-CI"] = Banana.document.vatCurrentBalance("L-CI", _startDate, _endDate);
  vatAmounts["L-CIA"] = Banana.document.vatCurrentBalance("L-CIA", _startDate, _endDate);
  vatAmounts["L-CO"] = Banana.document.vatCurrentBalance("L-CO", _startDate, _endDate);
  vatAmounts["L-INT"] = Banana.document.vatCurrentBalance("L-INT", _startDate, _endDate);
  vatAmounts["L-RI"] = Banana.document.vatCurrentBalance("L-RI", _startDate, _endDate);
  vatAmounts["L-SP"] = Banana.document.vatCurrentBalance("L-SP", _startDate, _endDate);

  //se periodo liquidazione corrisponde all'intero anno, include L-CIA (credito inizio anno), altrimenti include L-CI (credito iniziale)
  var isYear = false;
  if (param.accountingOpeningDate == _startDate && param.accountingClosureDate == _endDate)
    isYear = true;

  var emptyAmount = {
  vatAmount : 0,
  vatTaxable : 0,
  vatNotDeductible : 0,
  vatPosted : 0
  };
  if (isYear) {
    vatAmounts["L-CI"] = emptyAmount;
  }
  else {
    vatAmounts["L-CIA"] = emptyAmount;
  }

  // Get vat total for report
  vatAmounts["L"] = sumVatAmounts(vatAmounts, ["L-AC","L-CI","L-CIA","L-CO","L-INT","L-RI","L-SP"]);
  vatAmounts["Total"] = sumVatAmounts(vatAmounts, ["V","C","A","L"]);
  vatAmounts["TotalWithoutInterests"] = substractVatAmounts(vatAmounts["Total"], vatAmounts["L-INT"]);
  
  // Get vat total from Banana
  vatAmounts["BananaTotal"] = getVatTotalFromBanana(_startDate, _endDate);
  
  // Calculate difference in totals between report and Banana
  vatAmounts["difference"] = substractVatAmounts(vatAmounts["Total"], vatAmounts["BananaTotal"]);

  //Operazioni attive
  vatAmounts["OPATTIVE"] = sumVatAmounts(vatAmounts, ["V","C","L-CO","L-RI","L-SP"]);

  //Operazioni passive
  vatAmounts["OPPASSIVE"] = sumVatAmounts(vatAmounts, ["A"]);
  
  //Differenza operazioni
  vatAmounts["OPDIFFERENZA"] = sumVatAmounts(vatAmounts, ["OPATTIVE","OPPASSIVE"]);
  
  /* just for printing */
  vatAmounts["V-IM-BA"].style = "total4";
  vatAmounts["V-IM-REV"].style = "total4";
  vatAmounts["V-IM-EU"].style = "total4";
  vatAmounts["V-IM-ES"].style = "total4";
  vatAmounts["V-IM"].style = "total3";
  vatAmounts["V-NI-EU"].style = "total4";
  vatAmounts["V-NI"].style = "total3";
  vatAmounts["V-ES"].style = "total4";
  vatAmounts["V-NE"].style = "total4";
  vatAmounts["V-ED"].style = "total4";
  vatAmounts["V"].style = "total2";

  vatAmounts["C-NVE"].style = "total3";
  vatAmounts["C-VEN"].style = "total3";
  vatAmounts["C-REG"].style = "total3";
  vatAmounts["C"].style = "total2";
  
  vatAmounts["A-IM-RI"].style = "total4";
  vatAmounts["A-IM-BA"].style = "total4";
  vatAmounts["A-IM-BN"].style = "total4";
  vatAmounts["A-IM-AL"].style = "total4";
  vatAmounts["A-IM-RI-REV"].style = "total4";
  vatAmounts["A-IM-RI-REV-S"].style = "total4";
  vatAmounts["A-IM-RI-EU"].style = "total4";
  vatAmounts["A-IM"].style = "total3";
  vatAmounts["A-NI-X"].style = "total4";
  vatAmounts["A-NI"].style = "total3";
  vatAmounts["A-ES"].style = "total4";
  vatAmounts["A-NE"].style = "total4";
  vatAmounts["A-ED"].style = "total4";
  vatAmounts["A"].style = "total2";

  vatAmounts["L-AC"].style = "total3";
  vatAmounts["L-CI"].style = "total3";
  vatAmounts["L-CIA"].style = "total3";
  vatAmounts["L-INT"].style = "total3";
  vatAmounts["L"].style = "total2";

  vatAmounts["Total"].style = "total1";
  //vatAmounts["TotalDue"].style = "total1";
  vatAmounts["BananaTotal"].style = "total1";
  vatAmounts["difference"].style = "total4";

  vatAmounts.startDate = _startDate;
  vatAmounts.endDate = _endDate;
  vatAmounts.datiContribuente = {};
  vatAmounts.datiContribuente.liqTipoVersamento = param.datiContribuente.liqTipoVersamento;
  vatAmounts.datiContribuente.liqPercInteressi = param.datiContribuente.liqPercInteressi;
  vatAmounts.datiContribuente.liqPercProrata = param.datiContribuente.liqPercProrata;
  param.vatPeriods.push(vatAmounts);
  return param;
}

function printVatReport1(report, stylesheet, param) {

  //Period
  report.addParagraph("Periodo: " + Banana.Converter.toLocaleDateFormat(param.startDate) + " - " + Banana.Converter.toLocaleDateFormat(param.endDate), "period");
  
  //Print table
  var table = report.addTable("table1");
  var headerRow = table.getHeader().addRow();
  headerRow.addCell("Cod. IVA");
  headerRow.addCell("Imponibile", "amount");
  headerRow.addCell("Importo IVA", "amount");
  headerRow.addCell("IVA non deducibile", "amount");
  headerRow.addCell("IVA contabilizzata", "amount");

  //Print vat amounts
  for (var vatCode in param) {
    if (typeof param[vatCode] !== "object")
      continue;
    var sum = '';
    sum = Banana.SDecimal.add(sum, param[vatCode].vatTaxable);
    sum = Banana.SDecimal.add(sum, param[vatCode].vatAmount);
    sum = Banana.SDecimal.add(sum, param[vatCode].vatNotDeductible);
    sum = Banana.SDecimal.add(sum, param[vatCode].vatPosted);
    if (Banana.SDecimal.isZero(sum) || !param[vatCode].style)
      continue;
    var row = table.addRow();
    var description = vatCode;
    if (description == "A" && !Banana.SDecimal.isZero(param.datiContribuente.liqPercProrata))
      description += " (Prorata: " + Banana.SDecimal.round(param.datiContribuente.liqPercProrata, {'decimals':2}).toString() + "%)";
    row.addCell(description, "description " + param[vatCode].style);
    if (vatCode == "difference" || vatCode == "BananaTotal")
      row.addCell("","amount " + param[vatCode].style);
    else
      row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(param[vatCode].vatTaxable)), "amount " + param[vatCode].style);
    row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(param[vatCode].vatAmount)), "amount " + param[vatCode].style);
    row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(param[vatCode].vatNotDeductible)), "amount " + param[vatCode].style);
    row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.invert(param[vatCode].vatPosted)), "amount " + param[vatCode].style);
  }
}

function printVatReport2(report, stylesheet, param) {

  //Period
  report.addParagraph("Periodo: " + Banana.Converter.toLocaleDateFormat(param.startDate) + " - " + Banana.Converter.toLocaleDateFormat(param.endDate), "period");

  //Print table
  var table = report.addTable("table2");
  /*var headerRow = table.getHeader().addRow();
  headerRow.addCell("");
  headerRow.addCell("");
  headerRow.addCell("");
  headerRow.addCell("");*/

  //Print vat amounts
  var row = table.addRow();
  row.addCell("VP2");
  row.addCell("Totale operazioni attive (al netto dell'IVA)", "description");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(param["OPATTIVE"].vatTaxable)), "amount");
  row.addCell("");

  row = table.addRow();
  row.addCell("VP3");
  row.addCell("Totale operazioni passive (al netto dell'IVA)", "description");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(param["OPPASSIVE"].vatTaxable)), "amount");
  row.addCell("");

  row = table.addRow();
  row.addCell("VP4");
  row.addCell("IVA esigibile", "description");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(param["OPATTIVE"].vatPosted)), "amount");
  row.addCell("");
  
  row = table.addRow();
  row.addCell("VP5");
  var description = "IVA detratta";
  if (!Banana.SDecimal.isZero(param.datiContribuente.liqPercProrata))
    description = "IVA detratta (Prorata: " + Banana.SDecimal.round(param.datiContribuente.liqPercProrata, {'decimals':2}).toString() + "%)";
  row.addCell(description, "description");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(param["OPPASSIVE"].vatPosted)), "amount");
  row.addCell("");

  row = table.addRow();
  row.addCell("VP6");
  if (Banana.SDecimal.sign(param["OPDIFFERENZA"].vatPosted)<=0)
    row.addCell("IVA dovuta", "description");
  else
    row.addCell("IVA a credito", "description");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(param["OPDIFFERENZA"].vatPosted)), "amount");
  row.addCell("");
  
  row = table.addRow();
  row.addCell("VP7");
  row.addCell("Debito periodo precedente", "description");
  if (Banana.SDecimal.sign(param["L-CI"].vatPosted)<=0)
    row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(param["L-CI"].vatPosted)), "amount");
  else
    row.addCell("", "amount");
  row.addCell("");

  row = table.addRow();
  row.addCell("VP8");
  row.addCell("Credito periodo precedente", "description");
  if (Banana.SDecimal.sign(param["L-CI"].vatPosted)>=0)
    row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(param["L-CI"].vatPosted)), "amount");
  else
    row.addCell("", "amount");
  row.addCell("");

  row = table.addRow();
  row.addCell("VP9");
  row.addCell("Credito anno precedente", "description");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(param["L-CIA"].vatPosted)), "amount");
  row.addCell("");

  row = table.addRow();
  row.addCell("VP10");
  row.addCell("Versamenti auto UE", "description");
  row.addCell("", "amount");
  row.addCell("");

  row = table.addRow();
  row.addCell("VP11");
  row.addCell("Crediti d'imposta", "description");
  row.addCell("", "amount");
  row.addCell("");

  row = table.addRow();
  row.addCell("VP12");
  row.addCell("Interessi dovuti per liquidazioni trimestrali", "description");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(param["L-INT"].vatPosted)), "amount");
  /*propone interessi trimestrali se importo è diverso da quello visualizzato*/
  var amountInteressi = 0;
  if (param["L-INT"] && param["L-INT"].vatPosted)
    amountInteressi = Banana.SDecimal.abs(param["L-INT"].vatPosted);
  var amountInteressiCalcolati = 0;
  if (param.datiContribuente.liqTipoVersamento == 1)
    amountInteressiCalcolati = calculateInterestAmount(param);
  if (param.datiContribuente.liqTipoVersamento == 1 && amountInteressi != amountInteressiCalcolati) {
    var msg = getErrorMessage(ID_ERR_LIQUIDAZIONE_INTERESSI_DIFFERENTI);
    msg = msg.replace("%1", param.datiContribuente.liqPercInteressi );
    msg = msg.replace("%2", Banana.Converter.toLocaleNumberFormat(amountInteressiCalcolati) );
    row.addCell(msg, "amount warning");
  }
  else if (param.datiContribuente.liqTipoVersamento == 0 && amountInteressi != amountInteressiCalcolati)
    row.addCell(getErrorMessage(ID_ERR_LIQUIDAZIONE_INTERESSI_VERSAMENTO_MENSILE), "amount warning");
  else
    row.addCell("");

  row = table.addRow();
  row.addCell("VP13");
  row.addCell("Acconto dovuto", "description");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(param["L-AC"].vatPosted)), "amount");
  row.addCell("");

  row = table.addRow();
  row.addCell("VP14");
  if (Banana.SDecimal.sign(param["Total"].vatPosted)<=0)
    row.addCell("IVA da versare", "description");
  else
    row.addCell("IVA a credito", "description");
  row.addCell(Banana.Converter.toLocaleNumberFormat(Banana.SDecimal.abs(param["Total"].vatPosted)), "amount");
  row.addCell("");

}

function saveData(output, param) {
  var codiceFiscale = param.datiContribuente.codiceFiscale;
  if (codiceFiscale.length<=0)
    codiceFiscale = "99999999999";
  var fileName = "IT" + codiceFiscale + "_LI_" + param.comunicazioneProgressivo + ".xml";
  fileName = Banana.IO.getSaveFileName("Save as", fileName, "XML file (*.xml);;All files (*)")
  if (fileName.length) {
    var file = Banana.IO.getLocalFile(fileName)
    file.write(output);
    if (file.errorString) {
      Banana.Ui.showInformation("Write error", file.errorString);
    }
    else {
      Banana.IO.openUrl(fileName);
    }
  }
}
function setStyle(report, stylesheet) {
  if (!stylesheet) {
    stylesheet = report.newStyleSheet();
  }
  stylesheet.addStyle("@page", "size:portrait;margin:2em;margin-left:4em;font-size:12px; ");
  stylesheet.addStyle("phead", "font-weight: bold; margin-bottom: 1em");
  stylesheet.addStyle("thead", "font-weight: bold");
  stylesheet.addStyle("td", "padding-right: 1em;vertical-align:top;");
  
  stylesheet.addStyle(".amount", "text-align: right");
  stylesheet.addStyle(".center", "text-align: center");
  stylesheet.addStyle(".period", "font-size: 12px;font-weight: bold;padding-top: 2em;");
  stylesheet.addStyle(".warning", "color: red;font-size:8px;");
  stylesheet.addStyle(".total1", "border-bottom:1px double black;font-weight:bold;padding-top:10px;");
  stylesheet.addStyle(".total2", "border-bottom:1px double black;font-weight:bold;padding-top:10px;");
  stylesheet.addStyle(".total3", "border-bottom:1px solid black;padding-top:10px");
  stylesheet.addStyle(".total4", "padding-top:10px");
  stylesheet.addStyle("table.table1", "");
  stylesheet.addStyle("table.table2", "");
}

function substractVatAmounts(vatAmounts1, vatAmounts2) {
  var sum = {
  vatAmount : "",
  vatTaxable : "",
  vatNotDeductible : "",
  vatPosted : ""
  };

  sum.vatAmount = (+vatAmounts1.vatAmount - +vatAmounts2.vatAmount).toFixed(2);
  sum.vatTaxable = (+vatAmounts1.vatTaxable - +vatAmounts2.vatTaxable).toFixed(2);
  sum.vatNotDeductible = (+vatAmounts1.vatNotDeductible - +vatAmounts2.vatNotDeductible).toFixed(2);
  sum.vatPosted = (+vatAmounts1.vatPosted - +vatAmounts2.vatPosted).toFixed(2);

  return sum;
}

function sumVatAmounts(vatAmounts, codesToSum) {
  var sum = {
  vatAmount : "",
  vatTaxable : "",
  vatNotDeductible : "",
  vatPosted : ""
  };

  for (var i=0; i<codesToSum.length; i++) {
  codeAmounts = vatAmounts[codesToSum[i]];
  if (codeAmounts === undefined) {
    var msg = getErrorMessage(ID_ERR_CODICI_ND);
    msg = msg.replace("%1", codesToSum );
    Banana.document.addMessage( msg, ID_ERR_CODICI_ND);
    continue;
  }
  // Javascript note: the sign '+' in '+codeAmounts.vatAmount' is used to convert a string in a number
  sum.vatAmount = (+sum.vatAmount + +codeAmounts.vatAmount).toFixed(2);
  sum.vatTaxable = (+sum.vatTaxable + +codeAmounts.vatTaxable).toFixed(2);
  sum.vatNotDeductible = (+sum.vatNotDeductible + +codeAmounts.vatNotDeductible).toFixed(2);
  sum.vatPosted = (+sum.vatPosted + +codeAmounts.vatPosted).toFixed(2);
  }

  return sum;
}

function verifyParam(param) {
  if (!param.comunicazioneProgressivo)
    param.comunicazioneProgressivo = '';
  if (!param.comunicazioneCFDichiarante)
    param.comunicazioneCFDichiarante = '';
  if (!param.comunicazioneCodiceCaricaDichiarante)
    param.comunicazioneCodiceCaricaDichiarante = '';
  if (!param.comunicazioneCFIntermediario)
    param.comunicazioneCFIntermediario = '';
  if (!param.comunicazioneImpegno)
    param.comunicazioneImpegno = '';
  if (!param.comunicazioneImpegnoData)
    param.comunicazioneImpegnoData = '';
  if (!param.comunicazioneFirmaDichiarazione)
    param.comunicazioneFirmaDichiarazione = false;
  if (!param.comunicazioneFirmaIntermediario)
    param.comunicazioneFirmaIntermediario = false;
  if (!param.comunicazioneUltimoMese)
    param.comunicazioneUltimoMese = '';

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
  
  if (!param.outputScript)
    param.outputScript = 0;

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
