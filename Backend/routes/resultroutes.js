import exprss from 'express';
import { downloadStellarCSV, getCandidateVotes  , totalvotesofallcandidate} from '../controllers/resultController.js';
import { isadmin } from '../middleware/checkisadmin.js';

const resultRoutes = exprss.Router();

resultRoutes.route("/result").get(isadmin , getCandidateVotes);
resultRoutes.route("/total-votes").get(totalvotesofallcandidate);
resultRoutes.route("/downloadStellar").get( isadmin , downloadStellarCSV);

export default resultRoutes;