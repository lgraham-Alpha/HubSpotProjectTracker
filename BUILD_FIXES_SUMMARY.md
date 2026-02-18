# Build Fixes Summary

All known build-breaking issues have been addressed so the app builds on DigitalOcean (and locally).

## 1. TypeScript target (Set iteration)

- **Error:** `Type 'Set<string>' can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.`
- **Fix:** In `tsconfig.json`, `"target"` was changed from `"es5"` to `"es2015"`. This matches Next.js 14 recommendations and allows Set/iterator usage.

## 2. Prisma Json field (milestones)

- **Error:** `Type 'string | null' is not assignable to type 'NullableJsonNullValueInput | InputJsonValue | undefined'.`
- **Fix:** In `app/api/projects/[id]/milestones/route.ts` and `app/api/milestones/[id]/route.ts`, use `Prisma.JsonNull` instead of `null` for `prerequisiteMilestoneIds`, and cast stringified arrays to `Prisma.InputJsonValue`.

## 3. Client ProjectData type (track page)

- **Error:** Serialized milestone dates (`string`) were not assignable to Prisma `Milestone` (`Date`).
- **Fix:** In `components/TrackPageClient.tsx`, `ProjectData` no longer extends Prisma types. It now uses explicit `SerializedMilestone` and `SerializedActivityLog` interfaces with date fields as `string`.

## 4. HubSpot OAuth token exchange

- **Error:** `Property 'createToken' does not exist on type 'PromiseTokensApi'.`
- **Fix:** In `lib/hubspot/oauth.ts`, the call was changed from `client.oauth.tokensApi.createToken(...)` to `client.oauth.tokensApi.create(...)`.

## 5. Set deduplication (milestone utils)

- **Fix:** In `lib/utils/milestone.ts`, `[...new Set(blockingItems)]` was replaced with `Array.from(new Set(blockingItems))` so the code is valid even with older targets (and remains valid with `es2015`).

---

**Current state:** With these changes, `npm run build` should succeed. If a new error appears, it will be from a different spot; the issues above are resolved.
