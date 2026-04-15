export function notFoundCMB(req, res, next) {
  res.status(404).json({
    mensagem: "Rota não encontrada",
  });
}
