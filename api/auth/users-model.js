const db = require("../../data/dbConfig")

const find = () => {
    return db("users");
}

const findBy = (filter) => {
    return db("users").where(filter).first();
}

const findById = (id) => {
    return db("users").where("id", id).first();
}

const add = async (user) =>{
    const id = await db("users").insert(user);
    const result = await findById(id);
    return result;
}

const entryVerifyMiddleware = (req,res,next) =>{
    const user = req.body;
    if (user.username && user.password && user.username.trim().length && user.password.trim().length ) {
        next()
    } else {
        next({status: 401, message: "username and/or password required"})
    }
}

const userVerifyMiddleware = async (req, res, next) =>{
    const {username} = req.body;
    const search = await findBy({username});
    if (search) {
        next({status: 401, message: "username taken"});
    } else {
        next();
    }
}

const loginVerifyMiddleware = async (req, res, next) =>{
    const {username} = req.body;
    const search = await findBy({username});
    if (!search) {
        next({status: 401, message: "username not found"});
    } else {
        next();
    }
}

module.exports = {
    find, findBy, findById, add, userVerifyMiddleware, entryVerifyMiddleware, loginVerifyMiddleware
}
