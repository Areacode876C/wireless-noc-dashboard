const { app } = require('@azure/functions');

app.setup({
    enableHttpStream: true,
});

// Load function registrations
require('./functions/getSites');