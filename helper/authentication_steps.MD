# Easy Authentication and Authorization Setup
### Welcome to a straightforward guide for setting up authentication and authorization in your web application using Express, Passport, and MongoDB!

## Step 1: Install Required Packages
Ensure you have the necessary packages installed by executing the following command:

```bash
npm install express express-generator mongoose passport passport-local passport-local-mongoose express-session dotenv 

```


## Step 2: Setup app.js
In your app.js file, enable Passport and sessions by adding the following code:

```javascript

const session = require('express-session');
const passport = require('passport');

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: "abcd"
}));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(usersRouter.serializeUser());
passport.deserializeUser(usersRouter.deserializeUser());

```

## Step 3: Create User Model
Create a User.js model with basic fields and passport-local-mongoose plugin:

```javascript

const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');
const ConnectToMongo = require('../ConnectToMongo');

ConnectToMongo();

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    boards: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Board',
        },
    ],
    pins: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pin',
        },
    ],
    dp: String,
    fullname: {
        type: String,
        required: true,
    },
});

userSchema.plugin(plm);

module.exports = mongoose.model('User', userSchema);

```

## Step 4: Configure Passport in index.js
In your index.js file, configure the local strategy:

```javascript

const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));
```

Step 5: Create Routes
Build routes such as /register, /login, /logout, and a protected route /profile. Here's an example snippet:

``` javascript
Copy code

router.get('/', (req, res) => {
  res.render('index', { error: "" });
});

router.post("/register", async (req, res) => {
  try {
    const { username, email, fullname } = req.body;
    const userData = new userModel({ username, email, fullname });

    await userModel.register(userData, req.body.password);

    passport.authenticate("local")(req, res, () => {
      res.redirect("/profile");
    });
  } catch (err) {
    console.error(err);

    const errorMessage = (err.name === 'UserExistsError') ? 'User already exists.' : 'An error occurred during registration.';
    res.render("index", { error: errorMessage });
  }
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true
}));

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
      return next(err);
    }
    res.redirect("/login");
  });
});

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

router.post("/upload", isLoggedIn, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No files were uploaded" });
  }

  try {
    const { title, description } = req.body;
    const authorId = req.user ? req.user._id : null;

    const newPin = await postModel.create({
      image: req.file.filename,
      title,
      description,
      author: authorId
    });

    console.log(newPin);

    await userModel.findByIdAndUpdate(authorId, {
      $push: {
        pins: newPin._id
      }
    });
    res.redirect("/profile");
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

```

## Step 6: Create Views
Develop corresponding EJS views for the /register and /login routes.

## Step 7: Access User Data
Now you can access user data using req.user, which holds the data of the currently logged-in user:

```javascript
Copy code
const user = req.user;
```

That's it! You've set up a basic authentication and authorization system for your web application. Feel free to customize and build upon this foundation. Happy coding!
