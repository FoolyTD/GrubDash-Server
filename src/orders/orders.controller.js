const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function isValidOrder(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  const requiredFields = ["deliverTo", "mobileNumber", "dishes"];
  const orderData = {
    deliverTo,
    mobileNumber,
    dishes,
  };
  let quantity = 0;

  for (const field of requiredFields) {
    if (!orderData[field]) {
      return next({
        status: 400,
        message: `Invalid input: "${field}"`,
      });
    }
  }

  if (dishes === undefined) {
    return next({
      status: 400,
      message: `Invalid order, dishes needed`,
    });
  } else if (dishes.length <= 0) {
    return next({
      status: 400,
      message: `Invalid order, dishes cannot be empty`,
    });
  } else if (!Array.isArray(dishes)) {
    return next({
      status: 400,
      message: `Invalid order, dishes must be an array`,
    });
  } else if (dishes) {
    for (let i = 0; i < dishes.length; i++) {
      const dish = dishes[i];
      if (!dish.quantity) {
        next({
          status: 400,
          message: `Invalid quantity ${quantity} cannot be added to ${dish.quantity}`,
        });
      } else if (dish.quantity === 0 || typeof dish.quantity !== "number") {
        next({
          status: 400,
          message: `${i} is not a valid quantity`,
        });
      } else if (dish.quantity) {
        quantity += dish.quantity;
      }
    }
  }

  res.locals.orderData = orderData;
  next();
}

function orderExists(req,res,next) {
    const { orderId } = req.params;
    const foundOrder = orders.find(order=>order.id === orderId);

    if(foundOrder === undefined) {
       return next({
            status: 404,
            message: `Order not found: ${orderId}`
        })
    }
    res.locals.foundOrder = foundOrder;
    res.locals.orderId = orderId;
    next();
}

function list(req, res, next) {
  res.json({ data: orders });
}

function create(req, res, next) {
  const newOrder = { ...res.locals.orderData, id: nextId() };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function read(req,res,next) {
    res.json({data:res.locals.foundOrder});
}

function update(req,res,next) {
    const { data: { id, status, deliverTo } = {}} = req.body;
    const orderData = res.locals.orderData;
    const orderId = res.locals.orderId;
    const foundOrder = res.locals.foundOrder;
    const validStatuses = ["pending","preparing","out-for-delivery"];

    if (status == undefined) {
        return next({
            status: 400,
            message: `Order must have a status of pending, preparing, out-for-delivery, delivered`
        })
    } else if (status.length <= 0) {
        return next({
            status: 400,
            message: `Order must have a status of pending, preparing, out-for-delivery, delivered`
        })
    } else if (status === "delivered") {
        return next({
            status: 400,
            message: `A delivered order cannot be changed`
        })
    } else if (status) {
        for (const validStatus of validStatuses) {
            if (status === validStatus) {
                break;
            } else {
                next({
                    status:400,
                    message: 'Order must have a status of pending, preparing, out-for-delivery, delivered'
                })
            }
        }
    }
    
    if (id === undefined) {
        foundOrder["status"] = status;
        return res.json({data:foundOrder}); 
    } else if (id === "") {
        foundOrder["status"] = status;
        return res.json({data:foundOrder});
    } else if (id === null) {
        foundOrder["status"] = status;
        return res.json({data:foundOrder});
    } else if (id !== orderId) {
        return next({
            status: 400,
            message: `An id ${id} is not found`
        })
    }
    foundOrder["status"] = status;
    foundOrder["deliverTo"] = deliverTo;
    res.json({data:foundOrder});
}

function destroy(req,res,next) {
    const toDelete = res.locals.foundOrder;
    if(toDelete.status !== "pending") {
        next({
            status: 400,
            message: `Order must be pending to delete`
        })
    }
    orders.filter((order)=>{
        return order.id !== toDelete.id;
    })
    res.sendStatus(204);
}

module.exports = {
  list,
  create: [isValidOrder, create],
  read: [orderExists,read],
  update: [isValidOrder,orderExists, update],
  delete: [orderExists,destroy]
};
