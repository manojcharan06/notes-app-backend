require('dotenv').config()
const express = require('express');
const connectDB = require('./db');
const app = express();
const route = require('./routes/notesRoute')
const authRoute = require('./routes/authRoute')
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');

connectDB();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use(cookieParser())
app.use(express.json())
app.use('/api', route, authRoute)

app.get('/', (req, res) => {
    res.send("hlw")
})

app.use(errorHandler);

app.listen(process.env.PORT || 3000, () => {
    console.log("Server Running on", process.env.PORT || 3000)
}) 