const axios = require("axios");
let token = process.env.BOTTOKEN;

sendMessage = async (chatID, messaggio, token, parse_mode) => {
  try {
    var url;
    if (parse_mode) {
      url =
        "http://api.telegram.org/" + token + "/sendMessage?chat_id=" + chatID;
      url = url + "&parse_mode=html" + "&text=" + encodeURI(messaggio);
    } else {
      var url =
        "http://api.telegram.org/" + token + "/sendMessage?chat_id=" + chatID;
      url = url + "&text=" + encodeURI(messaggio);
    }
    await axios({
      method: "get",
      url: url,
    });
  } catch (err) {
    throw err;
    // console.log('error in sendmessage alert', err);
  }
};

module.exports = {
  async alert_Developers(message) {
    var ids = {
      // Raghava: "1296531250",
      sathish: "1321350229",

      
    };
    Object.values(ids).map(async (e) => {
      await sendMessage(e, message, token, true);
    });
  },
  async alert_admin(message) {
    var token = process.env.BOTTOKEN;

    var ids = {
      sathish: "1321350229",
      // Raghava: "1296531250",
    };
    Object.values(ids).map(async (e) => {
      await sendMessage(e, message, token, false);
    });
  },
  alert_SS: async (message) => {
    var token = process.env.BOTTOKEN;
    var ids = {
      // SS_GROUP: "-1002088553720",
      NEW_GROUP: "-1002085198150",
    };
    Object.values(ids).map(async (e) => {
      await sendMessage(e, message, token, true);
    });
  },
  OTP: (dev) => {
    if (dev == "true") {
      return 654321;
    }
    return Math.floor(100000 + Math.random() * 900000);
  },
  sendMessage: async (chatId, message) => {
    console.log("testing--0--->");

    const url = `https://api.telegram.org/${token}/sendMessage`;

    try {
      const response = await axios.post(url, {
        chat_id: chatId,
        text: message,
      });
      

      if (response.data.ok) {
        return true;
      } else {
        this.alert_Developers(response.data.description);
        console.log("Error sending message:", response.data.description);
        return false;
      }
    } catch (error) {
      console.log("Error:", error.response.data);
      return false;
    }
  },
};
