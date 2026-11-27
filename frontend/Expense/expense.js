const expenseForm = document.getElementById("expenseForm");
let currentPage = 1;
let totalPages = 1;

expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const expenseamount = document.getElementById("expenseamount").value;
  const description = document.getElementById("description").value;

  const expenseDetails = {
    expenseamount,
    description,
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

function getExpenses(page = 1) {
  axios
    .get(`http://localhost:3000/expense/getexpenses?page=${page}`, {
      headers: { Authorization: localStorage.getItem("token") },
    })
    .then((response) => {
      const expenseList = document.getElementById("expenseList");
      expenseList.innerHTML = "";

      currentPage = response.data.currentPage;
      totalPages = response.data.totalPages;

      // Display expenses
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
            .then(() => {
              getExpenses(currentPage);
            })
            .catch((err) => console.log(err));
        });

        expenseList.appendChild(li);
      });

      // Create pagination buttons
      const pagination = document.getElementById("pagination");
      pagination.innerHTML = "";

      if (currentPage > 1) {
        const previousBtn = document.createElement("button");
        previousBtn.textContent = "Previous";
        previousBtn.addEventListener("click", () => {
          getExpenses(currentPage - 1);
        });
        pagination.appendChild(previousBtn);
      }

      const currentBtn = document.createElement("button");
      currentBtn.textContent = currentPage;
      pagination.appendChild(currentBtn);

      if (currentPage < totalPages) {
        const nextBtn = document.createElement("button");
        nextBtn.textContent = "Next";
        nextBtn.addEventListener("click", () => {
          getExpenses(currentPage + 1);
        });
        pagination.appendChild(nextBtn);
      }

      const pageInfo = document.createElement("span");
      pageInfo.textContent = ` Page ${currentPage} of ${totalPages} `;
      pagination.appendChild(pageInfo);
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
      localStorage.setItem("token", verifyResponse.data.token);

      showPremiumUserMessage();

      alert("You are a Premium User Now");
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
const premiumMessage = document.getElementById("premiumMessage");
const leaderboardSection = document.getElementById("leaderboardSection");
const showLeaderboardBtn = document.getElementById("showLeaderboardBtn");
const leaderboardList = document.getElementById("leaderboardList");

function showPremiumUserMessage() {
  premiumMessage.style.display = "block";
  buyPremiumBtn.style.display = "none";
  leaderboardSection.style.display = "block";
}

const token = localStorage.getItem("token");

if (token) {
  const decodedToken = JSON.parse(atob(token.split(".")[1]));

  if (decodedToken.ispremiumuser) {
    showPremiumUserMessage();
  }
}

showLeaderboardBtn.addEventListener("click", async () => {
  try {
    const response = await axios.get(
      "http://localhost:3000/premium/showLeaderBoard",
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      },
    );

    leaderboardList.innerHTML = "";

    response.data.forEach((user, index) => {
      const li = document.createElement("li");

      li.textContent = `${index + 1}. ${user.name} - Total Expense: ${user.total_cost || 0}`;

      leaderboardList.appendChild(li);
    });
  } catch (err) {
    console.log(err);
    alert("Unable to fetch leaderboard");
  }
});

const reportBtn = document.getElementById("reportBtn");

reportBtn.addEventListener("click", () => {
  window.location.href = "../Report/report.html";
});
