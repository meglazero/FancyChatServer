const Joi = require('joi');
const db = require('./chatConnection');

const schema = Joi.object().keys({
    username: Joi.string().alphanum().required(),
    message: Joi.string().max(500).min(1).required()
});

const messages = db.get('messages');

function getAll() {
    return messages.find();
};

function create(message) {
    const result = schema.validate(message);
    if (result.error == null) {
        message.created = new Date();
        message.hour = message.created.getHours();
        if(message.created.getMinutes().toString().length == 1){
            message.minute = '0' + message.created.getMinutes()
        } else { message.minute = message.created.getMinutes() }
        return messages.insert(message);
    } else {
        return Promise.reject(result.error);
    }
};

function deleteMessages(query){
    if (query == 'all'){
        messages.drop();
    } else {
        return Promise.reject(result.error);
    }
}

module.exports = {
    create,
    getAll,
    deleteMessages
}