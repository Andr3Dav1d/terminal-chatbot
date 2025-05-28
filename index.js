require('dotenv').config();
const prompt = require('prompt-sync')();
const SimplDB = require('simpl.db');
const os = require('os');
const fs = require('fs');
const chatbot = require('./chatbot.js')

const db = new SimplDB();

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function linhas () {
    console.log('-----------------')
}

const osUserName = os.userInfo().username;

// Função para atualizar ou criar a chave no .env
function setApiKeyEnv(newKey) {
    let envContent = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';
    if (envContent.match(/^GROQ_API_KEY=/m)) {
        envContent = envContent.replace(/^GROQ_API_KEY=.*/m, `GROQ_API_KEY=${newKey}`);
    } else {
        envContent += `\nGROQ_API_KEY=${newKey}`;
    }
    fs.writeFileSync('.env', envContent);
    process.env.GROQ_API_KEY = newKey;
}

let name = db.get('groqUser.name');
let apiKey = process.env.GROQ_API_KEY || '';
let behavior = db.get('groqUser.behavior') || "Você é um assistente amigável, prestativo e técnico.";

console.clear();

function promptObrigatorio(msg) {
    let resposta = '';
    while (!resposta) {
        resposta = prompt(msg);
        if (!resposta) {
            console.log('Por favor, preencha o campo para continuar.');
        }
    }
    return resposta;
}

const newUser = () => { 
    console.log('-----------------')
    console.log('- Olá, seja bem-vindo!\n- O chatbot usa a tecnologia da Groq, através da Langchain.\n- Para poder usar o chatbot, será necessário você registrar seu usuário por meio de um nome fictício e da chave de API da Groq.')
    console.log('-----------------')

    const namePrompt = promptObrigatorio(`Nome de usuário: `) || osUserName;
    console.log(`Seu nome de usuário será ${namePrompt}!`)
    const apiKeyPrompt = promptObrigatorio('Chave de API: ')

    db.set('groqUser.name', namePrompt);
    setApiKeyEnv(apiKeyPrompt);
    console.log('- Dados registrados.\n- Inicie novamente o programa para ter acesso ao menu.\n- Esse prompt será encerrado em 5 segundos.')
    setTimeout(() => { process.exit(1) }, 5000)
}

// Função para atualizar variáveis globais após alteração
function updateUserVars() {
    name = db.get('groqUser.name');
    apiKey = process.env.GROQ_API_KEY || '';
    behavior = db.get('groqUser.behavior') || "Você é um assistente amigável, prestativo e técnico.";
}

const userExists = async () => {
    console.clear();
    linhas()
    console.log(`Olá, ${name}!\nEscolha uma opção:`)
    linhas()
    console.log('1. Entrar no Chatbot\n2. Configurar Usuário\n3. Sair')
    linhas()
    const option = promptObrigatorio('Escolha uma opção: ')
    optionSelector(option);
}

const optionSelector = async (option) => {
    switch (option) {
        case '1':
            console.clear();
            console.log('- Entrando no Chatbot...');
            await delay(2000);
            await chatbot.run(name, apiKey, behavior); 
            console.log('- Retornando à tela inicial...');
            await delay(2000);
            await userExists();
            break;
        case '2':
            userOptionMenu();
            break;
        case '3':
            console.clear();
            console.log('Saindo...');
            process.exit(1);
        default:
            optionNotExist();
            break;
    }
}

const userOptionMenu = () => {
    console.clear()
    linhas()
    const apiKeyDisplay = apiKey ? apiKey.substring(0, 7) + '...' : '(não definida)';
    console.log(`Nome de usuário: ${name}\nChave de API Groq: ${apiKeyDisplay}\nComportamento do assistente: ${behavior}`)
    linhas()
    console.log('Selecione o que você deseja alterar:')
    linhas()
    console.log('1. Alterar usuário\n2. Alterar chave de API\n3. Alterar comportamento do assistente\n4. Retornar à tela inicial')
    linhas()
    const userOption = promptObrigatorio('Escolha uma opção: ')
    userOptionSelector(userOption)
}

const userOptionSelector = (userOption) => {
    switch (userOption) {
        case '1': {
            const newName = promptObrigatorio('Digite o novo nome: ') || osUserName;
            db.set('groqUser.name', newName);
            updateUserVars();
            userOptionMenu();
            break;
        }
        case '2': {
            const newApiKey = promptObrigatorio('Insira a nova chave de API: ');
            setApiKeyEnv(newApiKey);
            updateUserVars();
            console.log('Chave de API atualizada!');
            userOptionMenu();
            break;
        }
        case '3': {
            const newBehavior = promptObrigatorio('Descreva como o assistente deve se comportar (ex: "Você é um assistente divertido e criativo"): ');
            db.set('groqUser.behavior', newBehavior);
            updateUserVars();
            console.log('Comportamento atualizado!');
            userOptionMenu();
            break;
        }
        case '4':
            updateUserVars();
            userExists();
            break;
        default:
            optionNotExist();
            break;
    }
}

const optionNotExist = () => {
    console.log('Essa opção não existe.')
    setTimeout(() => { console.clear(); userExists(); },3000)
}

if(!name || !apiKey) { newUser() } else { userExists() }