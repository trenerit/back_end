import express from 'express';
import validator from 'validator';
import cors from 'cors';
import nodeMailer from 'nodemailer';
import urllib from 'urllib';

const transport = nodeMailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "TWOJ_KOD_USER",
    pass: "TWOJE_HASLO"
  }
});

const app = express();

app.use(cors());

app.use(express.urlencoded({
  extended: true
}));

app.use(express.json());

app.listen(8888, () => {
    
  console.log('Server started on port 8888');
  
});

app.get("/", (req, res) => {
  
  res.send('serwer działa');
  
});

app.post("/validate", (req, res) => {
  
  const data = req.body;
  
  console.log(data);
  
  const errors = {};
  
  if (!validator.isEmail(data.mail)) {
    console.log('Email format is incorrect');
    errors.email = 'Niepoprawny adres e-mail.';
  }
  
  if (!validator.isLength(validator.trim(data.subject), {min:3, max:200})) {
    console.log('subject field is empty');
    errors.subject = 'Uzupełnij temat wiadomości.';
  }
  
  if (validator.isEmpty(validator.trim(data.message))) {
    console.log('message field is empty');
    errors.message = 'Uzupełnij treść wiadomości';
  }
  
  if (data.reCaptcha === undefined || data.reCaptcha === null || data.reCaptcha === '') {
    console.log('recaptcha field is empty');
    errors.reCaptcha = 'Zaznacz nie jestem robotem';
  } else {

    // secret dla localhost-a, tylko testowo! Trzeba tu podać secret dla domeny klienta!
    const secret = '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe';
    const urlCaptcha = `https://google.com/recaptcha/api/siteverify?secret=${secret}&res=${data.reCaptcha}&remoteip=${req.socket.remoteAddress}`;
    
    urllib.request(urlCaptcha, (err, data, res) => {
      const body = JSON.parse(data);
      if(body.success !== undefined && !body.success) {
            errors.reCaptcha = 'Niepoprawna weryfikacja captcha';
          }
    });

  }

  if(Object.keys(errors).length === 0) {
    let mailOptions = {
      to: "mail_naszego_klienta@example.com",
      from: data.mail,
      subject: data.subject,
      html: data.message
    };
    
    transport.sendMail(mailOptions)
    .then((result)=>{
      console.log(result);
    }).catch((error)=>{
      console.log(error);
    });

    res.send({"send":"Twoja wiadomość została wysłana, dziękujemy!"});
  
  } else {
    res.send(errors);
  }

});