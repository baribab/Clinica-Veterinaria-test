export function errorHandler(error, req, res, next) {
  console.error(error);

  res.status(500).json({
    mensagem: 'Erro interno do servidor',
    erro: error.message,
  });
}
