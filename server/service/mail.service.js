require("dotenv").config();
const { createTransport } = require("nodemailer");
const transport = require("../config/nodemailer.config");
const ejs = require("ejs");
const path = require("path");
class MailService {
  /**
   *
   * @param {String} email enter the user email
   * @param {String} subject enter the subject of the mail
   * @param {String} template enter the file name of the mail template
   * @param {Object} data enter the data object with user name and activation code
   */
  async send(email, subject, template, data) {
    try {
      // get the path of the template
      const templatePath = path.join(__dirname, "../mails", template);
      // render the email template with ejs
      const html = await ejs.renderFile(templatePath, data);

      // mail options
      const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: email,
        subject,
        html,
      };

      // finaly send the email
      transport.sendMail(mailOptions, (err, info) => {
        console.log(info)
        if (err) console.log("mail-error-> ", err);
        console.log(`mail has been sent to`);
      });
    } catch (error) {
      console.log("mail error", error);
    }
  }
}

module.exports = new MailService();
