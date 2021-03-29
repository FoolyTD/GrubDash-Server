const path = require("path");
const { send } = require("process");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function dishIsValid(req,res,next) {
    const { data:{ name, description, price, image_url } = {} } = req.body;
    const requiredFields = ["name","description","price","image_url"];
    const dishData = {
        name,
        description,
        price,
        image_url,
    }
    for(const field of requiredFields) {
        if(!dishData[field]) {
            return next({
                status: 400,
                message: `Dish must include a ${field}.`
            })
        }
    }
    res.locals.requiredFields = requiredFields;
    res.locals.dishData = dishData;
    next();
}

function dishExists(req,res,next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish)=> dish.id === dishId);

    if(foundDish === undefined) {
        return next({
            status: 404,
            message: `No matching dish is found.`
        })
    }
    res.locals.foundDish = foundDish; 
    next();
}

function list(req,res,next) {
    res.json({data:dishes});
}

function create(req,res,next) {
    const dishData = {...res.locals.dishData, id:nextId()}

    dishes.push(dishData);
    res.status(201).json({data:dishData});
}

function read(req,res,next) {
    res.json({ data: res.locals.foundDish})
}

function update(req,res,next) {
    const { data: { id, price } = {} } = req.body;
    const { dishId } = req.params;
    const requiredFields = res.locals.requiredFields;
    const foundDish = res.locals.foundDish;
    const dishData = res.locals.dishData;

    
    if (typeof(price) !== "number" || price <= 0) {
        return next({
            status: 400,
            message: `Invalid price`,
        })
    }
    if (id === undefined) {
        for(const field of requiredFields) {
            foundDish[field] = dishData[field];
        }
        return res.status(200).json({data:foundDish})
    } else if (id === null) {
        for(const field of requiredFields) {
            foundDish[field] = dishData[field];
        }
        return res.status(200).json({data:foundDish})
    } else if (id === '') {
        for(const field of requiredFields) {
            foundDish[field] = dishData[field];
        }
        return res.status(200).json({data:foundDish})
    } else if (id === dishId) {
        for(const field of requiredFields) {
            foundDish[field] = dishData[field];
        }
        return res.status(200).json({data:foundDish})
    } else {
        return next({
            status: 400,
            message: `Incorrect price dish id: ${id}.`
        })
    }
}

module.exports = {
    list,
    create: [ dishIsValid, create ],
    read: [ dishExists, read],
    update: [ dishExists, dishIsValid, update],
}