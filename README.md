# todo list API

A simple and efficient task management application deployed on **Vercel**, with the database hosted on **Railway**.

## Tech Stack  
- **Backend:** Node.js, Express.js  
- **Database:** PostgreSQL (hosted on Railway)  
- **Authentication:** JWT (JSON Web Token)  
- **Frontend:** (If applicable, specify here)  

## Database Schema  
The application consists of two main tables:  

### `users_tbl`  
| Column          | Data Type           | Constraints  | Description                   |
|---------------|------------------|--------------|-------------------------------|
| `user_id`     | `INTEGER`        | PRIMARY KEY  | Unique identifier for users   |
| `name`        | `VARCHAR(255)`   | NOT NULL     | User's full name              |
| `email`       | `VARCHAR(255)`   | UNIQUE, NOT NULL | User's email address    |
| `password_hash` | `VARCHAR(255)` | NOT NULL     | Hashed password               |
| `created_at`  | `TIMESTAMP`      | DEFAULT now() | Record creation timestamp  |
| `updated_at`  | `TIMESTAMP`      | DEFAULT now() | Last update timestamp       |


### `todos_tbl`  
| Column          | Data Type           | Constraints  | Description                     |
|---------------|------------------|--------------|-------------------------------|
| `todo_id`     | `INTEGER`        | PRIMARY KEY  | Unique identifier for tasks   |
| `user_id`     | `INTEGER`        | FOREIGN KEY (`users_tbl`) | Task owner  |
| `title`       | `VARCHAR(255)`   | NOT NULL     | Task title                     |
| `description` | `TEXT`           | NULLABLE     | Task description               |
| `due_date`    | `DATE`           | NULLABLE     | Task deadline                  |
| `priority`    | `priority_type`  | NULLABLE     | Task priority level            |
| `is_completed`| `progress_type`  | NULLABLE     | Task completion status         |
| `created_at`  | `TIMESTAMP`      | DEFAULT now() | Task creation timestamp  |
| `updated_at`  | `TIMESTAMP`      | DEFAULT now() | Last update timestamp       |

--- 

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Features

- Add, edit, and delete tasks
- Mark tasks as completed
- Searching title task
- Filters by date, status, and difficulty level
- Persistent data storage with a Railway-hosted database

## Instalation

**Install Dependencies**

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Arropi/todo_app.git
   cd todo_app
   ```
   

2. **Install Dependencies**

   Ensure you have [Node.js](https://nodejs.org/) installed. Then, run:

   ```bash
   npm install
   ```

3. **Set Up Database**

    Ensure you have [PostgreSQL](https://www.postgresql.org/download/) installed on your system. Then :
    - Use provided schema to create table
    - Deploy your database to [Railway](https://railway.com/)
    - Save the database url
    
4. **Set Up Environment Variables**

   Create a `.env` file in the root directory and add the following variables:

   ```env
   DATABASE_URL=your_railway_database_url
   SECRET = your_secret_token
   ```

   Replace `your_railway_database_url` with your actual Railway database URL. And replace `your_secret_token` with whatever do you want to be secret token
   
## Usage

1. **Start the Application**

   ```bash
   npm start
   ```

2. **Access the Application**

   Open your browser and navigate to `http://localhost:3000` to use the app locally.
   
3. **API Endpoints**

    ### **Register a new user**
    #### Request
    - **Endpoint:** `POST /register`
    - **Body:**
  ```json
  {
    "username": "user123",
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
 
 **Response:**
- **If Register Succesfully:** 
  ```json
  {
    "message": "Registrasi akun barumu berhasil dibuat.",
    "user": {
      "id": 1,
      "username": "user123",
      "email": "user@example.com"
    }
  }
  ```
- **If Email Has Been Registered:**
```json
  {
    "message": "Email telah digunakan, Coba untuk gunakan alamat email yang lain."
  }
  ```

- **If Username, Email, or Password is Blank:**
```json
  {
    "message": "Validasi gagal nama, email, ataupun password tidak boleh kosong."
  }
  ```
  ---

### **Login user**
#### Request
- **Endpoint:** `POST /login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
**Response:**
- **If Login Succesfully:** 
  ```json
  {
    "token": "your-jwt-token",
    "user": {
      "id": 1,
      "username": "user123",
      "email": "user@example.com"
    }
  }
  ```

- **If Email or Password is Blank:**
```json
  {
    "message": "Validasi gagal email atau password tidak boleh kosong."
  }
  ```

- **If Email Not Registered:**
```json
  {
    "message": "Email tidak terdaftar, mohon untuk melakukan registrasi terlebih dahulu."
  }
  ```

- **If Password Incorrect:**
```json
  {
    "message": "Password salah, harap masukkan password dengan benar."
  }
  ```


---


### **Create a new to do**
- **Endpoint:** `POST /todos`
- **Headers:** 
  ```json
  {
    "Authorization": "Bearer your-jwt-token"
  }
  ```
- **Body:**
  ```json
  {
    "title": "Membuat Ayam Goreng",
    "description": "Bahan ada di kulkas", (Optional)
    "due_date": "2025-02-02", (Optional)
    "is_completed": "done", (Optional)
    "priority": "High" (Optional)
}
  ```
- **Response:**
  - **If Created Succesfully:**
  ```json
  {
    "message": "Post created successfully",
    "post": {
      "id": 1,
      "title": "My First Post",
      "content": "This is the content of my first post.",
      "authorId": 1
    }
  }
  ```
    - **If Title Empty:**
  ```json
  {
    "message": "Title tidak boleh kosong"
  }
  ```
    ---

### **Get all to do**
- **Endpoint:** `GET /todos`
- **Response:**
  ```json
  {
    "message": "Data berhasil didapatkan",
    "datas": [
        {
            "todo_id": 34,
            "title": "Masak Ikan",
            "description": "Bahan ada di kulkas",
            "due_date": "2025-01-08",
            "priority": "Low",
            "is_completed": "in progress"
        }
    ],
    "total": 1
}
  ```

    ---

### **Get a single to do by ID**
- **Endpoint:** `GET /todos/{todoId}`
- **Response:**
    - **If The Todos Available:** 
  ```json
  {
    "message": "Data Dengan User id = 12 & Todo id = 34 ",
    "datas": [
        {
            "todo_id": 34,
            "title": "Masak Ikan",
            "description": "Bahan ada di kulkas",
            "due_date": "2025-01-08",
            "priority": "Low",
            "is_completed": "in progress"
        }
    ]
}
  ```

    - **If The Todos Not Found:** 
  ```json
  {
    "message": "To Do tidak ditemukan"
  }
  ```
  
  ---

### **Update a post**
#### It can be only one or more to updated feature
- **Endpoint:** `PUT /todos/{todoId}`
- **Headers:** 
  ```json
  {
    "Authorization": "Bearer your-jwt-token"
  }
  ```
- **Body:**
  ```json
  {
    "title" : "Masak Ikan",
    "due_date":  "2025-01-08",
    "is_completed": "in progress",
    "priority": "Low"
}
  ```
- **Response:**
    - **If The Todos Not Found:** 
  ```json
  {
    "message": "To Do tidak ditemukan"
  }
  ```

    - **If The Updated Succesfully:**
  ```json
  {
    "message": "Data berhasil diupdate",
    "datas": [
        {
            "todo_id": 34,
            "title": "Masak Ikan",
            "description": "Bahan ada di kulkas",
            "due_date": "2025-01-08",
            "priority": "Low",
            "is_completed": "in progress"
        }
    ]
  }
  ```
  
  ---  

### **Delete a post**
- **Endpoint:** `DELETE /todos/{todoId}`
- **Headers:** 
  ```json
  {
    "Authorization": "Bearer your-jwt-token"
  }
  ```
- **Response:**
    - **If The Todos Available:** 
  ```json
  {
    "message": "To Do dengan user id 12 dan todo id 34 berhasil dihapus"
  }
  ```
  - **If The Todos Not Found:** 
  ```json
  {
    "message": "To Do tidak ditemukan"
  }
  ```

---
### **When Server Error Will Be Give 505 Status**
### **Filtering Access**
#### **For filtering will hit by query:**
- `search=? `
- **Date:**
    - `start=? `
    - `end=?`
- `priority=?`
- `is_completed`

---

## **Accsess for our direct filtering:**
    
