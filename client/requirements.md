## Packages
zustand | Lightweight global state management for UI states if needed

## Notes
- Using JWT authentication via localStorage. 
- The `lib/queryClient.ts` file has been updated to automatically attach the `Authorization: Bearer <token>` header to all outgoing requests.
- Automatic redirect to `/auth` on 401 Unauthorized responses.
- Assuming API handles correct prefixing as defined in `@shared/routes`.
