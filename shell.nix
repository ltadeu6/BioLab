{ pkgs ? import <nixpkgs> {} }:

 pkgs.mkShell {
   # Nome do ambiente
   name = "cordova-deps-shell";

   # Lista de pacotes a serem instalados. Nada mais.
   # O Nix garantirá que 'node', 'cordova', 'gradle' e 'java'
   # estejam disponíveis no seu PATH quando você entrar no shell.
   buildInputs = with pkgs; [
     nodejs
     cordova
     gradle
     jdk
   ];

   # Mensagem simples para confirmar que você está no ambiente certo.
   shellHook = ''
     echo "Ambiente Nix com dependências do Cordova ativado."
     echo "Execute 'source ./env.sh' para configurar o Android SDK."
   '';
 }
