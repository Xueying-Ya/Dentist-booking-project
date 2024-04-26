const User = require('../models/User');


// Get token from model, create cookie and send response 
const sendTokenResponse = (user, statusCode, res) => {
// Create token
const token = user.getSignedJwtToken();

// Define options for cookie
const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000), // Set expiration date for the cookie
    httpOnly: true // Prevent JavaScript access to the cookie
};

// Set secure flag for production environment
if (process.env.NODE_ENV === 'production') {
    options.secure = true;
}

// Send response with cookie containing token
res
    .status(statusCode)
    //.cookie('token', token, options)
    .json({
    success: true,
    //add for frontend
    _id:user._id,
    name: user.name,
    email:user.email,
    //end for frontend
    token
    });
};

//@desc  Register user
//@route GET /api/v1/auth/register
//@access Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, telephone_number, role, password} = req.body;
    
    // Create user
    const user = await User.create({ name, email, telephone_number, role, password}); // Pass name, email, password, and role directly
    
    // Generate JWT token
    // const token = user.getSignedJwtToken();
    
    // res.status(200).json({ success: true, data: user, token }); // Return created user data and token upon success
    sendTokenResponse(user,200,res);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(400).json({ success: false, error: err.message }); // Return error message
  }
};

//@desc Login user
//@route POST /api/v1/auth/login
//@access Public
exports.login = async (req, res, next) => {
    const { email, password } = req.body;
  
    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, msg: 'Please provide an email and password' });
    }
  
    try {
      // Check for user
      const user = await User.findOne({ email }).select('+password');
  
      if (!user) {
        return res.status(400).json({ success: false, msg: 'Invalid credentials' });
      }
  
      // Check if password matches
      const isMatch = await user.matchPassword(password);
  
      if (!isMatch) {
        return res.status(401).json({ success: false, msg: 'Invalid credentials' });
      }
  
    // Create token
    //   const token = user.getSignedJwtToken();
    //   res.status(200).json({ success: true, token });
    sendTokenResponse(user,200,res);
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, msg: 'Server Error' });
    }
  };


//@desc Get current Logged in user
//@route POST /api/v1/auth/me
//@access Private
exports.getMe = async (req, res, next) => {
try {
    const user = await User.findById(req.user.id);

    if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
} catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
}
};


//logout
exports.logout = async (req, res, next) => {
      return res.status(200).json({ success: true, message: 'Logged out' });
  };
