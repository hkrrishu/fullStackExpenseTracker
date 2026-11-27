const reportTable = document.getElementById("reportTable");

const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const savings = document.getElementById("savings");

const downloadBtn = document.getElementById("downloadBtn");

let allExpenses = [];
let currentPeriod = "daily";

// Check whether the user is premium
function isPremiumUser() {
  const token = localStorage.getItem("token");

  if (!token) {
    return false;
  }

  try {
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    return decodedToken.ispremiumuser === true;
  } catch (err) {
    return false;
  }
}

// Disable download for non-premium users
if (!isPremiumUser()) {
  downloadBtn.disabled = true;
  downloadBtn.textContent = "🔒 Premium Users Only";
}

// Get expenses from backend
async function getExpenses() {
  try {
    const response = await axios.get(
      "http://localhost:3000/expense/getexpenses",
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      },
    );

    allExpenses = response.data.expenses;

    showReport();
  } catch (err) {
    console.log(err);
    alert("Unable to fetch expenses");
  }
}

// Check whether an expense belongs to the selected period
function filterExpenses(expenses) {
  const today = new Date();

  return expenses.filter((expense) => {
    const expenseDate = new Date(expense.createdAt);

    if (currentPeriod === "daily") {
      return expenseDate.toDateString() === today.toDateString();
    }

    if (currentPeriod === "weekly") {
      const firstDay = new Date(today);
      firstDay.setDate(today.getDate() - 6);
      firstDay.setHours(0, 0, 0, 0);

      return expenseDate >= firstDay && expenseDate <= today;
    }

    if (currentPeriod === "monthly") {
      return (
        expenseDate.getMonth() === today.getMonth() &&
        expenseDate.getFullYear() === today.getFullYear()
      );
    }
  });
}

// Display report
function showReport() {
  const filteredExpenses = filterExpenses(allExpenses);

  reportTable.innerHTML = "";

  let expenseTotal = 0;
  let incomeTotal = 0;

  filteredExpenses.forEach((expense) => {
    expenseTotal += Number(expense.expenseamount);

    const row = document.createElement("tr");

    row.innerHTML = `
            <td>${new Date(expense.createdAt).toLocaleDateString()}</td>
            <td>${expense.description}</td>
            <td>${expense.category}</td>
            <td>—</td>
            <td>₹${expense.expenseamount}</td>
        `;

    reportTable.appendChild(row);
  });

  totalIncome.textContent = "₹" + incomeTotal;
  totalExpense.textContent = "₹" + expenseTotal;
  savings.textContent = "₹" + (incomeTotal - expenseTotal);
}

// Daily, weekly and monthly buttons
const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentPeriod = button.dataset.period;

    filterButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    showReport();
  });
});

// Download report as CSV
downloadBtn.addEventListener("click", () => {
  if (!isPremiumUser()) {
    return;
  }

  const filteredExpenses = filterExpenses(allExpenses);

  let csv = "Date,Description,Category,Income,Expense\n";

  filteredExpenses.forEach((expense) => {
    csv += `${new Date(expense.createdAt).toLocaleDateString()},${expense.description},${expense.category},0,${expense.expenseamount}\n`;
  });

  const blob = new Blob([csv], {
    type: "text/csv",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "expense-report.csv";

  link.click();

  URL.revokeObjectURL(url);
});

// Load report
getExpenses();
