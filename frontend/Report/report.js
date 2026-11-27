const reportTable = document.getElementById("reportTable");

const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const savings = document.getElementById("savings");

const downloadBtn = document.getElementById("downloadBtn");

let allExpenses = [];
let currentPeriod = "daily";

// Pagination variables
let currentPage = 1;
const limit = 10;

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
    const token = localStorage.getItem("token");

    // First request: get page 1
    const response = await axios.get(
      "http://localhost:3000/expense/getexpenses?page=1",
      {
        headers: {
          Authorization: token,
        },
      },
    );

    allExpenses = response.data.expenses;

    const totalPages = response.data.totalPages;

    // Fetch remaining pages
    for (let page = 2; page <= totalPages; page++) {
      const nextResponse = await axios.get(
        `http://localhost:3000/expense/getexpenses?page=${page}`,
        {
          headers: {
            Authorization: token,
          },
        },
      );

      allExpenses = allExpenses.concat(nextResponse.data.expenses);
    }

    console.log("All expenses fetched:", allExpenses.length);

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
  console.log("All expenses:", allExpenses.length);
  console.log("Filtered expenses:", filteredExpenses.length);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / limit));

  // If current page exceeds total pages, go to last page
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  reportTable.innerHTML = "";

  let expenseTotal = 0;
  let incomeTotal = 0;

  // Calculate total from ALL filtered expenses
  filteredExpenses.forEach((expense) => {
    expenseTotal += Number(expense.expenseamount);
  });

  // Get only 10 expenses for the current page
  const startIndex = (currentPage - 1) * limit;
  const endIndex = startIndex + limit;

  const expensesToShow = filteredExpenses.slice(startIndex, endIndex);

  // Display current page expenses
  expensesToShow.forEach((expense) => {
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

  // Update summary
  totalIncome.textContent = "₹" + incomeTotal;
  totalExpense.textContent = "₹" + expenseTotal;
  savings.textContent = "₹" + (incomeTotal - expenseTotal);

  // Create pagination buttons
  const pagination = document.getElementById("reportPagination");
  pagination.innerHTML = "";

  if (currentPage > 1) {
    const previousBtn = document.createElement("button");
    previousBtn.textContent = "Previous";

    previousBtn.addEventListener("click", () => {
      currentPage--;
      showReport();
    });

    pagination.appendChild(previousBtn);
  }

  const pageInfo = document.createElement("span");
  pageInfo.textContent = ` Page ${currentPage} of ${totalPages} `;
  pagination.appendChild(pageInfo);

  if (currentPage < totalPages) {
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";

    nextBtn.addEventListener("click", () => {
      currentPage++;
      showReport();
    });

    pagination.appendChild(nextBtn);
  }
}

// Daily, weekly and monthly buttons
const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentPeriod = button.dataset.period;

    // Reset pagination when filter changes
    currentPage = 1;

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

  // Download ALL filtered expenses, not just current page
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
