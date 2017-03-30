var converter = require('number-to-words');

function SqueezePlayer (server, properties) {
    this.server = server;
    this.properties = properties;
}

SqueezePlayer.prototype.request = function (commandArray) {
    return this.server.request(this.properties.playerid, commandArray);
};

SqueezePlayer.prototype.power = function (state) {
    return this.request(state ? ['power', 1] : ['power', 0]);
};

SqueezePlayer.prototype.play = function () {
    return this.request(['play']);
};

SqueezePlayer.prototype.playRandom = function () {
    return this.request(['randomplay', 'tracks']);
};

SqueezePlayer.prototype.stop = function () {
    return this.request(['stop']);
};

SqueezePlayer.prototype.mute = function () {
    return this.request(['mixer', 'muting', 1]);
};

SqueezePlayer.prototype.unmute = function () {
    return this.request(['mixer', 'muting', 0]);
};

SqueezePlayer.prototype.volume = function (level) {
    return this.request(['mixer', 'volume', level]);
};

SqueezePlayer.prototype.playArtist = function (artist) {
    console.log('searching for artist: ' + artist);
    return new Promise((resolve, reject) => {
        this.request(['artists', 0, 100, 'search: ' + artist]).then((reply) => {
            if (reply.result.count === 0 && !isNaN(parseInt(artist))) {
                var number = parseInt(artist);
                var adjustedArtist = artist.replace(number, converter.toWords(number));
                return this.playArtist(adjustedArtist);
            }
            var artistId = reply.result.artists_loop[0].id;
            this.request(['playlist', 'shuffle', 1]).then(
                this.request(['playlistcontrol', 'cmd:load', 'artist_id:'+ artistId]).then(() => {
                    resolve();
                })
            );
        });
    });
};

SqueezePlayer.prototype.playGenre = function (genre) {
    return new Promise((resolve, reject) => {
        this.request(['genres', 0, 100, 'search: ' + genre]).then((reply) => {
            var genre = reply.result.genres_loop[0];
            this.request(['playlist', 'shuffle', 1]).then(
                this.request(['playlistcontrol', 'cmd:load', 'genre_id:'+ genre.id]).then(() => {
                    resolve();
                })
            );
        });
    });
};

module.exports = SqueezePlayer;