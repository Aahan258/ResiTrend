# Firebase Security Specification (Pulse AEC)

This document establishes the zero-trust data invariants and specifies the threat-modeling scenarios / "Dirty Dozen" rogue payloads designed to probe the limits of security on our platform.

## 1. Zero-Trust Data Invariants

- **Invariant A (Authenticated & Email Verified)**: To prevent malicious accounts, all creations and edits to profiles, achievements, endorsements, recognitions, or innovations MUST require a user whose email possesses validation verification (`request.auth.token.email_verified == true`).
- **Invariant B (Identity Separation & PII Protection)**: Read access to `/users/{userId}` coordinates is restricted strictly to the document owner or a verified administrator. General residents may only query public professional `/profiles/{uid}` documents.
- **Invariant C (State Lock-Ins)**: An innovation's status cannot bypass sequential pipeline stages. Once marked as `Implemented` or `Approved`, standard residents cannot modify it, preventing critical state shortcut modifications.
- **Invariant D (Immutability)**: Core fields like `createdAt`, `userId`, `fromUserId`, and `toUserId` are immutable following document creation.
- **Invariant E (Anti-Abuse Anonymous Cap)**: For anonymous Silent Applause (`/recognitions/`), residents cannot create duplicate nominations within the same month. This is enforced client-side and tracked server-side or validated via a composite hash field `fromUserIdHash`.

---

## 2. The "Dirty Dozen" Rogue Payloads

The following payloads represent malicious attempts by rogue actors to perform state injection, credential spoofing, privilege escalation, or resource poisoning. All of these must fail with `PERMISSION_DENIED`:

### Payload 1: Spoofer Admin Account Creation
An unverified user or a resident attempts to set `role: "admin"` during registration to bypass moderating checkpoints.
- **Collection Path**: `/users/attacker_uid`
- **Method**: Set
- **Payload**:
  ```json
  {
    "uid": "attacker_uid",
    "email": "attacker@gmail.com",
    "role": "admin",
    "emailVerified": true,
    "createdAt": "2026-06-07T00:00:00Z"
  }
  ```
- **Reason for Deny**: Users cannot self-appoint their own roles or privileges to bypass RBAC gates.

### Payload 2: Hostile Spoofed Profile Takeover
User `resident_A` attempts to alter `resident_B`'s public professional file to change their display name and profile content.
- **Collection Path**: `/profiles/resident_B`
- **Method**: Update
- **Payload**:
  ```json
  {
    "displayName": "Hacked Resident",
    "bio": "Defaced Prof",
    "year": "Fellow"
  }
  ```
- **Reason for Deny**: Writing to `/profiles/{uid}` is restricted strictly to `request.auth.uid == uid`.

### Payload 3: Direct XP Injection
An authorized resident attempts to artificially boost their own academic XP directly in their profile without earning it.
- **Collection Path**: `/profiles/attacker_uid`
- **Method**: Update
- **Payload**:
  ```json
  {
    "academicXp": 9999,
    "totalXp": 9999
  }
  ```
- **Reason for Deny**: Direct updates to static XP points or levels are protected. State-changing actions are strictly limited.

### Payload 4: Orphaned Achievement Entry
A resident attempts to inject an academic achievement for another resident or create a floating achievement without assigning a valid owner.
- **Collection Path**: `/achievements/rogue_achievement`
- **Method**: Set
- **Payload**:
  ```json
  {
    "id": "rogue_achievement",
    "userId": "other_resident_uid",
    "title": "Artificial Nobel Prize",
    "category": "Award",
    "status": "admin-verified"
  }
  ```
- **Reason for Deny**: Achievement data creation requires `incoming().userId == request.auth.uid` and must start with `status` set as `self-declared`.

### Payload 5: Auto-Approval Achievement Hack
A user attempts to create an achievement and self-verify it directly to bypass community validation.
- **Collection Path**: `/achievements/new_item`
- **Method**: Set
- **Payload**:
  ```json
  {
    "id": "new_item",
    "userId": "attacker_uid",
    "title": "Rogue Paper",
    "status": "admin-verified"
  }
  ```
- **Reason for Deny**: Setting status to `admin-verified` or `community-validated` on create is forbidden.

### Payload 6: Field Alteration on Verification
An attacker attempts to modify the title or Category of an achievement *after* key verification.
- **Collection Path**: `/achievements/verified_item`
- **Method**: Update
- **Payload**:
  ```json
  {
    "title": "Completely Different Paper",
    "status": "admin-verified"
  }
  ```
- **Reason for Deny**: Once an achievement is locked/verified, fields are immutable to prevent bait-and-switch modifications.

### Payload 7: Self-Endorsement Exploitation
A resident tries to endorse themselves in major surgical techniques to inflate their skill profile.
- **Collection Path**: `/endorsements/self_vote`
- **Method**: Set
- **Payload**:
  ```json
  {
    "id": "self_vote",
    "fromUserId": "attacker_uid",
    "toUserId": "attacker_uid",
    "category": "Surgical Skills"
  }
  ```
- **Reason for Deny**: Self-endorsement is forbidden (`incoming().fromUserId != incoming().toUserId`).

### Payload 8: Identity Manipulation in Endorsement
An attacker logs in as `resident_A` but attempts to create an endorsement claiming to be sent from `resident_B`.
- **Collection Path**: `/endorsements/spoof_vote`
- **Method**: Set
- **Payload**:
  ```json
  {
    "id": "spoof_vote",
    "fromUserId": "resident_B",
    "toUserId": "resident_C",
    "category": "Teaching"
  }
  ```
- **Reason for Deny**: `incoming().fromUserId` must match `request.auth.uid`.

### Payload 9: Invisible Silent Applause Duplication
An attacker attempts to submit multiple appreciations for the same user in the same month, bypassing the anti-spam hash lock.
- **Collection Path**: `/recognitions/double_applause`
- **Method**: Set
- **Payload**:
  ```json
  {
    "id": "double_applause",
    "fromUserIdHash": "duplicate_hash",
    "toUserId": "resident_B",
    "message": "Thank you!",
    "category": "Emergency support"
  }
  ```
- **Reason for Deny**: If the target document exists or its hash does not match standard secure client hash verification, the rules or constraints block duplicate operations.

### Payload 10: State Shortcut in Innovation Ideas
A resident attempts to move their own innovation idea directly from `Submitted` to `Implemented` without review.
- **Collection Path**: `/innovationIdeas/my_idea`
- **Method**: Update
- **Payload**:
  ```json
  {
    "status": "Implemented"
  }
  ```
- **Reason for Deny**: Standard residents are forbidden from modifying critical status attributes of approved/reviewed ideas; only designated administrators can advance states.

### Payload 11: Artificial Upvote Inflation
A resident alters the global upvote count on an innovation idea by increments of 100 instead of a verified +1 vote.
- **Collection Path**: `/innovationIdeas/popular_idea`
- **Method**: Update
- **Payload**:
  ```json
  {
    "upvotesCount": 999,
    "status": "Submitted"
  }
  ```
- **Reason for Deny**: Upvotes updates are constrained to lock modifications strictly to verified additions or upvoter array membership additions.

### Payload 12: Hostile PII Scraping Query
An anonymous or authenticated user tries to perform a list query on all private user documents to scrape active clinical emails.
- **Collection Path**: `/users`
- **Method**: List
- **Payload**: Blanket query to fetch all documents.
- **Reason for Deny**: Rule blocks blanket read inquiries on the private `/users/` list collection.

---

## 3. Test Runner Configurations

To verify that these cases are rigidly locked out, a automated `firestore.rules` script is drafted directly below to satisfy total security.
