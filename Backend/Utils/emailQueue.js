import Bull from 'bull';
import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: "anis1098imcc@gmail.com", 
    pass: "ipcd ewkx gdfh irxy"   
  }
});

// Create queue
const emailQueue = new Bull('voter-email-queue', {
  redis: {
    host: "redis-13772.c301.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 13772,
    username: 'default',
    password: "Aniskhan1608@",
  },
  limiter: {
    max: 12, // Max jobs per second
    duration: 60000,
  },
});

// Process jobs from the queue
emailQueue.process(2, async (job) => { 
  const { voter } = job.data;
  
  try {
    const mailOptions = {
      from: `"Voter Registration"`,
      to: voter.email,
      subject: 'Your Voter Registration Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c3e50;">Voter Registration Successful</h1>
          <p>Dear ${voter.name},</p>
          <p>Your voter registration has been successfully processed.</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Voter ID:</strong> ${voter.voterId}</p>
          </div>
          <p>Please keep this information safe as it will be required for voting.</p>
          <p>Thank you for registering.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #777;">
            If you didn't request this registration, please contact our support team.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${voter.email}`);
    return { success: true, email: voter.email };
  } catch (error) {
    console.error(`Failed to send email to ${voter.email}:`, error);
    throw error; 
  }
});

emailQueue.on('completed', (job, result) => {
  console.log(`Email job completed for ${result.email}`);
});

emailQueue.on('failed', (job, err) => {
  console.error(`Email job failed for ${job.data.voter.email}:`, err);
});

emailQueue.on('error', (error) => {
  console.error('Queue error:', error);
});

export default emailQueue;