//const Hospital = require("../models/Hospitals");
const Dentist = require("../models/Dentist");

//@desc Get all hospitals
//@route GET /api/v1/hospitals
//@access Public
exports.getDentists = async (req,res,next)=>{
    try { 
        // const hospitals = await Hospital.find(req.query);
        // console.log(req.query);
        let query;
        // Copy req.query
        const reqQuery = { ...req.query };
        // Fields to exclude
        const  removeFields = ['select', 'sort', 'page', 'limit'];
        // Loop over remove fields and delete them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);
        //console.log(reqQuery);

         // Filter hospitals based on query parameters
        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
        query = Dentist.find(JSON.parse(queryStr)).populate('appointments');

        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }
        
        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 25;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Dentist.countDocuments();
        query = query.skip(startIndex).limit(limit);

        // Execute query and retrieve hospitals
        const dentists = await query;
        // Pagination result
        const pagination = {};

        if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit: limit
        };
        }

        if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit: limit
        };
        }
        return res.status(200).json({success:true, count:dentists.length, pagination, data:dentists});
    } catch(err){
        return res.status(400).json({success:false});
    }

}


//@desc Get single hospital
//@route GET /api/v1/hospitals/:id
//@access Public
exports.getDentist= async (req,res,next)=>{
    try {
        const dentist = await Dentist.findById(req.params.id);
        
        if(!dentist){
            return res.status(400).json({success:false});
        }
        return res.status(200).json({success:true,data:dentist})
    } catch(err) {
        return res.status(400).json({success:false});
    }
}

//@desc Create new hospital
//@route POST /api/v1/hospitals
//@access Private
exports.createDentist = async (req, res, next) => {
    try {
        const dentist = await Dentist.create(req.body);
        return res.status(201).json({ success: true, data: dentist });
    } catch (err) {
        console.error("Error in creating dentist:", err);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};


//@desc Update hospital
//@route PUT /api/v1/hospitals/:id
//@access Private
exports.updateDentist=async (req,res,next)=>{
    try {
        const dentist = await Dentist.findByIdAndUpdate(req.params.id, req.body,
          {
            new: true,
            runValidators:true
          }  );

        if(!dentist){
            return res.status(400).json({success:false});
        }
        return res.status(200).json({success:true,data:dentist})
    } catch(err) {
        return res.status(400).json({success:false});
    }
}



//@desc Delete hospital
//@route Delete /api/v1/hospitals/:id
//@access Private
exports.deleteDentist=async (req,res,next)=>{
    try {
        const dentist = await Dentist.findById(req.params.id);

        if(!dentist){
            return res.status(400).json({success:false});
        }
        await dentist.deleteOne();
        return res.status(200).json({success:true,data:{}});
    } catch(err) {
        return res.status(400).json({success:false});
    }
}