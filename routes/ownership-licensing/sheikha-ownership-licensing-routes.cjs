"use strict";

const express = require("express");

const {
  createRouter
} = require(
  "../../runtime/ownership-licensing/" +
  "sheikha-ownership-licensing-http-adapter.cjs"
);

module.exports = createRouter({
  express,
  ownerVisible: true
});
