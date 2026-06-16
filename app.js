const express = require('express');
const path = require('path');

const app = express();

// ١. ڕێگەپێدان بە سێرڤەر بۆ خوێندنەوەی داتای فۆڕم و وێنەکان (JSON & URL Encoded)
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ٢. ناساندنی ڕێڕەوی فۆڵدەری public بۆ فایلە جێگیرەکان (CSS, JS, Audio)
app.use(express.static(path.join(__dirname, 'public')));

// ٣. دیاریکردنی بزوێنەری Views (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ٤. جیهانی کردنی گۆڕدراوی games بۆ ئەوەی لە هەموو کۆنترۆڵەرەکان بێ کێشە بخوێنرێتەوە
if (!global.games) {
    global.games = {};
}

// ٥. ڕێڕەوی سەرەکی پڕۆژەکە
app.get('/', (req, res) => {
    const roomID = req.query.id || null; 
    res.render('index', { roomID });
});

// ٦. بارکردنی ئەڤەتار
app.post('/upload-avatar', (req, res) => {
    const { avatar } = req.body;
    if (!avatar) {
        return res.status(400).json({ success: false, message: 'هیچ وێنەیەک نەدۆزرایەوە!' });
    }
    res.json({ success: true, message: 'وێنەکە بەسەرکەوتوویی ناسێنرا' });
});

/* ------------------------------------------------------------- */
/* 🚀 بەشی گرنگ بۆ Vercel: داگیرساندنی سێرڤەر لەسەر پۆرتی دیاریکراو */
/* ------------------------------------------------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
