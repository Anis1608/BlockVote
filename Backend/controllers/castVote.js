import StellarSdk from "stellar-sdk";
import bcrypt from "bcryptjs";
import AdminData from "../models/Admin.js";

import Voter from "../models/Voter.js";
import Candidate from "../models/Candidate.js";

const STELLAR_SERVER = "https://horizon-testnet.stellar.org"; // Stellar Testnet link
// const STELLAR_SECRET = "SB4L3577Z5RYXII6S6C6JRK2MFKNPX2XRYKTKG4HQLWIWZP4W4HOFBBK"; //  Secret Key
// const STELLAR_ACCOUNT = "GB4EJAAKTHEBXOYBN3IX3EYXXN2PWMXUVIWVBYYVV274M5M3LZOZNMFX"; //  Public Key

export const castVote = async (req, res) => {
    const { voterId, candidateId } = req.body;
    const adminId = req.admin?.id_no;
    console.log("admin data:" , adminId)

    const server = new StellarSdk.Server(STELLAR_SERVER);
    
    try {
        // Verify Voter & Candidate in Database
        const voter = await Voter.findOne({ voterId });
        // console.log(voter)
        const candidate = await Candidate.findOne({ candidateId });
        if (!voter || !candidate) {
            console.log("Voter or Candidate Not Found!");
            return res.status(404).json({Success:false  , error: "Voter or Candidate Not Found!" });
        }
        if (voter.voteCast == true) {
            console.log("Voter has already casted vote!");
            return res.status(400).json({Success:false  , error: "Voter has already casted vote!" });
        }

        const requestedAdminData = await AdminData.findOne({ id_no: adminId });
        // console.log("REquested Adimn data Fetched :" , requestedAdminData)
        //Load Account Info (Get Sequence Number)
        const account = await server.loadAccount(requestedAdminData.walletAddress);
        const sequence = account.sequence;

        // Encyrpt Voter ID & Candidate ID
        const EncyrptedvoterId = bcrypt.hashSync(voterId,  10);

        //Create Stellar Transaction
        const transaction = new StellarSdk.TransactionBuilder(account, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks.TESTNET
        })
        .addOperation(StellarSdk.Operation.payment({
            destination: requestedAdminData.walletAddress,
            asset: StellarSdk.Asset.native(), 
            amount: "0.00001", 
        }))
        .addMemo(StellarSdk.Memo.text(`Vote:${voterId}->${candidateId}`)) 
        .setTimeout(30)
        .build();

        //Sign Transaction
        const voterKeypair = StellarSdk.Keypair.fromSecret(requestedAdminData.walletSecret);
        transaction.sign(voterKeypair);

        //Submit Transaction
        const response = await server.submitTransaction(transaction);

        //Check Response
        if (response.successful) {
            console.log("Vote Successfully Recorded on Stellar!");
            //Update Voter in Database
            await Voter.findOneAndUpdate(
                { voterId }, // Find voter by ID
                { $set: { voteCast: true } }, 
            );
            return res.status(200).json({ message: "Vote recorded!", Success:true ,  hash: response.hash });
        } else {
            console.log(`Transaction Failed: ${response.extras?.result_codes?.transaction}`);
            return res.status(400).json({Success:false  , error: response.extras?.result_codes?.transaction });
        }

    } catch (error) {
        console.error("Error in castVote:", error);
        return res.status(500).json({Success:false  , error: "Internal Server Error" });
    }
};

export const voter_login = async (req, res) => {
    try {
        const { voterId } = req.body;
        if (!voterId) {
            return res.status(400).json({ message: "Voter ID is required", Success: false });
        }
        const voter = await Voter.findOne({ voterId });
        if (!voter) {
            return res.status(404).json({ message: "Voter not found", Success: false });
        }
        res.status(200).json({ message: "Login successful", Success: true,  voter });    
        // Generate JWT token (if needed)
        // const token = jwt.sign({ id: voter._id }, SECRET_KEY, { expiresIn: '1h' });

    } catch (error) {
        console.error("Error in voter_login:", error);
        res.status(500).json({ message: "Internal Server Error", Success: false });
    }
}