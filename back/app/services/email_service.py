import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

class EmailService:
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))
        self.sender_email = os.getenv("SENDER_EMAIL")
        self.sender_password = os.getenv("SENDER_PASSWORD")
        
        if not self.sender_email or not self.sender_password:
            raise ValueError("Email credentials not configured in environment variables")

    def send_email(self, recipient: str, subject: str, body: str) -> bool:
        try:
            # Create message
            message = MIMEMultipart()
            message["From"] = self.sender_email
            message["To"] = recipient
            message["Subject"] = subject
            
            # Add body to email
            message.attach(MIMEText(body, "plain"))
            
            # Create SMTP session
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()  # Enable TLS
                server.login(self.sender_email, self.sender_password)
                server.send_message(message)
            
            return True
        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return False