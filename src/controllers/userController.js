import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", {pageTitle: "Join"});
export const postJoin = async (req, res) => {
    const {name, username, email, password, password2, location,} = req.body;
    const pageTitle = "Join"
    const idEmailExist = await User.exists({$or: [{username}, {email}]});

    if (password !== password2) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "Password confirmation does not match.",
        })
    }
    if (idEmailExist) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "This username is already taken.",
        });
    }
    try {
        await User.create({
            name,
            username,
            email,
            password,
            location
        });
        res.redirect("/login");
    } catch (error) {
        return res.status(400).render("join", {
            pageTitle: "",
            errorMessage: error.errorMessage
        })
    }
};

export const getLogin = (req, res) => res.render("login", {pageTitle: "Login"});

export const postLogin = async (req, res) => {
    const {username, password} = req.body;
    const pageTitle = "Login"
    const user = await User.findOne({username, socialOnly: false});
    // check if account exists
    if (!user) {
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "An account with this username does not exists.",
        });
    }
    // check if password correct
    const checkID = await bcrypt.compare(password, user.password);
    if (!checkID) {
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "Wrong password.",
        });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    req.session.save();
    return res.redirect("/")
};

export const startGithubLogin = (req, res) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id: process.env.GH_CLIENT,
        allow_signup: false,
        scope: "read:user user:email"
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code,
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await (
        await fetch(finalUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
            },
        })
    ).json();

    if ("access_token" in tokenRequest) {
        // access api
        const {access_token} = tokenRequest
        const apiUrl = "https://api.github.com"
        const userData = await (
            await fetch(`${apiUrl}/user`, {
                headers: {
                    Authorization: `token ${access_token}`
                },
            })
        ).json();
        const emailData = await (
            await fetch(`${apiUrl}/user/emails`, {
                headers: {
                    Authorization: `token ${access_token}`
                },
            })
        ).json();
        const emailObj = emailData.find(
            email => email.primary === true && email.verified === true
        );
        if (!emailObj) {
            return res.redirect("/login")
        }
        let user = await User.findOne({email: emailObj.email});
        if (!user) {
            try {
                user = await User.create({
                    name: userData.name,
                    username: userData.login,
                    email: emailObj.email,
                    location: userData.location,
                    password: "",
                    oAuthAccount: true,
                });
                req.session.loggedIn = true;
                req.session.user = user;
                return res.redirect("/");
            } catch {
                return res.redirect("/login")
            }
        } else {
            req.session.loggedIn = true;
            req.session.user = user;
            return res.redirect("/");
        }
    } else {
        return res.redirect("/login")
    }
}

export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Delete User");

export const logout = (req, res) => res.send("Logout");
export const see = (req, res) => res.send("See user");
