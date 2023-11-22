const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const htmlFile = fs.readFileSync(`${__dirname}/index.html`, 'utf-8');
app.use('/images', express.static('images'));


// Sunucu tarafında bağlantıyı dinle
io.on('connection', (socket) => {
  const clientId = socket.handshake.address; // İstemci IP adresini al

  console.log(`Yeni bir istemci bağlandı. ID: ${clientId}`);

  // Klavye verisi al ve diğer istemcilere gönder
  socket.on('keyPress', (data) => {
    // console.log(`Klavye verisi (${clientId}):`, data);
    io.emit('keyPress', { ...data, clientId }); // Tüm istemcilere klavye verisini ve istemci ID'sini gönder
  });

  // Fare verisi al ve diğer istemcilere gönder
  socket.on('mouseMove', (data) => {
    // console.log(`Fare verisi (${clientId}):`, data);

    io.emit('mouseMove', { ...data, clientId }); // Tüm istemcilere fare verisini ve istemci ID'sini gönder
  });

  // Dosya yükleme işlemini dinle ve diğer istemcilere iletilmesini sağla
  socket.on('fileUpload', (data) => {
    const base64Data = data.fileData.replace(/^data:image\/png;base64,/, '');
    // console.log(`base64: `,  base64Data);
    const filename = `images/uploaded_${Date.now()}.png`; // Benzersiz bir dosya adı oluştur
    fs.writeFile(filename, base64Data, 'base64', (err) => {
      if (err) {
        console.error('Hata:', err);
        return;
      }
      console.log('Dosya yüklendi ve kaydedildi:', filename);
      io.emit('fileUploaded', { filename, clientId }); // Dosya adını ve istemci ID'sini diğer istemcilere gönder
    });
  });

  // İstemci bağlantısı kesildiğinde bilgi ver
  socket.on('disconnect', () => {
    console.log(`İstemci bağlantısı kesildi. ID: ${clientId}`);
  });
});

  // Sunucuyu belirli bir porta bağla
  const port = 3000;
  server.listen(port, () => {
    console.log(`Sunucu ${port} portunda çalışıyor.`);
    app.get('/', (req, res) => {
      res.status(200).send(htmlFile);
    });
});
