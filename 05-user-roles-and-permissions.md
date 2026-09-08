# User Access and Ownership Model

## Locked access model

There are only two application users and both are business owners.

| User | Access |
|---|---|
| Owner 1 | Full access to all modules and settings |
| Owner 2 | Full access to all modules and settings |

There are no staff, sales-user, store-user, accounts-user or manager roles in Version 1.

## Security rules

- Each owner has a separate login.
- Both owners can view and operate all business modules.
- Sensitive actions require an explicit confirmation screen, not another person's approval.
- Posted invoice cancellation, stock adjustment and backdated correction require a reason.
- Audit log records exactly which owner performed the action.
- Passwords are stored securely and never in plain text.

## Future compatibility

The data model may retain a simple permission architecture internally so staff roles can be added later without redesigning the whole application, but no staff-role UI is included in Version 1.
