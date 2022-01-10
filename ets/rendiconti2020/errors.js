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


/* Update: 2021-12-29 */


var ID_ERR_VERSIONE = "ID_ERR_VERSIONE";
var ID_ERR_LICENZA_ADVANCED = "ID_ERR_LICENZA_ADVANCED";
var ID_ERR_LICENZA_PROFESSIONAL = "ID_ERR_LICENZA_PROFESSIONAL";
var ID_ERR_GRUPPO_MANCANTE = "ID_ERR_GRUPPO_MANCANTE";
var ID_ERR_GRUPPO_ERRATO = "ID_ERR_GRUPPO_ERRATO";
var ID_ERR_GRUPPO_ERRATO_CATEGORIA = "ID_ERR_GRUPPO_ERRATO_CATEGORIA";

/**
 * return the text error message according to error id
 */
function getErrorMessage(errorId, column, value) {
    switch (errorId) {
        case ID_ERR_VERSIONE:
            if (BAN_EXPM_VERSION) {
                return "L'estensione richiede come versione minima Banana Contabilità Plus " + BAN_VERSION + "." + BAN_EXPM_VERSION;
            }
            else {
                return "L'estensione richiede come versione minima Banana Contabilità Plus " + BAN_VERSION;
                //return "L'estensione non funziona con questa versione di Banana Contabilità. Aggiornare alla versione " + BAN_VERSION + " o successiva.";
            }
        case ID_ERR_GRUPPO_ERRATO:
            //grColumn, riga, valore
            return "colonna <" + column + ">, valore <"+ value +"> Codice gruppo inserito errato. Modificare il codice gruppo nella tabella Conti.";

        case ID_ERR_GRUPPO_ERRATO_CATEGORIA:
            return "colonna <" + column + ">, valore <"+ value +"> Codice gruppo inserito errato. Modificare il codice gruppo nella tabella Categorie.";    
    
        case ID_ERR_LICENZA_ADVANCED:
            return "L'estensione richiede il piano Advanced.";

        case ID_ERR_LICENZA_PROFESSIONAL:
            return "L'estensione richiede il piano Professional.";
    }
    return "";
}
