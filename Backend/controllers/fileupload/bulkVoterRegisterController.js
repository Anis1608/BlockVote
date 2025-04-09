import fs from "fs";
import path from "path";
import xlsx from "xlsx";
import csvParser from "csv-parser";
import VoterData from "../../models/Voter.js";

export const bulkRegisterVoters = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded", Success: false });
    }

    const filePath = file.path;
    const ext = path.extname(file.originalname).toLowerCase();
    const adminId = req.admin._id;

    const voters = [];

    const processRow = (row) => {
      const voterId = row.voterId?.toString().trim();
      const name = row.name?.toString().trim();
      const dobRaw = row.dob?.toString().trim();
      const city = row.city?.toString().trim();
      const state = row.state?.toString().trim();

      if (!voterId || !name || !dobRaw || !state || !city) return;

      // Convert DD-MM-YYYY or DD/MM/YYYY to YYYY-MM-DD
      let dob = dobRaw;
      const dateMatch = dobRaw.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
      if (dateMatch) {
        const [_, dd, mm, yyyy] = dateMatch;
        dob = `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
      } else {
        return;
      }

      voters.push({
        voterId,
        name,
        dob,
        location: {
          state,
          city,
        },
        admin: adminId,
      });
    };

    const saveVoters = async () => {
      const results = [];

      for (const voter of voters) {
        const exists = await VoterData.findOne({ voterId: voter.voterId, admin: adminId });
        if (!exists) {
          results.push(await VoterData.create(voter));
        }
      }

      // Delete file after processing
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log("File deleted:", filePath);
        }
      });

      return res.status(200).json({
        message: "Voters processed successfully",
        Success: true,
        totalUploaded: results.length,
        totalSkipped: voters.length - results.length,
      });
    };

    if (ext === ".csv") {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", processRow)
        .on("end", async () => {
          await saveVoters();
        });
    } else if (ext === ".xlsx") {
      const workbook = xlsx.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);
      data.forEach(processRow);
      await saveVoters();
    } else {
      fs.unlinkSync(filePath); // delete unsupported files immediately
      return res.status(400).json({ message: "Unsupported file type", Success: false });
    }
  } catch (error) {
    console.error("Bulk voter registration error:", error);
    return res.status(500).json({ message: "Internal Server Error", Success: false });
  }
};
