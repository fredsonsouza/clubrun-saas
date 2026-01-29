# Club Run Saas

This project contains all the necessary boilerplate to setup a multi-tenant SaaS with Next.js including authentication and RBAC authorization.

## Features

### Authentication

- [ ] It should be able to authenticate using e-mail & password;
- [ ] It should be able to authenticate using Gmail, Outlook or another e-mail account;
- [ ] It should be able to recover password using e-mail;
- [ x ] It should be able to create an account (e-mail, name and password);

### Clubs

- [ ] It should be able to create a new club;
- [ ] It should be able to get club to which the user belongs;
- [ ] It should be able to update an club;
- [ ] It should be able to shutdown an club;
- [ ] It should be able to transfer club ownership;

### Invites

- [ ] It should be able to invite a new member (e-mail, role);
- [ ] It should be able to accept an invite;
- [ ] It should be able to revoke a pending invite;

### Members

- [ ] It should be able to get club members;
- [ ] It should be able to update a member role;

### Workouts

- [ ] It should be able to get workouts within a club;
- [ ] It should be able to create a new workout (athlete, club, distance, date, type: long, short..);
- [ ] It should be able to update a workout (athlete, club, distance, date, type: long, short..);
- [ ] It should be able to delete a workout;

### Billing

- [ ] It should be able to get billing details for club ($20 per project / $10 per member excluding billing role);

## RBAC

Roles & permissions.

### Roles

- Owner (count as administrator)
- Administrator
- Member
- Coach
- Billing (one per organization)
- Anonymous

### Permissions table

|                        | Owner | Administrator | Member | Coach | Billing | Anonymous |
| ---------------------- | ----- | ------------- | ------ | ----- | ------- | --------- |
| Update club            |       | ✅            | ❌     |       | ❌      | ❌        |
| Delete club            |       | ✅            | ❌     |       | ❌      | ❌        |
| Invite a member        |       | ✅            | ❌     |       | ❌      | ❌        |
| Revoke an invite       |       | ✅            | ❌     |       | ❌      | ❌        |
| List members           |       | ✅            | ✅     |       | ✅      | ❌        |
| Transfer ownership     |       | ⚠️            | ❌     |       | ❌      | ❌        |
| Update member role     |       | ✅            | ❌     |       | ❌      | ❌        |
| Delete member          |       | ✅            | ⚠️     |       | ❌      | ❌        |
| List workouts          |       | ✅            | ✅     |       | ✅      | ❌        |
| Create a new workout   |       | ✅            | ✅     |       | ❌      | ❌        |
| Update a workout       |       | ✅            | ⚠️     |       | ❌      | ❌        |
| Delete a workout       |       | ✅            | ⚠️     |       | ❌      | ❌        |
| Get billing details    |       | ✅            | ❌     |       | ✅      | ❌        |
| Export billing details |       | ✅            | ❌     |       | ✅      | ❌        |

> ✅ = allowed
> ❌ = not allowed
> ⚠️ = allowed w/ conditions

#### Conditions

- Only owners may transfer clubs ownership;
- Only administrators and workout authors may update/delete the workout;
- Members can leave their own club;
