import {Router} from 'express';
import {checkUserOptional} from '../utils';
import {auth} from 'firebase-admin';
import userRouter from "./u";
import collRouter from "./c";
import adminRouter from "./admin";
import profileRouter from "./profile";

const index = Router();

index.get('/', checkUserOptional, (req, res) => {
    res.render("index", {user: req.body.user, csrf: req.csrfToken()});
});

index.post('/', (req, res) => {
    const idToken = req.body.idToken.toString();
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    auth()
        .createSessionCookie(idToken, {expiresIn})
        .then((sessionCookie) => {
            const options = {maxAge: expiresIn, httpOnly: true, /*secure: true*/};
            res.cookie('session', sessionCookie, options);
            res.end(JSON.stringify({status: 'success'}));
        }, _ => {
            res.status(403).send('NZ2XG2D3NRHTS2KOL5TDISKMGNSH2===');
        });
});
index.get('/logout', (req, res) => {
    const sessionCookie = req.cookies.session || '';
    res.clearCookie('session');
    auth()
        .verifySessionCookie(sessionCookie)
        .then((decodedClaims) => auth().revokeRefreshTokens(decodedClaims.sub))
        .then(_ => res.redirect('/'))
        .catch(_ => res.status(403).send('logout failed'));
});

index.use("/u", userRouter);
index.use("/c", collRouter);
index.use("/admin", adminRouter);
index.use("/profile", profileRouter);

export default index;