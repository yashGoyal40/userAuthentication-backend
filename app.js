import express from 'express'
import { config } from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { connection } from "./database/connection.js"
import { errorMiddleware } from './middlewares/error.js'

import userRouter from "./routes/UserRoutes.js"

import { deletePendingUsers } from './automation/DeletePengingUser.js'
const app = express()


config({path:"./config/config.env"})

app.use(cors({
  origin: [process.env.FRONTEND_URL],
  methods: ['GET','PUT','POST','DELETE'],
  credentials: true
}))

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use('/api/v1/user',userRouter)

deletePendingUsers()
connection()

app.use(errorMiddleware)

export default app
