require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 1814;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MDBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

const appSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
});

const App = mongoose.model('App', appSchema);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.post('/save-app', async (req, res) => {
  const { name, image, description } = req.body;
  try {
    const newApp = new App({ name, image, description });
    await newApp.save();
    res.status(200).json({ message: 'App saved successfully', app: newApp });
  } catch (error) {
    res.status(500).json({ message: 'Error saving app', error });
  }
});

app.get('/get-apps', async (req, res) => {
  try {
    const apps = await App.find();
    res.status(200).json(apps);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching apps', error });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
