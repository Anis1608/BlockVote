import express from "express"
import { connectDatabase } from "./db.js";
import candidateRoutes from "./routes/candidaterRoutes.js"
import adminRoutes from "./routes/adminRoutes.js";
import castVoteRoutes from "./routes/castVoteRoutes.js";
import resultRoutes from "./routes/resultroutes.js";
import cors from "cors"
const app = express();
app.use(cors());
app.use(express.json())

// app.use("/voter" , user_routes)
app.use("/api" , candidateRoutes)
app.use("/api" , adminRoutes)
app.use("/api" , castVoteRoutes)
app.use("/api" , resultRoutes)

app.listen(5000, () =>{
//   database();
  console.log("Server Running on Port 5000")
});
connectDatabase()
