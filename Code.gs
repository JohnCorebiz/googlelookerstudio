// Função para autenticação
var cc = DataStudioApp.createCommunityConnector();

function getAuthType() {
  var AuthTypes = cc.AuthType;
  return cc
    .newAuthTypeResponse()
    .setAuthType(AuthTypes.NONE)
    .build();
}


// Função para configurar as opções da fonte de dados
function getConfig(request) {
  var config = cc.getConfig();

  config.newTextInput()
    .setId('accountName')
    .setName('Nome da conta VTEX')
    .setHelpText('Digite o nome da conta VTEX, a mesma que consta na URL ao acessar a conta do cliente.')
    .setPlaceholder('Digite aqui o nome da conta VTEX');

  config.newTextInput()
    .setId('apiKey')
    .setName('Chave de API')
    .setHelpText('Digite a chave de API da VTEX (apikey).')
    .setPlaceholder('Digite aqui a chave de API da VTEX');

  config.newTextInput()
    .setId('appToken')
    .setName('Token de Aplicativo')
    .setHelpText('Digite seu token de aplicativo da VTEX, fornecida junto da chave de API.')
    .setPlaceholder('Digite aqui o toke de aplicativo da VTEX');

  config.setdateRangeRequired(false);

  return config.build();
}


// Função para obter o esquema dos dados
function getSchema(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;

  var orderid = fields.newDimension()
      .setId('orderId')
      .setName('ID do pedido')
      .setDescription('O ID individual do pedido')
      .setType(types.TEXT)
      .setIsHidden(true);

  var saleschannel = fields.newDimension()
      .setId('salesChannel')
      .setName('Canal de Vendas')
      .setDescription('O canal de vendas do pedido')
      .setType(types.TEXT)
      .setIsHidden(true);

  var creationdate = fields.newDimension()
      .setId('creationDate')
      .setName('Data do pedido')
      .setDescription('A data em que o pedido foi criado')
      .setType(types.YEAR_MONTH_DAY)
      .setGroup('Data')
      .setIsHidden(true);

  var status = fields.newDimension()
      .setId('Status')
      .setName('Status do pedido')
      .setDescription('O status do pedido do cliente')
      .setType(types.TEXT)
      .setIsHidden(true);

  var paymentnames = fields.newDimension()
      .setId('paymentNames')
      .setName('Método de pagamento')
      .setDescription('O método de pagamento utilizado pelo cliente')
      .setType(types.TEXT)
      .setIsHidden(true);

  var totalvalue = fields.newMetric()
      .setId('totalValue')
      .setName('Valor total')
      .setDescription('Valor total do pedido')
      .setType(types.CURRENCY_BRL)
      .setAggregation(aggregations.SUM)
      .setIsHidden(true);

  return { 'schema': fields.build() };
}


// Função para obter os dados da VTEX
function getData(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;

  // Recupere os parâmetros do request
  var config = request.configParams;
  var accountName = config.accountName;
  var apiKey = config.apiKey;
  var appToken = config.appToken;

  // Construa a URL da API da VTEX
  var apiUrl = 'https://' + accountName + '.vteximg.com.br/api/oms/pvt/orders';

  // Configure os cabeçalhos de autenticação
  var headers = {
    'X-VTEX-API-AppKey': apiKey,
    'X-VTEX-API-AppToken': appToken
  };

  // Faça uma solicitação à API da VTEX
  var response = UrlFetchApp.fetch(apiUrl, {
    headers: headers
  });

  // Analise a resposta da API e converta-a em um objeto JSON
  var data = JSON.parse(response.getContentText());

  // Construa os dados a serem retornados
  var rows = [];
  data.forEach(function(order) {
    var row = [];
    row.push(order.orderId);
    row.push(order.salesChannel);
    row.push(order.creationDate);
    row.push(order.status);
    row.push(order.paymentNames);
    row.push(order.totalValue);
    rows.push(row);
  });

  // Crie um esquema com base nos campos
  var schema = fields.newTableSchema();
  schema.addColumn('orderId', types.TEXT);
  schema.addColumn('salesChannel', types.TEXT);
  schema.addColumn('creationDate', types.YEAR_MONTH_DAY);
  schema.addColumn('Status', types.TEXT);
  schema.addColumn('paymentNames', types.TEXT);
  schema.addColumn('totalValue', types.CURRENCY_BRL);

  // Retorne os dados
  return {
    schema: schema.build(),
    rows: rows
  };
}
