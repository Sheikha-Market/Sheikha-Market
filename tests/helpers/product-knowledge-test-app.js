'use strict';

const express = require('express');
const productKnowledgeRoutes = require('../../routes/product-knowledge/product-knowledge.routes');

const app = express();

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/product-knowledge', productKnowledgeRoutes);

module.exports = app;
