import pg from 'pg';
const {Pool} = pg

const pool = new Pool({
  user: 'Dev',    
  host: 'localhost',       
  database: 'FZ',   
  password: 'dev',  
  port: 5432,                 
});

export default pool;
