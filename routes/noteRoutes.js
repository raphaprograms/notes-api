const router = require('express').Router();
const Note  = require('../models/Note');
const { authMiddleware } = require('../middleware/auth');
 
// Apply authMiddleware to all routes in this file
router.use(authMiddleware);
 
// GET /api/notes - Get all notes for the logged-in user
// THIS IS THE ROUTE THAT CURRENTLY HAS THE FLAW
router.get('/', async (req, res) => {
  // This currently finds all notes in the database.
  // It should only find notes owned by the logged in user.
  try {
    console.log(req.user);
    
    const notes = await Note.find({});
    console.log(notes);
    
    res.json(notes);
  } catch (err) {
    res.status(500).json(err);
  }
});
 
// POST /api/notes - Create a new note
router.post('/', async (req, res) => {
  try {
    const note = await Note.create({
      ...req.body,
      // The user ID needs to be added here
      user: req.user._id
    });
    res.status(201).json(note);
  } catch (err) {
    res.status(400).json(err);
  }
});
 
// PUT /api/notes/:id - Update a note
router.put('/:id', async (req, res) => {
  try {
  // This needs an authorization check
  const noteToUpdate = await Note.findById(req.params.id)

    if (!noteToUpdate) {
      return res.status(404).json({ message: 'No note found with this id!' });
    }

    if(req.user._id !== noteToUpdate.user.toString()) {
      
      return res.status(403).json({ message: 'This is not your note!' });
    }

    const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!note) {
      return res.status(404).json({ message: 'No note found with this id!' });
    }
    res.json({ message: 'Note updated!' });
  } catch (err) {
    res.status(500).json(err);
  }
});
 
// DELETE /api/notes/:id - Delete a note
router.delete('/:id', async (req, res) => {
  try {
    // This needs an authorization check
    const noteToDelete = await Note.findById(req.params.id)

       if(req.user._id !== noteToDelete.user.toString()) {
      
      return res.status(403).json({ message: 'This is not your note!' });
    }

    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'No note found with this id!' });
    }

    res.json({ message: 'Note deleted!' });

  } catch (err) {
    res.status(500).json(err);
  }
});
 
module.exports = router;