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
// @id = ch.banana.script.italy_vat.daticontribuente.js
// @description = Dati contribuente...
// @doctype = 100.110;110.110;130.110;100.130
// @encoding = utf-8
// @includejs = ch.banana.script.italy_vat_2017.journal.js
// @includejs = ch.banana.script.italy_vat_2017.xml.js
// @inputdatasource = none
// @pubdate = 2018-02-15
// @publisher = Banana.ch SA
// @task = app.command
// @timeout = -1

function exec() {
  if (!Banana.document)
    return false;

  return settingsDialog();
}

/*
 * Metodo chiamato per aggiornare i parametri dello script (dati contribuente)
*/
function settingsDialog() {

  var datiContribuente = new DatiContribuente(Banana.document);
  var savedParam = Banana.document.getScriptSettings();
  if (savedParam.length > 0) {
    datiContribuente.setParam(JSON.parse(savedParam));
  }
  
  var dialog = Banana.Ui.createUi("ch.banana.script.italy_vat.daticontribuente.dialog.ui");
  //Dati anagrafici
  var tipoContribuenteComboBox = dialog.tabWidget.findChild('tipoContribuenteComboBox');
  if (tipoContribuenteComboBox)
    tipoContribuenteComboBox.currentIndex = datiContribuente.param.tipoContribuente;
  var codicefiscaleLineEdit = dialog.tabWidget.findChild('codicefiscaleLineEdit');
  if (codicefiscaleLineEdit)
    codicefiscaleLineEdit.text = datiContribuente.param.codiceFiscale;
  var partitaivaLineEdit = dialog.tabWidget.findChild('partitaivaLineEdit');
  if (partitaivaLineEdit)
    partitaivaLineEdit.text = datiContribuente.param.partitaIva;
  var codiceattivitaLineEdit = dialog.tabWidget.findChild('codiceattivitaLineEdit');
  if (codiceattivitaLineEdit)
    codiceattivitaLineEdit.text = datiContribuente.param.codiceAttivita;
  var societaLineEdit = dialog.tabWidget.findChild('societaLineEdit');
  if (societaLineEdit)
    societaLineEdit.text = datiContribuente.param.societa;
  var cognomeLineEdit = dialog.tabWidget.findChild('cognomeLineEdit');
  if (cognomeLineEdit)
    cognomeLineEdit.text = datiContribuente.param.cognome;
  var nomeLineEdit = dialog.tabWidget.findChild('nomeLineEdit');
  if (nomeLineEdit)
    nomeLineEdit.text = datiContribuente.param.nome;
  var indirizzoLineEdit = dialog.tabWidget.findChild('indirizzoLineEdit');
  if (indirizzoLineEdit)
    indirizzoLineEdit.text = datiContribuente.param.indirizzo;
  var ncivicoLineEdit = dialog.tabWidget.findChild('ncivicoLineEdit');
  if (ncivicoLineEdit)
    ncivicoLineEdit.text = datiContribuente.param.ncivico;
  var capLineEdit = dialog.tabWidget.findChild('capLineEdit');
  if (capLineEdit)
    capLineEdit.text = datiContribuente.param.cap;
  var comuneLineEdit = dialog.tabWidget.findChild('comuneLineEdit');
  if (comuneLineEdit)
    comuneLineEdit.text = datiContribuente.param.comune;
  var provinciaComboBox = dialog.tabWidget.findChild('provinciaComboBox');
  if (provinciaComboBox)
    provinciaComboBox.currentText = datiContribuente.param.provincia;
  var nazioneComboBox = dialog.tabWidget.findChild('nazioneComboBox');
    nazioneComboBox.currentIndex = 0;
  var telefonoLineEdit = dialog.tabWidget.findChild('telefonoLineEdit');
  if (telefonoLineEdit)
    telefonoLineEdit.text = datiContribuente.param.telefono;
  var faxLineEdit = dialog.tabWidget.findChild('faxLineEdit');
  if (faxLineEdit)
    faxLineEdit.text = datiContribuente.param.fax;
  var emailLineEdit = dialog.tabWidget.findChild('emailLineEdit');
  if (emailLineEdit)
    emailLineEdit.text = datiContribuente.param.email;
  //Dati IVA
  var tipoversamentoComboBox = dialog.tabWidget.findChild('tipoversamentoComboBox');
  if (tipoversamentoComboBox)
    tipoversamentoComboBox.currentIndex = datiContribuente.param.liqTipoVersamento;
  var percinteressiDoubleSpinBox = dialog.tabWidget.findChild('percinteressiDoubleSpinBox');
  if (percinteressiDoubleSpinBox) {
    if (datiContribuente.param.liqPercInteressi.length>0)
      percinteressiDoubleSpinBox.value = parseFloat(datiContribuente.param.liqPercInteressi);
    else  
      percinteressiDoubleSpinBox.value = 0;
  }
  var ivaprorataDoubleSpinBox = dialog.tabWidget.findChild('ivaprorataDoubleSpinBox');
  if (ivaprorataDoubleSpinBox) {
    if (datiContribuente.param.liqPercProrata.length>0)
      ivaprorataDoubleSpinBox.value = parseFloat(datiContribuente.param.liqPercProrata);
    else  
      ivaprorataDoubleSpinBox.value = 0;
  }
  //Numeri conto corrispettivi
  var fatturenormaliLineEdit = dialog.tabWidget.findChild('fatturenormaliLineEdit');
  if (fatturenormaliLineEdit)
    fatturenormaliLineEdit.text = datiContribuente.param.contoFattureNormali;
  var fatturefiscaliLineEdit = dialog.tabWidget.findChild('fatturefiscaliLineEdit');
  if (fatturefiscaliLineEdit)
    fatturefiscaliLineEdit.text = datiContribuente.param.contoFattureFiscali;
  var fatturescontriniLineEdit = dialog.tabWidget.findChild('fatturescontriniLineEdit');
  if (fatturescontriniLineEdit)
    fatturescontriniLineEdit.text = datiContribuente.param.contoFattureScontrini;
  var fatturedifferiteLineEdit = dialog.tabWidget.findChild('fatturedifferiteLineEdit');
  if (fatturedifferiteLineEdit)
    fatturedifferiteLineEdit.text = datiContribuente.param.contoFattureDifferite;
  var corrispettivinormaliLineEdit = dialog.tabWidget.findChild('corrispettivinormaliLineEdit');
  if (corrispettivinormaliLineEdit)
    corrispettivinormaliLineEdit.text = datiContribuente.param.contoCorrispettiviNormali;
  var corrispettiviscontriniLineEdit = dialog.tabWidget.findChild('corrispettiviscontriniLineEdit');
  if (corrispettiviscontriniLineEdit)
    corrispettiviscontriniLineEdit.text = datiContribuente.param.contoCorrispettiviScontrini;
  var ricevutefiscaliLineEdit = dialog.tabWidget.findChild('ricevutefiscaliLineEdit');
  if (ricevutefiscaliLineEdit)
    ricevutefiscaliLineEdit.text = datiContribuente.param.contoRicevuteFiscali;

  //dialog functions
  dialog.checkdata = function () {
    dialog.accept();
  }
  dialog.enableButtons = function () {
    if (tipoContribuenteComboBox.currentIndex == 0) {
        societaLineEdit.enabled = false;
        cognomeLineEdit.enabled = true;
        nomeLineEdit.enabled = true;
    }
    else {
        societaLineEdit.enabled = true;
        cognomeLineEdit.enabled = false;
        nomeLineEdit.enabled = false;
    }
  }
  dialog.showHelp = function () {
    Banana.Ui.showHelp("ch.banana.script.italy_vat_2017");
  }
  dialog.buttonBox.accepted.connect(dialog, dialog.checkdata);
  dialog.buttonBox.helpRequested.connect(dialog, dialog.showHelp);
  if (tipoContribuenteComboBox['currentIndexChanged(QString)'])
     tipoContribuenteComboBox['currentIndexChanged(QString)'].connect(dialog, dialog.enableButtons);
  else
     tipoContribuenteComboBox.currentIndexChanged.connect(dialog, dialog.enableButtons);
  
  //Visualizzazione dialogo
  Banana.application.progressBar.pause();
  dialog.enableButtons();
  var dlgResult = dialog.exec();
  Banana.application.progressBar.resume();
  if (dlgResult !== 1)
    return false;

  //Salvataggio dati
  //Dati anagrafici
  if (tipoContribuenteComboBox)
    datiContribuente.param.tipoContribuente = parseInt(tipoContribuenteComboBox.currentIndex.toString());
  if (codicefiscaleLineEdit)
    datiContribuente.param.codiceFiscale = codicefiscaleLineEdit.text;
  if (partitaivaLineEdit)
    datiContribuente.param.partitaIva = partitaivaLineEdit.text;
  if (codiceattivitaLineEdit)
    datiContribuente.param.codiceAttivita = codiceattivitaLineEdit.text;
  if (societaLineEdit)
    datiContribuente.param.societa = societaLineEdit.text;
  if (cognomeLineEdit)
    datiContribuente.param.cognome = cognomeLineEdit.text;
  if (nomeLineEdit)
    datiContribuente.param.nome = nomeLineEdit.text;
  if (indirizzoLineEdit)
    datiContribuente.param.indirizzo = indirizzoLineEdit.text;
  if (ncivicoLineEdit)
    datiContribuente.param.ncivico = ncivicoLineEdit.text;
  if (capLineEdit)
    datiContribuente.param.cap = capLineEdit.text;
  if (comuneLineEdit)
    datiContribuente.param.comune = comuneLineEdit.text;
  if (provinciaComboBox)
    datiContribuente.param.provincia = provinciaComboBox.currentText;
  if (nazioneComboBox)
    datiContribuente.param.nazione = 'IT';
  if (telefonoLineEdit)
    datiContribuente.param.telefono = telefonoLineEdit.text;
  if (faxLineEdit)
    datiContribuente.param.fax = faxLineEdit.text;
  if (emailLineEdit)
    datiContribuente.param.email = emailLineEdit.text;
  //Dati IVA
  if (tipoversamentoComboBox)
    datiContribuente.param.liqTipoVersamento = parseInt(tipoversamentoComboBox.currentIndex.toString());
  if (percinteressiDoubleSpinBox)
      datiContribuente.param.liqPercInteressi = percinteressiDoubleSpinBox.value.toString();
  if (ivaprorataDoubleSpinBox)
      datiContribuente.param.liqPercProrata = ivaprorataDoubleSpinBox.value.toString();
  //Numeri conto corrispettivi
  if (fatturenormaliLineEdit)
    datiContribuente.param.contoFattureNormali = fatturenormaliLineEdit.text;
  if (fatturefiscaliLineEdit)
    datiContribuente.param.contoFattureFiscali = fatturefiscaliLineEdit.text;
  if (fatturescontriniLineEdit)
    datiContribuente.param.contoFattureScontrini = fatturescontriniLineEdit.text;
  if (fatturedifferiteLineEdit)
    datiContribuente.param.contoFattureDifferite = fatturedifferiteLineEdit.text;
  if (corrispettivinormaliLineEdit)
    datiContribuente.param.contoCorrispettiviNormali = corrispettivinormaliLineEdit.text;
  if (corrispettiviscontriniLineEdit)
    datiContribuente.param.contoCorrispettiviScontrini = corrispettiviscontriniLineEdit.text;
  if (ricevutefiscaliLineEdit)
    datiContribuente.param.contoRicevuteFiscali = ricevutefiscaliLineEdit.text;

  var paramToString = JSON.stringify(datiContribuente.param);
  Banana.document.setScriptSettings("ch.banana.script.italy_vat.daticontribuente.js", paramToString);
  return true;
}

function DatiContribuente(banDocument) {
  this.banDocument = banDocument;
  if (this.banDocument === undefined)
    this.banDocument = Banana.document;
  this.initParam();
}


/*
 * Ritorna il conto che ha come descrizione accountDes
 * Serve per proporre i conti corrispettivi predefiniti 
 * 
 */
DatiContribuente.prototype.matchContoCorrispettivi = function(accountDes) {
  if (!this.banDocument || accountDes.length<=0)
    return '';

  var search = accountDes.toLowerCase();

  var table = this.banDocument.table('Accounts');
  if (table) {
    for (var i = 0; i < table.rowCount; i++) {
      var tRow = table.row(i);
      var accountId = tRow.value("Account");
      if (accountId.length<=0)
        continue;
      var currentDes = tRow.value("Description").toLowerCase();
      if (currentDes.length<=0)
        continue;
      currentDes = currentDes.replace("  ", " ");
      if (currentDes.indexOf(search)>=0)
        return accountId;
    }
  }
  return '';
}

DatiContribuente.prototype.getParam = function() {
  return this.param;
}

DatiContribuente.prototype.initParam = function() {
  this.param = {};

  //Dati contribuente
  this.param.tipoContribuente = 0;
  this.param.codiceFiscale = '';
  this.param.partitaIva = '';
  this.param.codiceAttivita = '';
  this.param.societa = '';
  this.param.cognome = '';
  this.param.nome = '';
  this.param.indirizzo = '';
  this.param.ncivico = '';
  this.param.cap = '';
  this.param.comune = '';
  this.param.provincia = '';
  this.param.nazione = 'IT';
  this.param.telefono = '';
  this.param.fax = '';
  this.param.email = '';
  //Tipo versamento liqTipoVersamento == 0 mensile ==1 trimestrale
  this.param.liqTipoVersamento = '';
  this.param.liqPercInteressi = '';
  this.param.liqPercProrata = '';

  //Conti corrispettivi
  //Se tutti i corrispettivi sono vuoti propone i conti trovati nella tabella conti
  this.param.contoFattureNormali = '';
  this.param.contoFattureFiscali = '';
  this.param.contoFattureScontrini = '';
  this.param.contoFattureDifferite = '';
  this.param.contoCorrispettiviNormali = '';
  this.param.contoCorrispettiviScontrini = '';
  this.param.contoRicevuteFiscali = '';

}

DatiContribuente.prototype.loadParam = function() {
  this.param = {};
  var savedParam = this.banDocument.getScriptSettings("ch.banana.script.italy_vat.daticontribuente.js");
  if (savedParam.length > 0)
    this.param = JSON.parse(savedParam);
  this.verifyParam();
  return this.param;
}

DatiContribuente.prototype.setParam = function(param) {
  this.param = param;
  this.verifyParam();
}

DatiContribuente.prototype.verifyParam = function() {
  if (!this.param.tipoContribuente)
    this.param.tipoContribuente = 0;
  if (!this.param.codiceFiscale)
    this.param.codiceFiscale = '';
  if (!this.param.partitaIva)
    this.param.partitaIva = '';
  if (!this.param.codiceAttivita)
    this.param.codiceAttivita = '';
  if (!this.param.societa)
    this.param.societa = '';
  if (!this.param.cognome)
    this.param.cognome = '';
  if (!this.param.nome)
    this.param.nome = '';
  if (!this.param.indirizzo)
    this.param.indirizzo = '';
  if (!this.param.ncivico)
    this.param.ncivico = '';
  if (!this.param.cap)
    this.param.cap = '';
  if (!this.param.comune)
    this.param.comune = '';
  if (!this.param.provincia)
    this.param.provincia = '';
  if (!this.param.nazione)
    this.param.nazione = 'IT';
  if (!this.param.telefono)
    this.param.telefono = '';
  if (!this.param.fax)
    this.param.fax = '';
  if (!this.param.email)
    this.param.email = '';
  if (!this.param.liqTipoVersamento)
    this.param.liqTipoVersamento = '';
  if (!this.param.liqPercInteressi)
    this.param.liqPercInteressi = '';
  if (!this.param.liqPercProrata)
    this.param.liqPercProrata = '';
  if (!this.param.contoFattureNormali)
    this.param.contoFattureNormali = this.matchContoCorrispettivi("fatture normali");
  if (!this.param.contoFattureFiscali)
    this.param.contoFattureFiscali = this.matchContoCorrispettivi("fatture fiscali");
  if (!this.param.contoFattureScontrini)
    this.param.contoFattureScontrini = this.matchContoCorrispettivi("fatture scontrini");
  if (!this.param.contoFattureDifferite)
    this.param.contoFattureDifferite = this.matchContoCorrispettivi("fatture differite");
  if (!this.param.contoCorrispettiviNormali)
    this.param.contoCorrispettiviNormali = this.matchContoCorrispettivi("corrispettivi normali");
  if (!this.param.contoCorrispettiviScontrini)
    this.param.contoCorrispettiviScontrini = this.matchContoCorrispettivi("corrispettivi scontrini");
  if (!this.param.contoRicevuteFiscali)
    this.param.contoRicevuteFiscali = this.matchContoCorrispettivi("ricevute fiscali");
}

