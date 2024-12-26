// Inventory object to track stock for each item
const inventory = {
    "Classic Burger": 50,
    "Chicken Pizza": 50,
    "Vanilla Ice Cream": 50,
    "Chicken Burger": 50,
};

// Initialize the cart and bill count
const cart = [];
let billGenerated = false;
let billCount = parseInt(localStorage.getItem("billCount")) || 1;

function addToCart(itemName, itemPrice, quantity) {
    // Check if enough stock is available
    if (inventory[itemName] < quantity) {
        alert(`Not enough stock for ${itemName}. Only ${inventory[itemName]} left.`);
        return;
    }

    // Find if the item already exists in the cart
    const existingItem = cart.find(item => item.name === itemName);

    if (existingItem) {
        // Check if adding the quantity exceeds stock
        if (inventory[itemName] < existingItem.quantity + quantity) {
            alert(`Not enough stock for ${itemName}. Only ${inventory[itemName]} left.`);
            return;
        }
        existingItem.quantity += quantity;
        existingItem.totalPrice = existingItem.quantity * itemPrice;
    } else {
        cart.push({
            name: itemName,
            price: itemPrice,
            quantity: quantity,
            totalPrice: itemPrice * quantity
        });
    }

    // Reduce the stock
    inventory[itemName] -= quantity;

    updateCart();
    updateInventoryDisplay();
}

function updateInventoryDisplay() {
    const inventoryContainer = document.getElementById("inventory-status");
    inventoryContainer.innerHTML = "";

    for (const item in inventory) {
        const inventoryItem = document.createElement("p");
        inventoryItem.textContent = `${item}: ${inventory[item]} left`;
        inventoryContainer.appendChild(inventoryItem);
    }
}

function updateCart() {
    const cartContainer = document.getElementById("cart-items");
    cartContainer.innerHTML = "";
    let grandTotal = 0;

    cart.forEach((item, index) => {
        const itemElement = document.createElement("div");
        itemElement.classList.add("cart-item");

        const itemContent = document.createElement("p");
        itemContent.textContent = `${item.name} - ${item.quantity} x ₹${item.price} = ₹${item.totalPrice}`;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = function () {
            removeItem(index);
        };

        itemElement.appendChild(itemContent);
        itemElement.appendChild(deleteButton);
        cartContainer.appendChild(itemElement);

        grandTotal += item.totalPrice;
    });

    const totalElement = document.getElementById("cart-total");
    totalElement.textContent = `Total: ₹${grandTotal}`;
}

function removeItem(index) {
    const item = cart[index];

    // Restore the stock for the removed item
    inventory[item.name] += item.quantity;

    // Remove the item from the cart
    cart.splice(index, 1);

    updateCart();
    updateInventoryDisplay();
}






function generateBill() {
    if (cart.length === 0) {
        alert("Cart is empty. Add items to generate a bill.");
        return;
    }

    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const paymentAmount = parseFloat(document.getElementById("payment-amount").value);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
        alert("Please enter a valid payment amount.");
        return;
    }

    let bill = "               Street Magic\n";
    bill += "            DOOR.NO:48-11/3-5C,\n";
    bill += "            NEW CURRENCY NAGAR,\n";
    bill += "                  6th LANE,\n";
    bill += "          Anjaneya Swami Temple Road,\n";
    bill += "              VIJAYAWADA-520008\n";
    bill += "                MO: 8885999948\n";
    bill += "---------------------------------------------\n";
    bill += `Date: ${date}  ${time}\n`;
    bill += `Cashier: Vamsi  BillNo: ${billCount}\n`;
    bill += "----------------------------------------------\n";
    bill += "No. Item            Qty   Price     Amount\n";
    bill += "----------------------------------------------\n";

    let index = 1;
    let grandTotal = 0;
    let totalQty = 0;

    cart.forEach((item) => {
        let itemName = item.name;
        if (itemName.length > 13) {
            // Split the item name into two lines if it exceeds 15 characters
            const firstLine = itemName.slice(0, 13); // First 15 characters
            const secondLine = itemName.slice(13);  // Remaining characters
            bill += `${index.toString().padEnd(2)} ${firstLine}\n`; // Print the first line
            bill += `${''.padEnd(2)} ${secondLine.padEnd(17)} ${item.quantity.toString().padEnd(5)} ₹${item.price.toString().padEnd(9)} ₹${item.totalPrice.toString().padEnd(4)}\n`; // Print the second line
        } else {
            // Single-line item name
            bill += `${index.toString().padEnd(2)} ${itemName.padEnd(17)} ${item.quantity.toString().padEnd(5)} ₹${item.price.toString().padEnd(9)} ₹${item.totalPrice.toString().padEnd(4)}\n`;
        }item.totalPrice;
        totalQty += item.quantity;
        index++;
    });

    const change = paymentAmount - grandTotal;

    bill += "----------------------------------------------\n";
    bill += `Total Qty: ${totalQty.toString().padEnd(15)} Sub Total: ₹${grandTotal}\n`;
    bill += `Grand Total: ₹${grandTotal}\n`;
    if (change >= 0) {
        bill += `Payment: ₹${paymentAmount}\n`;
        bill += `Change to Return: ₹${change}\n`;
    } else {
        bill += `Payment: ₹${paymentAmount}\n`;
        bill += `Balance Due: ₹${Math.abs(change)}\n`;
    }
    bill += "------------------------------------------\n";
    bill += "           Thanks for Visiting!\n";

    // Display the bill in the generated-bill element
    const billElement = document.getElementById("generated-bill");
    billElement.textContent = bill;
    billCount++;

    localStorage.setItem("billCount", billCount);

    // Mark the bill as generated
    billGenerated = true;

    updateCart();
}

function printBill() {
    const billContent = document.getElementById("generated-bill").textContent;

    if (!billContent.trim()) {
        alert("Please generate the bill first.");
        return;
    }



    // Create a new window for printing
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <html>
        <head>
            <title>Street Magic - Bill</title>
            <style>
                body {
                    font-family: 'Courier New', Courier, monospace;
                    padding: 20px;
                    margin: 0;
                }
                    
                pre {
                    font-size: 14px;
                    line-height: 1.6;
                }
            </style>
        </head>
        <body>
            <pre>${billContent}</pre>
        </body>
        </html>
    `);

    // Print and close the window
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}
function downloadBill() {
    if (!billGenerated) {
        alert("Please generate the bill first.");
        return;
    }

    const billContent = document.getElementById("generated-bill").textContent;
    const blob = new Blob([billContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Street_Magic_Bill.txt";
    link.click();
}
function updateFontSize() {
    const fontSize = document.getElementById("font-size").value;
    const billElement = document.getElementById("generated-bill");

    // Update the font size dynamically
    billElement.style.fontSize = `${fontSize}px`;
}

