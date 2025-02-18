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
// @id = ch.banana.it.efattura.contribuente
// @api = 1.0
// @pubdate = 2021-02-10
// @publisher = Banana.ch SA
// @description = Impostazioni...
// @description.it = Impostazioni...
// @doctype = *
// @task = app.command
// @inputdatasource = none
// @timeout = -1
// @includejs = ch.banana.it.efattura.b2b.js

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
        param = JSON.parse(Banana.document.getScriptSettings("efatturaXMLItalia"));
    }
    else {
        if (!settingsDialog())
            return "@Cancel";
        param = JSON.parse(Banana.document.getScriptSettings("efatturaXMLItalia"));
    }
}

/*Update script's parameters*/
function settingsDialog() {
    var eFattura = new EFattura(Banana.document);
    if (!eFattura.verifyBananaVersion())
        return false;

    var savedParam = Banana.document.getScriptSettings("efatturaXMLItalia");
    if (savedParam.length > 0) {
        eFattura.setParam(JSON.parse(savedParam));
    }

    var dialogTitle = 'Settings';
    var pageAnchor = 'dlgSettings';
    var convertedParam = eFattura.convertParam(eFattura.param, false);
    if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor))
        return false;
    for (var i = 0; i < convertedParam.data.length; i++) {
        // Read values to param (through the readValue function)
        if (typeof (convertedParam.data[i].readValue) !== 'undefined')
            convertedParam.data[i].readValue();
    }
    var paramToString = JSON.stringify(eFattura.param);
    Banana.document.setScriptSettings("efatturaXMLItalia", paramToString);
    return true;
}