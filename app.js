const path = require('path');

// Update your static files path to use absolute path
app.use(express.static(path.join(__dirname, 'public')));

// Update your views path
app.set('views', path.join(__dirname, 'views'));

// Update your port configuration
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
}); 