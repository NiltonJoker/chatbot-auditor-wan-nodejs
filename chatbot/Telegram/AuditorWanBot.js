process.env.NTBA_FIX_319 = 1;
const config = require("../../config"); //Archivo configuracion Bot
const TelegramBot = require("node-telegram-bot-api"); //Importante - libreria Telegram
const dialogflow = require("../dialogflow");
const { structProtoToJson } = require("../helpers/structFunctions");

// Funciones de la base de datos
const areasService = require("../../db/Areas");
const areaObjetivosService = require("../../db/AreaObjetivos");

const users = [];

const token = config.TELEGRAMTOKEN;

// Crear un bot que use 'polling' en español(sondeo) para buscar nuevas actualizaciones
const bot = new TelegramBot(token, {
  polling: true,
});

bot.on("callback_query", async (action) => {
  let msg = action.data;
  let senderID = action.from.id;
  await sendTextMessage(senderID, "<b>Seleccionaste:</b> " + msg);
  console.log("enviando a dialogflow: ", msg, senderID);
  await sendToDialogFlow(senderID, msg);
});

// Función para recibir los mensajes recibidos por el Chatbot
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const sender = msg.from.id;
  const message = msg.text;
  //check if user was registered
  saveUserInformation(msg);
  console.log("mensaje recibido: ", msg);
  await sendToDialogFlow(sender, message);
});

function saveUserInformation(msg) {
  let userId = msg.from.id;
  console.log("empezando a guardar");
  if (users.findIndex((user) => user.id === userId) === -1) {
    users.push({
      id: userId,
      first_name: msg.from.first_name,
      last_name: msg.from.last_name,
    });
    console.log("se guardo...", users);
  }
}

function getUserData(userId) {
  return users.find((user) => user.id === userId);
}

async function handleDialogFlowResponse(sender, response) {
  let responseText = response.fulfillmentMessages.fulfillmentText;
  let messages = response.fulfillmentMessages;
  let action = response.action;
  let contexts = response.outputContexts;
  let parameters = response.parameters;

  if (isDefined(action)) {
    handleDialogFlowAction(sender, action, messages, contexts, parameters);
  } else if (isDefined(messages)) {
    console.log("se entrara a handleMessages");
    handleMessages(messages, sender);
  } else if (responseText == "" && !isDefined(action)) {
    //dialogflow could not evaluate input.
    sendTextMessage(
      sender,
      "I'm not sure what you want. Can you be more specific? gaa"
    );
  } else if (isDefined(responseText)) {
    console.log("se mandara a sendTextMessage");
    sendTextMessage(sender, responseText);
  }
}

async function handleDialogFlowAction(
  sender,
  action,
  messages,
  contexts,
  parameters
) {
  let msg = "";
  switch (action) {
    case "ListadoAreas.action":
      await handleMessages(messages, sender);
      msg = "";
      let areas = await areasService.list();
      areas.forEach((area) => {
        msg += `<b>${area.id}.-</b> ${area.nombre}\n`;
      });
      await sendTextMessage(sender, msg);
      await sendTextMessage(
        sender,
        "Por favor, indícame el número para mostrar los objetivos específicos de la auditoria por Área..."
      );
      break;
    case "SeleccionArea.action":
      await handleMessages(messages, sender);
      id_area = parameters.fields.id_area.numberValue;
      await sendToDialogFlow(sender, "AreaObjetivos " + id_area); //empezamos con la pregunta 1
      break;
    case "AreaObjetivos.action":
      await handleMessage(messages,sender);
      msg= "";
      id_area = contexts[0].parameters.fields.id_area.numberValue;
      console.log("el id de el area es :", id_area);
      areaObjetivos = await areaObjetivosService.list(id_area);
      areaObjetivos.forEach((areaObjetivo, index) => {
        msg += `<b>${index+1}.-</b> ${areaObjetivo.objetivo}\n`;
      })
      await sendTextMessage(sender, `Esta área tiene ${areaObjetivos.length} objetivos específicios de la auditoría`);
      await sendTextMessage(sender, "Los objetivos específicos de la Auditoria del área elegida son: \n");
      await sendTextMessage(sender,msg);
      break;
    case "Auditoria.action":
      await handleMessage(messages, sender);
      msg=""
      let objetivos = [{nombre: "Objetivos Generales"}, {nombre: "Objetivos Específicos"}];
      objetivos.forEach((objetivo, index) => {
        msg += `<b>${index+1}.-</b> ${objetivo.nombre}\n`;
      })
      await sendTextMessage(sender, "<b>Objetivos:</b>\n");
      await sendTextMessage(sender, msg);
      await sendTextMessage(
        sender,
        "Por favor, indícame el número del objetivo ..."
      );
      break;
    case "ObjetivosAuditoria.action":
      await handleMessages(messages, sender);
      objetivo = parameters.fields.numero.numberValue;
      objetivo==1 ? await sendToDialogFlow(sender, "EmpezarObjetivos " + objetivo) : await sendToDialogFlow(sender, "ListarAreas");
      // await sendToDialogFlow(sender, "EmpezarObjetivos " + id_auditoria); //empezamos con la pregunta 1
      break;
    default:
      console.log(
        "se mandara el mensaje por defecto de handleDialogFlowAction"
      );
      handleMessages(messages, sender);
      break;
  }
}
async function sendToDialogFlow(senderID, messageText) {
  sendTypingOn(senderID);
  let result = await dialogflow.sendToDialogFlow(
    senderID,
    messageText,
    "TELEGRAM"
  );
  handleDialogFlowResponse(senderID, result);
}

function sendTypingOn(senderID) {
  bot.sendChatAction(senderID, "typing");
}

async function handleMessage(message, sender) {
  console.log("se entro a handleMessage");
  console.log("mensaje: ", message);
  console.log("switch: ", message.message);
  console.log("texto: ", message.text);
  switch (message.message) {
    case "text": //text
      for (const text of message.text.text) {
        if (text !== "") {
          await sendTextMessage(sender, text);
        }
      }
      break;
  }
}
async function handleMessages(messages, sender) {
  let timeoutInterval = 1100;
  let previousType;
  let cardTypes = [];
  let timeout = 0;
  for (var i = 0; i < messages.length; i++) {
    if (
      previousType == "card" &&
      (messages[i].message != "card" || i == messages.length - 1)
    ) {
      timeout = (i - 1) * timeoutInterval;
      setTimeout(handleCardMessages.bind(null, cardTypes, sender), timeout);
      cardTypes = [];
      await handleMessage(messages[i], sender);
      // timeout = i * timeoutInterval;
      // setTimeout(handleMessage.bind(null, messages[i], sender), timeout);
    } else if (messages[i].message == "card" && i == messages.length - 1) {
      cardTypes.push(messages[i]);
      timeout = (i - 1) * timeoutInterval;
      setTimeout(handleCardMessages.bind(null, cardTypes, sender), timeout);
      cardTypes = [];
    } else if (messages[i].message == "card") {
      cardTypes.push(messages[i]);
    } else {
      await handleMessage(messages[i], sender);
      // timeout = i * timeoutInterval;
      // setTimeout(handleMessage.bind(null, messages[i], sender), timeout);
    }
    previousType = messages[i].message;
  }
}

let sendTextMessage = async (senderID, message) => {
  console.log("Enviando el mensaje: ", senderID, message);
  await bot.sendMessage(senderID, message, {
    parse_mode: "HTML",
  });
};

function isDefined(obj) {
  if (obj === undefined) {
    return false;
  }

  if (obj === null) {
    return false;
  }
  if (obj === "") {
    return false;
  }
  return true;
}
