// // backend/db-windows-multi.js
// require('dotenv').config();
// const sql = require('mssql/msnodesqlv8'); 
// const util = require('util');
// const { execSync } = require('child_process');

// const INSPECT_OPTS = { showHidden: true, depth: null };

// const LOG = (lvl, ...args) => {
//   const ts = new Date().toISOString();
//   console.log(`[${ts}] [${lvl}]`, ...args.map(a => (typeof a === 'string' ? a : util.inspect(a, INSPECT_OPTS))));
// };

// function mask(s) {
//   if (!s) return s;
//   return String(s).replace(/(Password=)[^;]+/i, '$1****');
// }

// const env = {
//   server: process.env.DB_SERVER || 'DESKTOP-087JI60',
//   database: process.env.DB_NAME || 'School Managment System',
//   instance: process.env.DB_INSTANCE || undefined,
//   port: process.env.DB_PORT || '1433',
//   driverName: process.env.DB_DRIVER || 'ODBC Driver 17 for SQL Server',
//   connectionTimeout: parseInt(process.env.CONNECTION_TIMEOUT || '20000', 10),
// };

// // print whoami
// try {
//   const who = execSync('whoami', { encoding: 'utf8' }).trim();
//   LOG('INFO', 'Process running as (whoami):', who);
// } catch (e) {
//   LOG('WARN', 'whoami unavailable:', e && e.message ? e.message : e);
// }

// // candidate connection strings / servers to try (order matters: more specific first)
// const candidates = [];

// // 1) explicit ODBC connection string (no instance)
// candidates.push({
//   label: 'ODBC connectionString - machine name',
//   connectionString: `Driver={${env.driverName}};Server=${env.server};Database=${env.database};Trusted_Connection=Yes;Connection Timeout=${Math.round(env.connectionTimeout/1000)};`,
// });

// // 2) if instance provided, ODBC with instance
// if (env.instance) {
//   candidates.push({
//     label: 'ODBC connectionString - machine\\instance',
//     connectionString: `Driver={${env.driverName}};Server=${env.server}\\${env.instance};Database=${env.database};Trusted_Connection=Yes;Connection Timeout=${Math.round(env.connectionTimeout/1000)};`,
//   });
// }

// // 3) machine,port
// if (env.port) {
//   candidates.push({
//     label: 'ODBC connectionString - machine,port',
//     connectionString: `Driver={${env.driverName}};Server=${env.server},${env.port};Database=${env.database};Trusted_Connection=Yes;Connection Timeout=${Math.round(env.connectionTimeout/1000)};`,
//   });
// }

// // 4) localhost variants
// candidates.push({
//   label: 'ODBC connectionString - localhost',
//   connectionString: `Driver={${env.driverName}};Server=localhost;Database=${env.database};Trusted_Connection=Yes;Connection Timeout=${Math.round(env.connectionTimeout/1000)};`,
// });
// candidates.push({
//   label: 'ODBC connectionString - 127.0.0.1',
//   connectionString: `Driver={${env.driverName}};Server=127.0.0.1;Database=${env.database};Trusted_Connection=Yes;Connection Timeout=${Math.round(env.connectionTimeout/1000)};`,
// });

// // 5) msnodesqlv8 object-style (try machine + instanceName option)
// candidates.push({
//   label: 'msnodesqlv8 config object (instanceName if provided)',
//   configObject: {
//     server: env.server,
//     database: env.database,
//     driver: 'msnodesqlv8',
//     options: {
//       trustedConnection: true,
//       trustServerCertificate: true,
//       instanceName: env.instance || undefined
//     },
//     connectionTimeout: env.connectionTimeout,
//     requestTimeout: env.connectionTimeout,
//   }
// });

// // helper to attempt a connect using either connectionString or config object
// async function attempt(candidate) {
//   LOG('INFO', 'Attempting:', candidate.label);
//   if (candidate.connectionString) {
//     LOG('DEBUG', 'connectionString (masked):', mask(candidate.connectionString));
//   } else {
//     // mask any obvious password fields (none for Windows auth)
//     const cpy = JSON.parse(JSON.stringify(candidate.configObject));
//     if (cpy.password) cpy.password = '****';
//     LOG('DEBUG', 'configObject (masked):', cpy);
//   }

//   try {
//     // ensure we always create an isolated connection attempt
//     const connArg = candidate.connectionString ? { connectionString: candidate.connectionString } : candidate.configObject;
//     const pool = await sql.connect(connArg);
//     LOG('SUCCESS', `Connected using: ${candidate.label}`);
//     // query who/where we connected as and current DB
//     try {
//       const r = await pool.request().query(`SELECT SUSER_SNAME() as current_user_name, DB_NAME() as current_db`);
//       LOG('RESULT', r.recordset);
//     } catch (qerr) {
//       LOG('WARN', 'Connected but query failed:', util.inspect(qerr, INSPECT_OPTS));
//     }
//     await pool.close();
//     return { ok: true, label: candidate.label };
//   } catch (err) {
//     // deep inspect and return
//     LOG('ERROR', `Failed: ${candidate.label}`);
//     try { LOG('ERROR', util.inspect(err, INSPECT_OPTS)); } catch (e) { LOG('ERROR', 'inspect err failed', e); }
//     // JSON fallback
//     try {
//       const seen = new WeakSet();
//       const json = JSON.stringify(err, (k, v) => {
//         if (v && typeof v === 'object') {
//           if (seen.has(v)) return '[Circular]';
//           seen.add(v);
//         }
//         if (typeof v === 'function') return v.toString();
//         return v;
//       }, 2);
//       LOG('ERROR', 'err (json):', json);
//     } catch (e) {
//       LOG('ERROR', 'json stringify failed', e);
//     }
//     return { ok: false, label: candidate.label, error: err };
//   }
// }

// (async () => {
//   LOG('INFO', 'Starting multi-connect attempts. Candidates count:', candidates.length);
//   const results = [];
//   for (const c of candidates) {
//     const r = await attempt(c);
//     results.push(r);
//     // if connected, stop further attempts
//     if (r.ok) break;
//     // small pause between tries to avoid flaky behavior
//     await new Promise(res => setTimeout(res, 300));
//   }

//   const success = results.find(r => r.ok);
//   if (success) {
//     LOG('DONE', `Successfully connected with: ${success.label}`);
//     return;
//   }

//   LOG('FINAL', 'No candidate connected. Summary of failures:');
//   results.forEach((r, i) => {
//     LOG('FAIL', `#${i + 1}`, r.label, (r.error && r.error.message) || 'no message');
//   });

//   LOG('ACTION', 'Run these checks now (one-liners):');
//   LOG('ACTION', '1) Can this Windows user connect via sqlcmd (runs as same user?):');
//   LOG('ACTION', '   sqlcmd -S ' + env.server + ' -E -Q "SELECT SUSER_SNAME(), DB_NAME()"');
//   LOG('ACTION', '   If that works, note the printed user and run this script again in the same terminal.');
//   LOG('ACTION', '2) Ensure TCP/IP is enabled for the SQL Server instance: open "SQL Server Configuration Manager" -> SQL Server Network Configuration -> Protocols for <instance> -> Enable TCP/IP and restart SQL Server service.');
//   LOG('ACTION', '3) If using a named instance, ensure "SQL Server Browser" service is running (so instance name resolves), or set DB_INSTANCE and DB_PORT to the instance port.');
//   LOG('ACTION', '4) If sqlcmd fails with login denied, add the Windows login to SQL Server (in SSMS run as admin):');
//   LOG('ACTION', '   /* replace DESKTOP-087JI60\\hp with your whoami value */');
//   LOG('ACTION', '   CREATE LOGIN [DESKTOP-087JI60\\hp] FROM WINDOWS;');
//   LOG('ACTION', '   USE Student_management; CREATE USER [DESKTOP-087JI60\\hp] FOR LOGIN [DESKTOP-087JI60\\hp];');
//   LOG('ACTION', '   ALTER ROLE db_datareader ADD MEMBER [DESKTOP-087JI60\\hp]; ALTER ROLE db_datawriter ADD MEMBER [DESKTOP-087JI60\\hp];');
//   LOG('ACTION', '5) If native driver still errors but sqlcmd works: re-install msnodesqlv8 and ensure Node uses x64 (node -p "process.arch")');
//   LOG('ACTION', '   npm ci && npm i msnodesqlv8 --save (watch for build errors).');

//   LOG('INFO', 'If you want, copy/paste the most recent error block above and I will parse it and give the exact one-line fix.');
// })();







// backend/db.cjs
require("dotenv").config();
const sql = require("mssql/msnodesqlv8");

const connectionString = `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER || "DESKTOP-087JI60"};Database=${process.env.DB_NAME || "School Managment System"};Trusted_Connection=Yes;`;

const poolPromise = sql.connect({ connectionString })
  .then(pool => {
    console.log("✅ Connected to SQL Server with ODBC Driver 17");
    return pool;
  })
  .catch(err => {
    console.error("❌ SQL Server connection failed:", err);
    throw err;
  });

module.exports = {
  sql,
  poolPromise,
};