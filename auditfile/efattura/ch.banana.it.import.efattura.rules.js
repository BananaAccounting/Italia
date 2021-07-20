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

function ImportRules(banDocument) {
    this.banDocument = banDocument;
    if (this.banDocument === undefined)
        this.banDocument = Banana.document;
}

ImportRules.prototype.getEmptyRule = function () {
    /*let rule = {
        "ruleName" : "CPL",
        "ruleDescription" : "contropartita 4100 pagamenti CPL",
        "transactionType" : "MoneyOut",
        "bankAccount" : "ALL",
        "conditions" : [
          {
            "in":["pattinaggio", {"var":"description"}]
          }
        ],
        "expense" : "4100",
        "payee" : ";CPL"
    };*/
    let rule = {
        "ruleName": "CPL",
        "ruleDescription": "contropartita 4100 pagamenti CPL",
        "ruleConditions": [
            { "column": "description", "condition": "contains", "value": "CPL" },
            { "column": "account", "condition": "equal", "value": "1020" }
        ],
        "isAndRule": true,
        "ruleActions": [
            { "action": "update", "column": "accountDebit", "value": "4000" },
            { "action": "update", "column": "vatCode", "value": "V0" }
        ]
    };
    return rule;
}

ImportRules.prototype.loadRules = function (filename) {
    if (!filename)
        return '';

    //se il nome del file xsd non contiene il percorso, aggiunge il percorso dove è salvato il file contabile
    /*if (filename.indexOf("/") < 0) {
        var filePath = this.banDocument.info("Base", "FileName");
        var pos = filePath.lastIndexOf("/");
        if (filePath.length - 1 == pos)
            pos = filePath.lastIndexOf("/", filePath.length - 1);
        filePath = filePath.substr(0, pos + 1);
        filename = filePath + filename;
    }*/

    Banana.console.debug("-----" + filename);
    var file = Banana.IO.getLocalFile(filename);
    if (file && file.errorString) {
        Banana.console.info(file.errorString);
        return '';
    }
    let fileContent = file.read();
    if (file && file.errorString) {
        Banana.console.info(file.errorString);
        return '';
    }
    Banana.console.debug("fileContent: " + fileContent);
    Banana.console.debug("fileName: " + filename);
    return fileContent;
}
