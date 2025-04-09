import mongoose from "mongoose"

const voterSchema = new mongoose.Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin Details",
        required: true
    },
    voterId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    location: {
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        }
    },
    voteCast: {
        type: Boolean,
        default: false
    },
    voteTransactionId: {
        type: String
    }
})

const Voter_Details = mongoose.model("Voter Database", voterSchema)
export default Voter_Details
