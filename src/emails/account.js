const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "skrbasnet123@gmail.com",
    subject: "Thanks for joining Task-manager app",
    text: `hi ${name}, <h1> Welcome to the app. </h1>`,
  });
};

const farewellEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "skrbasnet123@gmail.com",
    subject: "Care to feedback why you are leaving?",
    html: `hi ${name}, We are sad to see you go. <strong>But we care enough</strong> to ask if you care to provide us any feedback so we might service you to join back? Thank you.`,
  });
};

// sendWelcomeEmail("shaikhhar007@gmail.com", "Shekhar");
module.exports = { sendWelcomeEmail, farewellEmail };
