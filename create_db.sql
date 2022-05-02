CREATE DATABASE dietapp;

USE dietapp;

CREATE TABLE users (
  user_id INT NOT NULL UNIQUE AUTO_INCREMENT,
  firstname VARCHAR(50) NOT NULL,
  lastname VARCHAR(50) NOT NULL,
  email VARCHAR(60) NOT NULL,
  password TEXT NOT NULL,
  PRIMARY KEY(user_id)
);