const express = require('express');
const path = require('path');

const app = express();

// ١. ڕێگەپێدان بە سێرڤەر بۆ خوێندنەوەی داتای فۆڕم و وێنەکان (JSON & URL Encoded)
app.use(express.json({ limit: '50mb' })); // بۆ ئەوەی ئەگەر وێنەی گەورەش بوو کێشە دروست نەبێت
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ٢. ناساندنی ڕێڕەوی فۆڵدەری public بە شێوازی دروست و جێگیر
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
    const roomID = req.query.id || null; // ئەگەر ئایدی نەبوو بە تال دایبنێت
    res.render('index', { roomID });
});

// ٦. ئەگەر بەکارهێنەر ویستی وێنەیەک باربکات یان ئەڤەتار دابنێت، ئەم بەشە ڕێگری لێ ناکات
app.post('/upload-avatar', (req, res) => {
    const { avatar } = req.body;
    if (!avatar) {
        return res.status(400).json({ success: false, message: 'هیچ وێنەیەک نەدۆزرایەوە!' });
    }
    // لێرەدا دەتوانیت وێنەکە پاشەکەوت بکەیت یان ڕاستەوخۆ بە سۆکێت بینێریت
    res.json({ success: true, message: 'وێنەکە بەسەرکەوتوویی ناسێنرا' });
});

module.exports = app;