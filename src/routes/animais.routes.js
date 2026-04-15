import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

// get de animais
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM animais ORDER BY id ASC");
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

// get de animais por id
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM animais WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensagem: "Animal não encontrado" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// post de animais
router.post("/", async (req, res, next) => {
  try {
    const { nome, especie, raca, idade, tutor_id } = req.body;

    if (!nome || !especie || !raca || idade === undefined || !tutor_id) {
      return res.status(400).json({
        mensagem: "Nome, espécie, raça, idade e tutor_id são obrigatórios",
      });
    }

    const tutorExiste = await pool.query("SELECT * FROM tutores WHERE id = $1", [tutor_id]);

    if (tutorExiste.rows.length === 0) {
      return res.status(404).json({ mensagem: "Tutor não encontrado" });
    }

    const result = await pool.query(
      `
      INSERT INTO animais (nome, especie, raca, idade, tutor_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [nome, especie, raca, idade, tutor_id],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
