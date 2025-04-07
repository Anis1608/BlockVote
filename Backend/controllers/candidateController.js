import candidateModel from "../models/Candidate.js"
import VoterModel from "../models/Voter.js"

export const RegisterCandidate = async (req , res) => {

    try {
        const {candidateId , name , profilePic , age , qualification , location , party} = req.body;
        if(!candidateId || !name || !profilePic || !age || !qualification || !location || !party){
            return res.status(400).json({message:"Something is Missing..."})
        }
        const checkCandidate = await candidateModel.findOne({candidateId})
        if(checkCandidate){
            return res.status(400).json({
                message:"Candidate Already Register...", 
                success:false}  )
        }
        if(age < 18){
            return res.status(400).json({message:"Candidate Age Should be Greater than 18...",
                success:false
            })
        }
        const candidateDetails = await candidateModel.create({
            candidateId,
            name,
            profilePic,
            age,
            qualification,
            location,
            party
        })
        res.status(200).json({message:"Candidate Register Successfully...",
             success:true ,
              candidateDetails
            })

    } catch (error) {
        console.log(error)
        res.status(400).json({message:"Something Went Wrong...",
            success:false
        })
        
    }  
}

export const getAllCandidates = async (req , res)=>{
    try {
        const getDetails = await candidateModel.find()
        console.log(getDetails)
        if(!getDetails){
            return res.status(400).json({message:"No Candidate Found...",
                 success:false
                })
        }
        res.status(200).json({message:"All Candidates..." ,
            success:true ,
            getDetails
        })
        
    } catch (error) {
        console.log(error)
        res.status(400).json({message:"Something Went Wrong...",  
            success:false
        })
}}

export const SameCityCandidate = async (req, res) => {
    try {
         const { voterId } = req.body; 
        if (!voterId) {
            return res.status(400).json({ message: "Voter ID is required", success: false });
        }
        const voter = await VoterModel.findOne({ voterId });
        if (!voter) {
            return res.status(404).json({ message: "Voter not found", success: false });
        }
    


        const candidates = await candidateModel.find({ 
            "location.city":  voter.location.city
        });
        console.log(candidates)

        if (candidates.length === 0) {
            return res.status(404).json({ message: "No candidates found in your area", Success: false });
        }

        res.status(200).json({
            message: "Candidates from your City & State",
            Success: true,
            candidates
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong", success: false });
    }
};

export const totalnoCandidate = async (req, res) => {
    try {
        const totalCandidateCount = await candidateModel.countDocuments();

        if (totalCandidateCount === 0) {
            return res.status(404).json({
                message: "No Candidates Found.",
                success: false
            });
        }

        res.status(200).json({
            message: "Total Candidates Count Fetched.",
            success: true,
            totalCandidates: totalCandidateCount
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something Went Wrong...",
            success: false
        });
    }
};

