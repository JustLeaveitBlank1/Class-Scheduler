# app/services/emailer.py
import os
import smtplib
from email.message import EmailMessage

MAIL_FROM = os.getenv("MAIL_FROM", "no-reply@schedulith.local")
SMTP_HOST = os.getenv("SMTP_HOST", "").strip()
SMTP_PORT = int(os.getenv("SMTP_PORT", "587") or 587)
SMTP_USER = os.getenv("SMTP_USER", "").strip()
SMTP_PASS = os.getenv("SMTP_PASS", "").strip()
SMTP_STARTTLS = (os.getenv("SMTP_STARTTLS", "true").lower() == "true")

def _send_via_smtp(to_email: str, subject: str, body: str) -> bool:
    if not (SMTP_HOST and SMTP_USER and SMTP_PASS):
        return False  # not configured
    try:
        msg = EmailMessage()
        msg["From"] = MAIL_FROM
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.set_content(body)

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as smtp:
            if SMTP_STARTTLS:
                smtp.starttls()
            smtp.login(SMTP_USER, SMTP_PASS)
            smtp.send_message(msg)
        return True
    except Exception as e:
        # Log and fall back to console
        print(f"[EMAIL][WARN] SMTP send failed: {e}")
        return False

def send_password_reset(to_email: str, reset_url: str) -> None:
    subject = "Password Reset"
    body = f"Click to reset your password:\n{reset_url}\n\nThis link expires soon."
    if _send_via_smtp(to_email, subject, body):
        print(f"[EMAIL] Sent reset link to {to_email} via SMTP.")
    else:
        print(
            "[DEV-EMAIL] To:", to_email, "\n",
            "Subject:", subject, "\n",
            "Body:\n", body
        )
