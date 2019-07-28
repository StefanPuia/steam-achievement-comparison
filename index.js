/* jslint node:true */
'use strict';

const app = require("express")();
const bodyParser = require('body-parser');
const Steam = require("./steam");
const path = require("path");

const API_KEY = "";
const client = new Steam(API_KEY);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get("/get/:appId/:userId", (req, res) => {
    Promise.all([
        client.getGameAchevements(req.params.appId),
        client.getUserAchievements(req.params.appId, req.params.userId)
    ])
    .then(results => {
        const userAchievements = mergeSchema(results[0], results[1]);

        res.render("userachievements", {
            stats: userAchievements.playerstats
        });
    })
    .catch(err => {
        console.log(err);
        res.send(500);
    });
});

app.get("/compare/:appId/:userId1/:userId2", (req, res) => {
    Promise.all([
        client.getGameAchevements(req.params.appId),
        client.getUserAchievements(req.params.appId, req.params.userId1),
        client.getUserAchievements(req.params.appId, req.params.userId2)
    ])
    .then(results => {
        const user1Achievements = mergeSchema(results[0], results[1]);
        const user2Achievements = mergeSchema(results[0], results[2]);
        
        res.render("compare", {
            stats1: user1Achievements.playerstats,
            stats2: user2Achievements.playerstats
        });
    })
    .catch(err => {
        console.log(err);
        res.send(err);
    });
});


app.listen(80, () => {
    console.log("listening");
});

function mergeSchema(schema, userdata) {
    for (let a of userdata.playerstats.achievements) {
        a.data = schema.achievements[a.apiname];
    }
    return userdata;
}