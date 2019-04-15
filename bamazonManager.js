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
  //Prompt user to declare what action they want to perform
  inquirer.prompt([
    {
      type: "list",
      name: "option",
      message: "What would you like to do?",
      choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
    }
  ]).then(function (manChoice) {
    //check for choice
    switch (manChoice.option) {
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
      case "Exit":
        endConnection();
      default:
    }
  })
};
//Query database and display all products for sale, price and quantity
function viewProduct() {
  connection.query(`SELECT item_id, product_name, price, stock_quantity FROM products`, function (err, res) {
    if (err) throw err;
    res.forEach(function (item) {
      console.log(`
ID: ${item.item_id}
Product: ${item.product_name}
Price:   ${item.price}
Stock: ${item.stock_quantity}
-----------------------------------------------------`)
    });
    //Send user back to prompt screen
    logIn();
  });
}

function lowInv() {
  //Search database table for items with quantity < 5
  connection.query(`SELECT item_id, product_name, price, stock_quantity FROM products WHERE stock_quantity < 5`, function (err, res) {
    if (err) throw err;
    //Display results for query
    res.forEach(function (item) {
      console.log(`
ID:      ${item.item_id}
Name:    ${item.product_name}
Price:   ${item.price}
Quantity ${item.stock_quantity}
------------------------------------------------`)
    });
  });
  //Send user back to prompt screen
  logIn();
}
//add more inventory to existing products
function addInv() {
  connection.query(`SELECT * FROM products`, function (err, res) {
    res.forEach(function (item) {
      console.log(`
ID:      ${item.item_id}
Name:    ${item.product_name}
Price:   ${item.price}
Quantity ${item.stock_quantity}
------------------------------------------------`)
    });
    if (err) throw err;
    //Prompt user input
    inquirer.prompt([
      {
        name: "id",
        type: "input",
        message: "What item did you want to update?",
        validate: function (value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      },
      {
        name: "quantity",
        type: "input",
        message: "How many of the item should be added to current inventory?",
        validate: function (value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
    ])
      .then(function (answer) {
        //query database to update quantity
        connection.query(`UPDATE products SET ? WHERE item_id = ${answer.id}`,
          [
            {//updates stock of desired inventory
              stock_quantity: parseInt(res[answer.id - 1].stock_quantity) + parseInt(answer.quantity)
            },
          ]);
        console.log("Inventory Added!")
        logIn();
      });
  });
}
//adds new product to table
function newProduct() {
  //prompts user for item details
  inquirer.prompt([
    {
      name: "name",
      type: "input",
      message: "What is the name of the product you would like to add?"
    },
    {
      name: "dept",
      type: "input",
      message: "Which department is the product a part of?"
    },
    {
      name: "price",
      type: "input",
      message: "What should the price be?",
      validate: function (value) {
        if (isNaN(value) === false) {
          return true;
        }
        return false;
      }
    },
    {
      name: "quantity",
      input: "input",
      message: "How much stock should we start out with?",
      validate: function (value) {
        if (isNaN(value) === false) {
          return true;
        }
        return false;
      }
    }
  ])
    .then(function (answer) {
      //builds sql code using a template literal and user responses
      connection.query(`INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES("${answer.name}", "${answer.dept}", ${answer.price}, ${answer.quantity})`, function (err, res) {
          if (err) throw err;
          console.log(`New Product Added! ${answer.quantity} units of ${answer.name} at $${answer.price} each!`)
          //returns user to start screen
          logIn();
        });
    });
}
//ends connection to DB
function endConnection() {
  connection.end();
};