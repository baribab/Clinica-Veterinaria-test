export function notFound(req, res, next) {
  res.status(404).json({
    mensagem: "Rota não encontrada",
  });
}
