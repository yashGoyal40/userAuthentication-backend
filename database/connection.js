import mongoose from "mongoose";

export const connection  = () =>{
  mongoose.connect(process.env.MONGO_URI,{
    dbName:"authService"
  })
  .then(() => {
    console.log("Connected to databse")
  })
  .catch((err) => {
    console.log(`database connection error : ${err}`);
  })
}