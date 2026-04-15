export function errorHandlerCMB(error, req, res, next) {
  console.error(error);

  res.status(500).json({
    mensagem: "Erro interno do servidor",
    erro: error.message,
  });
}

export function notFoundCMB(req, res, next) {
  res.status(404).json({
    mensagem: "Rota não encontrada",
  });
}
