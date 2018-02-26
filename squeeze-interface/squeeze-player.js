var log = require('../log');

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

SqueezePlayer.prototype.skip = function () {
    return this.request(['playlist', 'index', '+1']);
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

SqueezePlayer.prototype.volumeUp = function () {
    return this.request(['mixer', 'volume', '+15']);
};

SqueezePlayer.prototype.volumeDown = function () {
    return this.request(['mixer', 'volume', '-15']);
};

SqueezePlayer.prototype.playArtist = function (artistName, context) {
    log.info('Searching for artist: ' + artistName);
    return new Promise((resolve, reject) => {
        this.server.searchArtists(artistName, context).then((artist) => {
            log.info('Found artist: ' + JSON.stringify(artist));
            this.request(['playlist', 'shuffle', 1]).then(() => {
                log.info('Shuffling');
                this.request(['playlistcontrol', 'cmd:load', 'artist_id:' + artist.id]).then(() => {
                    log.info('Playing artist: ' + JSON.stringify(artist));
                    resolve();
                });
            });
        });
    });
};

SqueezePlayer.prototype.playGenre = function (genre) {
    return new Promise((resolve, reject) => {
        this.request(['genres', 0, 100, 'search: ' + genre]).then((reply) => {
            var genre = reply.result.genres_loop[0];
            this.request(['playlist', 'shuffle', 1]).then(
                this.request(['playlistcontrol', 'cmd:load', 'genre_id:' + genre.id]).then(() => {
                    resolve();
                })
            );
        });
    });
};

SqueezePlayer.prototype.playSong = function (songTitle, artistName, context) {
    return new Promise((resolve, reject) => {
        this.server.searchArtists(artistName, context).then((artist) => {
        	var filter = artist ? 'artist_id:' + artist.id : null;
        	
    		this.server.searchTitles(songTitle, filter).then((songs) => {
                log.info('Playing song: ' + JSON.stringify(songTitle));
                this.request(['playlistcontrol', 'cmd:load', 'track_id:' + songs[0].id]).then(() => {
                    resolve();
                })
            });
        });
    });
};

module.exports = SqueezePlayer;