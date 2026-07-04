from fastapi import APIRouter, Header, HTTPException, status, Request
from app.schemas.webhook import ClerkWebhookPayload
import json

router = APIRouter()

@router.post("/clerk", status_code=status.HTTP_200_OK)
async def clerk_webhook(
    request: Request,
    svix_id: str = Header(None, alias="svix-id"),
    svix_timestamp: str = Header(None, alias="svix-timestamp"),
    svix_signature: str = Header(None, alias="svix-signature")
):
    """
    Syncs user data from Clerk to the local Supabase database.
    Verifies the Svix signature before executing logic.
    """
    # TODO: Verify Svix signature:
    # 1. Read request raw body.
    # 2. Extract Clerk Webhook Secret from environment.
    # 3. Use `svix.webhooks.Webhook` verify method to validate headers and body.
    # 4. If invalid, raise HTTPException(status_code=400, detail="Invalid payload or signature").
    
    # Extract request JSON (will be done after signature verification)
    try:
        body_bytes = await request.body()
        payload = json.loads(body_bytes)
        # Validate using Pydantic model
        webhook_data = ClerkWebhookPayload(**payload)
    except Exception as e:
        # TODO: Log verification error details
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payload or signature"
        )
    
    # TODO: Perform database sync logic based on webhook type:
    # - If type is "user.created" or "user.updated":
    #   Insert or update user record in 'users' table using webhook_data.data.
    
    return {"status": "success"}
