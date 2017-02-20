if (!Array.prototype.rejoin) {
	Array.prototype.rejoin = function(sep, start, end) {
		if (!start) {
			start = 0;
		}
		if (!end) {
			end = this.length - 1;
		}
		end++;
		return this.slice(start, end).join(sep);
	};
}
