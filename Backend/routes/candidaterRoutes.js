import express from "express";
import { RegisterCandidate , getAllCandidates , SameCityCandidate , totalnoCandidate } from "../controllers/candidateController.js";
import { isadmin } from "../middleware/checkisadmin.js";

const candidateRoutes = express.Router()

candidateRoutes.route("/register-candidate").post(isadmin  ,RegisterCandidate )
candidateRoutes.route("/all-candidate").get(getAllCandidates)
candidateRoutes.route("/city-candidate").get(SameCityCandidate)
candidateRoutes.route("/total-candidate").get(totalnoCandidate)

export default candidateRoutes;
