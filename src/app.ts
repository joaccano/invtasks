require("dotenv").config();
import express, { Request, Response } from "express";
// import firebaseRoutes from "./routes/firebase.routes";
import routes from "./routes/routes";
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 3000;
import path from 'path';
const multer = require('multer');

app.set("port", PORT);
// app.all('*', function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, token, Accept, enctype');
//   if ('OPTIONS' == req.method) res.sendStatus(200);
//   else next();
// })

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/backups', express.static(path.join(__dirname, '..', 'backups')));
  
app.use(routes);

app.get("/", (req: Request, res: Response) => {
  res.send("Api REST VitalTrack!");
});

// Registrar las rutas
// app.use("/api", firebaseRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
