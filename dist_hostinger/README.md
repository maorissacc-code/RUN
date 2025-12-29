# Deploying to Windows EC2 (Windows 11 / Server)

## 1. Prerequisites (On the Server)
1.  **Install Node.js**:
    - Download and install the **Node.js LTS** version (`.msi`) from [nodejs.org](https://nodejs.org/).
    - During installation, ensure "Add to PATH" is selected.
2.  **Allow Port 3000/80**:
    - Go to your AWS Console -> EC2 -> Security Groups.
    - Add an Inbound Rule: Protocol `TCP`, Port `3000` (or `80`), Source `0.0.0.0/0`.

## 2. Installation
1.  **Copy Files**:
    - Copy this entire folder (`dist_hostinger`) to `C:\melzarim` (or any location) on your Windows server.
2.  **Install Dependencies**:
    - Open **PowerShell** as Administrator.
    - Navigate to the folder:
      ```powershell
      cd C:\melzarim
      ```
    - Run the install script:
      ```powershell
      npm run install-deps
      ```

## 3. Running the App
1.  **Start Helper**:
    - To start the app simply:
      ```powershell
      npm start
      ```
    - The app is now running on `http://localhost:3000`.

2.  **Production Service (Keep alive)**:
    - Install PM2 globally:
      ```powershell
      npm install -g pm2 pm2-windows-startup
      ```
    - Start the app:
      ```powershell
      pm2 start server/app.js --name melzarim
      ```
    - Save and Setup Startup:
      ```powershell
      pm2-startup install
      pm2 save
      ```

## 4. Connect Domain (Port 80 -> 3000)
To visit your site without typing `:3000`, run this command in PowerShell (Admin) to forward port 80 to 3000:

```powershell
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=80 connectaddress=127.0.0.1 connectport=3000
```

Now you can visit `http://YOUR_SERVER_IP` or `http://xflow.maortherapist.co.il` (if DNS points to this IP).
