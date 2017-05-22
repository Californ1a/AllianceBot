var send = (chan, msg, options) => {
	return new Promise((resolve, reject) => {
		if (options) {
			chan.send(msg, options).then(m => {
				resolve(m);
			}).catch(e => {
				reject(e);
			});
		} else {
			chan.send(msg).then(m => {
				resolve(m);
			}).catch(e => {
				reject(e);
			});
		}
	});
};

module.exports = (chan, msg, options) => {
	return new Promise((resolve, reject) => {
		if (chan.content) {
			if (chan.guild) {
				send(chan.channel, msg, options).then(m => {
					resolve(m);
				}).catch(e => {
					reject(e);
				});
			} else {
				send(chan.author, msg, options).then(m => {
					resolve(m);
				}).catch(e => {
					reject(e);
				});
			}
		} else {
			send(chan, msg, options).then(m => {
				resolve(m);
			}).catch(e => {
				reject(e);
			});
		}
	});
};
