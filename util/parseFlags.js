function joinParts(arr, start, end) {
	if (!start) {
		start = 0;
	}
	if (!end) {
		end = arr.length;
	}
	return arr.slice(start, end).join(" ");
}

module.exports = (cmd, args) => {
	if (!args) {
		return;
	}
	var indexes = [];
	var keyOrder = [];
	cmd.flags.forEach(f => {
		console.log("f", f);
		f.forEach(a => {
			if (args.includes(`--${a}`) && !keyOrder.includes(a)) {
				indexes.push(args.indexOf(`--${a}`));
				keyOrder.push(a);
			}
		});
	});
	if (!indexes) {
		return;
	}
	indexes.sort((a, b) => {
		keyOrder.sort(() => {
			return a - b;
		});
		return a - b;
	});
	var obj = "{";
	var val;
	var i = 0;
	for (i; i < indexes.length; i++) {
		if (indexes[i + 1]) {
			val = joinParts(args, indexes[i] + 1, indexes[i + 1]);
		} else {
			val = joinParts(args, indexes[i] + 1);
		}
		if (0 === indexes.length - 1) { //only one element
			obj += `"${keyOrder[i]}": "${val}" }`;
		} else if (i === indexes.length - 1) { //last element
			obj += `, "${keyOrder[i]}": "${val}" }`;
		} else if (i === 0) { //first element
			obj += `"${keyOrder[i]}": "${val}"`;
		} else {
			obj += `, "${keyOrder[i]}": "${val}"`;
		}
	}
	return JSON.parse(obj);
};
