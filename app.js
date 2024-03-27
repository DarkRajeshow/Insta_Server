// Importing modules
import createError from 'http-errors';
import express from 'express';
import logger from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import { isAuthenticated, isLoggedIn, loginUser, logoutUser, registerUser, getUserId } from './routes/auth/auth.js';

// Importing routes
import uploadRouter from './routes/actions/upload.js';
import likeRouter from './routes/actions/like.js';
import toggleFollowRouter from './routes/actions/toggleFollow.js';
import saveRouter from './routes/actions/save.js';
import userRouter from './routes/actions/user.js';
import commentsRouter from './routes/data/comments.js';
import feedRouter from './routes/data/feed.js';
import usernameRouter from './routes/data/username.js';
import likedRouter from './routes/data/liked.js';
import savedRouter from './routes/data/saved.js';
import postRouter from './routes/query/post.js';
import followersRouter from './routes/query/followers.js';
import followingRouter from './routes/query/following.js';
import searchRouter from './routes/query/search.js';
import exploreRouter from './routes/data/explore.js'
import messageRouter from './routes/data/message.js'
import notificationRouter from './routes/notification/notification.js'
import specialRouter from './routes/special.js'


// Importing models and utilities
import connectToMongo from './utility/connectToMongo.js';
import { createServer } from 'http'
import socketIo from './connection/socket.js';
import cookieParser from 'cookie-parser';

// Configuring environment variables
dotenv.config();

const __dirname = path.resolve();

const PORT = process.env.PORT;
const app = express();

// Connecting to MongoDB
connectToMongo();

// Authentication setup
app.use(cookieParser());
app.use(isAuthenticated);

// cores setup
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

// Default setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api/uploads", express.static("public/uploads"));



// // for frontend code rendering
// app.use(express.static(path.join(__dirname, '/client/dist')));

// app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "client", "dist", "index.html"))
// })

// API routes
// Auth
app.post('/api/login', loginUser);
app.post('/api/register', registerUser);
app.get('/api/logout', logoutUser);
app.get('/api/isloggedin', isLoggedIn);
app.get('/api/auth/userid', getUserId);

// User actions
app.use('/api/upload', uploadRouter);
app.use('/api/like', likeRouter);
app.use('/api/toggle-follow', toggleFollowRouter);
app.use("/api/save", saveRouter);
app.use('/api/user', userRouter);

// Data retrieval
app.use('/api/feed', feedRouter);
app.use('/api/username', usernameRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/liked', likedRouter);
app.use('/api/saved', savedRouter);
app.use("/api/explore", exploreRouter)
app.use("/api/messages", messageRouter)

// Query
app.use("/api/posts", postRouter);
app.use("/api/followers", followersRouter);
app.use("/api/following", followingRouter);
app.use("/api/search", searchRouter);

// notifications
app.use("/api/notifications", notificationRouter);


// special queries
app.use("/api/special", specialRouter);

// Error handling
app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    console.log(err);
    res.status(err.status || 500).json({
        success: false,
        status: err.message || 'Internal Server Error'
    });
});

const httpServer = createServer(app)

socketIo(httpServer);

// Starting the server
httpServer.listen(PORT, () => {
    console.log("Server is running : " + PORT);
});

// Exporting the app
export default app;
