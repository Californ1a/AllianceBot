function canUserAndBotAssign(assigner, assignee, buer) {
	if (!buer) {
		buer = assigner;
	}
	if (assigner.highestRole.position !== 0 && buer.highestRole.name !== 0 && assigner.hasPermission("MANAGE_ROLES_OR_PERMISSIONS") && buer.hasPermission("MANAGE_ROLES_OR_PERMISSIONS") && assigner.highestRole.position > assignee.highestRole.position && buer.highestRole.position > assignee.highestRole.position) {
		return true;
	} else {
		return false;
	}
}

module.exports = canUserAndBotAssign;
