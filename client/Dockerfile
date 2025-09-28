# Multi-stage build for React app
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --silent

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage with simple Node.js server
FROM node:18-alpine

# Copy built app from build stage
COPY --from=build /app/build /app/build

# Debug: List files to verify build
RUN ls -la /app/build

# Create simple server script with API proxy
RUN echo 'const http = require("http"); \
const https = require("https"); \
const fs = require("fs"); \
const path = require("path"); \
const url = require("url"); \
const port = process.env.PORT || 3000; \
const host = "0.0.0.0"; \
const backendUrl = process.env.BACKEND_URL || "https://ugc-validation-system-production.up.railway.app"; \
const mimeTypes = { \
  ".html": "text/html", \
  ".js": "text/javascript", \
  ".css": "text/css", \
  ".json": "application/json", \
  ".png": "image/png", \
  ".jpg": "image/jpg", \
  ".gif": "image/gif", \
  ".svg": "image/svg+xml", \
  ".wav": "audio/wav", \
  ".mp4": "video/mp4", \
  ".woff": "application/font-woff", \
  ".ttf": "application/font-ttf", \
  ".eot": "application/vnd.ms-fontobject", \
  ".otf": "application/font-otf", \
  ".wasm": "application/wasm" \
}; \
const server = http.createServer((req, res) => { \
  if (req.url === "/health") { \
    res.writeHead(200, { "Content-Type": "application/json" }); \
    res.end(JSON.stringify({ status: "OK", timestamp: new Date().toISOString() })); \
    return; \
  } \
  if (req.url.startsWith("/api/")) { \
    const backendPath = req.url.replace("/api", ""); \
    const backendUrlParsed = new url.URL(backendUrl + backendPath); \
    const isHttps = backendUrlParsed.protocol === "https:"; \
    const requestModule = isHttps ? https : http; \
    const backendReq = requestModule.request(backendUrlParsed, { \
      method: req.method, \
      headers: req.headers \
    }, (backendRes) => { \
      res.writeHead(backendRes.statusCode, backendRes.headers); \
      backendRes.pipe(res); \
    }); \
    req.pipe(backendReq); \
    backendReq.on("error", (err) => { \
      console.error("Backend request error:", err); \
      res.writeHead(500, { "Content-Type": "application/json" }); \
      res.end(JSON.stringify({ error: "Backend service unavailable" })); \
    }); \
    return; \
  } \
  let filePath = path.join(__dirname, "build", req.url === "/" ? "index.html" : req.url); \
  const extname = String(path.extname(filePath)).toLowerCase(); \
  const mimeType = mimeTypes[extname] || "application/octet-stream"; \
  fs.readFile(filePath, (error, content) => { \
    if (error) { \
      if (error.code == "ENOENT") { \
        fs.readFile(path.join(__dirname, "build", "index.html"), (error, content) => { \
          res.writeHead(200, { "Content-Type": "text/html" }); \
          res.end(content, "utf-8"); \
        }); \
      } else { \
        res.writeHead(500); \
        res.end("Sorry, check with the site admin for error: " + error.code + " ..\\n"); \
      } \
    } else { \
      res.writeHead(200, { "Content-Type": mimeType }); \
      res.end(content, "utf-8"); \
    } \
  }); \
}); \
server.listen(port, host, () => { \
  console.log(`Server running at http://${host}:${port}/`); \
  console.log(`Backend URL: ${backendUrl}`); \
});' > /app/server.js

# Expose port 3000
EXPOSE 3000

# Start server with debug
CMD ["sh", "-c", "echo 'Starting Node.js server...' && ls -la /app/build && node /app/server.js"]
