import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';


const envPath = path.resolve('../.env');
dotenv.config();
import routes from './routes/apiRoutes.js';
import { cwd } from 'process';


mongoose.set("strictQuery", false);
let dbConfig = process.env.MONGODB;
mongoose.connect(dbConfig, {}).then(() => {
  console.log("Successfully connected to the database");
}).catch(err => {
  console.log('Could not connect to the database. Exiting now...', err);
  process.exit();
});


const app = express();

app.use(cors());
app.set('trust proxy', true);
// app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(cwd(), 'public')));
app.use(express.static(path.join(cwd(), 'views')));
app.use(routes);
app.use((req, res, next) => {
  return next(notFound('This route does not exist.')); // Updated usage
});

app.use((err, req, res, next) => {

  if (err) {
    if (err.output) {
      return res.status(err.output.statusCode || 500).json(err.output.payload);
    }
    return res.status(500).json(err);
  }
});



const server = app.listen(process.env.PORT, () => {
  console.log(`server start on port ${process.env.PORT}`);
})

