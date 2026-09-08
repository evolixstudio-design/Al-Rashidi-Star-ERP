# Expense Management Specification

## Goal

Allow either owner to record a business expense in a few fields without accounting terminology.

## Fields

- Date
- Category
- Amount
- Payment Method / Account
- Payee
- Note
- Optional receipt attachment

## Categories

Configurable examples: rent, utilities, transport, salary/wages, maintenance, packaging, delivery, marketing and miscellaneous.

## Rules

- Posting an expense affects expense and profit reporting.
- Expense never changes inventory.
- Both owners have full access.
- Large or unusual expense does not require another user approval, but deletion/correction requires confirmation and reason.

## UX

Single simple form with one primary `Save Expense` button and a clear success message.
