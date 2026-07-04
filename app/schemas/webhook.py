from typing import List, Optional

from pydantic import BaseModel


class ClerkEmailAddress(BaseModel):
    email_address: str


class ClerkUserData(BaseModel):
    id: str
    email_addresses: List[ClerkEmailAddress]
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    image_url: Optional[str] = None


class ClerkWebhookPayload(BaseModel):
    data: ClerkUserData
    type: str
