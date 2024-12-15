module.exports = {
    apps: [
        {
            name: "proxy-server",
            script: "./server.js",
            instances: 1,
            exec_mode: "fork",
        },
    ],
};
