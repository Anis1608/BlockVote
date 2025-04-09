import exprss from 'express';
import { downloadStellarCSV, getCandidateVotesbyadmin  , totalvotesofallcandidate} from '../controllers/resultController.js';
import { isadmin } from '../middleware/checkisadmin.js';

const resultRoutes = exprss.Router();

resultRoutes.route("/public-result").get(getCandidateVotesbyadmin);
resultRoutes.route("/total-votes").get(isadmin , totalvotesofallcandidate);
resultRoutes.route("/downloadStellar").get( isadmin , downloadStellarCSV);

export default resultRoutes;