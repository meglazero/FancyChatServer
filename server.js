const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const hasha = require('hasha');
const methodOverride = require('method-override');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const messages = require('./db/messages');
const userlist = require('./db/userlist');

const app = express();

// app.use(morgan('tiny'));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

// message getting handling

app.get('/', (req, res) => {
    // res.json({
    //     message: "Attempted to get all messages"
    // });
    messages.getAll().then((messages) => {
        res.json(messages);
    })
});

// login handling

app.post('/login', async (req, res) => {
    // res.json({
    //     message: "Attempted login"
    // })
    let userVerification = [];

    await userlist.userExists(req.body.username.toLowerCase()).then((response) => {
        userVerification = response;
    });

    if ( userVerification.length == 0 ) {
        res.status(417);
        res.json({ error: 'User doesn\'t exist' });
    };
    if ( userVerification.length >= 2 ) {
        res.status(417);
        res.json({ error: 'Too many users with same name, contact admin' });
    };
    if ( req.body.secured ) {
        if ( userVerification[0].password === req.body.password ) {
            res.json(userVerification[0])
        } else {
            res.status(417);
            res.json({ error: "Invalid password" })
        }
    } else {
        if ( userVerification[0].password === hasha(req.body.password) ) {
            res.json(userVerification[0])
        } else {
            res.status(417);
            res.json({ error: "Invalid password" })
        }
    }
});

// logout handling + should be unnecessary, logging is handled on front end?

// app.post('/logout', (req, res) => {
//     res.json({
//         message: "Attempted logout"
//     })
// });

// send message handling

app.post('/message', (req, res) => {
    // res.json({
    //     message: "Attempt to send message"
    // })
    messages.create(req.body).then((message) => {
        res.json(message);
    }).catch((error) => {
        res.status(500);
        res.json(error);
    });
});

// user list handling

app.post('/users', async (req, res) => {
    // res.json({
    //     message: "Attempted to create user"
    // })
    let userVerification = []
    if (req.body.secure){
        delete req.body["secure"]
    } else {
        req.body.password = hasha(req.body.password);
    }
    req.body.username = req.body.username.toLowerCase()

    await userlist.userExists(req.body.username).then((response) => {
        userVerification = response
    })

    const { username, password } = req.body

    if(userVerification.length < 1){
        userlist.create({ username, password }).then((user) => {
            res.json(user);
        }).catch((error) => {
            res.status(500);
            res.json(error);
        });
    } else {
        res.json({
            error: 'User already exists'});
    };
});

app.get('/users', (req, res) => {
    userlist.getAll().then((users) => {
        res.json(users);
    })
})

// delete sections

app.delete('/users', async (req, res) => {
    if(req.body.account == "admin" && req.body.adminPW == "test"){
        if(req.body.query == "all") {
            await userlist.deleteUser(req.body.query);

            res.json({ message: "Dropped users table" })
        } else {
            let userList = [];
            req.body.username = req.body.username.toLowerCase();

            await userlist.userExists(req.body.username).then((result) => {
                userList = result
            })

            console.log(userList);

            if (userList.length > 1 && req.body.multiple != 'y') return res.json({
                message: 'Couldn\'t delete multiple users due to missing parameter: "multiple: y"'
            });

            for (user of userList) {
                console.log(`Attempting to delete: ${user._id}`)
                userlist.deleteUser(user._id);
            };

            res.json({
                message: "Attempted delete user"
            });
        }
    } else {
    res.json({
        errorCode: '500',
        message: 'Forbidden, wrong admin details'
    })
}
});

// need to update to deleting individual messages at some point
app.delete('/messages', (req, res) => {
    if(req.body.account == "admin" && req.body.adminPW == "test"){
        messages.deleteMessages(req.body.query);

        res.json({
            message: "Attempted delete message"
        });
    } else {
    res.json({
        errorCode: '500',
        message: 'Forbidden, wrong admin details'
    })
}
});

// redirects for GET handling

app.get('/login', (req, res) => {
    res.redirect(204, '/')
})

app.get('/logout', (req, res) => {
    res.redirect(204, '/')
})

app.get('/create-account', (req, res) => {
    res.redirect(204, '/')
})

app.get('/send-message', (req, res) => {
    res.redirect(204, '/')
})

app.listen(5050);