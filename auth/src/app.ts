import express from "express"
import 'express-async-errors'
import {json} from "body-parser"
import cookieSession from "cookie-session"
import {errorHandler, NotFoundError} from "@yustickets/common";

import {currentUserRouter} from "./routes/current-user";
import {signoutRouter} from "./routes/signout";
import {signupRouter} from "./routes/signup";
import {signinRouter} from "./routes/signin";

const app = express()

app.set('trust proxy', true)
app.use(json())
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',

}))

app.use(currentUserRouter)
app.use(signoutRouter)
app.use(signupRouter)
app.use(signinRouter)

app.all('*', async (req, res) => {
    throw new NotFoundError()
})

app.use(errorHandler)

export {app}
