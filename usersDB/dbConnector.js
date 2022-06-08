const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('postgres://postgres:root@localhost:5432/NotesUsers', {
    dialect: 'postgres'
});

const User = sequelize.define('User', {
    // Model attributes are defined here
    email:{
        type: DataTypes.CHAR,
        allowNull: false
    },
    passHash:{
        type: DataTypes.CHAR,
        allowNull: false
    }
}, {
    // Other model options go here
});

(async () => {
    await sequelize.sync({ force: false });
})();

module.exports = {User};
