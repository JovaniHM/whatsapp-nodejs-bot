const config = require("./config.js");
const token = config.token, apiUrl = config.apiUrl;
const app = require('express')();
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const mysql = require('mysql');
const port = process.env.PORT || 3000;

const connection = mysql.createConnection({
    host     : 'database-pga-rlh.cnicefbcq5cy.us-east-2.rds.amazonaws.com',
    user     : 'adminpga',
    password : '5BpKGMA(+#4xXg9#',
    database : 'PGA_RLH_DB'
});

// connection.connect();

// connection.query('SELECT * FROM INVITADOS;', function (error, results, fields) {
//     if (error) throw error;

//     console.log( results[0] );
// });

// connection.end();

app.use(bodyParser.json());

process.on('unhandledRejection', err => {
    console.log(err)
});	

app.get('/', function (req, res) {
    res.send("It's working.");
}); 

app.post('/webhook', async function (req, res) {
    const data = req.body;
    console.log( data );
    for (var i in data.messages) {
        const author = data.messages[i].author;
        const body = data.messages[i].body;
        const chatId = data.messages[i].chatId;
        const senderName = data.messages[i].senderName;
        if(data.messages[i].fromMe)return;

        switch (body) {
            case 'hola':
            case 'Hola':
                const textMain = `Hola, soy el Concierge de WWT Championship at Mayakoba y lo estaré acompañando durante todo el evento.\n\nEn nuestro MENÚ podrá consultar lo siguiente:\n\n1. Agenda\n2. Preguntas frecuentes\n3. Atención personalizada`;

                await apiChatApi('message', {chatId: chatId, body: textMain});
                break;
            case '1':
                const dataFile = {
                    phone: author,
                    body: "https://wwtatmayakoba.com/agenda/Agenda-WWT-2021-General.pdf",
                    filename: `Agenda.pdf`
                };

                await apiChatApi('sendFile', dataFile);
                break;
            case '2':
                const textQuestions = `1. ¿Dónde me hospedaré?\n2. ¿Tendré transportación para Mayakoba desde el Aeropuerto?\n3. Tuve cambios en mis vuelos, ¿a quién notifico?\n4. ¿Este año se solicitará alguna prueba COVID-19?\n5. ¿A qué hora jugaré el ProAm y con quién?`;

                await apiChatApi('message', {chatId: chatId, body: textQuestions});
                break;
            case '3':
                const textAtention = `1. Hospedaje\n2. Transportación\n3. Otros`;

                await apiChatApi('message', {chatId: chatId, body: textAtention});
                break;
            default:
                break;
        }
        
        // if(/help/.test(body)){
        //     const text = `${senderName}, this is a demo bot for https://chat-api.com/.
        //     Commands:
        //     1. chatId - view the current chat ID
        //     2. file [pdf/jpg/doc/mp3] - get a file
        //     3. ptt - get a voice message
        //     4. geo - get a location
        //     5. group - create a group with you and the bot`;
        //     await apiChatApi('message', {chatId: chatId, body: text});
        // }else if(/chatId/.test(body)){
        //     await apiChatApi('message', {chatId: chatId, body: chatId});
        // }else if(/file (pdf|jpg|doc|mp3)/.test(body)){
        //     const fileType = body.match(/file (pdf|jpg|doc|mp3)/)[1];
        //     const files = {
        //         doc: "http://domain.com/tra.docx",
        //         jpg: "http://domain.com/tra.jpg",
        //         mp3: "http://domain.com/tra.mp3",
        //         pdf: "http://domain.com/tra.pdf"
        //     };
        //     var dataFile = {
        //         phone: author,
        //         body: files[fileType],
        //         filename: `File *.${fileType}`
        //     };
        //     if(fileType == "jpg")dataFile['caption'] = "Text under the photo.";
        //     await apiChatApi('sendFile', dataFile);
        // }else if(/ptt/.test(body)){            
        //     await apiChatApi('sendAudio', {audio: "http://domain.com/tra.ogg", chatId: chatId});
        // }else if(/geo/.test(body)){
        //     await apiChatApi('sendLocation', {lat: 51.178843, lng: -1.826210, address: 'Stonehenge', chatId: chatId});
        // }else if(/group/.test(body)){
        //     let arrayPhones = [ author.replace("@c.us","") ];
        //     await apiChatApi('group', {groupName: 'Bot group', phones: arrayPhones, messageText: 'Welcome to the new group!'});
        // }
    }
    res.send('Ok');
});

app.listen(port, () => {
    console.log(`>>> The server is ready in port: (${port})`);
    console.log(`>>> Press CTRL + c to finish the server`);
})

async function apiChatApi(method, params){
    const options = {};
    options['method'] = "POST";
    options['body'] = JSON.stringify(params);
    options['headers'] = { 'Content-Type': 'application/json' };
    
    const url = `${apiUrl}/${method}?token=${token}`; 
    
    const apiResponse = await fetch(url, options);
    const jsonResponse = await apiResponse.json();
    return jsonResponse;
}