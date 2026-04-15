import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

async function listarConsultasCMB(req, res, next) {
  try {
    const result = await pool.query(`
      SELECT 
        consultas.*,
        animais.nome AS animal_nome,
        tutores.nome AS tutor_nome
      FROM consultas
      JOIN animais ON consultas.animal_id = animais.id
      JOIN tutores ON animais.tutor_id = tutores.id
      ORDER BY consultas.id ASC
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
}

async function buscarConsultaPorIdCMB(req, res, next) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        consultas.*,
        animais.nome AS animal_nome,
        tutores.nome AS tutor_nome
      FROM consultas
      JOIN animais ON consultas.animal_id = animais.id
      JOIN tutores ON animais.tutor_id = tutores.id
      WHERE consultas.id = $1
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensagem: "Consulta não encontrada" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

async function criarConsultaCMB(req, res, next) {
  try {
    const { animal_id, data_consulta, motivo, diagnostico, veterinario } = req.body;

    if (!animal_id || !data_consulta) {
      return res.status(400).json({
        mensagem: "animal_id e data_consulta são obrigatórios",
      });
    }

    const animal = await pool.query("SELECT id FROM animais WHERE id = $1", [animal_id]);

    if (animal.rows.length === 0) {
      return res.status(404).json({ mensagem: "Animal não encontrado" });
    }

    const result = await pool.query(
      `
      INSERT INTO consultas (animal_id, data_consulta, motivo, diagnostico, veterinario)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [animal_id, data_consulta, motivo || null, diagnostico || null, veterinario || null],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

async function atualizarConsultaCMB(req, res, next) {
  try {
    const { id } = req.params;
    const { animal_id, data_consulta, motivo, diagnostico, veterinario } = req.body;

    if (!animal_id || !data_consulta) {
      return res.status(400).json({
        mensagem: "animal_id e data_consulta são obrigatórios",
      });
    }

    const consulta = await pool.query("SELECT id FROM consultas WHERE id = $1", [id]);

    if (consulta.rows.length === 0) {
      return res.status(404).json({ mensagem: "Consulta não encontrada" });
    }

    const animal = await pool.query("SELECT id FROM animais WHERE id = $1", [animal_id]);

    if (animal.rows.length === 0) {
      return res.status(404).json({ mensagem: "Animal não encontrado" });
    }

    const result = await pool.query(
      `
      UPDATE consultas
      SET animal_id = $1,
          data_consulta = $2,
          motivo = $3,
          diagnostico = $4,
          veterinario = $5
      WHERE id = $6
      RETURNING *
      `,
      [animal_id, data_consulta, motivo || null, diagnostico || null, veterinario || null, id],
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

async function deletarConsultaCMB(req, res, next) {
  try {
    const { id } = req.params;

    const consulta = await pool.query("SELECT id FROM consultas WHERE id = $1", [id]);

    if (consulta.rows.length === 0) {
      return res.status(404).json({ mensagem: "Consulta não encontrada" });
    }

    await pool.query("DELETE FROM consultas WHERE id = $1", [id]);

    res.status(200).json({ mensagem: "Consulta removida com sucesso" });
  } catch (error) {
    next(error);
  }
}

async function listarConsultasPorAnimalCMB(req, res, next) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        consultas.*,
        animais.nome AS animal_nome,
        tutores.nome AS tutor_nome
      FROM consultas
      JOIN animais ON consultas.animal_id = animais.id
      JOIN tutores ON animais.tutor_id = tutores.id
      WHERE animais.id = $1
      ORDER BY consultas.data_consulta DESC
      `,
      [id],
    );

    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
}

// ROTAS
router.get("/", listarConsultasCMB);
router.get("/:id", buscarConsultaPorIdCMB);
router.post("/", criarConsultaCMB);
router.put("/:id", atualizarConsultaCMB);
router.delete("/:id", deletarConsultaCMB);
router.get("/animais/:id/consultas", listarConsultasPorAnimalCMB);

export default router;
