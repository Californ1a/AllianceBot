const colors = require("colors");
module.exports = (bot, closeEvent) => {
	var main = `Bot disconnected from server with status code ${closeEvent.code}.\nReason: `;
	var reason = "";
	switch (closeEvent.code) {
		case 1000:
			reason += "CLOSE_NORMAL - Normal closure; the connection successfully completed whatever purpose for which it was created.";
			break;
		case 1001:
			reason += "CLOSE_GOING_AWAY - The endpoint is going away, either because of a server failure or because the browser is navigating away from the page that opened the connection.";
			break;
		case 1002:
			reason += "CLOSE_PROTOCOL_ERROR - The endpoint is terminating the connection due to a protocol error.";
			break;
		case 1003:
			reason += "CLOSE_UNSUPPORTED - The connection is being terminated because the endpoint received data of a type it cannot accept (for example, a text-only endpoint received binary data).";
			break;
		case 1004:
			reason += "Reserved";
			break;
		case 1005:
			reason += "CLOSE_NO_STATUS - Reserved.  Indicates that no status code was provided even though one was expected.";
			break;
		case 1006:
			reason += "CLOSE_ABNORMAL - Reserved. Used to indicate that a connection was closed abnormally (that is, with no close frame being sent) when a status code is expected.";
			break;
		case 1007:
			reason += "Unsupported Data - The endpoint is terminating the connection because a message was received that contained inconsistent data (e.g., non-UTF-8 data within a text message).";
			break;
		case 1008:
			reason += "Policy Violation - The endpoint is terminating the connection because it received a message that violates its policy. This is a generic status code, used when codes 1003 and 1009 are not suitable.";
			break;
		case 1009:
			reason += "CLOSE_TOO_LARGE - The endpoint is terminating the connection because a data frame was received that is too large.";
			break;
		case 1010:
			reason += "Missing Extension - The client is terminating the connection because it expected the server to negotiate one or more extension, but the server didn't.";
			break;
		case 1011:
			reason += "Internal Error - The server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
			break;
		case 1012:
			reason += "Service Restart - The server is terminating the connection because it is restarting.";
			break;
		case 1013:
			reason += "Try Again Later - The server is terminating the connection due to a temporary condition, e.g. it is overloaded and is casting off some of its clients.";
			break;
		case 1014:
			reason += "Reserved";
			break;
		case 1015:
			reason += "TLS Handshake - Reserved. Indicates that the connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
			break;
		default:
			reason += "Unknown";
			break;
	}
	console.error(colors.red(`${main}${reason}${(closeEvent.reason && closeEvent.reason !== "") ? `\nGiven Reason: ${closeEvent.reason}` : ""}`));
	// console.log(`Reason: ${closeEvent.reason}`);
	// console.error(closeEvent);
	//process.exit();
};
