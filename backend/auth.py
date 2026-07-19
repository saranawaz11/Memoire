import os
from fastapi import Request, HTTPException
from clerk_backend_api import Clerk
from clerk_backend_api.security.types import AuthenticateRequestOptions

CLERK_SECRET_KEY = os.environ["CLERK_SECRET_KEY"]
# getting AUTHROIZED_PARTIES from env variable
AUTHORIZED_PARTIES = os.environ.get("CLERK_AUTHORIZED_PARTIES")

# AUTHORIZED_PARTIES = os.environ.get(
#     "CLERK_AUTHORIZED_PARTIES", "http://localhost:3000"
# ).split(",")

clerk = Clerk(bearer_auth=CLERK_SECRET_KEY)

def get_current_user_id(request: Request) -> str:
    try:
        request_state = clerk.authenticate_request(
            request,
            AuthenticateRequestOptions(authorized_parties=AUTHORIZED_PARTIES),
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    if not request_state.is_signed_in:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return request_state.payload["sub"]


def fetch_clerk_profile(user_id: str) -> dict:
    clerk_user = clerk.users.get(user_id=user_id)
    email = None
    if clerk_user.email_addresses:
        email = clerk_user.email_addresses[0].email_address
    return {
        "first_name": clerk_user.first_name,
        "last_name": clerk_user.last_name,
        "email": email,
    }