var inquirer = require("inquirer");
var mysql = require("mysql");
//create sql connection
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "Tebryn22!",
  database: "bamazon"
});
//verify connection and logIn
connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  logIn();
});

function logIn() {

  inquirer.prompt([
    {
      type: "list",
      name: "option",
      message: "What would you like to do?",
      choices: [ "View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
    }
  ]).then(function (manChoice) {
    switch(manChoice.option){
      case "View Products for Sale":
        viewProduct();
        break;
      case "View Low Inventory":
        lowInv();
        break;
      case "Add to Inventory":
        addInv();
        break;
      case "Add New Product":
        newProduct();
        break;
      default: 
        console.log("Please use one of the following commands:  View Products for Sale, View Low Inventory, Add to Inventory, Add New Product")
    }    
  })
};

function viewProduct(){
  connection.query(`SELECT item_id, product_name, price, stock_quantity FROM products`, function (err, res) {
    if (err) throw err;
    res.forEach(function (item) {
      console.log(`ID: ${item.item_id}
Product: ${item.product_name}
Price:   ${item.price}
Stock: ${item.stock_quantity}
-----------------------------------------------------`)
    });
    endConnection();
 })
}

function endConnection() {
  connection.end();
};