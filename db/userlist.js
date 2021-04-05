const Joi = require('joi');
const db = require('./userConnection');

const schema = Joi.object().keys({
    username: Joi.string().alphanum().case("lower").required(),
    password: Joi.string().alphanum().required()
});

const userlist = db.get('userlist');

function getAll() {
    return userlist.find();
};

function getPassword(user) {
    let attempt = userlist.findOne({
        username: user
    })
    let password = attempt.password
    return password
};

function userExists(user) {
    return userlist.find({username: user});
};

function create(user) {
    user.username = user.username.toLowerCase();
    const result = schema.validate(user);
    // if (userlist.findOne({
    //     username: user.username
    // })) {
    //     return Promise.reject('Existing user');
    // };
    // userlist.findOne({
    //     username: user.username
    // }).then(() => { return Promise.reject(result.error) })
    if (result.error == null) {
        user.created = new Date();
        return userlist.insert(user);
    } else {
        return Promise.reject(result.error);
    }
};

function deleteUser(query){
    if (query == 'all'){
        userlist.drop();
    } else {
        userlist.findOneAndDelete({ _id: query });
    }
    
}

module.exports = {
    create,
    getAll,
    getPassword,
    userExists,
    deleteUser
}