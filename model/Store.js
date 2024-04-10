const mongoose = require('mongoose')

const StoreSchema = new mongoose.Schema({
    ItemID: {
        type: String
    },
    ItemName: {
        type: String
    },
    ItemImage: {
        type: String
    },
    ItemPrice: {
        type: String
    },
    ItemDescription: {
        type: String
    },
    OrganId: {
        type: String
    }
})

module.exports = mongoose.model('Store', StoreSchema)