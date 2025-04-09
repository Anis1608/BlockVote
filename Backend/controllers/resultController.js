import StellarSdk from "stellar-sdk";
import Candidate from "../models/Candidate.js";
import AdminData from "../models/Admin.js";
import axios from "axios";
import { Parser } from 'json2csv';
import fs from 'fs';

const STELLAR_SERVER = "https://horizon-testnet.stellar.org";
const server = new StellarSdk.Server(STELLAR_SERVER);

export const getCandidateVotesbyadmin = async (req, res) => {
    try {
        const { adminId } = req.query;

        if (!adminId) {
            return res.status(400).json({ error: "adminId is required in query parameters" });
        }

        // Fetch candidates registered by this admin
        const candidates = await Candidate.find({ admin:adminId });

        if (!candidates || candidates.length === 0) {
            return res.status(404).json({ error: "No Candidates Found for this admin!" });
        }

        // Fetch admin's wallet address
        const admin = await AdminData.findById(adminId);
        if (!admin || !admin.walletAddress) {
            return res.status(404).json({ error: "Admin wallet not found!" });
        }

        const transactions = await server.transactions()
            .forAccount(admin.walletAddress)
            .call();

        let candidateVotesList = [];

        for (let candidate of candidates) {
            const { candidateId, name, party, location } = candidate;

            let voteCount = 0;
            transactions.records.forEach(tx => {
                if (tx.memo && tx.memo.includes("Vote:") && tx.memo.endsWith(`->${candidateId}`)) {
                    voteCount++;
                }
            });

            candidateVotesList.push({
                candidateId,
                name,
                party,
                location,
                voteCount
            });
        }

        // Sort and extract top 5
        const top5Candidates = [...candidateVotesList]
            .sort((a, b) => b.voteCount - a.voteCount)
            .slice(0, 5);

        return res.status(200).json({
            top5Candidates,
            allCandidates: candidateVotesList
        });

    } catch (error) {
        console.error("Error :", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


export const totalvotesofallcandidate = async (req, res) => {
    try {
        const adminId = req.admin._id; 
        const admin = await AdminData.findById(adminId);

        if (!admin || !admin.walletAddress) {
            return res.status(404).json({ error: "Admin wallet address not found!" });
        }

        const adminAddress = admin.walletAddress;

        if (
            typeof adminAddress !== 'string' ||
            !adminAddress.startsWith('G') ||
            adminAddress.length !== 56
        ) {
            return res.status(400).json({ error: "Invalid wallet address!" });
        }

        try {
            await server.loadAccount(adminAddress);
        } catch (err) {
            return res.status(400).json({ error: "Admin wallet address is inactive or unfunded!" });
        }

        const transactions = await server.transactions()
            .forAccount(adminAddress)
            .call();

        let totalVotes = 0;

        if (transactions.records && transactions.records.length > 0) {
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