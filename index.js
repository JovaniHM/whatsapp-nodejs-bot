const config = require("./config.js");
const token = config.token, apiUrl = config.apiUrl;
const app = require('express')();
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const fs = require('fs');
const mysql = require('mysql');
const { response } = require("express");
const port = process.env.PORT || 3000;

// const jsonContent = fs.readFileSync('./guests.json', 'utf-8');
// const guests = JSON.parse( jsonContent );

// guests.push({
//     name: 'Jovas',
//     age: 23,
//     number: Math.floor( Math.random() * 10 )
// })

// fs.writeFileSync('./guests.json', JSON.stringify( guests ), 'utf-8');

const connection = mysql.createConnection({
    host: 'database-pga-rlh.cnicefbcq5cy.us-east-2.rds.amazonaws.com',
    user: 'adminpga',
    password: '5BpKGMA(+#4xXg9#',
    database: 'PGA_RLH_DB',
});

app.use(bodyParser.json());

process.on('unhandledRejection', err => {
    console.log(err)
});	

app.get('/', function (req, res) {
    res.send("It's working.");
}); 

app.post('/sendImg', async function (req, res) {
    const data = req.body;

    const dataFile = {
        phone: data.phone,
        body: "https://wwtatmayakoba.com/events-img/WhatsApp-Image.jpeg",
        filename: `Imagen.jpeg`
    };

    await apiChatApi('sendFile', dataFile);

    setTimeout(async() => {
        text = `Bienvenido al MENÚ del WWT Championship at Mayakoba donde podrá consultar lo siguiente:\n\n3. Agenda\n4. Preguntas frecuentes\n5. Atención personalizada`;
        await apiChatApi('message', {phone: data.phone, body: text});
    }, 4000);

    res.send( 'Ok' );
});

app.post('/webhook', async function (req, res) {
    const data = req.body;
    for (var i in data.messages) {
        if(data.messages[i].fromMe)return;

        const author = data.messages[i].author;
        const body = data.messages[i].body;
        const chatId = data.messages[i].chatId;
        const senderName = data.messages[i].senderName;
        const chatName = data.messages[i].chatName;

        let phone = chatName.split(' ');

        phone.shift();
        phone.shift();

        phone = phone.join('');

        connection.connect();

        const query = connection.query(`CALL strGetInfoGuestWhatsApp( '${ phone }' );`)

        let text = '';

        query.on('result', async function(row, index) {
            if ( row.BAN == 1 ) {
                if ( row.REGISTROS_INGLES == 0 ) {
                    text = `Hola, soy el Concierge de WWT Championship at Mayakoba y lo estaré acompañando durante todo el evento.\n\nEn nuestro MENÚ podrá consultar lo siguiente:\n\n1. Agenda\n2. Preguntas frecuentes\n3. Atención personalizada`;
                    await apiChatApi('message', {chatId: chatId, body: text});
                } else {
                    text = `Hello! I am WWT Championship at Mayakoba Concierge and I will be assisting you throughout the event.\n\nWelcome to WWT Championship at Mayakoba Main Menu where you can look up the following information:\n\n1. Agenda\n2. Frequently Asked Questions\n3. Personalized attention`;
                    await apiChatApi('message', {chatId: chatId, body: text});
                }
            }
        });

        connection.end();

        // const jsonContent = fs.readFileSync('./guests.json', 'utf-8');
        // const guests = JSON.parse( jsonContent );

        // let index = guests.findIndex(g => g.author == author);

        // if (index == -1) {
        //     index = guests.push({
        //         author,
        //         langague: null
        //     });
        // }

        // switch (body) {
        //     case 'hola':
        //     case 'Hola':
        //     case 'hello':
        //     case 'Hello':
        //     case 'hi':
        //     case 'Hi':
        //         text = `Hola! Para comenzar por favor seleccione el idioma de su preferencia.\n\nHello! to start please select your preferred langague.\n\n1. Español\n2.English`;

        //         await apiChatApi('message', {chatId: chatId, body: text});
        //         break;
        //     case '1':
        //         // guests[ index ].langague = 1;
        //         text = `Hola, soy el Concierge de WWT Championship at Mayakoba y lo estaré acompañando durante todo el evento.\n\nEn nuestro MENÚ podrá consultar lo siguiente:\n\n3. Agenda\n4. Preguntas frecuentes\n5. Atención personalizada`;

        //         await apiChatApi('message', {chatId: chatId, body: text});
        //         break;
        //     case '2':
        //         // guests[ index ].langague = 2;
        //         text = `Hello! I am WWT Championship at Mayakoba Concierge and I will be assisting you throughout the event.`;

        //         await apiChatApi('message', {chatId: chatId, body: text});
        //         break;
        //     case '3':
        //         const dataFile = {
        //             phone: author,
        //             body: "https://wwtatmayakoba.com/agenda/Agenda-WWT-2021-General.pdf",
        //             filename: `Agenda.pdf`
        //         };

        //         await apiChatApi('sendFile', dataFile);

        //         text = `Bienvenido al MENÚ del WWT Championship at Mayakoba donde podrá consultar lo siguiente:\n\n3. Agenda\n4. Preguntas frecuentes\n5. Atención personalizada`;
        //         await apiChatApi('message', {chatId: chatId, body: text});
        //         break;
        //     case '4':
        //         text = `Preguntas frecuentes\n\n6. ¿Dónde me hospedaré?\n7. ¿Tendré transportación para Mayakoba desde el Aeropuerto?\n8. Tuve cambios en mis vuelos, ¿a quién notifico?\n9. ¿Este año se solicitará alguna prueba COVID-19?\n10. ¿A qué hora jugaré el Pro-Am y con quién?`;

        //         await apiChatApi('message', {chatId: chatId, body: text});
        //         break;
        //     case '5':
        //         text = `11. Hospedaje\n12. Transportación\n13. Otros`;

        //         await apiChatApi('message', {chatId: chatId, body: text});
        //         break;
        //     case '6':
        //         text = `6. ¿Dónde me hospedaré?\n\nPrevio a su llegada a Mayakoba, le informaremos el hotel en el que se hospedará. Cuando llegue al lobby, le indicarán la habitación asignada.`;
        //         await apiChatApi('message', {chatId: chatId, body: text});

        //         text = `¿Tiene usted alguna otra pregunta?\n\n14. Si\n15. No`;
        //         await apiChatApi('message', {chatId: chatId, body: text});
        //         break;
        //     case '7':
        //         text = `7. ¿Tendré transportación para Mayakoba desde el Aeropuerto?\n\nSi en la plataforma de registro usted lo solicitó e ingresó la información de sus vuelos, la transportación lo estará esperando a su llegada y para su regreso.`;
        //         await apiChatApi('message', {chatId: chatId, body: text});

        //         text = `¿Tiene usted alguna otra pregunta?\n\n14. Si\n15. No`;
        //         await apiChatApi('message', {chatId: chatId, body: text});
        //         break;
        //     case '8':
        //         text = `8. Tuve cambios en mis vuelos, ¿a quién notifico?\n\nTe pedimos por favor ingresar en la plataforma de registro y editar tu información: WWT Championship at Mayakoba ( https://wwtatmayakoba.com/login/?lang=es )`;
        //         await apiChatApi('message', {chatId: chatId, body: text});
                
        //         text = `¿Tiene usted alguna otra pregunta?\n\n14. Si\n15. No`;
        //         await apiChatApi('message', {chatId: chatId, body: text});
        //         break;
        //     case '9':
        //         text = `9. ¿Este año se solicitará alguna prueba COVID-19?\n\nNo`;
        //         await apiChatApi('message', {chatId: chatId, body: text});

        //         text = `¿Tiene usted alguna otra pregunta?\n\n14. Si\n15. No`;
        //         await apiChatApi('message', {chatId: chatId, body: text});
        //         break;
        //     case '10':
        //         text = `10. ¿A qué hora jugaré el Pro-Am y con quién?\n\nLa tarde del martes 2 de noviembre se le compartirán los pairings y horarios de salida.`;
        //         await apiChatApi('message', {chatId: chatId, body: text});

        //         text = `¿Tiene usted alguna otra pregunta?\n\n14. Si\n15. No`;
        //         await apiChatApi('message', {chatId: chatId, body: text});
        //         break;
        //     case '11':
        //         text = `XXX-XXX necesita atención personalizada con Hospedaje, favor de contactarlo(a) al número ${ chatName }`;
        //         await apiChatApi('message', {phone: '5215578684880', body: text});

        //         text = `En seguida nos pondremos en contacto con usted. Gracias por su espera.`;
        //         await apiChatApi('message', {chatId: chatId, body: text});

        //         setTimeout(async() => {
        //             text = `Bienvenido al MENÚ del WWT Championship at Mayakoba donde podrá consultar lo siguiente:\n\n3. Agenda\n4. Preguntas frecuentes\n5. Atención personalizada`;
        //             await apiChatApi('message', {chatId: chatId, body: text});
        //         }, 1000);
        //         break;
        //     case '12':
        //         text = `XXX-XXX necesita atención personalizada con Transportación, favor de contactarlo(a) al número ${ chatName }`;
        //         // await apiChatApi('message', {phone: '5219983216190', body: text});
        //         await apiChatApi('message', {phone: '527717485125', body: text});

        //         text = `En seguida nos pondremos en contacto con usted. Gracias por su espera.`;
        //         await apiChatApi('message', {chatId: chatId, body: text});

        //         setTimeout(async() => {
        //             text = `Bienvenido al MENÚ del WWT Championship at Mayakoba donde podrá consultar lo siguiente:\n\n3. Agenda\n4. Preguntas frecuentes\n5. Atención personalizada`;
        //             await apiChatApi('message', {chatId: chatId, body: text});
        //         }, 1000);
        //         break;
        //     case '13':
        //         text = `XXX-XXX necesita atención personalizada con Otros, favor de contactarlo(a) al número ${ chatName }`;
        //         await apiChatApi('message', {phone: '5215559693785)', body: text});

        //         text = `En seguida nos pondremos en contacto con usted. Gracias por su espera.`;
        //         await apiChatApi('message', {chatId: chatId, body: text});

        //         setTimeout(async() => {
        //             text = `Bienvenido al MENÚ del WWT Championship at Mayakoba donde podrá consultar lo siguiente:\n\n3. Agenda\n4. Preguntas frecuentes\n5. Atención personalizada`;
        //             await apiChatApi('message', {chatId: chatId, body: text});
        //         }, 1000);
        //         break;
        //     case '14':
        //         text = `Preguntas frecuentes\n\n6. ¿Dónde me hospedaré?\n7. ¿Tendré transportación para Mayakoba desde el Aeropuerto?\n8. Tuve cambios en mis vuelos, ¿a quién notifico?\n9. ¿Este año se solicitará alguna prueba COVID-19?\n10. ¿A qué hora jugaré el Pro-Am y con quién?`;

        //         await apiChatApi('message', {chatId: chatId, body: text});
        //         break;
        //     case '15':
        //         text = `Bienvenido al MENÚ del WWT Championship at Mayakoba donde podrá consultar lo siguiente:\n\n3. Agenda\n4. Preguntas frecuentes\n5. Atención personalizada`;

        //         await apiChatApi('message', {chatId: chatId, body: text});
        //         break;
        //     default:
        //         text = `Lo sentimos, la opción que ha ingresado no es válida, por favor intente nuevamente.`;

        //         await apiChatApi('message', {chatId: chatId, body: text});
        //         break;
        // }

        // if ( guests[ index ].langague == null ) {
        //     switch (body) {
        //         case 'hola':
        //         case 'Hola':
        //         case 'hello':
        //         case 'Hello':
        //         case 'hi':
        //         case 'Hi':
        //             text = `Hola! Para comenzar por favor seleccione el idioma de su preferencia.\n\nHello! to start please select your preferred langague.\n\n`;
    
        //             await apiChatApi('message', {chatId: chatId, body: text});
        //             break;
        //         case '1':
        //             guests[ index ].langague = 1;
        //             text = `Hola, soy el Concierge de WWT Championship at Mayakoba y lo estaré acompañando durante todo el evento.\n\nEn nuestro MENÚ podrá consultar lo siguiente:\n\n1. Agenda\n2. Preguntas frecuentes\n3. Atención personalizada`;
    
        //             await apiChatApi('message', {chatId: chatId, body: text});
        //             break;
        //         case '2':
        //             guests[ index ].langague = 2;
        //             text = `Hola, soy el Concierge de WWT Championship at Mayakoba y lo estaré acompañando durante todo el evento.\n\nEn nuestro MENÚ podrá consultar lo siguiente:\n\n1. Agenda\n2. Preguntas frecuentes\n3. Atención personalizada`;
    
        //             await apiChatApi('message', {chatId: chatId, body: text});
        //             break;
        //     }
        // } else {
        //     if (guests[ index ].langague = 1) {
        //         switch (body) {
        //             case '1':
        //                 const dataFile = {
        //                     phone: author,
        //                     body: "https://wwtatmayakoba.com/agenda/Agenda-WWT-2021-General.pdf",
        //                     filename: `Agenda.pdf`
        //                 };
        
        //                 await apiChatApi('sendFile', dataFile);
        //                 break;
        //             case '2':
        //                 text = `1. ¿Dónde me hospedaré?\n2. ¿Tendré transportación para Mayakoba desde el Aeropuerto?\n3. Tuve cambios en mis vuelos, ¿a quién notifico?\n4. ¿Este año se solicitará alguna prueba COVID-19?\n5. ¿A qué hora jugaré el Pro-Am y con quién?`;
        
        //                 await apiChatApi('message', {chatId: chatId, body: text});
        //                 break;
        //             case '3':
        //                 text = `1. Hospedaje\n2. Transportación\n3. Otros`;
        
        //                 await apiChatApi('message', {chatId: chatId, body: text});
        //                 break;
        //             default:
        //                 break;
        //         }
        //     } else {
        //         switch (body) {
        //             case '1':
        //                 const dataFile = {
        //                     phone: author,
        //                     body: "https://wwtatmayakoba.com/agenda/Agenda-WWT-2021-General.pdf",
        //                     filename: `Agenda.pdf`
        //                 };
        
        //                 await apiChatApi('sendFile', dataFile);
        //                 break;
        //             case '2':
        //                 text = `1. ¿Dónde me hospedaré?\n2. ¿Tendré transportación para Mayakoba desde el Aeropuerto?\n3. Tuve cambios en mis vuelos, ¿a quién notifico?\n4. ¿Este año se solicitará alguna prueba COVID-19?\n5. ¿A qué hora jugaré el Pro-Am y con quién?`;
        
        //                 await apiChatApi('message', {chatId: chatId, body: text});
        //                 break;
        //             case '3':
        //                 text = `1. Hospedaje\n2. Transportación\n3. Otros`;
        
        //                 await apiChatApi('message', {chatId: chatId, body: text});
        //                 break;
        //             default:
        //                 break;
        //         }
        //     }
        // }

        // fs.writeFileSync('./guests.json', JSON.stringify( guests ), 'utf-8');

        
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