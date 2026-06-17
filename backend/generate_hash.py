#!/usr/bin/env python3
"""
Admin password hash generator.
Run this script to generate a bcrypt hash for your admin password.

Usage:
    python generate_hash.py
"""

import bcrypt


def main():
    import getpass
    password = getpass.getpass("Enter admin password: ")
    confirm = getpass.getpass("Confirm password: ")

    if password != confirm:
        print("❌ Passwords do not match!")
        return

    # Hash using native bcrypt
    hashed_bytes = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    hashed = hashed_bytes.decode("utf-8")
    print(f"\n✅ Bcrypt hash generated:\n\nADMIN_PASSWORD_HASH={hashed}\n")
    print("Add this to your .env file")


if __name__ == "__main__":
    main()
