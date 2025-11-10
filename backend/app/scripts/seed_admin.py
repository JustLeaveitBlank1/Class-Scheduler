from passlib.hash import pbkdf2_sha256
from app.db.database import SessionLocal
from app.db import models as m

ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "ChangeMe123!"
ADMIN_NAME = "Admin"

def main():
    db = SessionLocal()
    try:
        u = db.query(m.User).filter_by(email=ADMIN_EMAIL).first()
        if not u:
            hashed = pbkdf2_sha256.hash(ADMIN_PASSWORD)
            u = m.User(
                email=ADMIN_EMAIL,
                hashed_password=hashed,
                full_name=ADMIN_NAME,
                is_active=True,
            )
            db.add(u)
            db.commit()
            print(f" Admin user created: {u.email}")
        else:
            print(" Admin already exists")
    finally:
        db.close()

if __name__ == "__main__":
    main()
