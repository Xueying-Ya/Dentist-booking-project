const Appointment = require('../models/Appointment');
const Dentist = require('../models/Dentist');

//@desc Get single appointment
//@route GET /api/v1/appointments/:id
//@access Public
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate({
      path: 'dentist',
      select: 'name years_of_experience area_of_expertise'
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: `No appointment with the id of ${req.params.id}` });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Cannot find Appointment" });
  }
};


//@desc Get all appointments
//@route GET /api/v1/appointments
//@access Public
exports.getAppointments = async (req, res, next) => {
  let query;

  try {
    // General users can see only their appointments
    if (req.user.role !== 'admin') {
      query = Appointment.find({ user: req.user.id }).populate({
        path: 'dentist',
        select: 'name years_of_experience area_of_expertise'
      });
    } else {
      // If you are an admin, you can see all appointments
      if (req.params.dentistId) {
        console.log(req.params.dentistId);
        query = Appointment.find({ dentist: req.params.dentistId }).populate({ 
          path: 'dentist',
          select: 'name years_of_experience area_of_expertise'
        });
      } else {
        query = Appointment.find().populate({ 
          path: 'dentist',
          select: 'name years_of_experience area_of_expertise'
        });
      }
    }

    const appointments = await query;

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Cannot find Appointment" });
  }
};

//@desc Add appointment
//@route POST /api/v1/dentists/:dentistid/appointment
//@access Private
exports.addAppointment = async (req, res, next) => {
  try {
    // Add user Id to req.body 
    req.body.user = req.user.id;

    try {
        // Check for existing appointments
        const existedAppointments = await Appointment.find({ user: req.user.id });

        // If the user is not an admin, they can only create 3 appointments
        if (existedAppointments.length >= 1 && req.user.role !== 'admin') {
            return res.status(400).json({ success: false, message: `The user with ID ${req.user.id} has already made an appointment` });
        }

        const apptDate = req.body.apptDate
        const dentist = req.body.dentist
        const dentist_name = await Dentist.findById(dentist).select('name');
         // Check if the appointment date is in the future
        const currentDate = new Date();
        if (new Date(apptDate) <= currentDate) {
            return res.status(400).json({ success: false, message: "Appointment date must be in the future" });
        }
        // Check if any appointment already exists for the specified date
        const existingAppointment = await Appointment.findOne({ apptDate: apptDate, dentist: dentist });

        // If an appointment already exists for the specified date, return an error
        if (existingAppointment) {
            return res.status(400).json({ success: false, message: `The selected appointment date ${apptDate} for Dentist ${dentist_name.name} is not available`});
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Error checking existing appointments" });
    }

    // Add dentist Id to req.body from URL parameter
    req.body.dentist = req.params.DentistId;
    const appointment = await Appointment.create(req.body);
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Cannot create Appointment" });
  }
};



//@desc Update appointment
//@route PUT /api/v1/appointments/:id
//@access Private
exports.updateAppointment = async (req, res, next) => {
  try {
      // Check if the user is the appointment owner
      let appointment = await Appointment.findById(req.params.id);
      if (!appointment) {
          return res.status(404).json({ success: false, message: `No appointment with the id of ${req.params.id}` });
      }

      if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
          return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to update this appointment` });
      }

      // Extract appointment date from request body
      const { apptDate } = req.body;

      // Parse the appointment date and convert it to a JavaScript Date object
      const appointmentDate = new Date(apptDate);

      // Get the current date
      const currentDate = new Date();

      // Check if the appointment date is in the future or present
      if (appointmentDate < currentDate) {
          return res.status(400).json({ success: false, message: "Appointment date must be in the future" });
      }

      // Update the appointment
      appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });

      res.status(200).json({
          success: true,
          data: appointment
      });
  } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: "Cannot update Appointment" });
  }
};




//@desc Delete appointment
//@route DELETE /api/v1/appointments/:id
//@access Private
exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: `No appointment with the id of ${req.params.id}` });
    }

    if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to delete this appointment` });
    }

    await appointment.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Cannot delete Appointment" });
  }
};
