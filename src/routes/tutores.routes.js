import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

// get de tutores
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM tutores ORDER BY id ASC");
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

// get de tutores por id
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM tutores WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensagem: "Tutor não encontrado" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// post de tuturoes
router.post("/", async (req, res, next) => {
  try {
    const { nome, telefone, email } = req.body;

    if (!nome || !telefone || !email) {
      return res.status(400).json({
        mensagem: "Nome, telefone e email são obrigatórios",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO tutores (nome, telefone, email)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [nome, telefone, email],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
