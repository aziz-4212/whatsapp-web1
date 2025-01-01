const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { Client, LocalAuth, MessageMedia  } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const fs = require('fs');
const qr = require('qrcode');
const path = require('path');

// Middleware untuk parsing body JSON
app.use(bodyParser.json());

//whatsapp
// const client = new Client();
// Membuat Client Baru dengan SESSION
// const client = new Client({
//     puppeteer: {
//         headless: true,
//         args: [
//             '--no-sandbox',
//             '--disable-setuid-sandbox',
//             '--disable-dev-shm-usage',
//             '--disable-accelerated-2d-canvas',
//             '--no-first-run',
//             '--no-zygote',
//             '--disable-gpu'
//         ],
//         // executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
//         executablePath: 'C:/chrome-win/chrome.exe',
//     },
//     authStrategy: new LocalAuth({
//         clientId: "whatsapp-1"
//     })
// });

// client = new Client({
//     authStrategy: new LocalAuth(),
//     puppeteer: {
//         headless: true,
//         args: [ '--no-sandbox', '--disable-gpu', ],
//     },
//     webVersionCache: { type: 'remote', remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html', }
// });

//untuk parsing data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// client.on('qr', (qr) => {
//     // Tampilkan QR code pada console dan dapatkan scan melalui WhatsApp
//     console.log('Silakan scan QR code ini: ', qr);
//     qrcode.generate(qr, {
//         small: true
//     });
// });

// client.on('ready', () => {
//     // WhatsApp siap untuk digunakan
//     console.log('WhatsApp siap untuk digunakan!');
//     // sendMessage();
//     const number = "+6285704259157"; // Ubah menjad Nomor hp yang akan dikirim pesan
//     const text = "Whatsapp Sudah siap!"; // Pesan Yang akan dikirim
//     const chatId = number.substring(1) + "@c.us";
//     // Kirim Pesan.
//     client.sendMessage(chatId, text);
// });

// Proses Dimana Ketika Pesan masuk ke bot
// client.on('message', async message => {
//     //Mengecek Pesan yang masuk sama dengan halo jika benar balas dengan Haii!!
//     if (message.body === 'halo') {
//         // Membalas Pesan
//         message.reply('Haii!!')
//     }
// });

//  //Proses Dimana klient disconnect dari Whatsapp-web
// client.on('disconnected', (reason) => {
//     console.log('disconnect Whatsapp', reason);
// });

// Kirim Pesan
// app.post('/kirim-pesan', async (req, res) => {

//     console.log(req.body);
//     const number = req.body.number;
//     const message = req.body.message;

//     const chatId = "62" + number.substring(1) + "@c.us";

//     client.sendMessage(chatId, message).then(response => {

//         res.status(200).json({
//             status: 'true',
//             response: response
//         });
//     }).catch(err => {
//         res.status(500).json({
//             status: 'false',
//             response: err
//         });
//     });
// });

// Kirim Gambar
// app.post('/kirim-gambar', (req, res) => {
//     const number = req.body.number;
//     const nama_gambar = req.body.nama_gambar;
//     const chatId = "62" + number.substring(1) + "@c.us";
    
//     const imagePath = 'gambar_kirim/'+nama_gambar;
//     const media = MessageMedia.fromFilePath(imagePath);

//     client.sendMessage(chatId, media).then(response => {
//         res.status(200).json({
//             status: 'true',
//             response: response
//         });
//     }).catch(err => {
//         res.status(500).json({
//             status: 'false',
//             response: err
//         });
//     });
// });



//Kirim Image dari gambar luar
async function downloadImage(url, filePath) {
    const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
    });

    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        let error = null;
        writer.on('error', (err) => {
            error = err;
            writer.close();
            reject(err);
        });
        writer.on('close', () => {
            if (!error) {
            resolve();
            }
        });
    });
}

  // Endpoint untuk mengirim gambar
// app.post('/kirim-link-gambar', async (req, res) => {
//     const number = req.body.number;
//     const imageUrl = req.body.imageUrl;
//     const nama_random = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
//     const mediaPath = 'image/'+nama_random+'.jpg';

//     // Unduh gambar dari URL eksternal
//     try {
//         await downloadImage(imageUrl, mediaPath);
//     } catch (error) {
//         console.error('Gagal mengunduh gambar:', error);
//         return res.status(500).json({ status: 'false', response: 'Gagal mengunduh gambar' });
//     }

//     const chatId = `62${number.substring(1)}@c.us`;

//     // Kirim pesan teks
//     const media = MessageMedia.fromFilePath(mediaPath);

//     client.sendMessage(chatId, media).then(response => {
//         res.status(200).json({
//             status: 'true',
//             response: response
//         });
//     }).catch(err => {
//         res.status(500).json({
//             status: 'false',
//             response: err
//         });
//     });
// });

app.post('/buat-qrcode', async (req, res) => {
    const nama_file = req.body.nama_file;
    const text_qrcode = req.body.text_qrcode;

    qr.toFile('qrcode/'+nama_file+'.png', text_qrcode, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Gagal menyimpan gambar barcode.' });
        } else {
            console.log('Gambar QR code berhasil disimpan.');
            return res.status(200).json({ message: 'Gambar barcode berhasil disimpan.' });
        }
    });
});

app.post('/buat-qrcode-noreg', async (req, res) => { 
    const text_qrcode = req.body.noreg;

    qr.toFile('qrcode-noreg/'+text_qrcode +'.png', text_qrcode, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Gagal menyimpan gambar barcode.' });
        } else {
            console.log('Gambar QR code berhasil disimpan.');
            return res.status(200).json({ message: 'Gambar barcode berhasil disimpan.' });
        }
    });
});

// app.post('/kirim-pesan-gambar', async (req, res) => {
//     const number = req.body.nomer_hp;
//     const pesan = req.body.pesan;
//     const nama_gambar = req.body.nama_gambar;

//     const chatId = "62" + number.substring(1) + "@c.us";

//     // const mediaPath = 'image/'+nama_gambar;
//     const mediaPath = path.join('gambar_kirim/', nama_gambar);
//     try {
//         const mediaGambar = mediaPath ? MessageMedia.fromFilePath(mediaPath) : null;
//         client.sendMessage(chatId, mediaGambar, { caption: pesan }).then(response => {
//             res.status(200).json({
//                 status: 'true',
//                 response: response
//             });
//         }).catch(err => {
//             res.status(500).json({
//                 status: 'false',
//                 response: err
//             });
//         });
//     } catch (error) {
//         return res.status(500).json({ error: 'File Tidak ditemukan, Pastikan file ditaruh didalam folder gambar_kirim.' });
//     }
// });


// app.post('/kirim-pesan-gambar-noreg', async (req, res) => {
//     const number = req.body.nomer_hp;
//     const pesan = req.body.pesan;
//     const nama_gambar = req.body.nama_gambar;

//     const chatId = "62" + number.substring(1) + "@c.us";

//     // const mediaPath = 'image/'+nama_gambar;
//     const mediaPath = path.join('qrcode-noreg/', nama_gambar);
//     try {
//         const mediaGambar = mediaPath ? MessageMedia.fromFilePath(mediaPath) : null;
//         client.sendMessage(chatId, mediaGambar, { caption: pesan }).then(response => {
//             res.status(200).json({
//                 status: 'true',
//                 response: response
//             });
//         }).catch(err => {
//             res.status(500).json({
//                 status: 'false',
//                 response: err
//             });
//         });
//     } catch (error) {
//         return res.status(500).json({ error: 'File Tidak ditemukan, Pastikan file ditaruh didalam folder gambar_kirim.' });
//     }
// });


// app.post('/kirim-pesan-gambar-lapor-gan', async (req, res) => {
//     const number = req.body.number;
//     const message = req.body.message;
//     const nama_gambar = req.body.nama_gambar;

//     const chatId = "62" + number.substring(1) + "@c.us";

//     // const mediaPath = 'image/'+nama_gambar;
//     // const mediaPath = path.join('gambar_kirim/', nama_gambar);
//     const mediaPath = path.join('C:/project/lapor-gan/public/uploads', nama_gambar);
//     try {
//         const mediaGambar = mediaPath ? MessageMedia.fromFilePath(mediaPath) : null;
//         client.sendMessage(chatId, mediaGambar, { caption: message }).then(response => {
//             res.status(200).json({
//                 status: 'true',
//                 response: response
//             });
//         }).catch(err => {
//             res.status(500).json({
//                 status: 'false',
//                 response: err
//             });
//         });
//     } catch (error) {
//         return res.status(500).json({ error: 'File Tidak ditemukan, Pastikan file ditaruh didalam folder gambar_kirim.' });
//     }
// });

//send messege group
// async function sendMessageToGroup(groupName, message) {
//     const chats = await client.getChats();
//     const group = chats.find(chat => chat.isGroup && chat.name === groupName);

//     if (group) {
//         group.sendMessage(message);
//         console.log(`Message sent to group ${groupName}`);
//     } else {
//         console.log(`Group ${groupName} not found`);
//     }
// }

app.post('/send-message-group', async (req, res) => {
    const { groupName, message } = req.body;

    if (!groupName || !message) {
        return res.status(400).send({ error: 'Please provide both groupName and message' });
    }

    try {
        const result = await sendMessageToGroup(groupName, message);
        res.status(200).send({ status: 'success', result });
    } catch (error) {
        res.status(500).send({ status: 'error', message: error.message });
    }
});

// app.post('/send-message-file-group', async (req, res) => {
//     const groupName = req.body.groupName;
//     const message = req.body.message;
//     const file = req.body.file;
//     const file_other_sistem = req.body.file_other_sistem;
//     console.log(req.body);
//     let mediaPath;
//     if (file != '') {
//         if (!groupName || !message || !file) {
//             return res.status(400).send('Missing groupName, message, or file');
//         }

//         mediaPath = path.join('gambar_kirim/', file);
//     } else if (file_other_sistem != '') {
//         if (!groupName || !message || !file_other_sistem) {
//             return res.status(400).send('Missing groupName, message, or file');
//         }
        
//         mediaPath = path.join('C:/project/lapor-gan/public/uploads', file_other_sistem);
//     } else {
//         return res.status(400).send('Missing file');
//     }

//     const media = mediaPath ? MessageMedia.fromFilePath(mediaPath) : null;

//     client.getChats().then((chats) => {
//         const group = chats.find(
//             (chat) => chat.isGroup && chat.name === groupName
//         );

//         if (!group) {
//             return res.status(404).send('Group not found');
//         }

//         client.sendMessage(group.id._serialized, message)
//             .then(() => {
//                 // const media = MessageMedia.fromFilePath(filePath);
//                 return client.sendMessage(group.id._serialized, media);
//             })
//             .then(() => {
//                 // fs.unlinkSync(mediaPath); // Remove the file after sending
//                 res.status(200).send({ status: 'success'});
//             })
//             .catch((err) => {
//                 // console.error(err);
//                 res.status(500).send('Failed to send message and file');
//             });
//     });
// });

// client.initialize();

// Menjalankan server
const port = 8000;
app.listen(port, () => {
    console.log(`Server berjalan di port ${port}`);
});
