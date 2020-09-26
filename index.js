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
