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
//Displays items available for purchase in the database: Included are the ID, name, and price as per instructions.
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

//User is then sent here to answer questions about the purchase
function userPrompt() {

  inquirer.prompt([
    {
      type: "input",
      name: "itemID",
      message: "Please enter the item ID of the product you would like to purchase.",
      validate: function (value) {
        if (isNaN(value) === false) {
            return true;
        }
        return false;
    }
    },
    {
      type: "input",
      name: "quantity",
      message: "How many would you like to buy?",
      validate: function (value) {
        if (isNaN(value) === false) {
            return true;
        }
        return false;
    }
    }
  ]).then(function (custResponse) {
    //Database is queried 
    connection.query(`SELECT *
    FROM products
    WHERE item_id=${custResponse.itemID}`, function (err, res) {
        if (err) throw err;
         //here we check if there is stock remaining
        if ((custResponse.quantity - res[0].stock_quantity) <= 0) {
          //If stock remains customer data is pushed forward to form the purchase and update the database
          purchase(res[0], custResponse);

          //else the customer is informed that their selection is out of stock and prompted again
        } else {
          console.log(`Sorry we are out of ${res[0].product_name}. Please try another item.`)
          userPrompt();
        }
      })
  })
};

//Here we update the stock quantity and conform the order
function purchase(res, custResponse) {
  // console.log(custResponse)
  console.log(`Thank you for your purchase of ${res.product_name}. Your Total is $${res.price * custResponse.quantity}`)
  connection.query(`UPDATE products SET ? WHERE ?`,
    [
      {
        stock_quantity: res.stock_quantity - custResponse.quantity
      },
      {
        item_id: res.item_id
      }
    ]);
  endConnection();
}

//closes connection
function endConnection() {
  connection.end();
};