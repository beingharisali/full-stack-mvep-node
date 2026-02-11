const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const searchUsers = asyncHandler(async (req, res) => {
  const { searchQuery, excludeCurrentUser = 'true' } = req.query;
  
  console.log('Search request received:', { searchQuery, excludeCurrentUser, user: req.user });
  
  if (!searchQuery) {
    console.log('Search query is missing');
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    let query = {};
    
    if (excludeCurrentUser === 'true' || excludeCurrentUser === true) {
      query._id = { $ne: req.user.userId };
      console.log('Excluding current user:', req.user.userId);
    }
    
    query.$or = [
      { firstName: { $regex: searchQuery, $options: 'i' } },
      { lastName: { $regex: searchQuery, $options: 'i' } },
      { email: { $regex: searchQuery, $options: 'i' } },
      { $expr: { $regexMatch: { input: { $concat: ["$firstName", " ", "$lastName"] }, regex: searchQuery, options: 'i' } } }
    ];

    if (req.user.role === 'customer') {
      query.role = 'vendor'; 
      console.log('Customer searching for vendors');
    } else if (req.user.role === 'vendor') {
      query.role = 'customer'; 
      console.log('Vendor searching for customers');
    } else {
      query.role = { $in: ['customer', 'vendor'] };
      console.log('Admin searching for customers/vendors');
    }

    console.log('Final query:', JSON.stringify(query, null, 2));
    
    const users = await User.find(query).select('-password');
    console.log('Found users:', users.length);
    
    res.json(users);
  } catch (error) {
    console.error('Error in searchUsers:', error);
    res.status(500).json({ message: 'Server error during user search', error: error.message });
  }
});

module.exports = {
  searchUsers
};