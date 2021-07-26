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

//classe che modifica i dati prima dell'importazione (ad esempio registrazioni)
//in base a delle regole definite in un file json che l'utente può definire
function ImportRules(banDocument) {
    this.banDocument = banDocument;
    if (this.banDocument === undefined)
        this.banDocument = Banana.document;
    this.jsonRules = '';
}

ImportRules.prototype.apply = function (jsonData) {
    //jsonData contiene i dati da importare (ad esempio registrazioni)
    //jsonRules contiene le istruzioni per aggiornare i dati da importare
    if (this.jsonRules.length <= 0 || jsonData.length <= 0)
        return jsonData;

    for (var i in jsonData) {
        var document = jsonData[i].document;
        for (var j in document.dataUnits) {
            var dataUnit = document.dataUnits[j];

            for (var k in this.jsonRules) {
                let rule = this.jsonRules[k];
                if (!rule.enabled || rule.ruleContext !== dataUnit.nameXml)
                    continue;

                for (var l in dataUnit.data.rowLists) {
                    for (var m in dataUnit.data.rowLists[l].rows) {
                        var row = dataUnit.data.rowLists[l].rows[m].fields;
                        if (this.applyConditions(rule, row))
                            this.applyActions(rule, row);
                    }
                }
            }
        }
    }
    return jsonData;
}

ImportRules.prototype.applyActions = function (rule, row) {
    //aggiorna la riga (row) in base alle azioni presenti nella regola (rule)
    for (var i in rule.ruleActions) {
        var action = rule.ruleActions[i].action;
        var lookupField = rule.ruleActions[i].column;
        var lookupValue = rule.ruleActions[i].value;
        if (action == "update") {
            /*for (var field in row) {
                if (lookupField === field) {
                    row[field] = lookupValue;
                }
            }*/
            row[lookupField] = lookupValue;
        }
    }
}

ImportRules.prototype.applyConditions = function (rule, row) {
    //ritorna true se la riga (row) corrisponde alle condizioni presenti nella regola (rule)
    let acceptRow = false;
    for (var i in rule.ruleConditions) {
        if (rule.isAndRule)
            acceptRow = false;
        var condition = rule.ruleConditions[i].condition;
        var lookupField = rule.ruleConditions[i].column;
        var lookupValue = rule.ruleConditions[i].value;
        if (condition == "equal") {
            for (var field in row) {
                if (lookupField === field && lookupValue === row[field]) {
                    acceptRow = true;
                }
            }
        }
        else if (condition == "contains") {
            for (var field in row) {
                if (lookupField === field && row[field].indexOf(lookupValue) >= 0) {
                    acceptRow = true;
                }
            }
        }
    }
    return acceptRow;
}

ImportRules.prototype.load = function (filename) {
    //carica il file contenente le regole per aggiornare i dati da importare
    this.jsonRules = '';
    if (!filename)
        return '';

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
    this.jsonRules = JSON.parse(fileContent);
}

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
/*let rule = {
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
};*/

/*let elements = [
        {
           "name": "a",
           "subElements":
           [
             {"surname": 1},
             {"surname": 2}
           ]
        },
        {
           "name": "b",
           "subElements":
           [ {"surname": 3}, {"surname": 1} ]
        },
        {
           "name": "c",
           "subElements":
           [ {"surname": 2}, {"surname": 5} ]
        } ];

// map() takes an array and creates a new array with the result of a function
// on each element in the original array.
var value = 1;
var filteredArray = elements
.filter(element => element.subElements
  .some(subElement => subElement.surname === value)
)
.map(element => {
  let n = Object.assign({}, element, {'subElements': element.subElements.filter(
    subElement => subElement.surname === value
  )})
  return n;
});
return filteredArray;*/

/*const data = [
{ "ConsoPhot_Id": "7924", "idLotImport": 166,
"Date_Id": 20160601, "Orga_Id": "86094", "NbTache": 35,
"NbCopie": 143, "NbCopieBW": 56, "NbCopieCouleur": 87, "MtTotal": 3.53 },
{ "ConsoPhot_Id": "7925", "idLotImport": 166,
"Date_Id": 20160601, "Orga_Id": "86537", "NbTache": 291,
"NbCopie": 969, "NbCopieBW": 622, "NbCopieCouleur": 347, "MtTotal": 15.61 },
{ "ConsoPhot_Id": "7926", "idLotImport": 166,
"Date_Id": 20160601, "Orga_Id": "86386", "NbTache": 7,
"NbCopie": 32, "NbCopieBW": 31, "NbCopieCouleur": 1, "MtTotal": 0.16 },
{ "ConsoPhot_Id": "7927", "idLotImport": 166,
"Date_Id": 20160601, "Orga_Id": "86084", "NbTache": 2,
"NbCopie": 3, "NbCopieBW": 3, "NbCopieCouleur": 0, "MtTotal": 0.01 },
{ "ConsoPhot_Id": "7928", "idLotImport": 166,
"Date_Id": 20160701, "Orga_Id": "86094", "NbTache": 33,
"NbCopie": 68, "NbCopieBW": 31, "NbCopieCouleur": 37, "MtTotal": 1.53 }
];

const key = "Orga_Id";
const value = "86094";
const result = data.filter(d => d[key] == value);
return result;*/
