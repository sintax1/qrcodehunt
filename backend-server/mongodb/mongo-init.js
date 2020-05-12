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

db.AdminUser.insert(
    {
        password: 'supersecret' // supersecret
    }
);
