const config = require("./config.js");
const token = config.token, apiUrl = config.apiUrl;
const app = require('express')();
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const fs = require('fs');
const mysql = require('mysql');
const { response } = require("express");
const port = process.env.PORT || 3000;

const connection = mysql.createConnection({
    host: 'database-pga-rlh.cnicefbcq5cy.us-east-2.rds.amazonaws.com',
    user: 'adminpga',
    password: '5BpKGMA(+#4xXg9#',
    database: 'PGA_RLH_DB',
});

connection.connect();

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
        if(data.messages[i].fromMe) return;

        const author = data.messages[i].author;
        const body = data.messages[i].body;
        const chatId = data.messages[i].chatId;
        const senderName = data.messages[i].senderName;
        const chatName = data.messages[i].chatName;

        let phone = chatName.split(' ');
        let text = '';

        phone.shift();
        phone.shift();

        phone = phone.join('');

        const jsonContent = fs.readFileSync('./guests.json', 'utf-8');
        const guests = JSON.parse( jsonContent );
        
        let index = guests.findIndex(g => g.author == author);

        if (index == -1) {
            index = guests.push({
                author,
                clave: '',
            });
        }

        const query = connection.query(`CALL strGetInfoGuestWhatsApp( '${ phone }' );`);

        query.on('result', async function(row, index) {
            if ( row.BAN == 1 ) {
                if ( row.REGISTROS_INGLES == 0 ) {
                    const caseValue = ( (body == 'Hola' || body == 'hola') ? 'Hola' : ( guests[ index ].clave + body ) );
                    console.log( caseValue );

                    await es_bot(caseValue, guests, index, text, chatId, row, author, chatName);
                } else {
                    const caseValue = ( (body == 'Hello' || body == 'hello' || body == 'Hi' || body == 'hi') ? 'Hello' : ( guests[ index ].clave + body ) );
                    console.log( caseValue );

                    await en_bot(caseValue, guests, index, text, chatId, row, author, chatName)
                }
            }

            fs.writeFileSync('./guests.json', JSON.stringify( guests ), 'utf-8');
        });

        // connection.end();
    }
    res.send('Ok');
});

app.listen(port, () => {
    console.log(`>>> The server is ready in port: (${port})`);
    console.log(`>>> Press CTRL + c to finish the server`);
})

async function es_bot(caseValue, guests, index, text, chatId, row, author, chatName) {
    switch ( caseValue ) {
        case 'es-3-1':
            es_22_(guests, index, text, chatId, row);
            break;
        case 'es-3-2':
            es_1_(guests, index, text, chatId, row, false);
            break;


        case 'es-23-1':
            text = `❗ ${ row.NOMBRE_INVITADO } necesita atención personalizada con Hospedaje, favor de contactarlo(a) al número 👉🏻 ${ chatName }`;
            await apiChatApi('message', {phone: '5215578684880', body: text});
            // await apiChatApi('message', {phone: '5217717485125', body: text});

            text = `En seguida nos pondremos en contacto con usted. 🏃🏼‍♀️\n\nGracias por su espera. 😊`;
            await apiChatApi('message', {chatId: chatId, body: text});

            es_1_(guests, index, text, chatId, row, false);
            break;
        case 'es-23-2':
            text = `❗ ${ row.NOMBRE_INVITADO } necesita atención personalizada con Transportación, favor de contactarlo(a) al número 👉🏻 ${ chatName }`;
            await apiChatApi('message', {phone: '5219983216190', body: text});
            // await apiChatApi('message', {phone: '5217717485125', body: text});

            text = `En seguida nos pondremos en contacto con usted. 🏃🏻\n\nGracias por su espera. 😊`;
            await apiChatApi('message', {chatId: chatId, body: text});

            es_1_(guests, index, text, chatId, row, false);
            break;
        case 'es-23-3':
            text = `❗ ${ row.NOMBRE_INVITADO } necesita atención personalizada con Otros, favor de contactarlo(a) al número 👉🏻 ${ chatName }`;
            await apiChatApi('message', {phone: '5215559693785)', body: text});
            // await apiChatApi('message', {phone: '5217717485125)', body: text});

            text = `En seguida nos pondremos en contacto con usted. 🏃🏻\n\nGracias por su espera. 😊`;
            await apiChatApi('message', {chatId: chatId, body: text});

            es_1_(guests, index, text, chatId, row, false);
            break;


        case 'es-22-1':
            text = `*¿Dónde me hospedaré?* 🤔\n\n🔸 Previo a su llegada a Mayakoba, le informaremos el hotel en el que se hospedará. Cuando llegue al lobby, le indicarán la habitación asignada.`;
            await apiChatApi('message', {chatId: chatId, body: text});

            es_3_(guests, index, text, chatId);
            break;
        case 'es-22-2':
            text = `*¿Tendré transportación para Mayakoba desde el Aeropuerto?* 🤔\n\n🔸 Si en la plataforma de registro usted lo solicitó e ingresó la información de sus vuelos, la transportación lo estará esperando a su llegada y para su regreso.`;
            await apiChatApi('message', {chatId: chatId, body: text});

            es_3_(guests, index, text, chatId);
            break;
        case 'es-22-3':
            text = `*Tuve cambios en mis vuelos, ¿a quién notifico?* 🤔\n\n🔸 Te pedimos por favor ingresar en la plataforma de registro y editar tu información: *WWT Championship at Mayakoba* 👉🏻 https://wwtatmayakoba.com/login/?lang=es`;
            await apiChatApi('message', {chatId: chatId, body: text});

            es_3_(guests, index, text, chatId);
            break;
        case 'es-22-4':
            text = `*¿Este año se solicitará alguna prueba COVID-19?* 🤔\n\n🔸 No`;
            await apiChatApi('message', {chatId: chatId, body: text});

            es_3_(guests, index, text, chatId);
            break;
        case 'es-22-5':
            if (row.PLAY_PRO_AM == 1) {
                text = `*¿A qué hora jugaré el Pro-Am y con quién?* 🤔\n\n🔸 La tarde del martes 2 de noviembre se le compartirán los pairings y horarios de salida.`;
                await apiChatApi('message', {chatId: chatId, body: text});

                es_3_(guests, index, text, chatId);
            } else {
                text = `Lo sentimos, la opción que ha ingresado no es válida. ❌\n\nPor favor, intente nuevamente.`;
                await apiChatApi('message', {chatId: chatId, body: text});
            }
            break;


        case 'es-1-1':
            const dataFile = {
                phone: author,
                body: row.PLAY_PRO_AM == 0 ? 'https://wwtatmayakoba.com/agenda/Agenda-WWT-2021-General.pdf' : 'https://wwtatmayakoba.com/agenda/Agenda-WWT-2021-ProAm.pdf',
                filename: `Agenda.pdf`
            };

            await apiChatApi('sendFile', dataFile);

            guests[ index ].clave = 'es-1-';

            es_1_(guests, index, text, chatId, row, false);
            break;
        case 'es-1-2':
            es_22_(guests, index, text, chatId, row);
            break;
        case 'es-1-3':
            guests[ index ].clave = 'es-23-';
            text = `*¿Qué tipo de atención personalizada desea?*\n\n1️⃣ Hospedaje\n2️⃣ Transportación\n3️⃣ Otros`;
            await apiChatApi('message', {chatId: chatId, body: text});
            break;


        case 'Hola':
        case 'hola':
            es_1_(guests, index, text, chatId, row)
            break;
        default:
            text = `Lo sentimos, la opción que ha ingresado no es válida. ❌\n\nPor favor, intente nuevamente.`;
            await apiChatApi('message', {chatId: chatId, body: text});
            break;
    }
}

async function en_bot(caseValue, guests, index, text, chatId, row, author, chatName) {
    switch ( caseValue ) {
        case 'en-3-1':
            en_22_(guests, index, text, chatId, row);
            break;
        case 'en-3-2':
            en_1_(guests, index, text, chatId, row, false);
            break;


        case 'en-23-1':
            text = `❗ ${ row.NOMBRE_INVITADO } necesita atención personalizada con Hospedaje, favor de contactarlo(a) al número ${ chatName }`;
            await apiChatApi('message', {phone: '5215578684880', body: text});
            // await apiChatApi('message', {phone: '5217717485125', body: text});

            text = `We will contact you as soon as possible. 🏃🏼‍♀️\n\nThank you for your time. 😊`;
            await apiChatApi('message', {chatId: chatId, body: text});

            en_1_(guests, index, text, chatId, row, false);
            break;
        case 'en-23-2':
            text = `❗ ${ row.NOMBRE_INVITADO } necesita atención personalizada con Transportación, favor de contactarlo(a) al número ${ chatName }`;
            await apiChatApi('message', {phone: '5219983216190', body: text});
            // await apiChatApi('message', {phone: '5217717485125', body: text});

            text = `We will contact you as soon as possible. 🏃🏻\n\nThank you for your time. 😊`;
            await apiChatApi('message', {chatId: chatId, body: text});

            en_1_(guests, index, text, chatId, row, false);
            break;
        case 'en-23-3':
            text = `❗ ${ row.NOMBRE_INVITADO } necesita atención personalizada con Otros, favor de contactarlo(a) al número ${ chatName }`;
            await apiChatApi('message', {phone: '5215559693785)', body: text});
            // await apiChatApi('message', {phone: '5217717485125)', body: text});

            text = `We will contact you as soon as possible. 🏃🏻\n\nThank you for your time. 😊`;
            await apiChatApi('message', {chatId: chatId, body: text});

            en_1_(guests, index, text, chatId, row, false);
            break;


        case 'en-22-1':
            text = `*Where am I staying?* 🤔\n\n🔸 Prior to arrival in Mayakoba, we will inform you of the hotel in which you will be staying. When you arrive in the lobby, you will be informed of the room assigned.`;
            await apiChatApi('message', {chatId: chatId, body: text});

            en_3_(guests, index, text, chatId);
            break;
        case 'en-22-2':
            text = `*Will I have transportation from the airport to Mayakoba?* 🤔\n\n🔸 If on the registration platform you requested it and entered your flight information, transportation will be waiting for you on arrival and for your return.`;
            await apiChatApi('message', {chatId: chatId, body: text});

            en_3_(guests, index, text, chatId);
            break;
        case 'en-22-3':
            text = `*I had changes on my flights, who do I notify?* 🤔\n\n🔸 Please login to the registration platform and edit your information: WWT Championship at Mayakoba 👉🏻 https://wwtatmayakoba.com/login/?lang=en`;
            await apiChatApi('message', {chatId: chatId, body: text});

            en_3_(guests, index, text, chatId);
            break;
        case 'en-22-4':
            text = `*Will any COVID-19 tests be requested this year?* 🤔\n\n🔸 No`;
            await apiChatApi('message', {chatId: chatId, body: text});

            en_3_(guests, index, text, chatId);
            break;
        case 'en-22-5':
            if (row.PLAY_PRO_AM == 1) {
                text = `*What time will I play Pro-Am and with whom?* 🤔\n\n🔸 On the afternoon of Tuesday, November 2, the pairings and schedules will be shared.`;
                await apiChatApi('message', {chatId: chatId, body: text});

                en_3_(guests, index, text, chatId);
            } else {
                text = `Sorry, the option entered is invalid. ❌\n\nPlease try again.`;
                await apiChatApi('message', {chatId: chatId, body: text});
            }
            break;


        case 'en-1-1':
            const dataFile = {
                phone: author,
                body: row.PLAY_PRO_AM == 0 ? 'https://wwtatmayakoba.com/agenda/Agenda-WWT-2021-General.pdf' : 'https://wwtatmayakoba.com/agenda/Agenda-WWT-2021-ProAm.pdf',
                filename: `Agenda.pdf`
            };
            
            await apiChatApi('sendFile', dataFile);

            guests[ index ].clave = 'en-1-';

            en_1_(guests, index, text, chatId, row, false);
            break;
        case 'en-1-2':
            en_22_(guests, index, text, chatId, row);
            break;
        case 'en-1-3':
            guests[ index ].clave = 'en-23-';
            text = `*What kind of personalized attention do you want?*\n\n1️⃣ Hosting\n2️⃣ Transportation\n3️⃣ Others`;
            await apiChatApi('message', {chatId: chatId, body: text});
            break;


        case 'Hello':
        case 'hello':
        case 'hi':
        case 'Hi':
            en_1_(guests, index, text, chatId, row)
            break;
        default:
            text = `Sorry, the option entered is invalid. ❌\n\nPlease try again.`;
            await apiChatApi('message', {chatId: chatId, body: text});
            break;
    }
}

async function es_1_(guests, index, text, chatId, row, start = true) {
    guests[ index ].clave = 'es-1-';

    if ( start ) {
        text = `Hola ${ row.NOMBRE_CARTA }, 👋🏻 soy el Concierge de *WWT Championship at Mayakoba* 🤖 y ${ row.SEXO == 0 ? 'lo' : 'la' } estaré acompañando durante todo el evento. 📅\n\nEn nuestro *MENÚ* podrá consultar lo siguiente:\n\n1️⃣ Agenda\n2️⃣ Preguntas frecuentes\n3️⃣ Atención personalizada`;
        await apiChatApi('message', {chatId: chatId, body: text});
    } else {
        setTimeout(async() => {
            text = `Bienvenido al *MENÚ* del *WWT Championship at Mayakoba* donde podrá consultar lo siguiente:\n\n1️⃣ Agenda\n2️⃣ Preguntas frecuentes\n3️⃣ Atención personalizada`;
            await apiChatApi('message', {chatId: chatId, body: text});
        }, 2000);
    }
}

async function en_1_(guests, index, text, chatId, row, start = true) {
    guests[ index ].clave = 'en-1-';

    if ( start ) {
        text = `Hello ${ row.NOMBRE_CARTA }! 👋🏻 I am *WWT Championship at Mayakoba* Concierge 🤖 and I will be assisting you throughout the event. 📅\n\nIn our *Main Menu* you can look up the following information:\n\n1️⃣ Agenda\n2️⃣ Frequently Asked Questions\n3️⃣ Personalized attention`;
        await apiChatApi('message', {chatId: chatId, body: text});
    } else {
        setTimeout(async() => {
            text = `Welcome to *WWT Championship at Mayakoba* *Main Menu* where you can look up the following information:\n\n1️⃣ Agenda\n2️⃣ Frequently Asked Questions\n3️⃣ Personalized attention`;
            await apiChatApi('message', {chatId: chatId, body: text});
        }, 2000);
    }
}

async function es_3_(guests, index, text, chatId) {
    guests[ index ].clave = 'es-3-';

    setTimeout(async() => {
        text = `¿Tiene usted alguna otra pregunta?\n\n1️⃣ Si\n2️⃣ No`;
        await apiChatApi('message', {chatId: chatId, body: text});
    }, 2000);
}

async function en_3_(guests, index, text, chatId) {
    guests[ index ].clave = 'en-3-';

    setTimeout(async() => {
        text = `Do you have any other questions?\n\n1️⃣ Yes\n2️⃣ No`;
        await apiChatApi('message', {chatId: chatId, body: text});
    }, 2000);
}

async function es_22_(guests, index, text, chatId, row) {
    guests[ index ].clave = 'es-22-';

    text = `*Preguntas frecuentes* ❔\n\n1️⃣ ¿Dónde me hospedaré?\n2️⃣ ¿Tendré transportación para Mayakoba desde el Aeropuerto?\n3️⃣ Tuve cambios en mis vuelos, ¿a quién notifico?\n4️⃣ ¿Este año se solicitará alguna prueba COVID-19?${ row.PLAY_PRO_AM == 1 ? `\n5️⃣ ¿A qué hora jugaré el Pro-Am y con quién?` : ''}`;
    await apiChatApi('message', {chatId: chatId, body: text});
}

async function en_22_(guests, index, text, chatId, row) {
    guests[ index ].clave = 'en-22-';

    text = `*Frequently Asked Questions* ❔\n\n1️⃣ Where am I staying?\n2️⃣ Will I have transportation from the airport to Mayakoba?\n3️⃣ I had changes on my flights, who do I notify?\n4️⃣ Will any COVID-19 tests be requested this year?${ row.PLAY_PRO_AM == 1 ? `\n5️⃣ What time will I play Pro-Am and with whom?` : ''}`;
    await apiChatApi('message', {chatId: chatId, body: text});
}

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