import nodemailer from 'nodemailer';
import config from '../utils/config';

class Mailer{
    static mailer( redirectURL, receiver){
        return new Promise((resolve,reject)=>{
            let transporter = nodemailer.createTransport({
                host: config.get('smtp:host'),
                port: config.get('smtp:port'),
                secure: false,
                auth: {
                  user: config.get('smtp:username'),
                  pass:  config.get('smtp:password'),
                },
                tls: {
                  rejectUnauthorized: false
                }
              });
              
              let mailOptions = {
                from:'noreply@anastrat.com',
                to: receiver,
                subject: `Anastrat: Verify your email`,
                html: `<p>Dear User,To confirm your email address please
                <a href="${redirectURL}">click here</a></p>`,
                /*
                attachments: [
                  {
                    filename: `${name}.pdf`,
                    path: path.join(__dirname, `../../src/assets/books/${name}.pdf`),
                    contentType: 'application/pdf',
                  },
                ],
                */


              };
              
              transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                  reject(err);
                } else {
                  resolve(info);
                }   
              });
        })
    }
}

export default Mailer;