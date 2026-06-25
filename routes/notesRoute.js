const express = require('express')
const router = express.Router();
const Notes = require('../models/notes')
const protect = require('../middleware/auth')

router.get('/notes', protect, async (req, res, next) => {
    try {
        console.log('coming')
        const myNotes = await Notes.find({ author: req.user.id });

        res.status(200).json({
            success: true,
            notes: myNotes
        })
    } catch (error) {
        next(error)
    }
})

router.get('/notes/:id', protect, async (req, res, next) => {
    const { id } = req.params;
    try {
        const Note = await Notes.findById(id);

        if (!Note) {
            return res.status(404).json({
                message: "Something went wrong!"
            })
        }

        res.status(200).json({
            success: true,
            notes: Note
        })
    } catch (error) {
        next(error);
    }
})

router.post('/notes', protect, async (req, res, next) => {
    try {
        const { title, body } = req.body;
        const newNote = new Notes({ title, body, author: req.user.id });
        await newNote.save();

        res.status(201).json({
            success: true,
            note: newNote
        })
    } catch (error) {
        next(error);
    }
})

router.put('/notes/:id', protect, async (req, res, next) => {
    try {
        const note = await Notes.findById(req.params.id)

        if (!note) {
            return res.status(404).json({
                message: "Note not Found!"
            })
        }

        if (note.author.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Not Authorized!"
            })
        }

        const { title, body, pinned } = req.body;
        const updatedNote = await Notes.findByIdAndUpdate(req.params.id, { title, body, pinned }, { new: true });

        res.status(200).json({
            success: true,
            note: updatedNote
        })
    } catch (error) {
        next(error)
    }
})

router.delete('/notes/:id', protect, async (req, res, next) => {
    try {
        const note = await Notes.findById(req.params.id)

        if (!note) {
            return res.status(404).json({
                message: "Note not Found!"
            })
        }

        if (note.author.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Not Authorized!"
            })
        }

        const deletedNote = await Notes.findByIdAndDelete(req.params.id);
        res.status(204).send()
    } catch (error) {
        next(error);
    }
})

module.exports = router
