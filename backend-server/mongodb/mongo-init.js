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
        password: '$2y$08$WnXCLJqwcYdVoanXFH3UReCPvLnBdD6q.idKuFp6rIh9vquLVFWCm' // supersecret
    }
);
