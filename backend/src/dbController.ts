import pool from "./db.js"
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
const { hash, compare } = bcrypt;
interface TimeEntry {
    id: string;
    startDateTime: string;
    endDateTime: string;
    description?: string;
  }
const dbcalls = {
  addUser: async (email: string, password: string) => {
    const emails = dbcalls.getAllEmails();
    if (!email || !password) {
      throw new Error("Email and password are required");
    } else if ((await emails).includes(email)) {
      return { status: "error", message: "email Taken" };
    } else {
      try {
        const hashedPassword = await hash(password, 10);

        const insertQuery = `
            INSERT INTO users (email, password)
            VALUES ($1, $2)
            RETURNING id, email`;
        const values = [email, hashedPassword];

        const rows = await pool.query(insertQuery, values);
        if (rows) return { status: "ok" };
        else return { status: "error", message: "unknown database error" };
      } catch (error) {
        console.error("Error creating user:", error);
        throw error;
      }
    }
  },
  getAllEmails: async () => {
    const result = await pool.query("SELECT email FROM users");
    const emails = result.rows.map((row) => row.email);
    return emails;
  },
  validateUser: async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    try {
      const query = `
            SELECT id, email, password
            FROM users
            WHERE email = $1
          `;
      const values = [email];
      const { rows } = await pool.query(query, values);

      if (!rows.length) {
        return { status: "error", message: "User not found" };
      }

      const user = rows[0];
      const isMatch = await compare(password, user.password);

      if (!isMatch) {
        return { status: "error", message: "Invalid credentials" };
      }

      const payload = { id: user.id, email: user.email };
      const token = jwt.sign(payload, process.env.KEY, { expiresIn: "1h" });

      return { status: "ok", token: token };
    } catch (error) {
      console.error("Error validating user:", error);
      throw error;
    }
  },
  getAllEntriesByToken: async (token: string) => {
    if (!token) {
      return {status:"error", message:"Login required"}
    }
    try {
      const decoded = jwt.verify(token, process.env.KEY) as {
        id: string;
        email: string;
      };
      const userId = decoded.id;
      const query = `SELECT * FROM entries WHERE userid = $1`;
      const { rows } = await pool.query(query, [userId]);

      return { status: "ok", entries: rows };
    } catch (error) {
      console.error("Error in getAllEntriesByToken:", error);
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid token");
      }
      throw new Error("Unable to fetch entries");
    }
  },
  addUserEntry: async (token:string, data:TimeEntry){
    try {
        const decoded = jwt.verify(token, process.env.KEY) as { id: string };
        const userId = decoded.id;
    
        const insertQuery = `INSERT INTO entries (userid, startTime, endTime, description) VALUES ($1, $2::TIMESTAMP, $3::TIMESTAMP, $4) RETURNING *`;
          
        const values = [
          userId,
          data.startDateTime,
          data.endDateTime,
          data.description || null,
        ];
    
        const { rows } = await pool.query(insertQuery, values);
        return rows[0];
      } catch (error) {
        console.error("Error adding entry:", error);
        if (error instanceof jwt.JsonWebTokenError) {
          throw new Error("Invalid token");
        }
        throw new Error("Unable to add entry to database");
      }
    }
}


export default dbcalls;