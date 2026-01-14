const express = require("express")
const router = express.Router();
const authentication = require("../middleware/authentication")
const { 
   getOrders,
    getSingleOrder,
     updateOrder, 
     deleteOrder,
      createOrder
} = require("../controllers/order");

 router.post("/create",authentication, createOrder);
 router.get("/get", authentication, getOrders);
 router.get("/single/:id",authentication, getSingleOrder);
 router.put("/update/:id",authentication, updateOrder);
 router.delete("/delete/:id",authentication, deleteOrder);
 
 module.exports = router;