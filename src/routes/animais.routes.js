import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

async function listarAnimaisCMB(req, res, next) {
  try {
    const result = await pool.query("SELECT * FROM animais ORDER BY id ASC");
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
}

async function buscarAnimalPorIdCMB(req, res, next) {
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
}

async function criarAnimalCMB(req, res, next) {
  try {
    const { nome, especie, raca, data_nascimento, tutor_id } = req.body;

    if (!nome) {
      return res.status(400).json({ mensagem: "O campo nome é obrigatório" });
    }

    const result = await pool.query(
      `INSERT INTO animais (nome, especie, raca, data_nascimento, tutor_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nome, especie || null, raca || null, data_nascimento || null, tutor_id || null],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

// ROTAS
router.get("/", listarAnimaisCMB);
router.get("/:id", buscarAnimalPorIdCMB);
router.post("/", criarAnimalCMB);

export default router;
