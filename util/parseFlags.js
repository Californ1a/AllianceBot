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
	if (!args[0]) {
		return;
	}
	var indexes = [];
	var keyOrder = [];
	cmd.flags.forEach((f, ke) => {
		f.forEach(a => {
			if (args.includes(`--${a}`) && !keyOrder.includes(ke)) {
				indexes.push(args.indexOf(`--${a}`));
				keyOrder.push(ke);
			}
		});
	});
	console.log("indexes", indexes);
	console.log("keyOrder", keyOrder);
	if (indexes.length === 0) {
		return;
	}
	if (indexes.length > 1) {

		var list = [];
		var j = 0;
		for (j; j < indexes.length; j++) {
			list.push({
				"index": indexes[j],
				"keyOrder": keyOrder[j]
			});
		}
		list.sort((a, b) => {
			return ((a.index < b.index) ? -1 : ((a.keyOrder === b.keyOrder) ? 0 : 1));
		});
		var k = 0;
		for (k; k < list.length; k++) {
			indexes[k] = list[k].index;
			keyOrder[k] = list[k].keyOrder;
		}
	}
	var obj = "{";
	var val;
	var i = 0;
	for (i; i < indexes.length; i++) {
		console.log(`indexes[${i}]`, indexes[i]);
		console.log(`keyOrder[${i}]`, keyOrder[i]);
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
