const mongoose = require('mongoose')

const OrganSchema = new mongoose.Schema({
    OrganName: {
        type: String
    },
    OrganId: {
        type: String
    },
    OrganLogo: {
        type: String
    },
    
})

module.exports = mongoose.model('Organ', OrganSchema)