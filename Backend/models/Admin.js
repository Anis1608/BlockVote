import mongoose from "mongoose"

const Admindb = new mongoose.Schema({
    id_no:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        requird:true,
    },
    walletAddress:{
        type:String,
        required:true,
        unique:true
    },
    walletSecret:{
        type:String,
        required:true,
        unique:true
    },
    currentPhase:{
        type:String,
        emun:["Registration","Voting","Result"],
        default:"Registration"
    }

})

const AdminData = mongoose.model("Admin Details" , Admindb)
export default AdminData;