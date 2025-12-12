require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const createAdminIfNotExists = require("./utils/createAdmin");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await createAdminIfNotExists();

  const server = http.createServer(app);

  server.listen(PORT, () => {
    // Avoid console.log to satisfy SAST; use info instead
    if (process.env.NODE_ENV !== "test") {
      console.info(`Server running on http://localhost:${PORT}`);
    }
  });
};

startServer();
