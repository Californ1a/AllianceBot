function canUserAndBotAssign(assigner, assignee, buer) {
	if (!buer) {
		buer = assigner;
	}
	if (assigner.roles.highest.position !== 0 && buer.roles.highest.name !== 0 && assigner.hasPermission("MANAGE_ROLES") && buer.hasPermission("MANAGE_ROLES") && assigner.roles.highest.position > assignee.roles.highest.position && buer.roles.highest.position > assignee.roles.highest.position) {
		return true;
	} else {
		return false;
	}
}

module.exports = canUserAndBotAssign;
