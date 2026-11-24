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
