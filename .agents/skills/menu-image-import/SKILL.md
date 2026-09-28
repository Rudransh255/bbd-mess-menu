---
name: menu-image-import
description: Build or review the Gemini-assisted workflow that extracts a mess menu from an uploaded image and prepares a publishable draft.
---

# Menu Image Import

Required workflow:

Upload Image -> Validate Image -> AI Extraction -> Structured JSON -> Schema Validation -> Draft -> Manual Review -> Preview -> Publish

AI-extracted content must never automatically become public. Every extracted field must be editable. Do not silently guess unreadable menu text; preserve uncertainty for human review. Validate Gemini output before saving it. Use structured JSON, not free-form AI text. Publishing requires explicit admin action.
