# Detetive - Caderno de Investigação

Bem-vindo ao seu caderno de investigação para o jogo **Detetive/Cluedo**. Esta aplicação foi feita para ajudar você a acompanhar suspeitos, armas, cômodos, sugestões e anotações durante a partida, tudo em uma interface mobile-first, rápida e fácil de usar.

## O que esta aplicação faz

- Permite marcar cartas com símbolos diferentes, como confirmada, eliminada, dúvida, pista-chave e outros.
- Organiza as cartas por categorias: suspeitos, armas e cômodos.
- Deixa você registrar jogadores e editar nome e cor quando quiser.
- Guarda suas anotações diretamente no navegador.
- Permite exportar e importar um arquivo JSON com toda a configuração da partida.
- Funciona bem no celular e também no computador.

## Como usar

### 1. Abrindo o jogo
Basta abrir o arquivo `index.html` no navegador. Não precisa instalar nada.

### 2. Configurando a partida
Na aba de configuração, você pode:

- adicionar jogadores;
- editar nome e cor de cada jogador;
- criar sua própria lista de suspeitos, armas e cômodos;
- definir o número da sessão;
- exportar ou importar os dados do jogo.

### 3. Marcando as cartas
Nas abas de suspeitos, armas e cômodos, cada linha representa uma carta e cada coluna representa um jogador.

Toque ou clique na célula para alternar entre os símbolos.

### 4. Registrando sugestões
Na aba de solução, você pode registrar sugestões feitas durante a partida. Isso ajuda a lembrar:

- quem sugeriu;
- qual suspeito foi falado;
- qual arma foi citada;
- qual cômodo entrou na jogada;
- quem refutou, ou se ninguém refutou.

### 5. Fazendo anotações
Use a aba de anotações para escrever deduções, pistas e observações importantes. Tudo fica salvo automaticamente no navegador.

## Significado dos símbolos

A aplicação usa símbolos para tornar as anotações mais rápidas:

- **✓** = confirmado
- **✗** = eliminado
- **?** = dúvida
- **★** = pista importante
- **〜** = rumor ou informação duvidosa
- **!** = atenção

## Exemplo de uso

Imagine que durante a partida você percebeu que um jogador mostrou uma carta quando alguém falou:

- Srta. Scarlet
- Faca
- Biblioteca

Você pode:

1. abrir a aba correspondente;
2. marcar o jogador que mostrou a carta;
3. registrar a sugestão na aba de solução;
4. escrever uma nota como:

> "Pedro mostrou uma carta depois da sugestão com Scarlet, Faca e Biblioteca."

Com isso, fica muito mais fácil ir eliminando possibilidades até chegar na combinação final.

## Importar e exportar

A aplicação foi pensada para compartilhar partidas entre amigos.

- **Exportar JSON**: gera um arquivo com toda a configuração atual.
- **Importar JSON**: carrega esse mesmo arquivo e restaura a partida.

Isso é ideal quando cada grupo joga com uma versão diferente do tabuleiro ou com listas personalizadas.

## Dicas rápidas

- Se o nome de um jogador estiver errado, edite direto pela modal de jogador.
- Se uma cor estiver repetida, troque pela cor que preferir.
- Se sua edição for diferente do padrão, personalize as cartas antes de começar a partida.
- Use o JSON exportado como base para criar configurações prontas para seu grupo.

## Estrutura do projeto

- `index.html` - interface principal e lógica da aplicação.
- `index.js` - scripts auxiliares, caso o projeto esteja separado em arquivos.
- `style.css` - estilos visuais da aplicação, caso o projeto esteja separado em arquivos.

## Para quem está jogando pela primeira vez

Se você nunca usou esse tipo de caderno, pense assim:

- cada carta pode ser marcada como "tenho", "não tenho" ou "talvez";
- cada sugestão revela um pedacinho da solução;
- quanto mais organizado você for, mais rápido a verdade aparece.

Agora é só abrir a mesa, distribuir as suspeitas e seguir as pistas. Boa investigação!
