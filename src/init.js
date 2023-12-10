import "dotenv/config";
import "./db";
import "./models/Video";
import "./models/User";
import app from "./server";

const SERVER_PORT = 4000;

const handleListening = () =>
  console.log(`✅ Server listening on http://localhost:${SERVER_PORT}`);

app.listen(SERVER_PORT, handleListening);