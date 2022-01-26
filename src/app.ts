import express from "express"
import { authRoutes } from "./routes/auth"
import { mainRoutes } from "./routes/main"

// export needed for unit/integration testing
export const app = express()

// parse JSON when content type is application/json
app.use(express.json())

authRoutes(app)
mainRoutes(app)