import AdminData from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Bowser from "bowser";
const SECRET_KEY = "anis"
import VoterData from "../models/Voter.js";
import StellarSdk from "stellar-sdk";
import axios from "axios"; 
import { v4 as uuidv4 } from 'uuid';
import redis from '../redisClient.js';

export const Register = async (req, res) => {
    const { name, id_no, email, password } = req.body;

    if (!name || !id_no || !email || !password) {
        return res.status(400).json({
            message: "Something is Missing...",
            Success: false
        });
    }

    const checkadmin = await AdminData.findOne({ id_no });
    if (checkadmin) {
        return res.status(400).json({
            message: "Admin Already Registered...",
            Success: false
        });
    }

    //Generate Stellar Wallet  
    const keypair = StellarSdk.Keypair.random();
    const walletAddress = keypair.publicKey();  
    const walletSecret = keypair.secret();  

    try {
        // Fund the Wallet
        const fundResponse = await axios.get(`https://friendbot.stellar.org/?addr=${walletAddress}`);
        
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
  
        const adminDetails = await AdminData.create({
            name,
            id_no,
            email,
            password: hashedPassword,
            walletAddress, 
            walletSecret 
        });

        res.status(200).json({
            message: "Admin Registered & Wallet Funded Successfully!",
            Success: true,
        });

    } catch (error) {
        console.error("Error Funding Wallet:", error);
        return res.status(500).json({
            message: "Failed to fund Stellar wallet!",
            Success: false
        });
    }
};



export const AdminLogin = async (req, res) => {
    try {
      const { id_no, email, password } = req.body;
      const userAgent = req.headers['user-agent'];
      const deviceId = req.headers['device-id'] || uuidv4();
  
      if (!email || !password || !id_no) {
        return res.status(400).json({ message: "Something is Missing...", Success: false });
      }
  
      const checkAdmin = await AdminData.findOne({ id_no });
      if (!checkAdmin) {
        return res.status(400).json({ message: "Admin Not Found...", Success: false });
      }
  
      const comparePassword = bcrypt.compareSync(password, checkAdmin.password);
      if (!comparePassword) {
        return res.status(400).json({ message: "Password is Incorrect...", Success: false });
      }
  
      // 🔍 Detect device info from User-Agent
      const browser = Bowser.getParser(userAgent);
      const parsedInfo = browser.getResult();
      const deviceInfo = {
        os: parsedInfo.os.name + ' ' + parsedInfo.os.versionName,
        browser: parsedInfo.browser.name + ' ' + parsedInfo.browser.version,
        platform: parsedInfo.platform.type,
      };
  
      // Generate JWT token
      const token = jwt.sign({ id: checkAdmin._id }, SECRET_KEY, { expiresIn: "1h" });
  
      //  Save session in Redis
      const redisKey = `session:${checkAdmin._id}:${deviceId}`;
      await redis.set(redisKey, token, 'EX', 3600); // expires in 1 hour
  
      // Save device info in Redis
      const deviceInfoKey = `device-info:${checkAdmin._id}:${deviceId}`;
      await redis.set(deviceInfoKey, JSON.stringify(deviceInfo), 'EX', 3600);
  
      return res.status(200).json({
        message: "Admin Login Successfully...",
        Success: true,
        token,
        deviceId,
        deviceInfo,
        walletAddress: checkAdmin.walletAddress,
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something Went Wrong...", Success: false });
    }
  };


 export const getDetails = async (req, res) => {
    try {
        const adminId = req.admin.id_no; // req.admin set by isadmin middleware
        const adminDetails = await AdminData.find({id_no:adminId}).select("-password -walletSecret");
        if (!adminDetails) {
            return res.status(404).json({ message: "Admin Not Found", Success: false });
        }
        res.status(200).json({
            message: "Admin Details...",
            Success: true,
            adminDetails
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something Went Wrong...", Success: false });
    }}


    export const logout = async (req, res) => {
        try {
          const adminId = req.admin._id.toString(); // from isAdmin middleware
          const deviceId = req.headers['device-id'];
      
          if (!deviceId) {
            return res.status(400).json({ message: "Device ID missing", Success: false });
          }
      
          const redisKey = `session:${adminId}:${deviceId}`;
          const deviceInfoKey = `device-info:${adminId}:${deviceId}`;
      
          const deleted = await redis.del(redisKey);
          await redis.del(deviceInfoKey);
      
          if (deleted === 0) {
            return res.status(404).json({ message: "Session not found", Success: false });
          }
      
          return res.status(200).json({ message: "Logout successful", Success: true });
        } catch (error) {
          console.error("Logout error:", error);
          res.status(500).json({ message: "Logout failed", Success: false });
        }
      };

      export const getAllLoggedInDevices = async (req, res) => {
        try {
          const adminId = req.admin._id.toString(); // req.admin set by isAdmin middleware
          const pattern = `session:${adminId}:*`;
      
          // Get all matching session keys
          const sessionKeys = await redis.keys(pattern);
      
          const devices = [];
      
          for (const key of sessionKeys) {
            const parts = key.split(':');
            const deviceId = parts[2];
      
            // Get JWT token for this session
            const token = await redis.get(key);
      
            // Get device info from Redis if available
            const deviceInfoKey = `device-info:${adminId}:${deviceId}`;
            const deviceInfoRaw = await redis.get(deviceInfoKey);
            const deviceInfo = deviceInfoRaw ? JSON.parse(deviceInfoRaw) : {};
      
            devices.push({
              deviceId,
              token,
              deviceInfo
            });
          }
      
          res.status(200).json({
            success: true,
            devices,
            message: `Active devices for admin ${adminId}`
          });
      
        } catch (error) {
          console.error('Error fetching active devices:', error);
          res.status(500).json({ success: false, message: 'Error fetching devices' });
        }
      };
      


export const getvoterDetails = async (req , res) => {   
    
    try {
        const getDetails = await VoterData.find()
        console.log(getDetails)
        if(!getDetails){
            return res.status(400).json({message:"No Voter Found...",
                 Success:false
                })
        }
        res.status(200).json({message:"All Voters..." ,
            Success:true ,
            getDetails
        })
        
    } catch (error) {
        console.log(error)
        res.status(400).json({message:"Something Went Wrong...",  
            Success:false
        })
}}

export const Register_Voter = async(req , res)=>{
    const {voterId , name , dob, location } = req.body
    if(!voterId || !name || !dob || !location){
        return res.status(400).json({message:"Something is Missing...",
            Success:false
        })
    }
    const checkVoter = await VoterData.findOne({voterId})
    if(checkVoter){
        return res.status(400).json({message:"Voter Already Register...",
            Success:false
        })
    }
    const voterDetails = await VoterData.create({
        voterId,
        name,
        dob,
        location
    })
    res.status(200).json({message:"Voter Register Successfully...",
        Success:true,
        voterDetails
    })
}

export const totalRegisterVoter = async (req , res) => {
    const totalVoter = await VoterData.find()
    if(!totalVoter || totalVoter.length === 0){
        return res.status(400).json({message:"No Voter Found...",
            Success:false
        })
    }
    res.status(200).json({message:"Total Voter Count...",
        Success:true,
        totalVoter:totalVoter.length
    })
   
}


// Add to your backend
export const getCurrentPhase = async (req, res) => {
  const adminId = req.admin?.id_no;
  const admin = await AdminData.findOne({ id_no: adminId });
  if (!admin) {
    return res.status(404).json({ message: "Admin not found", Success: false });
  }

  return res.status(200).json({
    Success: true,
    currentPhase: admin.currentPhase,
  });
};


export const electionPhase = async(req , res)=>{
    const {currentPhase} = req.body
    const adminId = req.admin?.id_no;
    
    if(!currentPhase){
        return res.status(400).json({message:"Something is Missing...",
            Success:false
        })
    }
    const updatePhase = await AdminData.findOneAndUpdate({id_no:adminId} ,{$set:{currentPhase:currentPhase}})
    res.status(200).json({message:"Phase Updated Successfully...",
        Success:true,
    })
}

   
