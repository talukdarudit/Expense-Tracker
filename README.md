# Expense Tracker
This app helps employees to keep track of their expenses. Employees can add an expense(category, amount, date) and view a list of their expenses.
The admin can view all expenses, filter them and change the status(pending, approved, rejected).
The admin can also get insights about the expenses (total expenses per category and monthly expenses).

Highlights:

- 🌟 Tech stack: MERN + TailwindCSS + Daisy UI
- 🎃 Authentication && Authorization with JWT
- 👌 Global state management with Zustand
- 🐞 Error handling both on the server and on the client

### Setup .env file

```js
MONGODB_URI=...
PORT=5001
JWT_SECRET=...

NODE_ENV=development
```


## Deployment

To deploy this project

```shell
  cd backend
  npm install
  npm start
```
then,

```shell
  cd frontend
  npm install
  npm run dev
```
