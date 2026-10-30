
const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

app.setName("Buku Tabungan Digital");

const isDev = !app.isPackaged;

const HOST = "127.0.0.1";
const PORT = 3000;
const APP_URL = `http://${HOST}:${PORT}`;

let mainWindow;
let nextServer;

function waitForNextServer(resolve, reject) {
  const maxAttempts = 60;
  let attempts = 0;

  const checkServer = async () => {
    attempts++;

    try {
      const response = await fetch(APP_URL);

      if (response.ok || response.status < 500) {
        resolve();
        return;
      }
    } catch {
      // Server belum siap.
    }

    if (attempts >= maxAttempts) {
      reject(
        new Error("Next.js tidak berhasil dijalankan dalam 60 detik.")
      );
      return;
    }

    setTimeout(checkServer, 1000);
  };

  checkServer();
}

function startNextServer() {
  return new Promise((resolve, reject) => {
    const npmCommand =
      process.platform === "win32" ? "npm.cmd" : "npm";

    nextServer = spawn(
      npmCommand,
      [
        "run",
        "dev",
        "--",
        "--hostname",
        HOST,
        "--port",
        String(PORT),
      ],
      {
        cwd: app.getAppPath(),
        env: {
          ...process.env,
          HOSTNAME: HOST,
          PORT: String(PORT),
          NEXT_TELEMETRY_DISABLED: "1",
        },
        stdio: "inherit",
        shell: process.platform === "win32",
      }
    );

    nextServer.once("error", reject);

    nextServer.once("exit", (code) => {
      if (code !== 0 && code !== null) {
        console.error(`Next.js berhenti dengan kode: ${code}`);
      }
    });

    waitForNextServer(resolve, reject);
  });
}

async function startProductionServer() {
  // Inisialisasi database khusus komputer pengguna.
  const { initializeDatabase } = require("./database.cjs");

  const databasePath = path.join(
    app.getPath("userData"),
    "data.db"
  );

  const migrationsPath = path.join(
    process.resourcesPath,
    "prisma",
    "migrations-sqlite"
  );

  initializeDatabase(databasePath, migrationsPath);

  // Lokasi Next.js standalone.
  const standalonePath = path.join(
    process.resourcesPath,
    "standalone"
  );

  const serverPath = path.join(
    standalonePath,
    "server.js"
  );

  const databaseUrl = `file:${databasePath.replace(/\\/g, "/")}`;

  nextServer = spawn(
    process.execPath,
    [serverPath],
    {
      cwd: standalonePath,
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
        NODE_ENV: "production",
        DATABASE_URL: databaseUrl,
        HOSTNAME: HOST,
        PORT: String(PORT),
        NEXT_TELEMETRY_DISABLED: "1",
      },
      stdio: "inherit",
      windowsHide: true,
    }
  );

  nextServer.once("error", (error) => {
    console.error("Gagal menjalankan Next.js:", error);
  });

  nextServer.once("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.error(`Next.js berhenti dengan kode: ${code}`);
    }
  });

  await new Promise((resolve, reject) => {
    waitForNextServer(resolve, reject);
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "Buku Tabungan Digital",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({
    action: "deny",
  }));

  await mainWindow.loadURL(APP_URL);
}

app.whenReady().then(async () => {
  try {
    if (isDev) {
      await startNextServer();
    } else {
      await startProductionServer();
    }

    await createWindow();
  } catch (error) {
    console.error("Gagal menjalankan aplikasi:", error);
    app.quit();
  }
});

app.on("before-quit", () => {
  if (nextServer && !nextServer.killed) {
    nextServer.kill();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
