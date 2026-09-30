import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

def send_verification_email(to_email: str, token: str):
    if not settings.SMTP_HOST or not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        raise ValueError("Email service is not configured.")

    verification_link = f"{settings.FRONTEND_URL}/verify-email?token={token}"

    subject = "Verify your REALCHECK AI account"
    body = f"""REALCHECK AI

Welcome to REALCHECK AI.

Please verify your email address to activate your account.

Verify Email: {verification_link}
"""

    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #00d2ff;">REALCHECK AI</h2>
        <p>Welcome to REALCHECK AI.</p>
        <p>Please verify your email address to activate your account.</p>
        <a href="{verification_link}" style="display: inline-block; background-color: #00d2ff; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 16px;">
          Verify Email
        </a>
        <p style="margin-top: 32px; font-size: 12px; color: #777;">If you did not create this account, please ignore this email.</p>
      </body>
    </html>
    """

    msg = MIMEMultipart('alternative')
    msg['From'] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL or settings.SMTP_USERNAME}>"
    msg['To'] = to_email
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'plain'))
    msg.attach(MIMEText(html_body, 'html'))

    try:
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT or 587)
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        raise Exception(f"Failed to send email: {str(e)}")

def send_password_reset_email(to_email: str, token: str):
    if not settings.SMTP_HOST or not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        raise ValueError("Email service is not configured.")

    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"

    subject = "Reset your REALCHECK AI password"
    body = f"""REALCHECK AI

We received a request to reset your password.

Reset Password: {reset_link}

If you did not request this, please ignore this email.
"""

    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #00d2ff;">REALCHECK AI</h2>
        <p>We received a request to reset your password.</p>
        <a href="{reset_link}" style="display: inline-block; background-color: #00d2ff; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 16px;">
          Reset Password
        </a>
        <p style="margin-top: 32px; font-size: 12px; color: #777;">If you did not request a password reset, please ignore this email.</p>
      </body>
    </html>
    """

    msg = MIMEMultipart('alternative')
    msg['From'] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL or settings.SMTP_USERNAME}>"
    msg['To'] = to_email
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'plain'))
    msg.attach(MIMEText(html_body, 'html'))

    try:
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT or 587)
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        raise Exception(f"Failed to send email: {str(e)}")
