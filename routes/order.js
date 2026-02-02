const express = require("express")
const router = express.Router();
const authentication = require("../middleware/authentication")
const authorize = require("../middleware/authrize")
const { 
   getOrders,
    getAllOrders,
    getSingleOrder,
     updateOrder, 
     deleteOrder,
      createOrder,
      updateOrderStatus,
      getVendorOrders,
      getAllOrdersForAdminOrVendor
} = require("../controllers/order");

 router.post("/create",authentication, createOrder);
 router.get("/get", authentication, getOrders);
 router.get("/get-all", authentication, authorize("admin"), getAllOrders); 
 router.get("/vendor-orders", authentication, authorize("vendor"), getVendorOrders);

 router.get("/single/:id",authentication, getSingleOrder);
 router.put("/update/:id",authentication, updateOrder);
 router.put("/update-status/:id", authentication, updateOrderStatus); 
 router.delete("/delete/:id",authentication, deleteOrder);

router.get("/vendor-orders-all", authentication, authorize("admin", "vendor"), getAllOrdersForAdminOrVendor);

 module.exports = router;