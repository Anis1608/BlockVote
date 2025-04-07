import mongoose from "mongoose";
const Mongo_database = "mongodb://localhost:27017/blockchain"

export const connectDatabase = () =>{
    mongoose.connect(Mongo_database , {
        // useNewUrlParser: true, 
        // useUnifiedTopology: true,
        family: 4,})
}
console.log("Database Connected Sucessfully...")