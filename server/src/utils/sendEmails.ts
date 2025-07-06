import nodemailer from 'nodemailer'
import { Transporter } from 'nodemailer'

const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html: string
) => {
        // Configure transporter
        const transporter: Transporter = nodemailer.createTransport({
		service: 'Gmail', // Use your email service
		host: 'smtp.gmail.com',
		port: 587,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	})
	//transporter.verify().then(console.log).catch(console.error);

	// Email options
	const mailOptions = {
		from: process.env.EMAIL_FROM,
		to,
		subject,
		text,
		html,
	}

	// Send email
        await transporter.sendMail(mailOptions)
}

export default sendEmail
