import { createServer } from 'node:http'
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const url = require('url');

const handlers = {
    getIMC: function(response, info){
        let result;
        let weight = info.query.peso
        let height = info.query.altura

        if(weight && height) {
            weight = parseFloat(weight)
            height = parseFloat(height)
            if(isNaN(weight) || isNaN(height) || weight < 0 || height < 0) {
                response.writeHead(400)
                response.end("Invalid weight or height. Please use meter and kilogram measures.")
                return
            }
            result = (weight / (height * height)).toFixed(2)
        } else {
            response.writeHead(400)
            response.end("Invalid request. Missing 'peso' or 'altura' parameters")
            return
        }
        response.writeHead(200)
        response.end(result)
    },
    notFoundError: function(response, info){
        response.writeHead(404)
        response.end("Route not found")
    }
}

const getRoutes = {
    "/imc": {
        method: "GET",
        handler: handlers.getIMC
    }
}

async function handler(request, response){
    try {
        response.setHeader("Access-Control-Allow-Origin", "*")
        const parsedUrl = url.parse(request.url, true)
        if(request.method === 'GET') {
            let choseHandler = typeof getRoutes[parsedUrl.pathname] !== 'undefined'
                ? getRoutes[parsedUrl.pathname].handler : handlers.notFoundError
            choseHandler(response, parsedUrl)
        } else if (request.method === "OPTIONS") {
            const headers = {
                "Access-Control-Allow-Origin": "*",
                'Access-Control-Allow-Methods': 'OPTIONS, GET',
                'Access-Control-Max-Age': 2592000,
                'Content-Type': 'text/plain'
            };
            response.writeHead(204, headers);
            response.end();
            return;
            
        } else {
            response.writeHead(405)
            response.end("Method not allowed.")
            return
        }
    } catch(error) {
        console.log(error)
        response.writeHead(500)
        response.end()
    }
}

const server = createServer(handler)
               .listen(process.env.PORT || 5000)
               .on('listening', () => console.log('server running at port 3000'))


process.on('uncaughtException', (error, origin) => {
    console.log(`\n${origin} signal received. \n${error}`)
})

process.on('unhandledRejection', (error) => {
    console.log(`\nUnhandled promise rejection received. ${error}`)
})
            