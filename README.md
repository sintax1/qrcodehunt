# QRHunt

QRHunt is a game similar to a scavenger hunt using QR Codes. The gameplay follows these steps:

1. Receive a hint in the form of a photo with optional text.
2. Try to find the hidden qr code. After some duration, receive another hint until you reach a totoal of 3 hints.
3. Scan the QR Code once you find it.
4. Receive a clue for the next step, rinse and repeat until the end.

### Setup a new Hunt

Follow these steps to create a QR Hunt.

1. Click *Setup* and enter the admin password (default: _supersecret_)
2. Click *New Hunt*
3. Enter the Hunt Settings such as name, hint timer and randomization. Click *Save*
4. Receive a link, go print QR codes.
5. Start taking pictures of the clues and attaching QR codes.
6. Click *Done* when finished.

## Development

```
QRCodeHunt
├───backend-server  // Backend services
│   ├───mongodb     // nosql db
│   └───nodejs      // node server (api/REST)
└───qrcodehunt      // Front End App
```

### Build/Install apk for Android

1. In Android Studio, navigate to Build->Generate Signed APK
2. follow the prompts
3. Ensure device is plugged in a visible adb
    ```
    > adb devices
    List of devices attached
    8de72b8a        device
    ```
4. install with adb
    ```
    adb install <release path>\app-release.apk
    ```

### Starting the Android Dev environment

1. Connect Android device via usb.
2. Setup tcp tunnel so android device can connect to Metro Server.
    ```
    adb reverse tcp:8081 tcp:8081
    ```
3. Start the Metro Server
    ```
    QRCodeHunt\qrcodehunt> react-native start --reset-cache
    ```
4. Open _qrcodehunt/android_ with Android Studio, Build & Run the App.

### Starting the backend services

1. Clone or pull the latest source
    ```
    git clone https://github.com/sintax1/qrcodehunt.git

    backend-server]$ git pull
    ```
2. Build and Run with docker-compose
    ```
    backend-server]$ sudo docker-compose up --build
    ```

#### Remove the mongo datastore

Follow these steps to clear the mongo db completely:

1. Delete the mongodb container
    ```
    sudo docker rm <mongodb container id>
    ```
2. Clear the data volume
    ```
    sudo docker volume prune
    ```
3. Rebuild the docker container

#### Login to mongo for manual queries

Follow these steps to login to mongodb container and run queries:

1. Get bash shell in the mongo container
    ```
    sudo docker exec -it <container id> /bin/bash
    ```
2. Start mongo cli
    ```
    mongo --username=<username>
    ```

3. Run queries
    ```
    > show dbs
    admin   0.000GB
    config  0.000GB
    local   0.000GB
    qrhunt  0.000GB
    > use qrhunt
    switched to db qrhunt
    > show collections
    adminusers
    hunts
    usersessions
    > db.hunts.find()
    ```