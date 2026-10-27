# API Design — Mononet / Verso

Design for the Mononet REST API, covering what is already built (**v1**) and the modules needed to take the remaining prototype screens live (**v2**): saved posts & reels, notifications, chat, pages, marketplace, unified search, and media uploads.

- Base URL: `http://localhost:3000/api` (dev), `/api` in production
- Docs: Swagger UI at `/docs`, OpenAPI JSON at `/docs-json`
- Content type: `application/json` (uploads use presigned URLs, see [Media](#102-media-uploads))
- All timestamps are ISO 8601 UTC strings. All IDs are Prisma `cuid()` strings.

Legend: **✅ built** · **🆕 proposed**

---

## 1. Conventions

These are the rules the existing code already follows; new modules must keep them.

| Concern | Convention |
| --- | --- |
| Auth | `Authorization: Bearer <accessToken>`. JWT payload `{ sub, email, username }` |
| Public vs. private reads | `OptionalJwtAuthGuard` on reads that enrich the response with viewer state (`likedByMe`, `isFollowing`) |
| Path params | Resource identifiers, except users which are addressed by **lowercase username** |
| Query params | `camelCase`, validated by a DTO with `class-validator` |
| Body fields | `camelCase`, unknown fields rejected (`forbidNonWhitelisted: true`) |
| Enums | `UPPER_SNAKE_CASE` (`IMAGE`, `VIDEO`, `LOCAL_MEETUP`) |
| Pagination | Opaque `cursor` (id of the last row) + `limit` (1–50, default 20) |
| List envelope | `{ data: T[], meta: { nextCursor, hasMore, limit } }` (posts) or a plain array for bounded lists |
| Mutation envelopes | Small, purposeful: `{ liked, likeCount }`, `{ following }`, `{ deleted: true }` |
| Ownership | Checked in the service, `403` on violation, `404` when the row is absent |
| Errors | Nest default envelope, plus Prisma mapping (see [§11](#11-errors)) |
| Validation | `ValidationPipe` with `transform`, `whitelist`, `forbidNonWhitelisted` |
| Swagger | Every route has `@ApiOperation`; DTO fields have `@ApiProperty` |

### 1.1 Pagination contract

```jsonc
// GET /posts?limit=2
{
  "data": [ { "id": "cm...", "...": "..." } ],
  "meta": { "nextCursor": "cm...", "hasMore": true, "limit": 2 }
}
```

- Feed-style lists: `orderBy [{ createdAt: "desc" }, { id: "desc" }]`, keyset-paginated by `id`.
- Comment/message lists: chronological `asc`, fetched `limit + 1` to detect `hasMore`.
- `meta.nextCursor` is always the id of the last returned row, `null` when exhausted.
- Comments currently return a flat `200`-row array. **v2 change (breaking):** returns `PaginatedResult<Comment>`; ship `/posts/:id/comments?cursor=` with the new envelope and keep `?legacy=true` only if the UI cannot ship in lockstep.

### 1.2 Status codes

| Code | Use |
| --- | --- |
| `200` | Read, idempotent toggle, update with `@HttpCode(200)` where a `201` would mislead |
| `201` | Created resource (`POST /posts`, `/orders`, `/conversations/:id/messages`) |
| `204` | Deletion with no body — keep `{ deleted: true }` + `200` instead for consistency |
| `400` | Validation failure, invalid state transition, self-follow |
| `401` | Missing/invalid/expired token |
| `403` | Authenticated but not allowed (not owner, not page admin) |
| `404` | Unknown id or username |
| `409` | Unique conflict (email, username, existing membership) |
| `422` | Business rule violation that is not a validation error (e.g. buying your own listing) — prefer `400` and reserve `422` for order/state-machine conflicts |
| `429` | Rate limited |

### 1.3 Auth gaps to close in v2

| Endpoint | Purpose |
| --- | --- |
| 🆕 `POST /auth/refresh` | Rotate a refresh token; access token stays short-lived (15 m) |
| 🆕 `POST /auth/logout` | Revoke the presented refresh token |
| 🆕 `PATCH /auth/password` | Change password while signed in (requires `currentPassword`) |
| 🆕 `DELETE /auth/account` | Soft-delete account, anonymize after grace period |

Refresh tokens: random 32-byte value, SHA-256 hashed at rest (same pattern as `PasswordResetToken`), 30-day TTL, rotation with reuse detection. Transport as `HttpOnly; Secure; SameSite=Lax` cookie for the web app; the access token remains a bearer header.

---

## 2. Domain map

```text
User ──< Post ──< Comment
 │        ├──< Like
 │        └──< SavedPost            🆕
 ├──< Follow
 ├──< Notification (actor/recipient) 🆕
 ├──< ConversationParticipant >── Conversation ──< Message 🆕
 ├──< PageMember >── Page ──< PageJoinRequest / PageInvite / PageEvent 🆕
 ├──< Product ──< ProductImage / OrderItem 🆕
 └──< Order (buyer/seller) 🆕
```

**Key decisions**

1. **Reels are posts.** A reel is a `Post` with `mediaType = VIDEO`; it reuses comments, likes, saves, and moderation. Only discovery and counters are new.
2. **Notifications are stored, not computed.** A row is written by the domain action that causes it (like, comment, follow, mention, page/marketplace events). This makes unread counts cheap and survives offline periods.
3. **Chat is REST-first, realtime-optional.** Messages persist over HTTP; an SSE stream (`GET /events`) pushes notification/message hints. WebSocket is a later upgrade, not a v2 requirement.
4. **Pages own posts.** Add nullable `Post.pageId`; when set, the page (not the personal feed) is the author surface, and page role gates publishing.
5. **Marketplace is order-first, payment-free.** No card processing in v2: buyers and sellers coordinate payment; the API models listing lifecycle, cart, order state machine, and meetup/delivery choice.
6. **Everything the UI renders must be addressable.** Each prototype screen maps to at least one read endpoint so no module blocks another.

---

## 3. Auth ✅

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | – | Create account, returns token + user |
| `POST` | `/auth/login` | – | Sign in by email **or** username |
| `POST` | `/auth/forgot-password` | – | Always returns the same generic message |
| `POST` | `/auth/reset-password` | – | Single-use, expiring, hashed token |
| `GET` | `/auth/me` | bearer | Current account |

```jsonc
// POST /auth/register  → 201
// { "email": "alex@mononet.dev", "username": "alexm", "name": "Alex Morgan", "password": "Password123!" }
{ "accessToken": "eyJ...", "user": { "id": "cm...", "email": "alex@mononet.dev", "username": "alexm", "name": "Alex Morgan", "bio": null, "avatarUrl": null, "createdAt": "..." } }
```

Rules already enforced: username `3–30` chars `[a-z0-9_]`, name `1–80`, password `8–72` (bcrypt cost 12), email lowercased/trimmed. Login uses a single `identifier` field.

---

## 4. Users ✅

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/users/me` | bearer | Private profile + counts |
| `PATCH` | `/users/me` | bearer | `name`, `bio`, `avatarUrl` (omitted ≠ cleared; `""` clears) |
| `GET` | `/users/search?q=&limit=` | – | Username/name contains, case-insensitive |
| `GET` | `/users/:username` | optional | Public profile + `isFollowing`, `isMe` |
| `POST` | `/users/:username/follow` | bearer | Idempotent upsert → `{ following: true }` |
| `DELETE` | `/users/:username/follow` | bearer | Idempotent → `{ following: false }` |

🆕 additions needed by the UI:

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/users/:username/followers?cursor=&limit=` | optional | Paginated follower list |
| `GET` | `/users/:username/following?cursor=&limit=` | optional | Paginated following list |
| `GET` | `/users/me/saved?cursor=&limit=` | bearer | Saved posts (see §5.3) |
| `GET` | `/users/:username/posts?cursor=&limit=` | optional | Alias for `GET /posts?author=` — keeps profile code simple |

`GET /users/:username` must never return `email`, `passwordHash`, or token data. `PRIVATE_USER_SELECT` is only for `me` routes.

---

## 5. Posts, likes, comments ✅

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/posts?author=&q=&cursor=&limit=` | optional | Newest first |
| `GET` | `/posts/feed?cursor=&limit=` | bearer | Own posts + followed authors |
| `GET` | `/posts/:id` | optional | Single post |
| `POST` | `/posts` | bearer | Text and/or image/video |
| `PATCH` | `/posts/:id` | bearer (owner) | Partial update |
| `DELETE` | `/posts/:id` | bearer (owner) | Hard delete, cascades |
| `POST` | `/posts/:id/like` | bearer | Idempotent → `{ liked: true, likeCount }` |
| `DELETE` | `/posts/:id/like` | bearer | Idempotent → `{ liked: false, likeCount }` |
| `GET` | `/posts/:id/comments` | – | Oldest first |
| `POST` | `/posts/:id/comments` | bearer | 1–1000 chars |
| `DELETE` | `/posts/:id/comments/:commentId` | bearer (comment or post author) | `403` otherwise |

Post shape returned to clients:

```jsonc
{
  "id": "cm...", "authorId": "cm...", "caption": "…",
  "imageUrl": "https://…", "imageAlt": "…", "mediaUrl": "https://…", "mediaType": "IMAGE",
  "createdAt": "…", "updatedAt": "…",
  "author": { "id": "…", "username": "alexm", "name": "Alex Morgan", "avatarUrl": "…" },
  "likeCount": 12, "commentCount": 3, "likedByMe": true, "isMine": false
}
```

Validation: caption ≤ 2200; URLs ≤ 2048; alt ≤ 300; post must have at least one of caption/image/media.

### 5.1 🆕 Post additions

- `Post.pageId` — publish as a page (requires `content.create` on that page).
- `Post.viewCount`, `Post.shareCount` — denormalized counters, incremented by `POST /posts/:id/view` and `POST /posts/:id/share`.
- `Post.editedAt` and `Post.deletedAt` — edit marker and soft delete for moderation; API filters `deletedAt: null`.
- `GET /posts?pageId=&mediaType=` filters.
- `PATCH /posts/:id` should reject edits after 24 h? **No** — keep editable; show "edited" in UI.

### 5.2 🆕 Reels

A reel is a video post; these routes exist for discovery and counters.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/reels?cursor=&limit=` | optional | Video posts, ranked by recency then engagement |
| `POST` | `/reels/:id/view` | optional | Idempotent per viewer/day → `{ viewCount }` |
| `POST` | `/reels/:id/share` | optional | → `{ shareCount }` |

Comments, likes, and saves use the post routes (`/posts/:id/comments`, `/posts/:id/like`, `/posts/:id/save`). Ranking for v2: `ORDER BY createdAt DESC` with a simple score (`likes + 2·comments + views/10`) as a tiebreak; a dedicated ranking job is out of scope.

### 5.3 🆕 Saved posts

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `PUT` | `/posts/:id/save` | bearer | Idempotent → `{ saved: true }` |
| `DELETE` | `/posts/:id/save` | bearer | Idempotent → `{ saved: false }` |
| `GET` | `/users/me/saved?cursor=&limit=` | bearer | Saved posts, newest save first |

`SavedPost` is `(userId, postId, createdAt)` with a composite primary key, mirroring `Like`. The list joins through `SavedPost` so ordering is by save time, not post time.

---

## 6. Notifications 🆕

Server-generated, per-recipient rows. A single write path (`NotificationsService.create`) is called from likes, comments, follows, mentions, page membership changes, and order updates.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/notifications?cursor=&limit=&unreadOnly=` | bearer | Newest first, includes actor + target preview |
| `GET` | `/notifications/unread-count` | bearer | `{ count }` — badge value |
| `POST` | `/notifications/:id/read` | bearer | Idempotent → `{ read: true }` |
| `POST` | `/notifications/read-all` | bearer | → `{ updated: n }` |
| `DELETE` | `/notifications/:id` | bearer | Remove one |
| `GET` | `/notifications/preferences` | bearer | Per-type toggles |
| `PATCH` | `/notifications/preferences` | bearer | Update toggles |

```jsonc
// GET /notifications
{
  "data": [{
    "id": "cm...",
    "type": "LIKE",                       // LIKE | COMMENT | FOLLOW | MENTION | POST | REEL | PAGE_INVITE | PAGE_JOIN_REQUEST | PAGE_ROLE_CHANGED | ORDER_UPDATE
    "title": "Alex Morgan liked your post",
    "message": "“Sunset over the bay”",
    "actor": { "id": "…", "username": "alexm", "name": "Alex Morgan", "avatarUrl": "…" },
    "target": { "type": "POST", "id": "cm..." },
    "readAt": null,
    "createdAt": "…"
  }],
  "meta": { "nextCursor": "cm...", "hasMore": false, "limit": 20 }
}
```

Rules:

- Never notify yourself (actor = recipient is skipped).
- Collapse duplicates inside a 10-minute window for the same `(recipient, actor, type, target)` — update `createdAt` instead of inserting.
- Respect `NotificationPreference`; disabled types are not written at all (cheaper than filtering on read).
- Deleting a post/comment cascades to its notifications (`onDelete: Cascade` on `targetId` is not possible across polymorphic types — use an explicit cleanup in the delete service, or a `targetPostId` FK for post-related types).

---

## 7. Chat 🆕

Two shapes: `DIRECT` (1:1, unique per participant pair) and `GROUP` (v2.1, no requirement yet but the model supports it).

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/conversations?cursor=&limit=` | bearer | Threads for the viewer, newest activity first |
| `POST` | `/conversations` | bearer | `{ participantIds: ["<userId>"] }` — idempotent for direct chats |
| `GET` | `/conversations/:id` | bearer (member) | Thread metadata + participant profiles |
| `GET` | `/conversations/:id/messages?before=&limit=` | bearer (member) | Reverse-chronological page, oldest-last |
| `POST` | `/conversations/:id/messages` | bearer (member) | `{ text?, mediaUrl?, replyToId? }` |
| `PATCH` | `/conversations/:id/messages/:messageId` | bearer (author) | Edit text within 15 min |
| `DELETE` | `/conversations/:id/messages/:messageId` | bearer (author) | Soft delete → tombstone `"message deleted"` |
| `POST` | `/conversations/:id/read` | bearer (member) | `{ lastMessageId }` → updates `lastReadAt` |
| `GET` | `/conversations/unread-count` | bearer | `{ count }` total unread threads |

```jsonc
// GET /conversations
{
  "data": [{
    "id": "cm...",
    "type": "DIRECT",
    "participants": [{ "id": "…", "username": "jamiel", "name": "Jamie Lee", "avatarUrl": "…" }],
    "lastMessage": { "id": "…", "senderId": "…", "text": "See you at 6", "createdAt": "…" },
    "unreadCount": 2,
    "lastMessageAt": "…"
  }],
  "meta": { "nextCursor": null, "hasMore": false, "limit": 20 }
}
```

Rules and constraints:

- Text ≤ 4000 chars; message must have `text` or `mediaUrl`; URL ≤ 2048.
- Sender must be an active participant; leaving a group keeps history but blocks new sends.
- Direct conversation lookup: `ConversationParticipant` composite index on `(userId, conversationId)`; creating a duplicate direct thread returns the existing one (`200` instead of `201`).
- Editing/deleting is author-only; no admin override in v2.
- Rate limit: 30 messages/minute/user (`429` beyond).
- Realtime: `GET /events` (SSE) emits `{ type: "message.created", conversationId, messageId }` plus notification and unread-count events. Clients refetch over REST; no message payload duplication in the stream keeps auth and ordering simple.

---

## 8. Pages 🆕

A page is an organization surface with its own posts, membership, roles, events, and analytics. It is the only place the RBAC model in the UI (`admin`, `editor`, `moderator`, `member`, `custom`) applies.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/pages?q=&category=&cursor=&limit=` | optional | Discover public pages |
| `POST` | `/pages` | bearer | Create page; creator becomes `ADMIN` |
| `GET` | `/pages/:slug` | optional | Public page; private pages require membership |
| `PATCH` | `/pages/:slug` | bearer (`page.settings`) | Name, description, category, visibility, rules |
| `DELETE` | `/pages/:slug` | bearer (`page.delete`) | Admin only; archives then deletes |
| `GET` | `/pages/:slug/members?cursor=&limit=` | optional | Members + roles |
| `PATCH` | `/pages/:slug/members/:userId` | bearer (`member.role`) | Change role/permissions |
| `DELETE` | `/pages/:slug/members/:userId` | bearer (`member.remove`) | Remove member (or leave: `DELETE …/members/me`) |
| `POST` | `/pages/:slug/join` | bearer | Public → `MEMBER`; private → pending request |
| `DELETE` | `/pages/:slug/join` | bearer | Leave page or cancel request |
| `GET` | `/pages/:slug/join-requests` | bearer (`member.invite`) | Pending requests |
| `POST` | `/pages/:slug/join-requests/:userId/approve` | bearer (`member.invite`) | → `MEMBER` |
| `POST` | `/pages/:slug/join-requests/:userId/reject` | bearer (`member.invite`) | Removes request |
| `GET` | `/pages/:slug/invites` | bearer (`member.invite`) | Sent invites |
| `POST` | `/pages/:slug/invites` | bearer (`member.invite`) | `{ username }` or `{ usernames: [] }` |
| `POST` | `/pages/:slug/invites/accept` | bearer (invitee) | Join |
| `POST` | `/pages/:slug/invites/reject` | bearer (invitee) | Decline |
| `GET` | `/pages/:slug/events?cursor=&limit=` | optional | Upcoming + past |
| `POST` | `/pages/:slug/events` | bearer (`content.create`) | Create event |
| `PATCH` | `/pages/:slug/events/:eventId` | bearer (`content.edit`) | Update event |
| `DELETE` | `/pages/:slug/events/:eventId` | bearer (`content.delete`) | Delete event |
| `GET` | `/pages/:slug/analytics?range=7d\|30d\|90d` | bearer (`page.analytics`) | Views, member growth, post engagement |
| `GET` | `/pages/:slug/posts?cursor=&limit=` | optional | Alias for `GET /posts?pageId=` |

### 8.1 Page roles and permissions

Roles are presets; `CUSTOM` carries an explicit permission array. Service resolves `effectivePermissions = rolePreset ∪ customPermissions` (admins always get everything).

| Permission | ADMIN | EDITOR | MODERATOR | MEMBER | CUSTOM |
| --- | :-: | :-: | :-: | :-: | :-: |
| `content.create` (post/event) | ✓ | ✓ | – | – | configurable |
| `content.edit` | ✓ | ✓ | – | – | configurable |
| `content.delete` | ✓ | ✓ | ✓ | – | configurable |
| `moderation.comments` | ✓ | ✓ | ✓ | – | configurable |
| `moderation.members` | ✓ | – | ✓ | – | configurable |
| `member.invite` | ✓ | ✓ | – | – | configurable |
| `member.role` | ✓ | – | – | – | – |
| `member.remove` | ✓ | – | ✓ | – | configurable |
| `page.settings` | ✓ | – | – | – | conf. (admin cannot be revoked) |
| `page.analytics` | ✓ | ✓ | – | – | configurable |
| `page.delete` | ✓ | – | – | – | – |

Guardrails: an `EDITOR` cannot promote anyone to `ADMIN` (already encoded in the UI prototype); the last admin cannot be removed or demoted; only admins can grant `member.role`.

### 8.2 Page shape

```jsonc
{
  "id": "cm...", "slug": "verso-design", "name": "Verso Design", "category": "Design",
  "description": "…", "visibility": "PUBLIC",        // PUBLIC | PRIVATE | SECRET
  "avatarUrl": "…", "coverUrl": "…", "isVerified": false,
  "rules": ["Be kind", "No spam"],
  "memberCount": 128, "postCount": 42,
  "viewerRole": "EDITOR", "viewerPermissions": ["content.create", "..."],
  "createdAt": "…"
}
```

`visibility` semantics: `PUBLIC` — anyone can join; `PRIVATE` — anyone can request, content visible to members; `SECRET` — not listed, invite-only, `404` for non-members.

---

## 9. Marketplace 🆕

Scope: listings, single-seller cart, order state machine, seller flows. No payments in v2 — payment is arranged between buyer and seller; the API records intent and status.

### 9.1 Listings

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/products?q=&category=&condition=&minPrice=&maxPrice=&delivery=&sort=newest\|price_asc\|price_desc&cursor=&limit=` | optional | Browse active listings |
| `GET` | `/products/:id` | optional | Detail + images + seller |
| `POST` | `/products` | bearer | Create listing (draft or active) |
| `PATCH` | `/products/:id` | bearer (seller) | Edit; `sold`/`archived` → `409` after first order |
| `DELETE` | `/products/:id` | bearer (seller) | Archive if ordered, hard delete if not |
| `GET` | `/users/me/products?cursor=&limit=` | bearer | My listings (all statuses) |
| `POST` | `/products/:id/view` | optional | Idempotent view counter |

```jsonc
// POST /products  → 201
{
  "title": "Mechanical Keyboard",
  "price": 89.00,                    // decimal string accepted, stored as Decimal(10,2)
  "description": "Barely used, brown switches",
  "category": "Electronics",
  "condition": "LIKE_NEW",           // NEW | LIKE_NEW | GOOD | FAIR
  "deliveryMethod": "DELIVERY",      // LOCAL_MEETUP | DELIVERY | BOTH
  "location": "Kathmandu",
  "images": [{ "url": "https://…", "alt": "…" }]   // 1–8 images
}
```

Rules: price `0.01–1,000,000`; title `1–120`; description ≤ 5000; image URLs ≤ 2048. `sellerId` comes from the token, never the body. Buyers cannot order their own listing (`400`).

### 9.2 Cart

Server-side cart so it survives devices, but the UI may keep a local copy and reconcile:

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/cart` | bearer | Items with live price/availability |
| `PUT` | `/cart/items/:productId` | bearer | `{ quantity }` upsert (1–99) |
| `DELETE` | `/cart/items/:productId` | bearer | Remove |
| `DELETE` | `/cart` | bearer | Clear |

Carts are single-seller in v2: adding a product from a different seller returns `409` with `{ sellerId }`, and the client offers "start a new cart". `GET /cart` returns `{ items, subtotal, seller, hasUnavailableItems }`.

### 9.3 Orders

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/orders` | bearer | From cart or `{ productId, quantity }`; optional `Idempotency-Key` |
| `GET` | `/orders?role=buyer\|seller&status=&cursor=&limit=` | bearer | My orders |
| `GET` | `/orders/:id` | bearer (buyer or seller) | Detail + timeline |
| `POST` | `/orders/:id/cancel` | bearer (buyer before shipment, seller anytime pre-completion) | → `CANCELLED` |
| `POST` | `/orders/:id/accept` | bearer (seller) | → `SELLER_ACCEPTED` |
| `POST` | `/orders/:id/ship` | bearer (seller) | `{ trackingNumber }` → `SHIPPED` |
| `POST` | `/orders/:id/meetup` | bearer (seller) | `{ scheduledAt, location }` → `MEETUP_SCHEDULED` |
| `POST` | `/orders/:id/complete` | bearer (buyer, or seller for meetup) | → `COMPLETED`, marks products `SOLD` |

```jsonc
// GET /orders/:id
{
  "id": "cm...", "status": "SHIPPED", "deliveryMethod": "DELIVERY",
  "buyer":   { "id": "…", "username": "alexm", "name": "Alex Morgan" },
  "seller":  { "id": "…", "username": "jamiel", "name": "Jamie Lee" },
  "items": [{ "productId": "…", "title": "Mechanical Keyboard", "unitPrice": "89.00", "quantity": 1, "imageUrl": "…" }],
  "subtotal": "89.00", "shipping": "0.00", "total": "89.00",
  "deliveryAddress": "…", "trackingNumber": "…",
  "timeline": [{ "status": "CONFIRMED", "at": "…" }, { "status": "SELLER_ACCEPTED", "at": "…" }],
  "createdAt": "…"
}
```

State machine (invalid transitions → `422`):

```text
CONFIRMED ──accept──> SELLER_ACCEPTED ──ship──> SHIPPED ──> IN_TRANSIT ──> DELIVERED ──> COMPLETED
    │                        │                                    │
    └────cancel──────────────┴──────────────cancel───────────────┘──> CANCELLED
CONFIRMED ──meetup(seller)──> MEETUP_SCHEDULED ──complete──> COMPLETED
```

- `POST /orders` snapshots title, price, and image into `OrderItem` so later listing edits do not rewrite history.
- Stock: v2 products are effectively quantity 1 for second-hand goods. Creating an order marks the product `RESERVED`; cancellation releases it; completion marks `SOLD`. Concurrent orders on the same product → `409`.
- `Idempotency-Key` header replays the original response for 24 h (unique index on `(buyerId, key)`).
- Order notifications reuse §6 with `type = ORDER_UPDATE`.

---

## 10. Search and media 🆕

### 10.1 Unified search

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/search?q=&type=all\|users\|posts\|pages\|products&limit=` | optional | Grouped results |

```jsonc
{ "users": [...], "posts": [...], "pages": [...], "products": [...],
  "meta": { "q": "keyboard", "limit": 5 } }
```

- Per-group `limit` (1–20), no cross-group cursor in v2; each group links to its dedicated paginated route.
- Minimum query length 1; trim, cap at 100 chars.
- Postgres `ILIKE` is sufficient now; when it isn't, add `pg_trgm` indexes before considering a search service.

### 10.2 Media uploads

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/media/upload-url` | bearer | `{ contentType, size, purpose }` → presigned `PUT` URL |
| `POST` | `/media/complete` | bearer | Confirm upload, returns the public `fileUrl` |
| `DELETE` | `/media/:key` | bearer (owner) | Remove unreferenced object |

- Allowed: `image/jpeg|png|webp|gif` ≤ 10 MB; `video/mp4|webm` ≤ 100 MB.
- Response: `{ uploadUrl, fileUrl, key, expiresAt }` (5-minute URL). Clients `PUT` the bytes, then use `fileUrl` in post/product/message bodies.
- Store in S3-compatible object storage (Neon Object Storage or R2); the API only signs URLs, never proxies bytes.
- Orphan cleanup: nightly job deletes objects with no referencing row after 24 h.

---

## 11. Errors

Nest's default envelope plus the Prisma filter:

```jsonc
{ "statusCode": 403, "message": "You can only modify your own posts", "error": "Forbidden" }
```

Validation failures return an array in `message`:

```jsonc
{ "statusCode": 400, "message": ["caption must be shorter than or equal to 2200 characters"], "error": "Bad Request" }
```

Prisma mapping (implemented): `P2002 → 409`, `P2003 → 409`, `P2025 → 404`; anything else logs and returns a generic `500`.

Machine-readable codes to add (optional `code` field, non-breaking):

| Code | HTTP | Meaning |
| --- | --- | --- |
| `AUTH_INVALID_CREDENTIALS` | 401 | Login failed |
| `AUTH_TOKEN_EXPIRED` | 401 | Refresh required |
| `VALIDATION_FAILED` | 400 | Body/query invalid |
| `NOT_FOUND` | 404 | Resource missing |
| `FORBIDDEN` | 403 | Not owner / missing permission |
| `CONFLICT_UNIQUE` | 409 | Duplicate email, username, membership |
| `CART_MULTI_SELLER` | 409 | Cart belongs to another seller |
| `ORDER_INVALID_TRANSITION` | 422 | State machine rejected |
| `PRODUCT_UNAVAILABLE` | 409 | Already reserved/sold |
| `RATE_LIMITED` | 429 | Throttled |

---

## 12. Data model additions (Prisma sketch)

```prisma
enum NotificationType {
  LIKE
  COMMENT
  FOLLOW
  MENTION
  POST
  REEL
  PAGE_INVITE
  PAGE_JOIN_REQUEST
  PAGE_ROLE_CHANGED
  ORDER_UPDATE
}

enum ConversationType { DIRECT GROUP }
enum PageVisibility   { PUBLIC PRIVATE SECRET }
enum PageRole         { ADMIN EDITOR MODERATOR MEMBER CUSTOM }
enum ProductStatus    { DRAFT ACTIVE RESERVED SOLD ARCHIVED }
enum ProductCondition { NEW LIKE_NEW GOOD FAIR }
enum DeliveryMethod   { LOCAL_MEETUP DELIVERY BOTH }
enum OrderStatus {
  CONFIRMED
  SELLER_ACCEPTED
  SHIPPED
  IN_TRANSIT
  DELIVERED
  MEETUP_SCHEDULED
  COMPLETED
  CANCELLED
}

model SavedPost {
  userId    String
  postId    String
  createdAt DateTime @default(now())
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  @@id([userId, postId])
  @@index([postId])
  @@map("saved_posts")
}

model Notification {
  id        String           @id @default(cuid())
  userId    String
  actorId   String?
  type      NotificationType
  title     String
  message   String?
  targetType String?
  targetId  String?
  readAt    DateTime?
  createdAt DateTime         @default(now())
  user  User  @relation("notificationRecipient", fields: [userId], references: [id], onDelete: Cascade)
  actor User? @relation("notificationActor", fields: [actorId], references: [id], onDelete: SetNull)
  @@index([userId, createdAt(sort: Desc)])
  @@index([userId, readAt])
  @@map("notifications")
}

model NotificationPreference {
  userId String
  type   NotificationType
  inApp  Boolean @default(true)
  email  Boolean @default(false)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@id([userId, type])
  @@map("notification_preferences")
}

model Conversation {
  id            String           @id @default(cuid())
  type          ConversationType @default(DIRECT)
  directKey     String?          @unique   // sorted "userIdA:userIdB" for idempotent directs
  lastMessageAt DateTime         @default(now())
  createdAt     DateTime         @default(now())
  participants ConversationParticipant[]
  messages     Message[]
  @@index([lastMessageAt(sort: Desc)])
  @@map("conversations")
}

model ConversationParticipant {
  conversationId String
  userId         String
  lastReadAt     DateTime?
  joinedAt       DateTime @default(now())
  leftAt         DateTime?
  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@id([conversationId, userId])
  @@index([userId])
  @@map("conversation_participants")
}

model Message {
  id             String    @id @default(cuid())
  conversationId String
  senderId       String
  text           String?
  mediaUrl       String?
  replyToId      String?
  editedAt       DateTime?
  deletedAt      DateTime?
  createdAt      DateTime  @default(now())
  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender       User         @relation(fields: [senderId], references: [id], onDelete: Cascade)
  replyTo      Message?     @relation("reply", fields: [replyToId], references: [id], onDelete: SetNull)
  replies      Message[]    @relation("reply")
  @@index([conversationId, createdAt(sort: Desc)])
  @@map("messages")
}

model Page {
  id          String         @id @default(cuid())
  slug        String         @unique
  name        String
  category    String
  description String         @default("")
  visibility  PageVisibility @default(PUBLIC)
  avatarUrl   String?
  coverUrl    String?
  isVerified  Boolean        @default(false)
  rules       String[]
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  members     PageMember[]
  joinRequests PageJoinRequest[]
  invites     PageInvite[]
  events      PageEvent[]
  posts       Post[]
  @@index([category])
  @@map("pages")
}

model PageMember {
  pageId      String
  userId      String
  role        PageRole @default(MEMBER)
  permissions String[] // used when role = CUSTOM
  joinedAt    DateTime @default(now())
  page Page @relation(fields: [pageId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@id([pageId, userId])
  @@index([userId])
  @@map("page_members")
}

model PageJoinRequest {
  pageId    String
  userId    String
  createdAt DateTime @default(now())
  page Page @relation(fields: [pageId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@id([pageId, userId])
  @@map("page_join_requests")
}

model PageInvite {
  pageId    String
  userId    String
  invitedById String
  status    String   @default("PENDING") // PENDING ACCEPTED REJECTED
  createdAt DateTime @default(now())
  page Page @relation(fields: [pageId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@id([pageId, userId])
  @@index([userId, status])
  @@map("page_invites")
}

model PageEvent {
  id          String   @id @default(cuid())
  pageId      String
  title       String
  description String   @default("")
  location    String?
  startsAt    DateTime
  endsAt      DateTime?
  createdAt   DateTime @default(now())
  page Page @relation(fields: [pageId], references: [id], onDelete: Cascade)
  @@index([pageId, startsAt])
  @@map("page_events")
}

model Product {
  id             String           @id @default(cuid())
  sellerId       String
  title          String
  description    String
  price          Decimal          @db.Decimal(10, 2)
  category       String
  condition      ProductCondition
  deliveryMethod DeliveryMethod
  location       String
  status         ProductStatus    @default(ACTIVE)
  viewCount      Int              @default(0)
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  seller User @relation(fields: [sellerId], references: [id], onDelete: Cascade)
  images ProductImage[]
  @@index([status, createdAt(sort: Desc)])
  @@index([status, category])
  @@index([sellerId, createdAt(sort: Desc)])
  @@map("products")
}

model ProductImage {
  id        String @id @default(cuid())
  productId String
  url       String
  alt       String?
  position  Int    @default(0)
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  @@index([productId, position])
  @@map("product_images")
}

model CartItem {
  userId    String
  productId String
  quantity  Int      @default(1)
  createdAt DateTime @default(now())
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  @@id([userId, productId])
  @@map("cart_items")
}

model Order {
  id             String      @id @default(cuid())
  buyerId        String
  sellerId       String
  status         OrderStatus @default(CONFIRMED)
  deliveryMethod DeliveryMethod
  deliveryAddress String?
  trackingNumber String?
  meetupAt       DateTime?
  meetupLocation String?
  subtotal       Decimal @db.Decimal(10, 2)
  shipping       Decimal @db.Decimal(10, 2) @default(0)
  total          Decimal @db.Decimal(10, 2)
  idempotencyKey String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  buyer  User @relation("orderBuyer", fields: [buyerId], references: [id])
  seller User @relation("orderSeller", fields: [sellerId], references: [id])
  items  OrderItem[]
  timeline OrderEvent[]
  @@unique([buyerId, idempotencyKey])
  @@index([buyerId, createdAt(sort: Desc)])
  @@index([sellerId, createdAt(sort: Desc)])
  @@map("orders")
}

model OrderItem {
  id         String  @id @default(cuid())
  orderId    String
  productId  String
  title      String
  unitPrice  Decimal @db.Decimal(10, 2)
  quantity   Int
  imageUrl   String?
  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  @@index([orderId])
  @@map("order_items")
}

model OrderEvent {
  id        String      @id @default(cuid())
  orderId   String
  status    OrderStatus
  note      String?
  createdAt DateTime    @default(now())
  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  @@index([orderId, createdAt])
  @@map("order_events")
}
```

Existing `User`/`Post` gain relations (`savedPosts`, `notifications`, `messages`, `pages`, `products`, `orders`) and `Post.pageId String?` with `@@index([pageId, createdAt(sort: Desc)])`. `NotificationPreference` is optional for v2; add it when email digests exist.

---

## 13. Cross-cutting rules

| Rule | Detail |
| --- | --- |
| Authorization | Resolve the actor once, then check resource membership/ownership in the service; never trust body IDs |
| Privacy | A private page's posts, members, and events are invisible (`404`) to non-members |
| Cascades | Deleting a user cascades posts/comments/likes/saves; deleting a page cascades its posts' `pageId` (set null) or deletes page posts — **decision: delete page posts** |
| Soft delete | Posts and messages use `deletedAt`; users get a 30-day grace period before anonymization |
| N+1 | Every list query uses Prisma `include`/`select` with counts; no per-row queries |
| Indexes | Match query shapes: `(authorId, createdAt)`, `(conversationId, createdAt)`, `(userId, createdAt)` |
| Rate limits | Auth 10/min/IP; posts 10/min; comments 30/min; messages 30/min; uploads 20/h |
| Payload size | JSON body limit 1 MB; uploads bypass the API via presigned URLs |
| Caching | `GET /posts` and `GET /pages/:slug` may add `ETag` + `Cache-Control: private, max-age=15` for auth'd reads |
| Observability | Request id header (`x-request-id`), structured logs on mutations, `/api/health` stays dependency-checked |

---

## 14. Rollout plan

| Phase | Scope | Why first |
| --- | --- | --- |
| **0. Hardening** | Refresh/logout, comment pagination, saved posts, reels counters, media uploads | Closes existing gaps and unblocks the UI's save/reel screens |
| **1. Social graph** | Followers/following lists, unified search, notification storage + unread | Cheap, high-visibility, no new aggregates |
| **2. Pages** | Page CRUD, membership, invites, roles, events, analytics | Largest RBAC surface; depends on media + notifications |
| **3. Chat** | Conversations, messages, read state, SSE hints | Depends on notifications for "new message" badges |
| **4. Marketplace** | Products, cart, orders, state machine | Most complex invariants; benefits from stable media + notifications |
| **5. Realtime polish** | SSE → WebSocket, typing indicators, presence | Optional; REST polling is the fallback |

Each phase ships with: Prisma migration, module + DTOs + Swagger annotations, service unit tests for authorization and state transitions, and a Vitest e2e path in `apps/backend/test`.

---

## 15. Open questions

1. **Reels vs. posts** — is a reel ever *not* a post (e.g. no caption, separate moderation)? Current decision: no.
2. **Payments** — if checkout becomes real, orders need a `Payment` aggregate and webhook-driven state; the current machine stays the source of truth for fulfillment.
3. **Multi-seller carts** — deferred (`CART_MULTI_SELLER`) to keep order/seller notifications simple.
4. **Message retention** — 15-minute edit window is a product call; check with design.
5. **Page post ownership** — should a page post also appear in the author's personal feed? Current decision: no, only in `GET /posts?pageId=`.
6. **Account deletion** — hard delete vs. anonymize: proposal is soft delete + anonymize, but the retention window needs legal input.
