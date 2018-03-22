// Copyright [2018] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.script.check_speed
// @description = Check speed
// @doctype = 100.110;110.110;130.110;100.130
// @encoding = utf-8
// @includejs = ch.banana.script.italy_vat_2017.journal.js
// @includejs = ch.banana.script.italy_vat.daticontribuente.js
// @includejs = ch.banana.script.italy_vat_2017.xml.js
// @inputdatasource = none
// @pubdate = 2018-03-14
// @publisher = Banana.ch SA
// @task = app.command
// @timeout = -1

function exec() {
  if (!Banana.document)
    return "@Cancel";

  var journal = {};
  var transactions = [];
  journal = Banana.document.journal(
    Banana.document.ORIGINTYPE_CURRENT, Banana.document.ACCOUNTTYPE_NONE);

  //Test1
  /*for (i=0; i<journal.rows.length; i++) {
    var transaction = journal.rows[i];
    var jsonTransaction = JSON.parse(transaction.toJSON());
    var operationType = jsonTransaction["JOperationType"];
    if (parseInt(operationType)==1) {
      continue;
    }
    transactions.push( jsonTransaction);
    Banana.document.addMessage( "Row " + i.toString() + " " + jsonTransaction['JDescription']);
  }*/

  //Test2
  Banana.application.showMessages(false);
  Banana.application.clearMessages();
  Banana.application.progressBar.start(journal.rowCount);
  for (i=0; i<journal.rowCount; i++) {
    var tRow = journal.row(i);
	Banana.application.progressBar.setText("row " + i); 
    if (tRow.value('JOperationType') == Banana.document.OPERATIONTYPE_TRANSACTION) {
      var jRowOrigin = tRow.value('JRowOrigin');
      var jDate = tRow.value('JDate');
      var jAccount = tRow.value('JAccount');
      var jContraAccount = tRow.value('JContraAccount');
      var jDescription = tRow.value('JDescription');
      var jAccountDescription = tRow.value('JAccountDescription');
      var jAmount = tRow.value('JAmount');
	  if (!Banana.application.progressBar.step())
		break;
      //Banana.application.addMessage( "Row " + i.toString() + " " + jDate + " " + jDescription);
    }
  }
  Banana.application.progressBar.finish();
  Banana.application.showMessages();
  Banana.application.addMessage( "Script finished");
}
