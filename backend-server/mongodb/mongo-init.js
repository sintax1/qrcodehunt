db.createUser(
    {
        user: "admin",
        pwd: "password",
        roles: [
            {
                role: "readWrite",
                db: "qrhunt"
            }
        ]
    }
);

db.adminusers.insert(
    {
        password: 'Supersecret' // supersecret
    }
);
