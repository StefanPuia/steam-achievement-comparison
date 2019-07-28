/* jslint node:true */
'use strict';

const API_URL = "https://api.steampowered.com";
const fetch = require("node-fetch");

function param(obj) {
    let params = [];
    for (let key in obj) {
        params.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]));
    }
    return params.join("&");
}

module.exports = class Steam {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    doSteamAPICall(url, params) {
        let payload = {
            key: this.apiKey
        };
        Object.assign(payload, params)
        return new Promise((resolve, reject) => {
            fetch(`${API_URL}/${url}?${param(payload)}`)
                .then(res => res.json())
                .then(resolve)
                .catch(err => {
                    console.log(err);
                    reject(err);
                });
        });
    }

    getUserAchievements(appId, userId) {
        return new Promise((resolve, reject) => {
            this.doSteamAPICall(`ISteamUserStats/GetPlayerAchievements/v0001/`, {
                steamid: userId,
                appId: appId
            })
            .then(data => {
                if (data.playerstats.success === false) reject(data.playerstats.error);
                resolve(data);
            });
        });
    }

    getGameSchema(appId) {
        return this.doSteamAPICall(`ISteamUserStats/GetSchemaForGame/v0002/`, {
            appId: appId
        });
    }

    getGameAchevements(appId) {
        return new Promise((resolve, reject) => {
            this.getGameSchema(appId)
            .then(data => {
                let schema = {
                    game: data.game,
                    achievements: {}
                };
                for (let a of data.game.availableGameStats.achievements) {
                    schema.achievements[a.name] = a;
                }
                resolve(schema);
            })
            .catch(reject);
        });
    }
};