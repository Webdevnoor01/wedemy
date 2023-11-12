const http = require("http")
// app
const app = require("./app/index")
// db
const db = require("./db")

const server = http.createServer(app)

const port = process.env.PORT || 5000

// connect the databse
db.connect(process.env.DATABASE_CONNECTION_URL).then(() => {
    console.log("Database connected successfylly")
    server.listen(port, () => {
        console.log("server listening on ", port)
    })
}).catch((e) => {
    console.log(e)
})