const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");

const isDev = !app.isPackaged;

const HOST = "127.0.0.1";
const PORT = 3000;
const APP_URL = `http://${HOST}:${PORT}`;

let mainWindow;
let nextServer;

function startNextServer() {
  return new Promise((resolve, reject) => {
    const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

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

async function waitForNextServer(resolve, reject) {
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
      // Server belum siap, coba lagi.
    }

    if (attempts >= maxAttempts) {
      reject(new Error("Next.js tidak berhasil dijalankan dalam 60 detik."));
      return;
    }

    setTimeout(checkServer, 1000);
  };

  checkServer();
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