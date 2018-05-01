var mysql = require("mysql");
var inquirer = require("inquirer");

// Connect to database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    user: "root",

    password: "password",
    database: "bamazon"
});

// Connect to MySQL server and database
connection.connect(function (err) {
    if (err) throw err;
    // Start function
    start();
});

// Function to list items
function start() {
    inquirer
        .prompt({
            name: "actions",
            type: "rawlist",
            message: "Would you like to [VIEW PRODUCTS], [ADD INVENTORY], or [ADD PRODUCTS]?",
            choices: ["VIEW PRODUCTS", "ADD INVENTORY", "ADD PRODUCTS"]
        })
        .then(function (answer) {
            // Call functions based on user input
            if (answer.actions.toUpperCase() === "VIEW PRODUCTS") {
                viewProducts();
            }
            else if (answer.actions.toUpperCase() === "ADD INVENTORY") {
                addInventory();
            }
            else {
                addProduct();
            }
        });
}

// Function to view products and inventory levels
function viewProducts() {
    // prompt for info about the item being put up for auction
    connection.query("SELECT * FROM products", function (err, res) {
        console.log(res);
        start();
    });
}

function addInventory() {
    // Query database for products to add inventory too
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        // Prompt user for which items they'd like to add inventory for
        inquirer
            .prompt([
                {
                    name: "choice",
                    type: "rawlist",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < results.length; i++) {
                            choiceArray.push(results[i].product_name);
                        }
                        return choiceArray;
                    },
                    message: "What item would you like to add inventory for?"
                },
                {
                    name: "addInventory",
                    type: "input",
                    message: "How much much did you restock?"
                }
            ])
            .then(function (answer) {
                // Get info of chosen product
                var chosenItem;
                for (var i = 0; i < results.length; i++) {
                    if (results[i].product_name === answer.choice) {
                        chosenItem = results[i];
                    }
                    connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                            {
                                stock_quantity: chosenItem.stock_quantity + answer.addInventory
                            },
                            {
                                id: chosenItem.id
                            }
                        ],
                        function (error) {
                            if (error) {
                                throw err;
                                console.log("Inventory updated successfully!");
                                start();
                            }
                            else {
                                // Something went wrong
                                console.log("Something went wrong. Try again...");
                                start();
                            }
                        }
                    );
                }
            })
    })
}