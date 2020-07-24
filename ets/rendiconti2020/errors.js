// Copyright [2020] [Banana.ch SA - Lugano Switzerland]
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

var ID_ERR_VERSIONE = "ID_ERR_VERSIONE";
var ID_ERR_GRUPPO_MANCANTE = "ID_ERR_GRUPPO_MANCANTE";
var ID_ERR_GRUPPO_ERRATO = "ID_ERR_GRUPPO_ERRATO";

/**
 * return the text error message according to error id
 */
function getErrorMessage(errorId) {
    switch (errorId) {
        case ID_ERR_VERSIONE:
            return "L'estensione non funziona con questa versione di Banana Contabilità. Aggiornare alla versione Experimental più recente.";
        case ID_ERR_GRUPPO_MANCANTE:
            return "Colonna gruppo non definita. Impostare la colonna del gruppo da utilizzare nelle impostazioni dell'estensione.";
        case ID_ERR_GRUPPO_ERRATO:
            return "Codice gruppo inserito errato. Modificare il codice gruppo nella tabella Conti.";
    }
    return "";
}
