exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data || data.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate JWT with only the required fields
  const token = jwt.sign(
    { email: data.email, role: data.role, name: data.name },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  // Respond with token and user info
  res.json({
    token
  });
};
