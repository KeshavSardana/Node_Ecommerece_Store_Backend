// i am not using this file because i just liked to write these again and again used functions there only just to get
//  the clear idea of that function flow but the code that is reusable we can place that code in utils
// ex is this token generator
// this code can be used multiple times like at the time of signup , login , forgetpassword
// this is basically to get the token .

const cookieToken = (user, res) => {
  const token = user.getJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRY * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.status(200).cookie("token", token, options).json({
    success: true,
    token,
    user,
  });
};
