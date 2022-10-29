import jwt from "jsonwebtoken";

export const Activation_token = (payload) => {
  return jwt.sign(payload, `${process.env.ACTIVATION_TOKEN_SECRET}`, {
    expiresIn: "5m",
  });
};

export const Access_token = (payload) => {
  return jwt.sign(payload, `${process.env.ACCESS_TOKEN_SECRET}`, {
    expiresIn: "15s",
  });
};

export const Refresh_token = (payload) => {
  return jwt.sign(payload, `${process.env.REFRESH_TOKEN_SECRET}`, {
    expiresIn: "7d",
  });
};
