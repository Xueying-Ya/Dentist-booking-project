const express = require('express');
const {getDentists, getDentist, createDentist, updateDentist, deleteDentist}
=require("../controllers/dentists");

//Include other routers
const appointmentRouter = require('./appointments');

const router = express.Router();
const {protect,authorize} = require('../middleware/auth');

//Re-route into other resource router
router.use('/:DentistId/appointments/',appointmentRouter);

router.route('/').get(getDentists).post(protect,authorize('admin'),createDentist);
router.route('/:id').get(getDentist).put(protect,authorize('admin'),updateDentist).delete(protect,authorize('admin'),deleteDentist);

module.exports=router;