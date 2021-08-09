const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_SEND_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ron@therealrogden.com',
        subject: 'Thanks for joinging therealrogden.com',
        text: `Welcome to the site, ${name}. Let me know how things are working out!`
    })
}

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ron@therealrogden.com',
        subject: 'Look, honestly, I\'m just sad to see you go',
        text: `I\'m not gonna beg you to stay, ${name}. But PLEASE DO NOT GO!!!! Tell me what I can do to keep you around and make it all worth your while?`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}