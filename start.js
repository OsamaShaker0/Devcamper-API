const path = require('path');
const express = require('express');
const dotenv = require('dotenv').config();
const connectDB = require('./config/db');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const errorHandler = require('./middlewares/error');
const notFound = require('./middlewares/notFound');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const expressLimit = require('express-rate-limit');
const cors = require('cors');

//ANCHOR -  route files
const docs = require('./routes/home');
const auth = require('./routes/auth');
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const users = require('./routes/users');
const reviews = require('./routes/reviews');
let app = express();
app.use(morgan('dev'));
// middleware parser
app.use(express.json());
app.use(cookieParser());
// sanitize data
app.use(mongoSanitize());
// set security headers
app.use(helmet());
// prevent xss attaks
app.use(xss());
//rate limit
const limiter = expressLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});
app.use(limiter);
app.use(hpp());
// enable cors
app.use(cors());
// set static folder
app.use(express.static(path.join(__dirname, 'public')));
//!SECTION Middlewares
//file upload middleware
app.use(fileUpload());
// Mount Routs
app.use('/', docs);
app.use('/api/v1/auth', auth);
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth/users', users);
app.use('/api/v1/reviews', reviews);
app.use(errorHandler);
app.use(notFound);
let port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => console.log(`Server is running on port ${port}...`));
  } catch (error) {
    console.log({ Error: error.message });
  }
};
start();
