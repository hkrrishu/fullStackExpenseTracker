const express = require('express');
const cors = require('cors');

const app = express();

const sequelize = require('./util/database');
const User = require('./models/userTable');
const userRoutes = require('./routes/userRoute');

app.use(cors());
app.use(express.json());

app.use('/user', userRoutes);

sequelize
    .sync()
    .then(() => {
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch(err => console.log(err));