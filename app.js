const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo').default || require('connect-mongo');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Tell Express to use EJS as the view/template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Morgan logs every request e.g: GET /todos 200 (so you can see what's happening)
app.use(morgan('dev'));

// Allows Express to read data sent from HTML forms
app.use(express.urlencoded({ extended: true }));

// Serves static files like CSS from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Session setup — this is what keeps users logged in between pages
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // Session lasts 1 day
}));

// Routes
app.get('/', (req, res) => res.redirect('/login'));
app.use('/', authRoutes);
app.use('/todos', todoRoutes);

// Global error handler — must always be the very last app.use()
app.use(errorHandler);

module.exports = app;
