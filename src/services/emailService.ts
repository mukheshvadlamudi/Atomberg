import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

emailjs.init(PUBLIC_KEY);

interface EmailParams {
  to_name: string;
  to_email: string;
  subject: string;
  message: string;
}

export const sendEmailNotification = (params: EmailParams) => {
  // Fire and forget so we don't block the UI
  emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      to_name: params.to_name,
      to_email: params.to_email,
      subject: params.subject,
      message: params.message,
    }
  ).then(
    (response) => {
      console.log('✅ Email sent successfully!', response.status, response.text);
    },
    (err) => {
      console.error('❌ Failed to send email:', err);
    }
  );
};
