require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Expense = require('./models/expenseTable');
const User = require('./models/userTable');
const expenseRoutes = require('./routes/expenseRoute');
const Order = require('./models/orderTable');
const purchaseRoutes = require('./routes/purchaseRoute');

const app = express();

const sequelize = require('./util/database');
const userRoutes = require('./routes/userRoute');

app.use(cors());
app.use(express.json());

app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);
app.use('/purchase', purchaseRoutes);


User.hasMany(Expense);
Expense.belongsTo(User);
User.hasMany(Order);
Order.belongsTo(User);

sequelize
    .sync({ alter: true })
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch(err => console.log(err));