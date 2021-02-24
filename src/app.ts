import express from "express"
import socketio from "socket.io";
import path from 'path'
import { Producto } from './producto'
import {CommonRoutesConfig} from './rutas/common.route.config'
import {UsersRoutes} from './rutas/users.route.config'
import handlebars from 'express-handlebars'

const routes: Array<CommonRoutesConfig> = []

const app = express()
app.set("port", process.env.PORT || 8080);
var http = require("http").Server(app);
let io = require("socket.io")(http);

let productos: Producto [] = []
routes.push(new UsersRoutes(app, productos))

app.use(express.static('public'))

app.engine(
    "hbs", 
    handlebars({
        extname: ".hbs",
        defaultLayout: "ingresar.hbs", 
        layoutsDir: path.join(__dirname,  '..', 'views', 'layouts'),
        partialsDir: path.join(__dirname, '..', 'views', 'partials')
    })
)

app.set('views', path.join(__dirname, '..', 'views'))
app.set('view engine', 'hbs')

io.on("connection", function(socket: any) {
    socket.emit('coneccion', 'Bienvenidx, por favor indique su nombre')
    socket.emit("recargar", productos)
    
    socket.on('bienvenida', (data: any) => {
        console.log(data);
    });

    socket.on("newProd", function(message: any) {
        // console.log(message);
        let id = (productos.length + 1).toString()
            // console.log(req.body)
        const {title, price, thumbnail, nombre} = message
        const prod = {
                    id,
                    title,
                    price: parseInt(price),
                    thumbnail
        }
        productos.push(prod)
        socket.broadcast.emit("recargar", productos)
        socket.emit("recargar", productos)
        console.log(`${nombre} ha agregado un producto`)
        console.log(productos)
    });
    
});

http.listen(8080, () => {
    console.log('escuchando en 8080')
}).on('error', console.log);