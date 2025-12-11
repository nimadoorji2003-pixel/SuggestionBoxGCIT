const getSystemHealth = async (req, res) => {
    res.status(200).json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      // You can add more later: db status, version, etc.
    });
  };
  
  module.exports = {
    getSystemHealth,
  };
  