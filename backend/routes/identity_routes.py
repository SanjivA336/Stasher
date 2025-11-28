import json
from fastapi import APIRouter, Depends, HTTPException, status, Response, Header
from backend.database import REPO, fs
from backend.models import *
from typing import List

import os
from passlib.context import CryptContext
from datetime import timedelta
from fastapi.security import OAuth2PasswordBearer

from .routes_helper import changes_to_string
import firebase_admin
from firebase_admin import credentials, auth

# region === Config === ===
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 7
REFRESH_TOKEN_EXPIRE_MINUTES = REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter()

def get_firebase_admin_cred():
    creds_json = os.environ.get("FIREBASE_CREDENTIALS")
    if creds_json:
        try:
            service_account_info = json.loads(creds_json)
            return credentials.Certificate(service_account_info)
        except Exception as e:
            raise RuntimeError("Failed to parse FIREBASE_CREDENTIALS: " + str(e))

    creds_path = os.environ.get("FIREBASE_CREDENTIALS_PATH", "backend/Keys/pantry-firebase-serviceAccount.json")
    if os.path.exists(creds_path):
        try:
            return credentials.Certificate(creds_path)
        except Exception as e:
            raise RuntimeError("Failed to load credentials from file: " + str(e))

    raise RuntimeError("No Firebase credentials found.")

cred = get_firebase_admin_cred()
firebase_admin.initialize_app(cred)
#endregion

# region === Helper Methods === ===
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing auth token.")

    token = authorization.split(" ")[1]

    try:
        decoded = auth.verify_id_token(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid auth token." + str(e))

    uid = decoded["uid"]
    user = REPO.USERS.get(uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return user

def get_current_member(user: User, stash_id: str) -> Member:
    members = REPO.MEMBERS.query([("owner_user_id", "==", user.id), ("stash_id", "==", stash_id), ("is_active", "==", True)])
    if not members:
        raise HTTPException(status_code=404, detail="You do not have access to this stash.")
    
    return members[0]
# endregion

# region === Current API === ===
@router.get("/current/user", response_model=UserProtected)
async def get_current_user_route(current_user: User = Depends(get_current_user)):
    return UserProtected.from_model(current_user)

@router.get("/current/members/active", response_model=List[Member])
async def get_current_active_members(current_user: User = Depends(get_current_user)):
    return current_user.get_active_members()

@router.get("/current/stashes/active", response_model=List[Stash])
async def get_current_active_stashes(current_user: User = Depends(get_current_user)):
    members = current_user.get_active_members()
    stash_ids = [member.stash_id for member in members]
    return REPO.STASHES.query([("id", "in", stash_ids)]) or [] if stash_ids else []

@router.get("/current/can_access/{stash_id}", response_model=bool)
async def check_access(stash_id: str, current_user: User = Depends(get_current_user)):
    members = REPO.MEMBERS.query([("owner_user_id", "==", current_user.id), ("stash_id", "==", stash_id), ("is_active", "==", True)])
    return len(members) > 0
# endregion

# region === User API === ===
@router.get("/user-template", response_model=UserProtected)
def user_get_template():
    raise HTTPException(status_code=200, detail="No template available for User.")

@router.post("/user", response_model=UserProtected)
def user_create(payload: UserPayload, response: Response):
    if not payload.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User ID is required.")
    
    if not payload.username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username is required.")
    
    if not payload.email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is required.")
    
    if not payload.password_current:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password is required.")

    if len(REPO.USERS.query([('email','==', payload.email.strip().lower())])) > 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="An account with that email already exists.")
    
    user = User(
        id=payload.id,
        username=payload.username,
        email=payload.email,
        password_hashed=pwd_context.hash(payload.password_current)
    )

    created = REPO.USERS.add(user)
    if not created:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="User registration failed")
    return created
    
@router.get("/user/{user_id}", response_model=UserProtected)
def user_get(user_id: str, current_user: User = Depends(get_current_user)):
    if (user := REPO.USERS.get(user_id)):
        return user
    raise HTTPException(status_code=404, detail="User not found.")

@router.patch("/user", response_model=UserProtected)
def user_update(payload: UserPayload, current_user: User = Depends(get_current_user)):
    if not payload.id or payload.id.strip() == "":
        raise HTTPException(status_code=400, detail="User ID is required in payload for update.")

    if not current_user.id == payload.id:
        raise HTTPException(status_code=403, detail="You can only update your own user information.")

    user = REPO.USERS.get(payload.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    if payload.password_new:
        if not payload.password_current:
            raise HTTPException(status_code=400, detail="Current password is required to set a new password.")
        
        if not pwd_context.verify(payload.password_current, user.password_hashed):
            raise HTTPException(status_code=403, detail="Current password is incorrect.")
        
        if payload.password_new == payload.password_current:
            raise HTTPException(status_code=400, detail="New password cannot be the same as the old password.")

        user.password_hashed = pwd_context.hash(payload.password_new)

    if payload.email and payload.email != user.email:
        if len(REPO.USERS.query([('email','==', payload.email.strip().lower())])) > 0:
            raise HTTPException(status_code=400, detail="An account with that email already exists.")

    updated_user = payload.to_model(user, preserve=True)
    
    if not (changes := user.diff(updated_user)):
        return user

    if (updated_user := REPO.USERS.update(updated_user)):
        return updated_user
    raise HTTPException(status_code=500, detail="User update failed.")

@router.delete("/user/{user_id}", response_model=bool)
def user_delete(user_id: str, current_user: User = Depends(get_current_user)):
    user = REPO.USERS.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if not current_user.id == user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own user account.")
    
    batch = fs.create_batch()
    
    user.purge(batch)

    if fs.commit_batch(batch):
        return True
    raise HTTPException(status_code=500, detail="User deletion failed.")

# User-Specific APIs

@router.get("/user/{user_id}/members/{filter}", response_model=List[Member])
def user_get_members(user_id: str, filter: str, current_user: User = Depends(get_current_user)):
    user = REPO.USERS.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    if not current_user.id == user.id:
        raise HTTPException(status_code=403, detail="You can only access your own members.")

    if filter == "all":
        return user.get_all_members()
    elif filter == "active":
        return user.get_active_members()

@router.get("/user/{user_id}/stashes/{filter}", response_model=List[Stash])
def user_get_stashes(user_id: str, filter: str, current_user: User = Depends(get_current_user)):
    user = REPO.USERS.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    if not current_user.id == user.id:
        raise HTTPException(status_code=403, detail="You can only access your own stashes.")

    if filter == "all":
        return user.get_all_stashes()
    elif filter == "active":
        return user.get_active_stashes()
# endregion

# region === Member API === ===
@router.get("/member-template", response_model=Member)
def member_get_template(current_user: User = Depends(get_current_user)):
    member = Member(
        owner_user_id=current_user.id,
        stash_id="",
        nickname=current_user.username or "New Member",
        debts={},
        is_admin=False,
        is_active=True
    )
    return member

@router.post("/member", response_model=Member)
def member_create(payload: MemberPayload, current_user: User = Depends(get_current_user)):
    raise HTTPException(status_code=200, detail="Member creation is not supported directly. Create or join a stash to automatically create a member.")

@router.get("/member/{member_id}", response_model=Member)
def member_get(member_id: str, current_user: User = Depends(get_current_user)):
    member = REPO.MEMBERS.get(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found.")

    if not (current_member := get_current_member(current_user, member.stash_id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")
    
    return member

@router.patch("/member", response_model=Member)
def member_update(payload: MemberPayload, current_user: User = Depends(get_current_user)):
    if not payload.id or payload.id.strip() == "":
        raise HTTPException(status_code=400, detail="Member ID is required in payload for update.")
    
    member = REPO.MEMBERS.get(payload.id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found.")

    current_member = get_current_member(current_user, member.stash_id)
    if not current_member:
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    if not current_member.is_admin:
        if current_member.id != member.id:
            raise HTTPException(status_code=403, detail="Only admins can update other members.")
        
        if payload.is_admin is not None and payload.is_admin != member.is_admin:
            raise HTTPException(status_code=403, detail="Only admins can change admin status.")

    updated_member = payload.to_model(member, preserve=True)
    
    if not (changes := member.diff(updated_member)):
        return member
    
    event = Event(
        stash_id=member.stash_id,
        member_id=current_member.id,
        type=EventType.SUCCESS,
        title=f"Member '{member.nickname}' Updated",
        message=changes_to_string(changes)
    )
    
    batch = fs.create_batch()

    REPO.EVENTS.batch_add(batch, event)
    REPO.MEMBERS.batch_update(batch, updated_member)

    if fs.commit_batch(batch):
        return updated_member
    raise HTTPException(status_code=500, detail="Member update failed.")

@router.delete("/member/{member_id}", response_model=bool)
def member_delete(member_id: str, current_user: User = Depends(get_current_user)):
    member = REPO.MEMBERS.get(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found.")

    current_member = get_current_member(current_user, member.stash_id)
    if not current_member:
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    if not current_member.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can delete members.")
    
    if member.id == current_member.id:
        raise HTTPException(status_code=403, detail="You cannot delete your own member account.")

    batch = fs.create_batch()
    
    member.purge(batch, current_member.id)
    
    if fs.commit_batch(batch):
        return True
    raise HTTPException(status_code=500, detail="Member deletion failed.")

# Member-Specific APIs

@router.get("/member/{member_id}/user", response_model=UserProtected)
def member_get_user(member_id: str, current_user: User = Depends(get_current_user)):
    member = REPO.MEMBERS.get(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found.")

    if not (current_member := get_current_member(current_user, member.stash_id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    user = member.get_owner
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return user

@router.get("/member/{member_id}/stash", response_model=Stash)
def member_get_stash(member_id: str, current_user: User = Depends(get_current_user)):
    member = REPO.MEMBERS.get(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found.")

    if not (current_member := get_current_member(current_user, member.stash_id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    stash = member.get_stash
    if not stash:
        raise HTTPException(status_code=404, detail="Stash not found.")

    return stash

@router.get("/member/{member_id}/items/{filter}", response_model=List[Item])
def member_get_items(member_id: str, filter: str, current_user: User = Depends(get_current_user)):
    member = REPO.MEMBERS.get(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found.")

    if not (current_member := get_current_member(current_user, member.stash_id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    if filter == "bought":
        return member.get_bought_items()
    elif filter == "used":
        return member.get_used_items()

@router.get("/member/{member_id}/orders", response_model=List[Order])
def member_get_orders(member_id: str, current_user: User = Depends(get_current_user)):
    member = REPO.MEMBERS.get(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found.")

    if not (current_member := get_current_member(current_user, member.stash_id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return member.get_orders()

@router.get("/member/{member_id}/events", response_model=List[Event])
def member_get_events(member_id: str, current_user: User = Depends(get_current_user)):
    member = REPO.MEMBERS.get(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found.")

    if not (current_member := get_current_member(current_user, member.stash_id)):
        raise HTTPException(status_code=403, detail="You do not have access to this stash.")

    return member.get_events()
# endregion
