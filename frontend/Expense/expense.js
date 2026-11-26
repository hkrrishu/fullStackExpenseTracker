const expenseForm = document.getElementById("expenseForm");

expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const expenseamount = document.getElementById("expenseamount").value;
  const description = document.getElementById("description").value;
  const category = document.getElementById("category").value;

  const expenseDetails = {
    expenseamount,
    description,
    category,
  };

  axios
    .post("http://localhost:3000/expense/addexpense", expenseDetails, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    })
    .then((response) => {
      console.log(response);
      alert("Expense added successfully!");
      getExpenses();
    })
    .catch((err) => {
      console.log(err);
      alert("Error adding expense");
    });
});

function getExpenses() {
  axios
    .get("http://localhost:3000/expense/getexpenses", {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    })
    .then((response) => {
      const expenseList = document.getElementById("expenseList");
      expenseList.innerHTML = "";

      response.data.expenses.forEach((expense) => {
        const li = document.createElement("li");

        li.textContent = `${expense.expenseamount} - ${expense.description} - ${expense.category}`;

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";

        li.appendChild(deleteBtn);
        deleteBtn.addEventListener("click", () => {
          axios
            .delete(
              `http://localhost:3000/expense/deleteexpense/${expense.id}`,
              {
                headers: {
                  Authorization: localStorage.getItem("token"),
                },
              },
            )
            .then((response) => {
              getExpenses();
            })
            .catch((err) => {
              console.log(err);
            });
        });

        expenseList.appendChild(li);
      });
    })
    .catch((err) => {
      console.log(err);
    });
}
getExpenses();

// Initialize Cashfree
const cashfree = Cashfree({
  mode: "sandbox",
});

// Buy Premium button
const buyPremiumBtn = document.getElementById("buyPremiumBtn");

buyPremiumBtn.addEventListener("click", async () => {
  try {
    // Step 1: Create order in our backend
    const response = await axios.post(
      "http://localhost:3000/purchase/buy-premium",
      {},
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      },
    );

    const paymentSessionId = response.data.paymentSessionId;
    const orderId = response.data.orderId;

    // Step 2: Open Cashfree checkout
    await cashfree.checkout({
      paymentSessionId: paymentSessionId,
      redirectTarget: "_modal",
    });

    // Step 3: Verify payment with our backend
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const verifyResponse = await axios.post(
      "http://localhost:3000/purchase/update-transaction-status",
      {
        orderId: orderId,
      },
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      },
    );

    // Step 4: Show result
    if (verifyResponse.data.paymentStatus === "SUCCESSFUL") {
      alert("Transaction successful! You are now a Premium Member.");
    } else if (verifyResponse.data.paymentStatus === "FAILED") {
      alert("TRANSACTION FAILED");
    } else {
      alert("Payment is still pending. Please check again.");
    }
  } catch (err) {
    console.log(err);
    alert("Something went wrong during payment.");
  }
});
