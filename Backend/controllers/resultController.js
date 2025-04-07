import StellarSdk from "stellar-sdk";
import Candidate from "../models/Candidate.js";
import AdminData from "../models/Admin.js";
import axios from "axios";
import { Parser } from 'json2csv';
import fs from 'fs';

const STELLAR_SERVER = "https://horizon-testnet.stellar.org";
const server = new StellarSdk.Server(STELLAR_SERVER);



export const getCandidateVotes = async (req, res) => {
    try {
        const adminWalletAddress = req.admin.walletAddress;

        const candidates = await Candidate.find();
        if (!candidates || candidates.length === 0) {
            return res.status(404).json({ error: "No Candidates Found!" });
        }

        let votesByCity = {};
        let votesByState = {};

        for (let candidate of candidates) {
            const { candidateId, name, location, party } = candidate;

            const transactions = await server.transactions()
                .forAccount(adminWalletAddress)
                .call();

            if (!transactions.records) continue;

            let voteCount = 0;
            transactions.records.forEach(tx => {
                if (tx.memo && tx.memo.includes(`Vote:`) && tx.memo.endsWith(`->${candidateId}`)) {
                    voteCount++;
                }
            });

            const { city, state } = location;
            if (!votesByCity[city]) {
                votesByCity[city] = [];
            }
            votesByCity[city].push({ candidateId, name, party, voteCount });

            if (!votesByState[state]) {
                votesByState[state] = {};
            }
            if (!votesByState[state][party]) {
                votesByState[state][party] = 0;
            }
            votesByState[state][party] += voteCount;
        }

        // Get the city-wise winners
        let cityWinners = {};
        for (let city in votesByCity) {
            let highestVotes = -1;
            let winner = {};
            votesByCity[city].forEach(candidate => {
                if (candidate.voteCount > highestVotes) {
                    highestVotes = candidate.voteCount;
                    winner = candidate;
                }
            });
            cityWinners[city] = {
                winner: winner.name,
                party: winner.party,
                votes: highestVotes
            };
        }

        // Get the state-wise winners based on vote counts (not city wins)
        let stateWinners = {};
        for (let state in votesByState) {
            let partyVotes = votesByState[state];
            let winningParty = '';
            let maxVotes = -1;
            for (let party in partyVotes) {
                if (partyVotes[party] > maxVotes) {
                    maxVotes = partyVotes[party];
                    winningParty = party;
                }
            }
            stateWinners[state] = {
                winningParty,
                votes: maxVotes
            };
        }

        return res.status(200).json({
            cityWinners,
            stateWinners
        });

    } catch (error) {
        console.error("Error in getCandidateVotes:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

   
export const totalvotesofallcandidate = async (req, res) => {
    try {
        const admindata = await AdminData.find();
        if (!admindata || admindata.length === 0) {
            return res.status(404).json({ error: "No Candidates Found!" });
        }

        let totalVotes = 0;

        for (let candidate of admindata) {
            const candidateAddress = candidate.walletAddress;
            if (
                !candidateAddress ||
                typeof candidateAddress !== 'string' ||
                !candidateAddress.startsWith('G') ||
                candidateAddress.length !== 56
            ) {
                // console.warn(`Skipping invalid walletAddress: ${candidateAddress}`);
                continue;
            }

            try {
                await server.loadAccount(candidateAddress);
            } catch (err) {
                // console.warn(`Skipping inactive or unfunded address: ${candidateAddress}`);
                continue;
            }

            const transactions = await server.transactions()
                .forAccount(candidateAddress)
                .call();

            if (!transactions.records) continue;

            transactions.records.forEach(tx => {
                if (tx.memo && tx.memo.includes("Vote:")) {
                    totalVotes++;
                }
            });
        }

        return res.status(200).json({
            totalVotes
        });

    } catch (error) {
        console.error("Error in totalvotesofallcandidate:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


export const downloadStellarCSV = async (req, res) => {
    try {
        const accountId = req.admin.walletAddress; // Use the admin's wallet address
        const horizonUrl = `https://horizon-testnet.stellar.org/accounts/${accountId}/transactions`;

        const response = await axios.get(horizonUrl);
        const transactions = response.data._embedded.records;

        if (transactions.length === 0) {
            return res.status(404).json({ error: "No transactions found." });
        }

        const formattedTransactions = transactions.map(tx => ({
            'Tx Hash': tx.hash,
            'Source Account': tx.source_account,
            'Fee Charged': tx.fee_charged,
            'Created At': tx.created_at,
        }));

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(formattedTransactions);

        const filename = `stellar_transactions_${accountId.substring(0, 6)}.csv`;
        fs.writeFileSync(filename, csv);
        
        return res.status(200).download(filename, () => {
            fs.unlinkSync(filename); // Delete the file after sending it
        });

    } catch (error) {
        console.error('Error fetching transactions:', error.message);
        return res.status(500).json({ error: 'Error fetching transactions.' });
    }

}