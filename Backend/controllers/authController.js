const supabase = require('../database/supabaseClient');
const jwt = require('jsonwebtoken');

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data || data.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { email: data.email, role: data.role, name: data.name },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.json({ token });

  } catch (err) {
    // This will print the actual error to your backend terminal
    console.error("LOGIN ERROR:", err); 
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getProfile = (req, res) => {
  // The verifyToken middleware already added the user's data to req.user
  // We just need to send it back. No need to query the database again.
  res.json(req.user);
};
