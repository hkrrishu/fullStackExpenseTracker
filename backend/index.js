const express = require('express');
const cors = require('cors');
const Expense = require('./models/expenseTable');
const User = require('./models/userTable');
const expenseRoutes = require('./routes/expenseRoute');

const app = express();

const sequelize = require('./util/database');
const userRoutes = require('./routes/userRoute');

app.use(cors());
app.use(express.json());

app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);

User.hasMany(Expense);
Expense.belongsTo(User);

sequelize
    .sync()
    .then(() => {
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch(err => console.log(err));