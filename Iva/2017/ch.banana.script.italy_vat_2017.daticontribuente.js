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
// @id = ch.banana.script.italy_vat_2017.daticontribuente.js
// @description = IVA Italia 2017: Dati contribuente...
// @doctype = *;110
// @encoding = utf-8
// @includejs = ch.banana.script.italy_vat_2017.journal.js
// @includejs = ch.banana.script.italy_vat_2017.xml.js
// @inputdatasource = none
// @pubdate = 2017-07-31
// @publisher = Banana.ch SA
// @task = app.command
// @timeout = -1

/*
 * Metodo chiamato per aggiornare i parametri dello script (dati contribuente)
*/
function settingsDialog() {

  var param = initParam();
  var savedParam = Banana.document.getScriptSettings("ch.banana.script.italy_vat_2017.daticontribuente.js");
  if (savedParam.length > 0) {
    param = JSON.parse(savedParam);
  }
  param = verifyParam(param);
  
  var accountingData = {};
  accountingData = readAccountingData(accountingData);
  if (accountingData.accountingYear.length<=0) {
    return false;
  }

  var dialog = Banana.Ui.createUi("ch.banana.script.italy_vat_2017.daticontribuente.dialog.ui");
  
  //Dati anagrafici
  var tipoContribuenteComboBox = dialog.tabWidget.findChild('tipoContribuenteComboBox');
  if (tipoContribuenteComboBox)
    tipoContribuenteComboBox.currentIndex = param.tipoContribuente;
  var codicefiscaleLineEdit = dialog.tabWidget.findChild('codicefiscaleLineEdit');
  if (codicefiscaleLineEdit)
    codicefiscaleLineEdit.text = param.codiceFiscale;
  var partitaivaLineEdit = dialog.tabWidget.findChild('partitaivaLineEdit');
  if (partitaivaLineEdit)
    partitaivaLineEdit.text = param.partitaIva;
  var codiceattivitaLineEdit = dialog.tabWidget.findChild('codiceattivitaLineEdit');
  if (codiceattivitaLineEdit)
    codiceattivitaLineEdit.text = param.codiceAttivita;
  var cognomeLineEdit = dialog.tabWidget.findChild('cognomeLineEdit');
  if (cognomeLineEdit)
    cognomeLineEdit.text = param.cognome;
  var nomeLineEdit = dialog.tabWidget.findChild('nomeLineEdit');
  if (nomeLineEdit)
    nomeLineEdit.text = param.nome;
  var sessoComboBox = dialog.tabWidget.findChild('sessoComboBox');
  if (sessoComboBox)
    sessoComboBox.currentIndex = param.sesso;
  var dataNascita = Banana.Converter.stringToDate(param.dataNascita, "YYYY-MM-DD");
  var datanascitaDateEdit = dialog.tabWidget.findChild('datanascitaDateEdit');
  if (datanascitaDateEdit)
    datanascitaDateEdit.setDate = dataNascita;
  var comunenascitaLineEdit = dialog.tabWidget.findChild('comunenascitaLineEdit');
  if (comunenascitaLineEdit)
    comunenascitaLineEdit.text = param.comuneNascita;
  var provincianascitaLineEdit = dialog.tabWidget.findChild('provincianascitaLineEdit');
  if (provincianascitaLineEdit)
    provincianascitaLineEdit.text = param.provinciaNascita;
  var societaLineEdit = dialog.tabWidget.findChild('societaLineEdit');
  if (societaLineEdit)
    societaLineEdit.text = param.societa;
  var localitaLineEdit = dialog.tabWidget.findChild('localitaLineEdit');
  if (localitaLineEdit)
    localitaLineEdit.text = param.comuneSedeLegale;
  var provinciaLineEdit = dialog.tabWidget.findChild('provinciaLineEdit');
  if (provinciaLineEdit)
    provinciaLineEdit.text = param.provinciaSedeLegale;
  var telefonoLineEdit = dialog.tabWidget.findChild('telefonoLineEdit');
  if (telefonoLineEdit)
    telefonoLineEdit.text = param.telefono;
  var faxLineEdit = dialog.tabWidget.findChild('faxLineEdit');
  if (faxLineEdit)
    faxLineEdit.text = param.fax;
  var emailLineEdit = dialog.tabWidget.findChild('emailLineEdit');
  if (emailLineEdit)
    emailLineEdit.text = param.email;
  //Dati IVA
  var tipoversamentoComboBox = dialog.tabWidget.findChild('tipoversamentoComboBox');
  if (tipoversamentoComboBox)
    tipoversamentoComboBox.currentIndex = param.liqTipoVersamento;
  var percinteressiDoubleSpinBox = dialog.tabWidget.findChild('percinteressiDoubleSpinBox');
  if (percinteressiDoubleSpinBox) {
    if (param.liqPercInteressi.length>0)
      percinteressiDoubleSpinBox.value = parseInt(param.liqPercInteressi);
    else  
      percinteressiDoubleSpinBox.value = 0;
  }
  //dialog.tabWidget.tab_2.ivaprorataDoubleSpinBox.value = parseInt(param.liqPercProrata);
  
  //Numeri conto corrispettivi
  /*dialog.tabWidget.tab_2.groupBox_2.fatturenormaliComboBox.currentIndex = param.contoFattureNormali;
  dialog.tabWidget.tab_2.groupBox_2.fatturefiscaliComboBox.currentIndex = param.contoFattureFiscali;
  dialog.tabWidget.tab_2.groupBox_2.fatturescontriniComboBox.currentIndex = param.contoFattureScontrini;
  dialog.tabWidget.tab_2.groupBox_2.fatturedifferiteComboBox.currentIndex = param.contoFattureDifferite;
  dialog.tabWidget.tab_2.groupBox_2.corrispettivinormaliComboBox.currentIndex = param.contoCorrispettiviNormali;
  dialog.tabWidget.tab_2.groupBox_2.corrispettiviscontriniComboBox.currentIndex = param.contoCorrispettiviScontrini;
  dialog.tabWidget.tab_2.groupBox_2.ricevutefiscaliComboBox.currentIndex = param.contoRicevuteFiscali;*/


  //dialog functions
  dialog.checkdata = function () {
    dialog.accept();
  }
  dialog.showHelp = function () {
    Banana.Ui.showHelp("ch.banana.script.italy_vat_2017");
  }
  dialog.buttonBox.accepted.connect(dialog, "checkdata");
  dialog.buttonBox.helpRequested.connect(dialog, "showHelp");
  
  //Visualizzazione dialogo
  Banana.application.progressBar.pause();
  var dlgResult = dialog.exec();
  Banana.application.progressBar.resume();
  if (dlgResult !== 1)
    return false;

  //Salvataggio dati
  //Dati anagrafici
  if (tipoContribuenteComboBox)
    param.tipoContribuente = tipoContribuenteComboBox.currentIndex.toString();
  if (codicefiscaleLineEdit)
    param.codiceFiscale = codicefiscaleLineEdit.text;
  if (partitaivaLineEdit)
    param.partitaIva = partitaivaLineEdit.text;
  if (codiceattivitaLineEdit)
    param.codiceAttivita = codiceattivitaLineEdit.text;
  if (cognomeLineEdit)
    param.cognome = cognomeLineEdit.text;
  if (nomeLineEdit)
    param.nome = nomeLineEdit.text;
  if (sessoComboBox)
    param.sesso = sessoComboBox.currentIndex.toString();
  if (datanascitaDateEdit) {
    var dataNascita = datanascitaDateEdit.text;
    param.dataNascita = Banana.Converter.toInternalDateFormat(dataNascita);
  }
  if (comunenascitaLineEdit)
    param.comuneNascita = comunenascitaLineEdit.text;
  if (provincianascitaLineEdit)
    param.provinciaNascita = provincianascitaLineEdit.text;
  if (societaLineEdit)
    param.societa = societaLineEdit.text;
  if (localitaLineEdit)
    param.comuneSedeLegale = localitaLineEdit.text;
  if (provinciaLineEdit)
    param.provinciaSedeLegale = provinciaLineEdit.text;
  if (telefonoLineEdit)
    param.telefono = telefonoLineEdit.text;
  if (faxLineEdit)
    param.fax = faxLineEdit.text;
  if (emailLineEdit)
    param.email = emailLineEdit.text;
  //Dati IVA
  if (tipoversamentoComboBox)
    param.liqTipoVersamento = parseInt(tipoversamentoComboBox.currentIndex.toString());
  if (percinteressiDoubleSpinBox)
      param.liqPercInteressi = percinteressiDoubleSpinBox.value.toString();

  var paramToString = JSON.stringify(param);
  Banana.document.setScriptSettings("ch.banana.script.italy_vat_2017.daticontribuente.js", paramToString);
  return true;
}

function exec() {

  if (!Banana.document)
    return false;

  return settingsDialog();
}

function initParam(param)
{
  if (!param)
    param = {};

  //Dati contribuente
  param.tipoContribuente = 0;
  param.codiceFiscale = '';
  param.partitaIva = '';
  param.codiceAttivita = '';
  param.cognome = '';
  param.nome = '';
  param.sesso = '';
  param.dataNascita = '';
  param.comuneNascita = '';
  param.provinciaNascita = '';
  param.societa = '';
  param.comuneSedeLegale = '';
  param.provinciaSedeLegale = '';
  param.telefono = '';
  param.fax = '';
  param.email = '';
  param.liqPercInteressi = '';
  param.liqTipoVersamento = '';
  //param.liqPercProrata = '';

  //Conti corrispettivi
  /*param.contoFattureNormali = '';
  param.contoFattureFiscali = '';
  param.contoFattureScontrini = '';
  param.contoFattureDifferite = '';
  param.contoCorrispettiviNormali = '';
  param.contoCorrispettiviScontrini = '';
  param.contoRicevuteFiscali = '';*/

  return param;
}

function verifyParam(param) {
  if (!param)
    param = {};
  if (!param.tipoContribuente)
    param.tipoContribuente = 0;
  if (!param.codiceFiscale)
    param.codiceFiscale = '';
  if (!param.partitaIva)
    param.partitaIva = '';
  if (!param.codiceAttivita)
    param.codiceAttivita = '';
  if (!param.cognome)
    param.cognome = '';
  if (!param.nome)
    param.nome = '';
  if (!param.sesso)
    param.sesso = '';
  if (!param.dataNascita)
    param.dataNascita = '';
  if (!param.comuneNascita)
    param.comuneNascita = '';
  if (!param.provinciaNascita)
    param.provinciaNascita = '';
  if (!param.societa)
    param.societa = '';
  if (!param.comuneSedeLegale)
    param.comuneSedeLegale = '';
  if (!param.provinciaSedeLegale)
    param.provinciaSedeLegale = '';
  if (!param.telefono)
    param.telefono = '';
  if (!param.fax)
    param.fax = '';
  if (!param.email)
    param.email = '';
  if (!param.liqPercInteressi)
    param.liqPercInteressi = '';
  if (!param.liqTipoVersamento)
    param.liqTipoVersamento = '';
  /*if (!param.liqPercProrata)
    param.liqPercProrata = '';
  if (!param.contoFattureNormali)
    param.contoFattureNormali = '';
  if (!paramcontoFattureFiscali
    param.contoFattureFiscali = '';
  if (!param.contoFattureScontrini)
    param.contoFattureScontrini = '';
  if (!param.contoFattureDifferite)
    param.contoFattureDifferite = '';
  if (!param.contoCorrispettiviNormali)
    param.contoCorrispettiviNormali = '';
  if (!param.contoCorrispettiviScontrini)
    param.contoCorrispettiviScontrini = '';
  if (!param.contoRicevuteFiscali)
    param.contoRicevuteFiscali = '';*/
  
  return param;
}

