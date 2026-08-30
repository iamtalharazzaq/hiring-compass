import smtplib
from email.message import EmailMessage
from app.config import Settings
class SmtpEmailSender:
    def __init__(self, settings: Settings): self.settings = settings
    def send(self, recipient: str, subject: str, body: str) -> str | None:
        if self.settings.email_provider != "smtp" or not self.settings.smtp_host: raise RuntimeError("EMAIL_NOT_CONFIGURED")
        message = EmailMessage(); message["From"] = f"{self.settings.smtp_from_name} <{self.settings.smtp_from_email}>"; message["To"] = recipient; message["Subject"] = subject; message.set_content(body)
        with smtplib.SMTP(self.settings.smtp_host, self.settings.smtp_port, timeout=10) as client:
            if self.settings.smtp_use_tls: client.starttls()
            if self.settings.smtp_username: client.login(self.settings.smtp_username, self.settings.smtp_password)
            client.send_message(message)
        return None
