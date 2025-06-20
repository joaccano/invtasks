import nodemailer from 'nodemailer';

// Crear y exportar la función para enviar correos
export const sendEmail = async (to: string, subject: string, body: string) => {
  // Configuración del transporter para nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,  // Tu dirección de correo
      pass: process.env.EMAIL_PASS   // Tu contraseña de aplicación
    }
  });

  // Opciones del correo
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    html: body,
  };

  // Intentar enviar el correo
  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo enviado');
  } catch (error: any) {
    console.error('Error al enviar el correo:', error);
  }
};

