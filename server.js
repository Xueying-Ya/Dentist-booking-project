const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
//Route file
const dentists = require('./routes/dentists');
const appointments = require('./routes/appointments');
const auth = require('./routes/auth');

// Load environment variables
dotenv.config({ path: './config/config.env' });

//Connect to database
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// // CORS middleware
// const allowCrossDomain = (req, res, next) => {
//   res.header(`Access-Control-Allow-Origin`, `http://localhost:3000/`);
//   res.header(`Access-Control-Allow-Methods`, `GET,PUT,POST,DELETE`);
//   res.header(`Access-Control-Allow-Headers`, `Content-Type`);
//   next();
// };

// app.use(allowCrossDomain);
//Mount routes
app.use('/api/v1/dentists',dentists);
app.use('/api/v1/appointments',appointments);
app.use('/api/v1/auth',auth);


const PORT = process.env.PORT || 500;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

//Handle unhandles promise rejections
process.on('unhandledRejection',(err,promise)=>{
  console.log(`Error: ${err.message}`);
  //Close server & exit process
  server.close(()=>process.exit(1));
}
);
