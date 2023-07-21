const mongoose = require('mongoose');
const app = require('./app');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

process.on('uncaughtException',err=>{
  console.log(err.name,err.message)
  console.log('Shutting down Server');
    process.exit(1);
}
)

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
   
  })
  .then((con) => {
    console.log('Connection Done');
  });

const server=app.listen(process.env.PORT, () => {
  console.log(`App running on port 3005...`);
});

process.on('unhandledRejection',err=>{
  console.log(err.name,err.message)
  console.log('Shutting down Server');
  server.close(()=>{
    process.exit(1);
  })
})
