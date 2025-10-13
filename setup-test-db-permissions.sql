-- SQL-Befehle für Adminer
-- Diese Befehle geben dem Benutzer 'mazin_user' alle Rechte für die Test-Datenbank

-- 1. Gehe zu Adminer (http://localhost:8080)
-- 2. Melde dich als root an (Server: nexus-commerce-db, User: root, Passwort: mazin_passwort)
-- 3. Klicke auf "SQL-Kommando" in der linken Seitenleiste
-- 4. Kopiere und führe den folgenden Befehl aus:

GRANT ALL PRIVILEGES ON nexus_commerce_test.* TO 'mazin_user'@'%';
FLUSH PRIVILEGES;
