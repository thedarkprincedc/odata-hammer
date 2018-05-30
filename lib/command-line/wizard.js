var inquirer = require('inquirer');
exports.run = function(){
    inquirer.prompt([{
        type: "list",
        name: "taskType",
        message: "What would you like to do?",
        choices: [
          "Import metadata / data from a xml endpoint (Manual)",
          "Import metadata / data from a xml endpoint (Automatic)",
          "Generate metadata from Excel file"
         ]
      }
    ]).then(answers => {
        console.log(answers);
    });
}