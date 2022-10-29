export const validRegister = async (req, res, next) => {
  const { name, account, password } = req.body;

  const errors = [];
  if (!name) {
    errors.push("Please add your name.");
  } else if (name.length > 20) {
    errors.push("Your name is up to 20 chars long.");
  }
  if (!account) {
    errors.push("Please add your email or phone number.");
  } else if (!validateEmail(account) && !validateNumber(account)) {
    errors.push("Enter a valid email or phone number");
  }
  if (password.length < 6) {
    errors.push("Password must be at least 6 character");
  }

  if (errors.length > 0) return res.status(400).json({ msg: errors });
  next();
};

export function validateNumber(phone) {
  const re = /^[+]/g;
  return re.test(phone);
}

export function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
