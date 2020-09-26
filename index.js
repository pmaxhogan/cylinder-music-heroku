const fetch = require("node-fetch");

const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`)
})

const getAllOfSomething = async (url, auth, token) => {
    let lastResult = null;
    let data = [];
    while(!lastResult || data.length < lastResult.meta.total){
        const req = await fetch(url + "&offset=" + data.length, {
            "headers": {
                "authorization": auth,
                "media-user-token": token
            }
        })
        const response = await req.json();
        if(!req.ok) throw new Error(`${req.status} ${JSON.stringify(response)}`);
        data = data.concat(response.data);
        lastResult = response;
    }
    return data;
};


app.get('/api/getAlbums', async (request, response) => {
    if(!request.query.auth || !request.query.token || typeof request.query.auth !== "string" || typeof request.query.token !== "string"){
        return response.status(400).end();
    }
    const results = await getAllOfSomething("https://amp-api.music.apple.com/v1/me/library/albums?include[library-albums]=artists&include[library-artists]=catalog&fields[artists]=url&includeOnly=catalog%2Cartists&limit=100", request.query.auth, request.query.token);
    response.json(results);
})

app.get('/api/imgProxy', async (request, response) => {
    let isInvalid = false;
    if(!request.query.url || typeof request.query.url !== "string"){
        isInvalid = true;
    }
    try{
        const url = new URL(request.query.url.toString());
        if(!url.hostname.endsWith(".mzstatic.com")){
            isInvalid = true;
        }
    }catch (e) {
        isInvalid = true;
    }

    if(isInvalid){
        return response.status(400).end();
    }


    const resp = await fetch(request.query.url);
    response.header("Content-Type", resp.headers.get("content-type"))
    response.header("cache-control", resp.headers.get("cache-control"))
    response.header("etag", resp.headers.get("etag"))
    response.header("content-length", resp.headers.get("content-length"))
    response.header("last-modified", resp.headers.get("last-modified"))
    resp.body.pipe(response);
})
