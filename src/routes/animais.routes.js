import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM animais ORDER BY id ASC");
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

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

router.post("/", async (req, res, next) => {
  try {
    const { nome, especie, raca, data_nascimento, tutor_id } = req.body;

    if (!nome) {
      return res.status(400).json({
        mensagem: "O campo nome é obrigatório",
      });
    }

    if (tutor_id) {
      const tutorExiste = await pool.query("SELECT * FROM tutores WHERE id = $1", [tutor_id]);

      if (tutorExiste.rows.length === 0) {
        return res.status(404).json({ mensagem: "Tutor não encontrado" });
      }
    }

    const result = await pool.query(
      `
      INSERT INTO animais (nome, especie, raca, data_nascimento, tutor_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [nome, especie || null, raca || null, data_nascimento || null, tutor_id || null],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.get("/:id/consultas", async (req, res, next) => {
  try {
    const { id } = req.params;

    const animalExiste = await pool.query("SELECT * FROM animais WHERE id = $1", [id]);

    if (animalExiste.rows.length === 0) {
      return res.status(404).json({ mensagem: "Animal não encontrado" });
    }

    const result = await pool.query(
      `
      SELECT
        consultas.id AS consulta_id,
        consultas.data_consulta,
        consultas.motivo,
        consultas.diagnostico,
        consultas.veterinario,
        animais.id AS animal_id,
        animais.nome AS animal_nome,
        animais.especie,
        animais.raca,
        animais.data_nascimento
      FROM consultas
      INNER JOIN animais ON consultas.animal_id = animais.id
      WHERE animais.id = $1
      ORDER BY consultas.data_consulta ASC
      `,
      [id],
    );

    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

export default router;
