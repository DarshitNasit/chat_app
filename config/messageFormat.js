const moment = require("moment");

const formateMessage = (username, message) => {
  return {
    username: username,
    message: message,
    time: moment().format("h:mm a"),
  };
};

module.exports = formateMessage;
