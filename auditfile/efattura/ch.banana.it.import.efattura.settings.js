// Copyright [2026] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.it.import.efattura.settings
// @api = 1.0
// @pubdate = 2026-10-11
// @publisher = Banana.ch SA
// @description = Impostazioni...
// @description.it = Impostazioni...
// @doctype = *
// @task = app.command
// @inputdatasource = none
// @timeout = -1

function exec(inData, options) {
    if (!Banana.document)
    return false;

  return settingsDialog();
}

/*
 * Metodo chiamato per aggiornare i parametri dell'estensione Importazione documenti fiscali italiani
*/
function settingsDialog() {
    if (!Banana.document)
        return false;

    var parametriImportazione = new ParametriImportazione(Banana.document);
    parametriImportazione.readParam();
}

function ParametriImportazione(banDocument) {
  this.banDocument = banDocument;
  if (this.banDocument === undefined)
    this.banDocument = Banana.document;
  this.initParam();
}

ParametriImportazione.prototype.getParam = function() {
  return this.param;
}

ParametriImportazione.prototype.initParam = function() {
  this.param = {};

}

ParametriImportazione.prototype.readParam = function() {
  this.param = {};
  var savedParam = this.banDocument.getScriptSettings("ch.banana.it.import.efattura");
  if (savedParam.length > 0)
    this.param = JSON.parse(savedParam);

  this.verifyParam();
  return this.param;
}

ParametriImportazione.prototype.setParam = function(param) {
  this.param = param;
  this.verifyParam();
}

ParametriImportazione.prototype.verifyParam = function() {
    if (!this.param)
        this.param = {};
}

ParametriImportazione.prototype.writeParam = function() {
  var paramToString = JSON.stringify(this.param);
  this.banDocument.setScriptSettings("ch.banana.it.import.efattura", paramToString);
}
