import { google } from "googleapis";
import nodemailer from "nodemailer";
const OAuth2 = google.auth.OAuth2;
import dotenv from "dotenv";
dotenv.config();

const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

async function sendMail(to, url, txt) {
  try {
    const accessToken = await oauth2Client.getAccessToken();
    const createTransporter = async () => {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: process.env.EMAIL,
          accessToken,
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          refreshToken: process.env.REFRESH_TOKEN,
        },
      });

      return transporter;
    };
    const sendEmail = async (emailOptions) => {
      let emailTransporter = await createTransporter();
      await emailTransporter.sendMail(emailOptions);
    };
    sendEmail({
      from: process.env.EMAIL,
      to: to,
      subject: "Email verification",
      text: "Email verification",
      html: `<div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
              <h2 style="text-align: center; text-transform: uppercase;color: teal;">Welcome to the Roaring Lion's channel.</h2>
              <p>Congratulations! You're almost set to start using DEVAT✮SHOP.
                  Just click the button below to validate your email address.
              </p>
              
              <a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${txt}</a>
          
              <p>If the button doesn't work for any reason, you can also click on the link below:</p>
          
              <div>${url}</div>
              </div>`,
    });
  } catch (error) {
    console.log(error.message);
  }
}
export default sendMail;
