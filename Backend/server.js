const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const axios = require('axios');
const mongoose = require("mongoose");
// const dataBooks = require('./data.json');
const port = 3000;

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true, limit: '1000mb'}));
app.use(express.static("public"));

//Connection
mongoose.connect("mongodb://127.0.0.1:27017/InsightfulReadsAI")
.then(()=>console.log("MongoDB connected"))
.catch(err=>console.log("Mongo Err", err));

//Schemas
const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    url: String,
    rating: String,
    genres: [String],
    description: String
});

const friendSchema = new mongoose.Schema({
    username: String
});

const friendRequestSentSchema = new mongoose.Schema({
    receiverName: String,
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
});

const friendRequestReceivedSchema = new mongoose.Schema({
    senderName: String,
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
});

const notificationSchema = new mongoose.Schema({
    message: String
});

const userSchema = new mongoose.Schema({
    username: {type:String, unique: true},
    email: {type:String, unique: true},
    password: String,
    mode: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
    },
    reading_wishlist: [bookSchema],
    ongoing: [bookSchema],
    completed: [bookSchema],
    friends: [friendSchema],
    friendRequestSent: [friendRequestSentSchema],
    friendRequestReceived: [friendRequestReceivedSchema],
    notifications: [notificationSchema]
});

//Models
const User = mongoose.model("User", userSchema);

// Define middleware function to check if user is authenticated
const requireAuth = (req, res, next) => {
    fetch('http://localhost:8000/states')
    .then(response => response.json())
    .then(data => {
        if (data.isAuthenticated === "true") {
            return next();
        } else {
            res.redirect('/login');
        }
    })
    .catch(err => console.log(err));
};

app.get('/', requireAuth, (req, res)=>{
    if (typeof req.query.results !== "undefined") {
        fetch('http://localhost:8000/states')
        .then(response => response.json())
            .then(data => {
                const test_list = data.test_list;
                res.render('home', { books: test_list});
        });
    } else {
        res.render('home');
    }
});

app.get('/reading-list', requireAuth, (req, res)=>{
    fetch('http://localhost:8000/states')
    .then(response => response.json())
        .then(data => {
            User.findOne({ username: data.username })
            .then((user) => {
                const reading_wishlist = user.reading_wishlist;
                const ongoing = user.ongoing;
                const completed = user.completed;
                res.render('reading-list', {reading_wishlist: reading_wishlist, ongoing:ongoing, completed:completed});
            })
            .catch(err => {
                console.log("Error adding book to reading wishlist:", err);
            });
        });
});

app.route("/signup")
.get((req, res)=>{
    res.render("signup");
})
.post((req, res)=>{
    User.find()
    .then((users)=>{
        if (users.length>0){
            var check = 4
            if (users.filter(user=> user.username === req.body.username && user.email === req.body.email).length > 0) {
                check = 1;
            } else if (users.filter(user=> user.username === req.body.username).length > 0) {
                check = 2;
            } else if (users.filter(user=> user.email === req.body.email).length > 0) {
                check = 3;
            } else {
                check = 0;
            }
            switch(check) {
                case 0: {
                    const newUser = new User({
                        username: req.body.username,
                        email: req.body.email,
                        password: req.body.password,
                        reading_wishlist: [],
                        ongoing: [],
                        completed: [],
                        friends: []
                    });
    
                    newUser.save()
                    .then(()=>res.redirect("/login"))
                    .catch(err=>console.log(err));
                    break;
                }
                case 1: {
                    res.render("signup", {errmsg1: "username already taken!", errmsg2: "This email is used by another account!"}); 
                    break;
                }
                case 2: {
                    res.render("signup", {errmsg1: "username already taken!"});
                    break;
                }
                case 3: {
                    res.render("signup", {errmsg2: "This email is used by another account!"});
                    break;
                }
                default: {
                    res.render('signup', {errmsg2: "error"});
                    break;
                }
            }
        } else {
            const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                reading_wishlist: [],
                ongoing: [],
                completed: [],
                friends: []
            });

            newUser.save()
            .then(()=>res.redirect("/login"))
            .catch(err=>console.log(err));
        }
    })
    .catch(err=>console.log(err));
});

app.route("/login")
.get((req, res)=>{
    res.render("login");
})
.post((req, res)=>{
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({username: username})
    .then((foundUser)=>{
        if(foundUser){
            if(foundUser.password === password){
                fetch('http://localhost:8000/states')
                .then(response => response.json())
                .then(data => {
                    data.isAuthenticated = "true";
                    data.username = req.body.username;
                    data.notifications = foundUser.notifications;
                    data.mode = foundUser.mode;
                    fetch('http://localhost:8000/states', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });
                })
                .then(()=>res.redirect("/reading-list"))
                .catch(err=>console.log(err));
                
            } else {
                res.render("login", {errmsg: "Incorrect password!"});
            }
        } else {
            res.render("login", {errmsg: "User not found! Please signup"});
        }
    })
    .catch(err=>console.log(err))
});

app.get("/logout", requireAuth, (req, res)=>{
    fetch('http://localhost:8000/states')
    .then(response => response.json())
    .then(data => {
        const username = data.username
        User.findOne({username: username})
        .then(user => {
            user.mode = data.mode
            user.save()
        })
        data.isAuthenticated = "false";
        data.username = "null";
        fetch('http://localhost:8000/states', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    })
    .then(()=>res.redirect("/login"))
    .catch(err=>console.log(err));
});

app.get("/notifications", requireAuth, (req, res)=>{
    fetch('http://localhost:8000/states')
    .then(response => response.json())
    .then(data => {
        User.findOne
        ({ username: data.username })
        .then(user => {
            res.render("notifications", {notifications: user.notifications});
        })
        .catch(err => console.log(err));
    });
});

app.get("/friends", requireAuth, (req, res)=>{
    fetch('http://localhost:8000/states')
    .then(response => response.json())
    .then(data=>{
        User.findOne({username: data.username})
        .then(user=>{
            const requests = {
                received: user.friendRequestReceived,
                sent: user.friendRequestSent
            }
            res.render('friends', {friends: user.friends, requests: requests});
        })
        .catch(err=>console.log(err))
    });
});

app.post("/friends", requireAuth, (req,  res)=>{
    const friendUsername = req.body.username;
    //console.log("Step 1:",friendUsername)
    fetch('http://localhost:8000/states')
    .then(response => response.json())
    .then(data => {
        User.findOne({username: data.username})
        .then(user => {
            // console.log("Step2: Obviously you exist in users", user.username)
            // console.log("Step3: Your friends", user.friends)
        const requests = {
            received: user.friendRequestReceived,
            sent: user.friendRequestSent
        }
        if (friendUsername === user.username){
            res.render("friends", {friends: user.friends, errmsg: "You can't add yourself as a friend!", requests: requests});
            // console.log("adding yourself",friendUsername);
        } else {
            User.findOne({username: friendUsername})
            .then((friend)=>{
            if(friend){
                // console.log("Step4: friend exists in users", friend.username)
                if(user.friends.length > 0) {
                    const same = user.friends.filter(f => f.username === friendUsername)
                    if (same.length>0) {
                        // console.log("adding same friend again")
                        res.render("friends", {friends: user.friends, errmsg: "Friend already added!", requests: requests});
                    } else {
                        // send friendRequest
                        const newFriendRequestSent = {
                            receiverName: friendUsername,
                            status: 'pending'
                        }
                        User.findOneAndUpdate(
                            { username: user.username },
                            { $push: { friendRequestSent: newFriendRequestSent } }, 
                            { new: true } 
                        )
                        .then(() => {
                            const newFriendRequestReceived = {
                                senderName: user.username,
                                status: 'pending'
                            }
                            const newNotification = {
                                message: `${user.username} sent you a friend request!`
                            }
                            User.findOneAndUpdate(
                                { username: friendUsername },
                                { $push: { 
                                    friendRequestReceived: newFriendRequestReceived,
                                    notifications: newNotification
                                } }, 
                                { new: true } 
                            )
                            .then(() => {
                                User.findOne({username: user.username})
                                    .then(user=>{
                                        const requests = {
                                            received: user.friendRequestReceived,
                                            sent: user.friendRequestSent
                                        }
                                        res.render("friends", {friends: user.friends, success: "Friend request sent!", requests: requests});
                                    })
                                    .catch(err => {
                                        console.log("Error sending friend request:", err);
                                    });
                            })
                            .catch(err => {
                                console.log("Error sending friend request:", err);
                            });
                        })
                        .catch(err => {
                            console.log("Error sending friend request:", err);
                        });
                    }
                } else {
                    // send friendRequest
                    const newFriendRequestSent = {
                        receiverName: friendUsername,
                        status: 'pending'
                    }
                    User.findOneAndUpdate(
                        { username: user.username },
                        { $push: { friendRequestSent: newFriendRequestSent } }, 
                        { new: true } 
                    )
                    .then(() => {
                        const newFriendRequestReceived = {
                            senderName: user.username,
                            status: 'pending'
                        }
                        const newNotification = {
                            message: `${user.username} sent you a friend request!`
                        }
                        User.findOneAndUpdate(
                            { username: friendUsername },
                            { $push: { 
                                friendRequestReceived: newFriendRequestReceived,
                                notifications: newNotification
                            } }, 
                            { new: true } 
                        )
                        .then(() => {
                            User.findOne({username: user.username})
                                .then(user=>{
                                    const requests = {
                                        received: user.friendRequestReceived,
                                        sent: user.friendRequestSent
                                    }
                                    res.render("friends", {friends: user.friends, success: "Friend request sent!", requests: requests});
                                })
                                .catch(err => {
                                    console.log("Error sending friend request:", err);
                                });
                        })
                        .catch(err => {
                            console.log("Error sending friend request:", err);
                        });
                    })
                    .catch(err => {
                        console.log("Error sending friend request:", err);
                    });
                }
            } else {
                res.render("friends", {friends: user.friends, errmsg: "User not found!"});
            }
            })
        }
      });
    });
});

app.post('/eval-friend-requests', requireAuth, (req, res)=>{
    const senderName = req.body.senderName;
    const status = req.body.status;
    fetch('http://localhost:8000/states')
    .then(response => response.json())
        .then(data => {
            User.findOne({ username: data.username })
            .then(user=>{
                if(status === "accept") {
                    const newFriend = {
                        username: senderName
                    }
                    User.findOneAndUpdate(
                        { username: user.username },
                        { $push: { friends: newFriend } }, 
                        { new: true } 
                    )
                    .then(() => {
                        User.findOneAndUpdate(
                            { username: user.username },
                            { $pull: { friendRequestReceived: {senderName: senderName} } }, 
                            { new: true } 
                        )
                        .then(() => {
                            User.findOneAndUpdate(
                                { username: senderName },
                                { $push: { friends: {username: user.username} } }, 
                                { new: true } 
                            )
                            .then(() => {
                                User.findOneAndUpdate(
                                    { username: senderName },
                                    { $pull: { friendRequestSent: {receiverName: user.username} } }, 
                                    { new: true } 
                                )
                                .then(user => {
                                    const userEdit = user;
                                    userEdit.notifications.push({message: `${data.username} accepted your friend request!`});
                                    userEdit.save()
                                    res.redirect("/friends");
                                })
                                .catch(err => { console.log("Error accepting friend request:", err);});
                            })
                            .catch(err=>{ console.log("Error accepting friend request:", err);});
                        })
                        .catch(err => { console.log("Error accepting friend request:", err);});
                    })
                    .catch(err => { console.log("Error accepting friend request:", err);});
                }
                else if(status === "reject") {
                    User.findOneAndUpdate(
                        { username: data.username },
                        { $pull: { friendRequestReceived: {senderName: senderName} } }, 
                        { new: true } 
                    )
                    .then(() => {
                        User.findOneAndUpdate(
                            { username: senderName },
                            { $pull: { friendRequestSent: {receiverName: data.username} } }, 
                            { new: true } 
                        )
                        .then(user => {
                            const userEdit = user;
                            userEdit.notifications.push({message: `${data.username} rejected your friend request!`});
                            userEdit.save()
                            res.redirect("/friends");
                        })
                        .catch(err => { console.log("Error rejecting friend request:", err);});
                    })
                    .catch(err => { console.log("Error rejecting friend request:", err);});
                }
            })
            .catch(err => { console.log("Error accepting friend request:", err);});
        })
        .catch(err => { console.log("Error accepting friend request:", err);});
});

app.post('/add-book-to-reading-wishlist', (req, res)=>{
    const newBook = {
        title: req.body.title,
        author: req.body.author,
        url: req.body.url,
        rating: req.body.rating,
        genres: req.body.genres.split(','),
        description: req.body.description
    }
    console.log(newBook);
    fetch('http://localhost:8000/states')
    .then(response => response.json())
        .then(data => {
            User.findOneAndUpdate(
                { username: data.username },
                { $push: { reading_wishlist: newBook } }, 
                { new: true } 
            )
            .then((user) => {
                    console.log("Book added to reading wishlist:", user.username);
                    res.redirect("/reading-list")
            })
            .catch(err => {
                console.log("Error adding book to reading wishlist:", err);
            });
        });
});

app.post('/add-book-to-ongoing', (req, res)=>{
    const newBook = {
        title: req.body.title,
        author: req.body.author,
        url: req.body.url,
        rating: req.body.rating,
        genres: req.body.genres.split(','),
        description: req.body.description
    }
    fetch('http://localhost:8000/states')
    .then(response => response.json())
        .then(data => {
            User.findOneAndUpdate(
                { username: data.username },
                { $pull: {reading_wishlist: {title: newBook.title}}, $push: { ongoing: newBook } }, 
                { new: true } 
            )
            .then((user) => {
                    console.log("Book added from reading_wishlist to ongoing:", user.username);
                    res.redirect("/reading-list")
            })
            .catch(err => {
                console.log("Error adding book to reading wishlist:", err);
            });
        });
});

app.post('/add-book-to-completed', (req, res)=>{
    const newBook = {
        title: req.body.title,
        author: req.body.author,
        url: req.body.url,
        rating: req.body.rating,
        genres: req.body.genres.split(','),
        description: req.body.description
    }
    fetch('http://localhost:8000/states')
    .then(response => response.json())
        .then(data => {
            User.findOneAndUpdate(
                { username: data.username },
                { $pull: {ongoing: {title: newBook.title}}, $push: { completed: newBook } }, 
                { new: true } 
            )
            .then((user) => {
                    console.log("Book added from reading_wishlist to ongoing:", user.username);
                    res.redirect("/reading-list")
            })
            .catch(err => {
                console.log("Error adding book to reading wishlist:", err);
            });
        });
});

app.get('/book/:title', (req, res)=>{
    let searchTitle = req.params.title;
    fetch('http://localhost:8000/states')
    .then(response => response.json())
    .then(data=>{
        const book = data.test_list.filter(book=>book.title === searchTitle)
        var foundIn = 4
        if(book.length > 0) {
            User.findOne({username: data.username})
            .then(user => {
                if(user.reading_wishlist.filter(book=>book.title === searchTitle).length > 0) {
                    foundIn = 1
                } else if (user.ongoing.filter(book=>book.title === searchTitle).length > 0) {
                    foundIn = 2
                } else if (user.completed.filter(book=>book.title === searchTitle).length > 0) {
                    foundIn = 3
                } else {
                    foundIn = 0
                }
            }).then(()=>{
                if (foundIn === 0){
                    res.render("bookPreview", {book: book[0], addLink: "/add-book-to-reading-wishlist"})
                } else if (foundIn === 1){
                    res.render("bookPreview", {book: book[0], addLink: "/add-book-to-ongoing"})
                } else if (foundIn === 2) {
                    res.render("bookPreview", {book: book[0], addLink: "/add-book-to-completed"})
                } else if (foundIn === 3) {
                    res.render("bookPreview", {book: book[0], addLink: "completed"})
                } else {
                    res.render("bookPreview", {book: book[0], addLink: "error"})
                }
                    
            });
        } else {
            res.redirect("/error");
        }
    });
});

app.get('/friends/:username/books/:title', (req, res)=>{
    let searchTitle = req.params.title;
    let friendUsername = req.params.username;
    var book = {}
    fetch('http://localhost:8000/states')
    .then(response => response.json())
    .then(data=>{
        User.findOne(
            { 
                username: friendUsername,
                $or: [
                  { "reading_wishlist.title": searchTitle },
                  { "ongoing.title": searchTitle },
                  { "completed.title": searchTitle }
                ]
            }
        ).then((user) => {
              if (!user) {
                console.log("User not found");
                res.redirect("/error")
              }
          
              book = user.reading_wishlist.find(book => book.title === searchTitle) ||
               user.ongoing.find(book => book.title === searchTitle) ||
               user.completed.find(book => book.title === searchTitle);
              
              console.log("Found book:", book);
              var foundIn = 4
              if(book) {
                User.findOne({username: data.username})
                .then(user => {
                    if(user.reading_wishlist.filter(book=>book.title === searchTitle).length > 0) {
                        foundIn = 1
                    } else if (user.ongoing.filter(book=>book.title === searchTitle).length > 0) {
                        foundIn = 2
                    } else if (user.completed.filter(book=>book.title === searchTitle).length > 0) {
                        foundIn = 3
                    } else {
                        foundIn = 0
                    }
                }).then(()=>{
                    if (foundIn === 0){
                        res.render("bookPreview", {book: book, addLink: "/add-book-to-reading-wishlist"})
                    } else if (foundIn === 1){
                        res.render("bookPreview", {book: book, addLink: "/add-book-to-ongoing"})
                    } else if (foundIn === 2) {
                        res.render("bookPreview", {book: book, addLink: "/add-book-to-completed"})
                    } else if (foundIn === 3) {
                        res.render("bookPreview", {book: book, addLink: "completed"})
                    } else {
                        res.render("bookPreview", {book: book, addLink: "error"})
                    }
                        
                });
              } else {
                res.redirect("/error");
              }
            }
        );
    });
});

app.get("/profile/:username", requireAuth, (req, res)=>{
    User.findOne({username: req.params.username})
    .then(user=>{
        if(user) {
            res.render("profile", {user: user});
        } else {
            res.redirect("/error");
        }
    });
});

app.get("/friend/:username", (req, res)=>{
    fetch("http://localhost:8000/states")
    .then(response => response.json())
    .then(data => {
        User.findOne({username: req.params.username})
        .then(friend=>{
            if(friend) {
                User.findOne({username: data.username})
                .then(user => {
                    if (user.username === req.params.username) {
                        res.redirect(`/profile/${user.username}`)
                    } else {
                        res.render("friendsPreview", {user: friend});
                    }
                });
            } else {
                res.redirect("/error");
            }
        });
    });
});

app.post('/deleteNotification', (req, res)=>{
    const notificationID = req.body.notificationId;
    fetch('http://localhost:8000/states')
    .then(response => response.json())
    .then(data => {
        User.findOneAndUpdate(
            { username: data.username },
            { $pull: { notifications: { _id: notificationID } } }, 
            { new: true } 
        )
        .then(() => {
            data.notifications = data.notifications.filter(X=> X._id !== notificationID)
            fetch('http://localhost:8000/states', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(()=> res.redirect("/notifications"))
            .catch(err => {console.log("Error deleting notification:", err)});
        })
        .catch(err => {
            console.log("Error deleting notification:", err);
        });
    })
    .catch(err => {
        console.log("Error deleting notification:", err);
    });
});

app.post('/data', (req, res) => {
    const title = [req.body.title];

    // Define the form data
    const formData = new FormData();
    formData.append('title', title);

    // Define the URL of your Python server
    const url = 'http://127.0.0.1:5000/books'; // Replace with your server URL

    // Send the POST request
    axios.post(url, formData)
    .then(response => {
        // console.log('Response:', response.data);
        const list = response.data;
        fetch('http://localhost:8000/states')
        .then(res => res.json())
        .then(async data => {
            data.test_list = list;
            fetch('http://localhost:8000/states', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).then(()=>res.redirect(`/?results=${list.length}`));
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

app.get("/error", (req, res)=>{
    res.render("error");
});

app.listen(port, ()=>{
    console.log(`Server started on port ${port}`);
});