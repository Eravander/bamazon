var inquirer = require("inquirer");
var mysql = require("mysql");

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

connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  logIn();
});

function logIn() {
  connection.query(`SELECT item_id, product_name, price FROM products`, function (err, res) {
    if (err) throw err;
    res.forEach(function (item) {
      console.log(`ID:      ${item.item_id}
Product: ${item.product_name}
Price:   ${item.price}
-----------------------------------------------------`)
    })
    userPrompt();
  });
};

function userPrompt() {


  inquirer.prompt([
    {
      type: "input",
      name: "itemID",
      message: "Please enter the item ID of the product you would like to purchase.",
    }
  ]).then(function (response) {

    connection.query(`SELECT *
    FROM products
    WHERE item_id=${response.itemID}`, function (err, res) {
        if (err) throw err;
        console.log(res[0].stock_quantity)
        if (res[0].stock_quantity > 0) {
          //   * This means updating the SQL database to reflect the remaining quantity. -----Make this a purchase() function?
          // purchase();
          
          //* Once the update goes through, show the customer the total cost of their purchase.
        } else {
          console.log(`Sorry we are out of ${res[0].product_name}. Please try another item.`)
          userPrompt();
        }
        endConnection();
      })
  })
};

// function purchase(){
//   connection.query(
//     `UPDATE products SET ? WHERE ?`,
//     [
//       {
//         // stock_quantity: -=1
//       },
//       {

//       }
//     ]
//   )
// }

function endConnection() {
  connection.end();
}